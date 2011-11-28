// Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/*
 * This file bootstraps the Runtime for the Command Line. It's compiled in place of the initial script of the app. Check the file bin/firejs
 */

var fire = require('fire')
var path = require('path')
var sys = require('util')
var fs = require('fs')
var util = require('util')

module.exports = function() {
	var pureArgs = process.argv.slice(2)
	var parsedArgv = process.parsedArgv
	var noArgs = pureArgs.length == 0
	var mainScriptPath = module.filename
	var mainScriptDirName = path.dirname(mainScriptPath)
	var expressionName = null
	var applicationName = ''
	if(path.basename(mainScriptPath) == "package.json") {
		// Read package.json
		var packageJson = JSON.parse(fs.readFileSync(mainScriptPath, 'utf8'))
		expressionName = packageJson.name + ".Main"
		applicationName = packageJson.name
	} else {
		// Exec the app.
		var expressionName = fire.inferExpressionNameByFileName(path.basename(mainScriptPath))
		if(!expressionName) {
			throw "The file '" + mainScriptPath+ "' was not recognized as a fire script due file name extension incompatibility"
			return
		}
		var appNameSeparator = expressionName.indexOf('.')
		applicationName = appNameSeparator == -1 ? expressionName : expressionName.substring(0,appNameSeparator)
	}
	

	//require.paths.unshift(path.join(mainScriptDirName,'node_modules'))

	var runtime = new fire.Runtime()
	runtime.applicationName = applicationName
	runtime.moduleRequire = function(moduleName) {
		return require(moduleName)
	}
	var manifestPath = path.join(mainScriptDirName, fire.DEFAULT_MANIFEST_FILE_NAME)
	path.exists(manifestPath, function(manifestFound) {
		var self = this
		var initializationFinished = function(err) {
			if(err) {
				var UnknownConstructor = "<unknown>"
				var errorType = ((typeof(err) === 'object' && err.constructor) ? (err.constructor.name || UnknownConstructor) : "UnknownConstructor")
				if(!process.parsedArgv['porcelain-errors']) {
					console.error("Fire.JS Runtime Initialization Error")
					console.error({
						type: errorType,
						error: err
					})
				} else {
					console.error(JSON.stringify({
						type: errorType,
						error: (err.toJSONObject ? err.toJSONObject() : err.toString())
					}))
				}
				process.exit(fire.INITIALIZATION_ERROR_EXIT_CODE)
			}
			if(parsedArgv['print-expressions'] == true) {
				var expressions = []
				var expNames = Object.keys(runtime.loadedExpressionsMeta)
				for(var i = 0; i < expNames.length; i++) {
					var meta = runtime.loadedExpressionsMeta[expNames[i]]
					expressions.push({
						name: meta.name,
						flags: meta.flags
					})
				}
				sys.print(JSON.stringify(expressions))
				process.exit(0)
			}
			else if(parsedArgv['print-manifest'] == true) {
				sys.print(JSON.stringify(runtime.mergedManifest))
				process.exit(0)
			}
			else 
				{
					var expDef = runtime.getExpressionDefinition(expressionName)
					if(!expDef) {
						var msg = "Main Expression '" + expressionName + "' can not be found"
						if(!process.parsedArgv['porcelain-errors']) {
							console.error("Fire.JS CLI Error")
							console.error(msg)
						} else {
							console.error(JSON.stringify({
								type: "MainExpressionNotFound",
								error: {
									message: msg,
									expressionName: expressionName
								}
							}))
						}
						process.exit(fire.MAIN_EXPRESSION_NOT_FOUND_ERROR_EXIT_CODE)
					}
					var exp = new(expDef.implementation)
					exp.runtime = runtime
					exp.resultCallback = function(res) {
						if(!(res instanceof fire.IgnoreOutput)) {
							sys.print(JSON.stringify(res))
						}
						process.exit(0)
					}
					exp.errorCallback = function(err) {
						console.error(util.inspect(err))
						process.exit(1)
					}
					exp.run()
				}
			}

			if(manifestFound) {
				runtime.loadFromManifestFile(manifestPath, initializationFinished)
			} else {
				runtime.setBaseDir(mainScriptDirName)
				// Manually load the scripts
				runtime.load(initializationFinished)
			}
		})

	}
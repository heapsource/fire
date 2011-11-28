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

var vm = require('vm')
var util = require('util')
var path = require('path')
var RuntimeError = require('./RuntimeError')
var Iterator = require('./Iterator')
var Expressions = require('./Expressions')
var mergeWith = require('./mergeWith.js')
var ModuleInitializer = require('./ModuleInitializer.js')
var fs = require('fs')

/*
 * Export Shared Types
 */
module.exports.Error = require('./Error')
module.exports.Expression = Expressions.Expression
module.exports.Iterator = require('./Iterator')
module.exports.CompilationError = require('./CompilationError.js')
module.exports.InitializerError = require('./InitializerError.js')
module.exports.IgnoreOutput = require('./IgnoreOutput')
module.exports.Runtime = require('./Runtime.js')
module.exports.RuntimeError = require('./RuntimeError.js')
module.exports.ModuleInitializerError = require('./ModuleInitializerError.js')

/*
 * Export Constants
 */
var constants = require('./constants.js')
mergeWith(module.exports, constants)

/*
 * Register Custom Extensions in Node.JS
 */
require.extensions[constants.DEFAULT_CUSTOM_SCRIPT_EXTENSION] = function (module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(content, filename);
}
var loaderFunction = function (module, filename) {
	return module._compile(fs.readFileSync(path.join(__dirname,"cli.js"), 'utf8'), filename);
};
require.extensions[".json"] = loaderFunction // loader for package.json
require.extensions[constants.DEFAULT_SCRIPT_EXTENSION] = loaderFunction

/*
 * Fire.js Ignitable Modules are absolutely in love with this function. 
 */
module.exports.igniteModule = function(thirdPartyModule, thirdPartyRequire) {
	if(!thirdPartyModule || (typeof(thirdPartyModule) !== 'object')) {
		throw "thirdPartyModule object is required"
	}
	if(!thirdPartyRequire || (typeof(thirdPartyRequire) !== 'function')) {
		throw "thirdPartyRequire function is required"
	}
	return new ModuleInitializer(thirdPartyModule, thirdPartyRequire)
}

module.exports.inferExpressionNameByFileName = function(fileName) {
	if(!fileName) return null
	for(var i = 0; i < constants.DEFAULT_EXPRESSION_EXTENSIONS.length; i++) {
		var extension = constants.DEFAULT_EXPRESSION_EXTENSIONS[i]
		if(fileName.indexOf(extension) != -1) {
			return fileName.substring(0, fileName.indexOf(extension))
		}
	}
	return null
}

/*
 * Boostrap a Fire.js Runtime into the current process using the given arguments.
 */
var nopt = require('nopt')
module.exports.executeApplication = function(argv) {
	process.parsedArgv = nopt({
		"print-expressions" : Boolean,
		"porcelain-errors" : Boolean,
		"print-manifest": Boolean
	},
	{
		"pe": ["--print-expressions", true],
		"pm": ["--print-manifest", true]
	},argv, 0)
	var noArgs = process.parsedArgv.argv.remain.length == 0
	if(noArgs) {
		printHelp()
		process.exit(0);
	} else {
		var initialFileName = process.parsedArgv.argv.remain.shift()
		process.parsedArgv.argv.cooked.splice(process.parsedArgv.argv.cooked.indexOf(initialFileName), 1)
		var initialFileName = path.resolve(initialFileName)
		require(initialFileName)() // run the cli... check cli.js for more info.
	}

	function printHelp() {
		console.log("Fire.JS Runtime version " + module.exports.PackageInfo.version)
		console.log("usage: firejs TheProject.Main.fjson")
		console.log("usage: firejs package.json")
		console.log("options:")
		console.log("	--print-expressions: prints all the expression names and flags loaded by the runtime as a JSON document to stdout")
		console.log("	--porcelain-errors: prints errors to stderr in JSON format")
		console.log("	--print-manifest: prints the merged manifest as a JSON document to stdout")
		console.log("")
		console.log("Copyright (C) 2011 Firebase.co and Contributors. http://firejs.firebase.co")
	}
}

/*
 * Export the package information right from the package.json file.
 */
module.exports.PackageInfo = JSON.parse(fs.readFileSync(path.join(__dirname,"../package.json"), 'utf8'))

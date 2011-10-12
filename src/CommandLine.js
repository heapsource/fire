
var fs = require('fs')
var path = require('path')

function CommandLine() {
	var packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname,"../package.json"), 'utf8'))
	this.versionNumber = packageJSON.version
}

CommandLine.prototype.run = function() {
	var pureArgs = process.argv.slice(2)
	var noArgs = pureArgs.length == 0
	if(noArgs) {
		this.printHelp()
		process.exit(0);
	} else {
		var scriptName = pureArgs[0]
		
		
		var mainScriptPath = path.resolve(scriptName)
		
		var mainScriptDirName = path.dirname(mainScriptPath)
		
		var priest = require(path.join(mainScriptDirName,'node_modules/priest'))
		
		
		var mainScriptStats = fs.stat(mainScriptPath)
		
		var expressionName = priest.inferExpressionNameByFileName(path.basename(mainScriptPath))
		if(!expressionName) {
			throw "The file '" + scriptName+ "' was not recognized as a priest script due file name extension incompatibility"
			return
		}
		
		
		
		process.chdir(mainScriptDirName) // Change the Current Directory
		require.paths.unshift(path.join(mainScriptDirName,'node_modules'))
		
		var runtime = new priest.Runtime()
		runtime.moduleRequire = function(moduleName) {
			return require(moduleName)
		}
		var manifestPath = priest.DEFAULT_MANIFEST_FILE_NAME
		path.exists(manifestPath, function(manifestFound) {
			if(manifestFound) {
				runtime.loadFromManifestFile(manifestPath)
			} else {
				// Manually load the scripts
				runtime.load()
			}
			var self = this
			var contextBase = {};
			contextBase._resultCallback = function(res) {
				console.log(JSON.stringify(res))
			}
			contextBase._loopCallback = function() {};
			contextBase._inputExpression  = function() {};
			contextBase._variables = {};   
			contextBase._errorCallback =  function() {};
			runtime.runExpressionByName(expressionName, contextBase ,null)
		})
	}
}

CommandLine.prototype.printHelp = function() {
	console.log("Priest Runtime version " + this.versionNumber)
	console.log("usage: priest TheProject.Main.priest.json")
	console.log("")
	console.log("Copyright (C) 2011 Firebase and Contributors. http://priest.firebase.co")
}

module.exports = CommandLine
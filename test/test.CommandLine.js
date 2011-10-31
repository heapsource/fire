var vows = require('vows')
var assert = require('assert')
var PathCache = require('../src/Paths').PathCache
var AstEntryType = require('../src/Paths').AstEntryType
var Variable = require('../src/Variable')
var exec  = require('child_process').exec
var priest = require('../src/core.js')

vows.describe('priest command line utility').addBatch({
	"When I run the command line with no args": {
		topic: function() {
			var self = this
			exec('bin/./priest', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the copyright and version": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "Firebase")
			assert.include(output.stdout, "version")
		}
	},
	"When I run the command line in a directory with a single folder and single JSON file": {
		topic: function() {
			var self = this
			exec(' (cd test/commandLineDirs/simple && ../../../bin/./priest mySimpleMain.priest.json)', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the output of the priest expression": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "Hello World from the Simplest JSON Expression")
		}
	},
	"When I run the command line in a directory with a single folder with a JSON file and a Manifest and the module returns a value from the configuration section": {
		topic: function() {
			var self = this
			exec('bin/./priest test/commandLineDirs/withManifest2/myMain.priest.json', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the configuration value in the console": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "The Chuck Norris Four")
		}
	}
	,
	"When I run the command line in a directory with two json scripts and the main script uses the second script as the result": {
		topic: function() {
			var self = this
			exec('bin/./priest test/commandLineDirs/withRootLevelFiles/myMain.priest.json', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the second expression value in the console": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "Value from the Other Expression")
		}
	}
	,
	"When I run the command line in a project with a manifest that specifies additional directories and the main script returns a value from an additional directory": {
		topic: function() {
			var self = this
			exec('bin/./priest test/commandLineDirs/withSubScripts/myMain.priest.json', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the additional directory expression value in the console": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.deepEqual(output.stdout, JSON.stringify({
				subExp: "Value from a Sub expression",
				customSubExp: "customSubExpression",
				customExp: "customExpression"
			}))
		}
	},
	"When I run the command line in a project with a failing initializer": {
		topic: function() {
			var self = this
				exec('bin/./priest test/commandLineDirs/failingInitializer/failingInitializer.Main.priest.json', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"I should see the error description in the stderr": function(output){
			assert.equal(output.stderr,"priest runtime initializer 'failingInitializer.Init' failed with error: 'priest runtime error: Can not find the right configuration'\n")
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stdout)
		}
	},
	"When I run the command line in a project with a initializer in a module that prints a message to the console": {
		topic: function() {
			var self = this
				exec('bin/./priest test/commandLineDirs/moduleInitializers/moduleInitializers.Main.priest.json', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"I should see the message in the output": function(output){
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stderr)
			assert.equal(output.stdout,"Initialized from Module in Dev Mode\n")
		}
	},
	"When I run the command line in a project with modules that contain scripts in the root of the module and declares some additional directories": {
		topic: function() {
			var self = this
				exec('bin/./priest test/commandLineDirs/moduleScriptDirs/moduleScriptDirs.Main.priest.json', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"I should see the message in the output": function(output){
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stderr)
			assert.equal(output.stdout,JSON.stringify({
				"superExpression1":"Something from Super Expression One",
				"superExpression2":"This expression was loaded from an aux directori exported using exportScriptsDir",
				"superExpression3":"This expression was loaded from an aux directori exported using the module manifest",
				"superExpression4":"This expression was loaded from a custom javascrip file in a manifest script dir",
				"superExpression5": "This custom expression was loaded from a module explicit subdir",
				"superExpression1b": "This custom expression was loaded from the root of the app"
				}))
			}	
	}
}).export(module);
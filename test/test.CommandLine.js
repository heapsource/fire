var vows = require('vows')
var assert = require('assert')
var PathCache = require('../src/Paths').PathCache
var AstEntryType = require('../src/Paths').AstEntryType
var exec  = require('child_process').exec
var fire = require('../src/core.js')
var path = require('path')

vows.describe('firejs command line utility').addBatch({
	"When I run the command line with no args": {
		topic: function() {
			var self = this
			exec('bin/./firejs', function (error, stdout, stderr) {
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
			exec(' (cd test/commandLineDirs/simple && ../../../bin/./firejs mySimpleMain.fjson)', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the output of the fire.js expression": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "Hello World from the Simplest JSON Expression")
		}
	},
	"When I run the command line in a directory with a single folder with a JSON file and a Manifest and the module returns a value from the configuration section": {
		topic: function() {
			var self = this
			exec('bin/./firejs test/commandLineDirs/withManifest2/myMain.fjson', function (error, stdout, stderr) {
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
			exec('bin/./firejs test/commandLineDirs/withRootLevelFiles/myMain.fjson', function (error, stdout, stderr) {
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
			exec('bin/./firejs test/commandLineDirs/withSubScripts/myMain.fjson', function (error, stdout, stderr) {
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
	"When I run the command line in a project with a failing initializer and --porcelain-errors": {
		topic: function() {
			var self = this
				exec('bin/./firejs --porcelain-errors test/commandLineDirs/failingInitializer/failingInitializer.Main.fjson', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"I should see the error description in the stderr": function(output){
			var initErrorInfo = JSON.parse(output.stderr)
			assert.equal(initErrorInfo.type, "InitializerError")
			assert.equal(initErrorInfo.error.expression.name, "failingInitializer.Init")
			assert.equal(initErrorInfo.error.error, "fire.js runtime error: Can not find the right configuration")
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stdout)
		}
	},
	"When I run the command line in a project with a initializer in a module that prints a message to the console": {
		topic: function() {
			var self = this
				exec('bin/./firejs test/commandLineDirs/moduleInitializers/moduleInitializers.Main.fjson', function (error, stdout, stderr) {
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
				exec('bin/./firejs test/commandLineDirs/moduleScriptDirs/moduleScriptDirs.Main.fjson', function (error, stdout, stderr) {
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
	},
	"When I run an app with --print-expressions": {
		topic: function() {
			var self = this
				exec('bin/./firejs --print-expressions test/commandLineDirs/expressionsList/MyApp.Main.fjson', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"I should a JSON document the list of all loaded expressions in the output": function(output){
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stderr)
			var result = JSON.parse(output.stdout)
			assert.isArray(result)
			assert.notEqual(result.length, 0)
			var getExp = null
			for(var i = 0; i < result.length; i++) {
				var exp = result[i]
				if(exp.name == 'get') {
					getExp = exp
					break
				}
			}
			assert.isNotNull(getExp, "it should at least export the 'get' built-in expression")
			assert.deepEqual(getExp, {
				name: "get",
				flags: ["hint"]
			})
		}
	}
	,
	"When I run an app with a package.json instead of a JSON script": {
		topic: function() {
			var self = this
				exec('bin/./firejs test/commandLineDirs/packageJson/package.json', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"the app should start with the expression based on the name of the app": function(output){
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stderr)
			assert.deepEqual(JSON.parse(output.stdout), "Hello from a package.json launched app")
		}
	},
	"When I run an app the parsedArgv should not contain the script file name or the package file name": {
		topic: function() {
			var self = this
				exec('bin/./firejs test/commandLineDirs/parsedArgv/Parsed.Main.fjson --something true', function (error, stdout, stderr) {
					self.callback(null, {
						error: error, 
						stdout: stdout, 
						stderr: stderr
					})
				});
		},
		"the app should start with the script but the remaining should not have the script name or path": function(output){
			assert.isNotNull(output.stdout)
			assert.isEmpty(output.stderr)
			assert.deepEqual(JSON.parse(output.stdout), [
			"--something", 'true'])
		}
	},
	"When I run an application using package.json and there is no main script matching the name of the app": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/invalidMainPackageJson/package.json', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"The exit code should be MAIN_EXPRESSION_NOT_FOUND_ERROR_EXIT_CODE": function(output){
			assert.strictEqual(output.code, fire.MAIN_EXPRESSION_NOT_FOUND_ERROR_EXIT_CODE)
			},
		"Stderr should have a human readable message": function(output){
			assert.isNotNull(output.stdout)
			assert.equal(output.stderr, "Fire.JS CLI Error\nMain Expression 'SuperApp.Main' can not be found\n")
		}
	},
	"When I run an application with porcelain errors using package.json and there is no main script matching the name of the app": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/invalidMainPackageJson/package.json --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"The exit code should be MAIN_EXPRESSION_NOT_FOUND_ERROR_EXIT_CODE": function(output){
			assert.strictEqual(output.code, fire.MAIN_EXPRESSION_NOT_FOUND_ERROR_EXIT_CODE)
		},
		"stderr JSON document error type should be MainExpressionNotFound": function(output){
			var stderr = JSON.parse(output.stderr)
			assert.equal(stderr.type, "MainExpressionNotFound")
		},
		"stderr JSON document error message should be the human readable message": function(output){
			var stderr = JSON.parse(output.stderr)
			assert.equal(stderr.error.message, "Main Expression \'SuperApp.Main\' can not be found")
		},
		"stderr JSON document expressionName should be the name of the main expression that the CLI failed to execute": function(output){
			var stderr = JSON.parse(output.stderr)
			assert.equal(stderr.error.expressionName, "SuperApp.Main")
		}
	},
	"When I run an application with expressions from a deferred module": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/deferredSubModuleLoading/package.json --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"the application should be able to execute the app smoothly": function(output){
			assert.isEmpty(output.stderr)
			assert.equal(output.stdout, '"From Sub Sub"')
		}
	}
}).export(module);

vows.describe('firejs - applicationName').addBatch({
	"When I run an application from command line using package.json": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/appNameFromPackage/package.json --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"the application name should be the name found in package.json": function(output){
			assert.isEmpty(output.stderr)
			assert.equal(output.stdout, '"AppNameFromPackage"')
		}
	},
	"When I run an application from command line using main expression file": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/appNameFromExpression/AppNameFromMainExpression.Main.fjson --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"the application name should be the first part of the main expression": function(output){
			assert.isEmpty(output.stderr)
			assert.equal(output.stdout, '"AppNameFromMainExpression"')
		}
	},
	"When I run an application from command line using a non main expression file": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/appNameFromExpression/AppNameFromOtherName.fjson --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"the application name should be name of the main expression": function(output){
			assert.isEmpty(output.stderr)
			assert.equal(output.stdout, '"AppNameFromOtherName"')
		}
	}
}).export(module);


vows.describe('firejs - Module Initializer Errors').addBatch({
	"When I run an application with porcelain errors and a module returns an error": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/manifests/testConfigMissing/testConfigMissing.Main.fjson --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"The exit code should be INITIALIZATION_ERROR_EXIT_CODE": function(output){
			assert.strictEqual(output.code, fire.INITIALIZATION_ERROR_EXIT_CODE)
		},
		"stderr JSON document error type should be ModuleInitializerError": function(output){
			var stderr = JSON.parse(output.stderr)
			assert.equal(stderr.type, "ModuleInitializerError")
		},
		"stderr JSON document error modulePath should contain the path to the failing module": function(output){
			var stderr = JSON.parse(output.stderr)
			assert.equal(stderr.error.modulePath, path.join(__dirname,"manifests/testConfigMissing/node_modules/module1/main.js") )
		},
		"stderr JSON document error should contain the error message": function(output){
			var stderr = JSON.parse(output.stderr)
			assert.equal(stderr.error.error, "database connection info is missing")
		}
	},
}).export(module);

vows.describe('firejs - Module Initializer and Initializer Expressions').addBatch({
	"When I run an application that return values from module initializer, module initializer expression and app initializer expressions": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/moduleInitExpInit/package.json --porcelain-errors', function (error, stdout, stderr) {
				processResult = {
					error: error,
					stdout: stdout,
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"The exit code should be 0": function(output){
			assert.strictEqual(output.code, 0)
		},
		"stderr should be empty": function(output){
			assert.isEmpty(output.stderr)
		},
		"stdout JSON document should contain the values from module initializer, module initializer expression and app initializer expressions": function(output){
			var stdout = JSON.parse(output.stdout)
			assert.deepEqual(stdout, {
				"moduleInitValue": "Module Initializer",
				"moduleInitExpValue": "Module Expression Initializer",
				"appInitValue":"App Initializer Expression"
			})
		}
	}
}).export(module);


vows.describe('firejs - --print-manifest').addBatch({
	"When I run an application with --print-manifest": {
		topic: function() {
			var self = this
			var processResult = null
			var child = exec('bin/./firejs test/commandLineDirs/printManifest/package.json --print-manifest', function (error, stdout, stderr) {
				processResult = {
					error: error,
					stdout: stdout,
					stderr: stderr
				}
			});
			child.on("exit", function(code, signal) {
				processResult.code = code
				self.callback(null, processResult)
			})
		},
		"The exit code should be 0": function(output){
			assert.strictEqual(output.code, 0)
		},
		"stderr should be empty": function(output){
			assert.isEmpty(output.stderr)
		},
		"stdout JSON document should contain the merged manifest": function(output){
			var stdout = JSON.parse(output.stdout)
			assert.equal(stdout.manifestProperty, "Manifest Value")
		}
	}
}).export(module);

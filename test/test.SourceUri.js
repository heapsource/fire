var vows = require('vows')
var assert = require('assert')
var fire = require('../src/core.js')
var path = require('path')
var Runtime = fire.Runtime

vows.describe('firejs - Source Paths JSON').addBatch({
	"When I register a JSON expression without explicit sourceUri": {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.registerWellKnownExpressionDefinition({
				name: "MyTestExpression",
				json: null
			});
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					self.callback(null, runtime.loadedExpressionsMeta["MyTestExpression"])
				}
			});
		},
		"The sourceUri of the expression should be the name of the expression with protocol 'virtual' and extension .fjson": function(err, exp) {
			assert.equal(exp.sourceUri, "virtual:/MyTestExpression.fjson")
		}
	},
	"When I register a JSON expression with explicit sourceUri": {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.registerWellKnownExpressionDefinition({
				name: "MyTestExpression",
				json: null,
				sourceUri: "fs:/someJson.fjson"
			});
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					self.callback(null, runtime.loadedExpressionsMeta["MyTestExpression"])
				}
			});
		},
		"The sourceUri of the expression should remain the same": function(err, exp) {
			assert.equal(exp.sourceUri, "fs:/someJson.fjson")
		}
	}
}).export(module)

vows.describe('firejs - Source Paths Custom').addBatch({
	"When I register a custom expression without explicit sourceUri": {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.registerWellKnownExpressionDefinition({
				name: "MyTestExpression",
				implementation: function() {
					// faked =)
				}
			});
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					self.callback(null, runtime.loadedExpressionsMeta["MyTestExpression"])
				}
			});
		},
		"The sourceUri of the expression should be the name of the expression with protocol 'virtual' and extension .fjs": function(err, exp) {
			assert.equal(exp.sourceUri, "virtual:/MyTestExpression.fjs")
		}
	},
	"When I register a Custom expression with explicit sourceUri": {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.registerWellKnownExpressionDefinition({
				name: "MyTestExpression",
				implementation: function() {
					// faked =)
				},
				sourceUri: "fs:/someJson.fjs"
			});
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					self.callback(null, runtime.loadedExpressionsMeta["MyTestExpression"])
				}
			});
		},
		"The sourceUri of the expression should remain the same": function(err, exp) {
			assert.equal(exp.sourceUri, "fs:/someJson.fjs")
		}
	}
}).export(module)

vows.describe('firejs - Source Paths Directories').addBatch({
	"When I load a runtime and register files with registerWellKnownExpressionFile": {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.registerWellKnownExpressionFile(path.join(__dirname, "sourceUri/Hello.js"))
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					self.callback(null, runtime.loadedExpressionsMeta["Hello"])
				}
			});
		},
		"The sourceUri of the expression should be the path to the source file with protocol 'fs' ": function(err, exp) {
			assert.equal(exp.sourceUri, "fs:/" + path.join(__dirname, "sourceUri/Hello.js"))
		}
	}
	,"When I load a runtime and load custom directories": {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.scriptDirectories.push({
				path: path.join(__dirname, "sourceUri")
			})
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					self.callback(null, {
						Hi: runtime.loadedExpressionsMeta["Hi"],
						Bye: runtime.loadedExpressionsMeta["Bye"]
					})
				}
			});
		},
		"The sourceUri of the expressions should be the right uri with protocol 'fs' and the file name": function(err, res) {
			assert.equal(res.Hi.sourceUri, "fs:/" + path.join(__dirname, "sourceUri/Hi.fjs"))
			assert.equal(res.Bye.sourceUri, "fs:/" + path.join(__dirname, "sourceUri/Bye.fjson"))
		}
	}
}).export(module)
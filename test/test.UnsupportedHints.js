var vows = require('vows')
var assert = require('assert')
var jsonCode = require('../src/core.js')
var FireError = require('../src/core.js').Error
var Runtime = jsonCode.Runtime

var globalContextBase = {};
globalContextBase._resultCallback = function(res) {}
globalContextBase._loopCallback = function() {};
globalContextBase._inputExpression  = function() {};
globalContextBase._variables = {};            
globalContextBase._errorCallback =  function() {};

vows.describe('firejs').addBatch({
	'Having a JSON code that uses @return with a hint': {
		"when we register it": {
			topic:function() {
				var self = this
				var runtime = new Runtime()
				runtime.registerWellKnownExpressionDefinition({
					name:"testForbiddenHints",
					json: {
						"@return(something)": 2
					}
				})
				runtime.load(function(initError) {
					if(initError) {
						self.callback(initError, null)
					}
					else {
						self.callback(null, runtime)
					}
					return runtime
				})
			},
			"the error should not be null": function(err, runtime) {
				assert.isNotNull(err)
			},
			"the error should be instance of CompilationError": function(err, runtime) {
				assert.instanceOf(err, jsonCode.CompilationError)
			},
			"the error code should be 'UnsupportedHint'": function(err, runtime) {
				assert.equal(err.code, "UnsupportedHint")
			},
			"the error message should be \"Expression \'return\' does not support hints\"": function(err, runtime) {
				assert.equal(err.message, "Expression 'return' does not support hints")
			},
			"the error path should be '{@}/@return(something)'": function(err, runtime) {
				assert.equal(err.path, "{@}/@return(something)")
			}
		}
	},
}).export(module);
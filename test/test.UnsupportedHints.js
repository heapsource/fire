var vows = require('vows')
var assert = require('assert')
var jsonCode = require('../src/core.js')
var PriestError = require('../src/core.js').Error
var Runtime = jsonCode.Runtime
jsonCode.exportTestOnlyFunctions();

var globalContextBase = {};
globalContextBase._resultCallback = function(res) {}
globalContextBase._loopCallback = function() {};
globalContextBase._inputExpression  = function() {};
globalContextBase._variables = {};            
globalContextBase._errorCallback =  function() {};

vows.describe('priest').addBatch({
	'Having a JSON code that uses @return with a hint': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testForbiddenHints",
					json: {
						"@return(something)": 2
					}
				})
				return runtime
			},
			"it should throw a PriestError": function(runtime) {
				assert.throws(function() {
					runtime.runExpressionByName("testForbiddenHints", globalContextBase ,null)
				}, PriestError);
			},
			"with error code UnsupportedHint": function(runtime) {
				try{
					runtime.runExpressionByName("testForbiddenHints", globalContextBase ,null)
					throw "meh"
				}catch(ex) {
					assert.equal(ex.code,"UnsupportedHint")
				}
			}
		}
	},
}).export(module);
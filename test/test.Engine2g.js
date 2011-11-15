var vows = require('vows')
var assert = require('assert')
var jsonCode = require('../src/core.js')
var Runtime = jsonCode.Runtime
var Expression = jsonCode.Expression
var exec  = require('child_process').exec
jsonCode.exportTestOnlyFunctions();

var fs = require('fs'),
path = require('path')

function getTempTestOutputFileName(filename) {
	return "/tmp/" + filename
}

vows.describe('firejs').addBatch({
		
	'When I have a object with no firejs special keys': {
		topic: function() {
			var self = this
			var runtime = new Runtime()
			runtime.registerWellKnownExpressionDefinition({
				name: "NoSpecialKeysTest",
				json: {
					"name":"Johan", 
					"age": 25
				}
			});
			runtime.load(function(initError) {
				if(initError) {
					self.callback(initError, null)
				} else {
					var contextBase = {};
					contextBase._resultCallback = function(res) {
						self.callback(null, res)
					}
					contextBase._loopCallback = function() {
						self.callback("_loopCallback reached", null)
					};
					contextBase._inputExpression  = function() {
						self.callback("_inputExpression reached", null)
					};
					contextBase._variables = {};        
					contextBase._errorCallback =  function(err) {
						self.callback(err, null)
					};
					runtime.runExpressionByName("NoSpecialKeysTest", contextBase ,null)
				}
			});
		},
		"the result should be a copy of the original JSON" : function(err, expressionResult) {
			assert.deepEqual(expressionResult, {
				"name":"Johan", 
				"age": 25
			});
			assert.isNull(err)
		}
	},
'When I have a JSON with regular keys and expression keys at the same level': {
	topic: function() {
		return {
			"@return": 2,
			"someOtherRegularKey": 3
		};    
	},
	"when I compile it": {
		" I should get JS1001 error": function(topic) {
			var test = function() {
				jsonCode._testOnly_compileExpressionFuncFromJSON(topic, "someFileWithMixedKeys.js",undefined,"");
			};
			assert.throws(function() {
				test()
				}, jsonCode.Error)
				try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "JS1001")
				}
			}
		} 
	}
	,
	"When I have a key called '@return' and I ask for the pure expression name": {
		topic: function() {
			return "@return"
		}
		,"I should get 'return' only": function(topic){
			assert.equal(jsonCode._testOnly_getExpressionNameFromSpecialKey(topic), "return")
		}
	},
	"When I have a key with white spaces at the beginning ' @set' and I ask for the pure expression name": {
		topic: function() {
			return "  @set"
		}
		,"I should get 'set' without the symbol or white spaces": function(topic){
			assert.equal(jsonCode._testOnly_getExpressionNameFromSpecialKey(topic), "set")
		}
	}
	,
	"When I have a key called 'return' and I ask for the pure expression name": {
		topic: function() {
			return "return"
		}
		,"I should get an exception": function(topic){
			assert.throws(function() {
				jsonCode._testOnly_getExpressionNameFromSpecialKey(topic)
			})
		}
	}
	,'When I have a simple firejs expression that returns 2': {
		topic: function() {
			return {
				"@return": 2
			};    
		},
		"and I run it": {
			topic:function(topic) {
				var self = this
				var runtime = new Runtime()
				runtime.registerWellKnownExpressionDefinition({
					name: "Test",
					json: topic
				});
				runtime.load(function(initError) {
					if(initError) {
						self.callback(initError, null)
					} else {
						var contextBase = {};
						var result = {
							count: 0
						}
						contextBase._resultCallback = function(res) {
							result.count++
							result.result = res
							self.callback(null, result)
						}
						contextBase._loopCallback = function() {
							self.callback("_loopCallback reached", null)
						};
						contextBase._inputExpression  = function() {
							self.callback("_inputExpression reached", null)
						};
						contextBase._variables = {};        
						contextBase._errorCallback =  function(err) {
							self.callback(err, null)
						};
						runtime.runExpressionByName("Test", contextBase ,null)
					}
				});
			},
			"the result should not be null" : function(err, expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be 2" : function(err, expressionResult) {
				assert.equal(expressionResult.result, 2);
			}
		}
	}
	,'When I have two expression in a block that returns 2 and 3': {
		topic: function() {
			return {
				"@return": 2,
				" @return": 3
			};    
		},
		"and I run it": {
			topic:function(topic) {
				var self = this
				var runtime = new Runtime()
				runtime.registerWellKnownExpressionDefinition({
					name: "Test",
					json: topic
				});
				runtime.load(function(initError) {
					if(initError) {
						self.callback(initError, null)
					} else {
						var contextBase = {};
						var result = {
							count: 0
						}
						contextBase._resultCallback = function(res) {
							result.count++
							result.result = res
							self.callback(null, result)
						}
						contextBase._loopCallback = function() {
							self.callback("_loopCallback reached", null)
						};
						contextBase._inputExpression  = function() {
							self.callback("_inputExpression reached", null)
						};
						contextBase._variables = {};        
						contextBase._errorCallback =  function(err) {
							self.callback(err, null)
						};
						runtime.runExpressionByName("Test", contextBase ,null)
					}
				});
			},
			"the result should not be null" : function(err, expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be 3, the last result in the expression block" : function(err, expressionResult) {
				assert.equal(expressionResult.result, 3);
			},
			"the result callback should be called only once":  function(err, expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	}
	,'When I have two expression and the last expression returns an object': {
		topic: function() {
			return {
				"@return": 2,
				" @return": {
					"name":"Super Dude"
				}
			};    
		},
		"and I run it": {
			topic:function(topic) {
				var self = this
				var runtime = new Runtime()
				runtime.registerWellKnownExpressionDefinition({
					name: "Test",
					json: topic
				});
				runtime.load(function(initError) {
					if(initError) {
						self.callback(initError, null)
					} else {
						var contextBase = {};
						var result = {
							count: 0
						}
						contextBase._resultCallback = function(res) {
							result.count++
							result.result = res
							self.callback(null, result)
						}
						contextBase._loopCallback = function() {
							self.callback("_loopCallback reached", null)
						};
						contextBase._inputExpression  = function() {
							self.callback("_inputExpression reached", null)
						};
						contextBase._variables = {};        
						contextBase._errorCallback =  function(err) {
							self.callback(err, null)
						};
						runtime.runExpressionByName("Test", contextBase ,null)
					}
				});
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be the object, the last result in the expression block" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, {
					"name":"Super Dude"
				});
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	}
	,'When I have a JSON doc with one key and the value of the key is a expression': {
		topic: function() {
			return {
				"name":{
					"@return": "Super Dude"
				}
			};    
		},
		"and I run it": {
			topic:function(topic) {
				var self = this
				var runtime = new Runtime()
				runtime.registerWellKnownExpressionDefinition({
					name: "Test",
					json: topic
				});
				runtime.load(function(initError) {
					if(initError) {
						self.callback(initError, null)
					} else {
						var contextBase = {};
						var result = {
							count: 0
						}
						contextBase._resultCallback = function(res) {
							result.count++
							result.result = res
							self.callback(null, result)
						}
						contextBase._loopCallback = function() {
							self.callback("_loopCallback reached", null)
						};
						contextBase._inputExpression  = function() {
							self.callback("_inputExpression reached", null)
						};
						contextBase._variables = {};        
						contextBase._errorCallback =  function(err) {
							self.callback(err, null)
						};
						runtime.runExpressionByName("Test", contextBase ,null)
					}
				});
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be an object with the regular keys and the expression value, the last result in the expression block" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, {
					"name":"Super Dude"
				});
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	}

	,'When I have a JSON doc with one expression at the first level, a property with regular key and the value of that regular key is and a expression at third level': {
		topic: function() {
			return {
				"name":{
					"@return": "Super Dude"
				},
				"internalInfo": {
					"maxversion":"1",
					"currentVersion":{
						"@return": 11
					}
				}
			};    
		},
		
		"and I run it": {
			topic:function(topic) {
				var self = this
				var runtime = new Runtime()
				runtime.registerWellKnownExpressionDefinition({
					name: "Test",
					json: topic
				});
				runtime.load(function(initError) {
					if(initError) {
						self.callback(initError, null)
					} else {
						var contextBase = {};
						var result = {
							count: 0
						}
						contextBase._resultCallback = function(res) {
							result.count++
							result.result = res
							self.callback(null, result)
						}
						contextBase._loopCallback = function() {
							self.callback("_loopCallback reached", null)
						};
						contextBase._inputExpression  = function() {
							self.callback("_inputExpression reached", null)
						};
						contextBase._variables = {};        
						contextBase._errorCallback =  function(err) {
							self.callback(err, null)
						};
						runtime.runExpressionByName("Test", contextBase ,null)
					}
				});
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be an object, the last result in the expression block" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, {
				"name":"Super Dude",
				"internalInfo": {
					"maxversion":"1",
					"currentVersion":11
				}
			});
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	}	,
		"When I have a key a hint ' @set(x)' and I ask for the pure expression name": {
			topic: function() {
				return " @set(x)"
			}
			,"I should get 'set' without the symbol, whitespaces or hint": function(topic){
				assert.equal(jsonCode._testOnly_getExpressionNameFromSpecialKey(topic), "set")
			}
		},
		"When I have a key a hint ' @set(x)' and I ask for the hint": {
			topic: function() {
				return " @set(x)"
			}
			,"I should get 'x'": function(topic){
				assert.equal(jsonCode._testOnly_getHint(topic), "x")
			}
		},
		"When I have a key a hint ' @set(x' with no ending hint symbol and I ask for the hint": {
			topic: function() {
				return " @set(x"
			}
			,"I should get 'x'": function(topic){
				assert.equal(jsonCode._testOnly_getHint(topic), "x")
			}
		},
		'When I have a JSON document with a get expression and the hint is a variable that I setted in a higher expression': {
			topic: function() {
				return {
					"name":{
						"@get(passedVariable)": null
					},
				};    
			},
			"and I run it": {
				topic:function(topic) {
					var self = this
					var runtime = new Runtime()
					runtime.registerWellKnownExpressionDefinition({
						name: "Test",
						json: topic
					});
					runtime.load(function(initError) {
						if(initError) {
							self.callback(initError, null)
						} else {
							var contextBase = {};
							var result = {
								count: 0
							}
							contextBase._resultCallback = function(res) {
								result.count++
								result.result = res
								self.callback(null, result)
							}
							contextBase._loopCallback = function() {
								self.callback("_loopCallback reached", null)
							};
							contextBase._inputExpression  = function() {
								self.callback("_inputExpression reached", null)
							};
							contextBase._variables = {"passedVariable":"This is my Variable"};        
							contextBase._errorCallback =  function(err) {
								self.callback(err, null)
							};
							runtime.runExpressionByName("Test", contextBase ,null)
						}
					});
				},
				"the result should not be null" : function(expressionResult) {
					assert.isNotNull(expressionResult.result)
				},
				"the result should be an object with the variable value on it, the last result in the expression block" : function(expressionResult) {
					assert.deepEqual(expressionResult.result, { 
					"name":"This is my Variable",
				});
				},
				"the result callback should be called only once":  function(expressionResult) {
					assert.equal(expressionResult.count, 1)
				}
			}
		},
		'When I have nested up three nested expresions': {
			topic: function() {
				return {
					" @return": {
						" @return": {
							" @return": {
								name: "John"
							}
						}
					}
				};    
			},
			"and I run it": {
				topic:function(topic) {
					var self = this
					var runtime = new Runtime()
					runtime.registerWellKnownExpressionDefinition({
						name: "Test",
						json: topic
					});
					runtime.load(function(initError) {
						if(initError) {
							self.callback(initError, null)
						} else {
							var contextBase = {};
							var result = {
								count: 0
							}
							contextBase._resultCallback = function(res) {
								result.count++
								result.result = res
								self.callback(null, result)
							}
							contextBase._loopCallback = function() {
								self.callback("_loopCallback reached", null)
							};
							contextBase._inputExpression  = function() {
								self.callback("_inputExpression reached", null)
							};
							contextBase._variables = {};        
							contextBase._errorCallback =  function(err) {
								self.callback(err, null)
							};
							runtime.runExpressionByName("Test", contextBase ,null)
						}
					});
				},
				"the result should not be null" : function(expressionResult) {
					assert.isNotNull(expressionResult.result)
				},
				"the result should be the last nested value, the last result in the expression block" : function(expressionResult) {
					assert.deepEqual(expressionResult.result, {
								name: "John"
							});
				},
				"the result callback should be called only once":  function(expressionResult) {
					assert.equal(expressionResult.count, 1)
				}
			}
		},
		'When I have expressions inside an array': {
			topic: function() {
				return [
					{
						"@return": 1
					},
					{
						"@return": {
							x:64.2,
							y: 934.1
						}
					}
				]
			},
			"and I run it": {
				topic:function(topic) {
					var self = this
					var runtime = new Runtime()
					runtime.registerWellKnownExpressionDefinition({
						name: "Test",
						json: topic
					});
					runtime.load(function(initError) {
						if(initError) {
							self.callback(initError, null)
						} else {
							var contextBase = {};
							var result = {
								count: 0
							}
							contextBase._resultCallback = function(res) {
								result.count++
								result.result = res
								self.callback(null, result)
							}
							contextBase._loopCallback = function() {
								self.callback("_loopCallback reached", null)
							};
							contextBase._inputExpression  = function() {
								self.callback("_inputExpression reached", null)
							};
							contextBase._variables = {};        
							contextBase._errorCallback =  function(err) {
								self.callback(err, null)
							};
							runtime.runExpressionByName("Test", contextBase ,null)
						}
					});
				},
				"the result should not be null" : function(expressionResult) {
					assert.isNotNull(expressionResult.result)
				},
				"the result should be the array with the result of all expressions as items, the last result in the expression block" : function(expressionResult) {
					assert.deepEqual(expressionResult.result, [1,{
						x:64.2,
						y: 934.1
					}
						]);
				},
				"the result callback should be called only once":  function(expressionResult) {
					assert.equal(expressionResult.count, 1)
				}
			}
		}
}).export(module)
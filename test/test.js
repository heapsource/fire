var vows = require('vows')
var assert = require('assert')
var jsonCode = require('../src/core.js')
var Runtime = jsonCode.Runtime
jsonCode.exportTestOnlyFunctions();

var fs = require('fs'),
path = require('path')

function getTempTestOutputFileName(filename) {
	return "/tmp/" + filename
}

vows.describe('priest').addBatch({
		
	'When I have a object with no priest special keys': {
		topic: function() {
			return {
				"name":"Johan", 
				"age": 25
			};    
		},
		"and I compile it": {
			topic: function(topic) {
				return jsonCode._testOnly_compileExpressionFuncFromJSON(topic, "someFile.js",
				getTempTestOutputFileName('json2code.js'),
				"" // hint
				);
			},
			"it should not be null": function(topic){
				assert.isNotNull(topic)
			},
			"it should give a function Object": function(topic){
				assert.instanceOf(topic, Function)
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
			jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
				//sendInput("")
			}, function(){
				// break
			}, function(result) {
				cb(null, result)
			},getTempTestOutputFileName('json2code.js'),
			"" // hint
			)
		},
		"the result should not be null" : function(expressionResult) {
			assert.isNotNull(expressionResult)
		}
		,
		"the result should be a copy of the original JSON" : function(expressionResult) {
			assert.deepEqual(expressionResult, {
				"name":"Johan", 
				"age": 25
			});
		}
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
	,'When I have a simple priest expression that returns 2': {
		topic: function() {
			return {
				"@return": 2
			};    
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					cb(null, result)
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult)
			},
			"the result should be 2" : function(expressionResult) {
				assert.equal(expressionResult, 2);
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be 3, the last result in the expression block" : function(expressionResult) {
				assert.equal(expressionResult.result, 3);
			},
			"the result callback should be called only once":  function(expressionResult) {
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
	},'When I have two expression and the last expression returns an object': {
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
	},
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{"passedVariable":"This is my Variable"}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count 
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
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
	
}).export(module); 

vows.describe('priest variables scopes').addBatch({
	'When I have a JSON document with a set expression, other expressions on the same level should see the variable': {
		topic: function() {
			return {
				"@set(point)": {
					x:22.3,
					y:56.2
				},
				"@get(point)": null
			};    
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				jsonCode._testOnly_runJSONObject(topic,{passedVariable:"This is my Variable"}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be an object with the variable value on it, the last result in the expression block" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, {
					x:22.3,
					y:56.2
				});
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	},'When I have a @set expression in a inner scope of a previous statement ': {
		topic: function() {
			return {
				"@return": {
					"@set(v)": "Value"
				},
				"@get(v)": null
			};    
		},
		"and I run it outter context should not see the value ": {
			topic:function(topic) {
				var cb = this.callback
				jsonCode._testOnly_runJSONObject(topic,{passedVariable:"This is my Variable"}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					cb(null, result)
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should be undefined" : function(expressionResult) {
				assert.equal(expressionResult, undefined)
			},
			"the result should be undefined, the value of an undefined variable" : function(expressionResult) {
				assert.deepEqual(expressionResult, undefined);
			}
		}
	},'When I have a @set expression in a outer scope of a previous statement ': {
		topic: function() {
			return {
				"@set(v)": {
					"@set(something)": "Value",
					"@return": {
						"@return": {
							"@get(something)": null
						}
					}
				},
				"@get(v)": null
			};    
		},
		"and I run it inner context should see the value ": {
			topic:function(topic) {
				var cb = this.callback
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					cb(null, result)
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should be the value of the most inner expression" : function(expressionResult) {
				assert.equal(expressionResult, "Value")
			},
		}
	},
	'When I have a @set expression in a outer scope and a fourth level @set modifies the value ': {
		topic: function() {
			return {
				"@set(something)": "Value",
				"@return": {
					"@return": {
						"@return": {
							"@return": {
								"@return": {
									"@return": {
										"@set(something)": "Changed at deep levels",
										"@return": null
									}
								}
							}
						}
					}
				},
				"@get(something)": null
			};    
		},
		"and I run it the outer context should see the value ": {
			topic:function(topic) {
				var cb = this.callback
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					//console.warn("break")
					// break
				}, function(result) {
					cb(null, result)
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should be the value of the most inner expression" : function(expressionResult) {
				assert.equal(expressionResult, "Changed at deep levels")
			},
		}
	},
	
	'When I have a @set expression in a inner scope and I use @get on the same variable on an outer scope': {
		topic: function() {
			return {
				"@return": {
					"@set(something)": "Value",
					"@return": "Something else"
				},
				"@get(something)": null
			};    
		},
		"and I run it the outer context should not see the value ": {
			topic:function(topic) {
				var cb = this.callback
				jsonCode._testOnly_runJSONObject(topic,{"x":4000}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					//console.warn("break")
					// break
				}, function(result) {
					cb(null, result)
				},getTempTestOutputFileName('json2code.js'),"")
			},
			"the result should be undefined" : function(expressionResult) {
				assert.isUndefined(expressionResult)
			},
		}
	},
}).export(module);

vows.describe('priest _result tests').addBatch({
	'When the first expression in a block returns a value and the last expression returns the parent value': {
		topic: function() {
			return  {
				"@return":"Super Result on the same level",
				"@testReturnParentResult": null
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testReturnParentResultPath = path.join(__dirname, "expressions/testReturnParentResult.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				}, [testReturnParentResultPath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the second expression should be able to reach the last result of the container block, the parent result" : function(expressionResult) {
				assert.equal(expressionResult.result, "Super Result on the same level") // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When the unique expression in the first level of a document returns the parent value': {
		topic: function() {
			return  {
				"@testReturnParentResult": null
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testReturnParentResultPath = path.join(__dirname, "expressions/testReturnParentResult.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				}, [testReturnParentResultPath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be undefined since there is no results in the expression block yet" : function(expressionResult) {
				assert.equal(expressionResult.result, undefined) // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When the unique expression in the second level of a document returns the parent value': {
		topic: function() {
			return  {
				"@return": "Something",
				"@return": {
					"@testReturnParentResult": null
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testReturnParentResultPath = path.join(__dirname, "expressions/testReturnParentResult.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				}, [testReturnParentResultPath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be undefined since there is no results in the expression block yet" : function(expressionResult) {
				assert.equal(expressionResult.result, undefined) // check expressions/testExpThatRaisesError.js
			}
		}
	}
}).export(module);

vows.describe('priest error handling').addBatch({
	'When a nested expression raises an error and is not handled by any of the nested expressions': {
		topic: function() {
			return  {
					"@return": {
						"@testExpThatRaisesError":null
					}
				}
			
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testExpThatRaisesErrorFilePath = path.join(__dirname, "expressions/testExpThatRaisesError.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[testExpThatRaisesErrorFilePath])
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.count, 0)
			},
			"the error callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 1)
			},
			"the result should be undefined" : function(expressionResult) {
				assert.equal(expressionResult.result, undefined)
			}
			,
			"the result callback not be undefined" : function(expressionResult) {
				assert.equal(expressionResult.errorInfo.error, "Help!!!... Chuck Norris is in da house!") // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When a nested expression raises an error and a @try expression catches the error and I use @returnError': {
		topic: function() {
			return  {
					"@try":{
						"@return": {
							"@testExpThatRaisesError":null
						}
					},
					"@returnError":null
				}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testExpThatRaisesErrorFilePath = path.join(__dirname, "expressions/testExpThatRaisesError.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[testExpThatRaisesErrorFilePath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be the error" : function(expressionResult) {
				assert.equal(expressionResult.result.error, "Help!!!... Chuck Norris is in da house!") // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When a nested expression inside @try does not raises any error': {
		topic: function() {
			return  {
					"@try":{
						"@return": "I'm not an error :)"
					}
				}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				//var testExpThatRaisesErrorFilePath = path.join(__dirname, "expressions/testExpThatRaisesError.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				})
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be the input of the @try expression" : function(expressionResult) {
				assert.equal(expressionResult.result, "I'm not an error :)") // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When a nested expression raises an error and a @try expression is followed by a @catch expression': {
		topic: function() {
			return  {
					"@try":{
						"@testExpThatRaisesError":null
					}, 
					"@catch": "We got an error here!"
				}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testExpThatRaisesErrorFilePath = path.join(__dirname, "expressions/testExpThatRaisesError.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[testExpThatRaisesErrorFilePath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be the input of the @catch expression" : function(expressionResult) {
				assert.equal(expressionResult.result, "We got an error here!") // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When a nested expression raises an error and a @try expression is followed by two @catch expressions': {
		topic: function() {
			return  {
					"@try":{
						"@testExpThatRaisesError":null
					}, 
					"@catch": "First Error catch, yay!",
					" @catch": "Opps, the error was cleared out by the previous, so @catch stays with the last value"
				}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testExpThatRaisesErrorFilePath = path.join(__dirname, "expressions/testExpThatRaisesError.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[testExpThatRaisesErrorFilePath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be the input of the first catch as the first @catch clears the error and the second never hits" : function(expressionResult) {
				assert.equal(expressionResult.result, "First Error catch, yay!") // check expressions/testExpThatRaisesError.js
			}
		}
	},
	'When a nested expression raises an error and a @try expression is followed by two @resetError @catch expressions': {
		topic: function() {
			return  {
					"@try":{
						"@testExpThatRaisesError":null
					}, 
					"@resetError": null,
					"@catch": "Never returned"
				}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var errorCount = 0
				var tResult = undefined
				var testExpThatRaisesErrorFilePath = path.join(__dirname, "expressions/testExpThatRaisesError.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					console.warn("break here")
					// break
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[testExpThatRaisesErrorFilePath])
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the result should be undefined" : function(expressionResult) {
				assert.equal(expressionResult.result, undefined)
			}
		}
	}
}).export(module);

vows.describe('priest loop control').addBatch({
	'When an expression contains a loop control expression, the loopCallback should be called': {
		topic: function() {
			return  {
					"@testDoLoopControl": null
				}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				var expPath = path.join(__dirname, "expressions/testDoLoopControl.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[expPath])
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.count, 0)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 1)
			}
		}
	},
	'When an expression block contains a loop control expression as the input': {
		topic: function() {
			return  {
				"@return": {
					"@return": 1,
					"@return": {
						"@set(x)": 26,
						"@get(x)": null,
						"@testDoLoopControl": null,
						"@return": 51
					}
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				var expPath = path.join(__dirname, "expressions/testDoLoopControl.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[expPath])
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.isUndefined(expressionResult.result)
				assert.equal(expressionResult.count, 0)
				
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 1)
			}
		}
	},
	'When an expression array contains a loop control expression nested in the input': {
		topic: function() {
			return  {
				"@return": {
					"@return": 1,
					"@return": [
						{
							"@set(x)": 26
						},
						{
							"@get(x)": null
						},
						{
							"@testDoLoopControl": null
						},
						{
							"@return": 51
						}
					]
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				var expPath = path.join(__dirname, "expressions/testDoLoopControl.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[expPath])
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.isUndefined(expressionResult.result)
				assert.equal(expressionResult.count, 0)
				
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 1)
			}
		}
	},
	'When an expression array contains a loop control expression nested two levels down in the input': {
		topic: function() {
			return  {
				"@return": {
					"@return": 1,
					"@return": [
						{
							"@set(x)": 26
						},
						{
							"@get(x)": null
						}, {
							"@return": {
								x:500,
								y:400
							},
							"@testDoLoopControl":null,
							"@return": "something"
						},
						{
							"@return": 51
						}
					]
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				var expPath = path.join(__dirname, "expressions/testDoLoopControl.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[expPath])
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.isUndefined(expressionResult.result)
				assert.equal(expressionResult.count, 0)
				
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 1)
			}
		}
	},
	'When I have a @break at the first level': {
		topic: function() {
			return  {
				"@break": null
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				//var expPath = path.join(__dirname, "expressions/testDoLoopControl.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				})
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.isUndefined(expressionResult.result)
				assert.equal(expressionResult.count, 0)
				
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 1)
			}
		}
	},
	
	'When I have a @break at a second level': {
		topic: function() {
			return  {
				"@return": {
					"@break": null
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				//var expPath = path.join(__dirname, "expressions/testDoLoopControl.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				})
			},
			"the result callback should not be called at all":  function(expressionResult) {
				assert.isUndefined(expressionResult.result)
				assert.equal(expressionResult.count, 0)
				
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 1)
			}
		}
	},
	'When I have a @loop at a second level and a expression that breaks at third time': {
		topic: function() {
			return  {
				"@loop": {
					"@testExecAtThirdTime":{
						"@break": null	
					},
					"@return": "Item"
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[path.join(__dirname, "expressions/testExecAtThirdTime.js")])
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 0)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 0)
			},
			"the result should be an array with three items":  function(expressionResult) {
				assert.deepEqual(expressionResult.result, ["Item", "Item", "Item"])
			}
		}
	},
	'When I have a @loop at a second level and a expression continue at second time': {
		topic: function() {
			return  {
				"@loop": {
					"@testIncrementedName(Item)": null,
					"@testExecAtFirstTime":{
						"@continue": null
					},
					"@testExecAtThirdTime": {
						"@break": null
					}
				}
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var breakCount = 0
				var tResult = undefined
				var errorCount = 0
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					breakCount++ // loop
					cb(null, {
						result: tResult,
						count: count,
						breakCount: breakCount,
						errorCount: errorCount
					})
				}, function(result) {
					
					tResult = result
					count++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount:errorCount
					})
				},getTempTestOutputFileName('json2code.js'),"", function(errorInfo){
					errorCount++
					cb(null, {
						result:tResult,
						count:count,
						breakCount: breakCount,
						errorCount: errorCount,
						errorInfo: errorInfo
					})
				},[path.join(__dirname, "expressions/testExecAtFirstTime.js"), path.join(__dirname, "expressions/testExecAtThirdTime.js"),path.join(__dirname, "expressions/testIncrementedName.js")])
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 0)
			},
			"the error callback should not be called at all":  function(expressionResult) {
				assert.equal(expressionResult.errorCount, 0)
			},
			"the loop callback should be called once" : function(expressionResult) {
				assert.equal(expressionResult.breakCount, 0)
			},
			"the result should be an array with two items":  function(expressionResult) {
				assert.deepEqual(expressionResult.result, ["Item0", "Item1", "Item3"])
			}
		}
	}
}).export(module);
 
vows.describe('priest @get paths').addBatch({
	'When I use @get to get the second item in the array': {
		topic: function() {
			return  {
				"@set(numbers)": [
					"Zero",
					"One",
					"Two"
				],
				"@get(numbers[1])": undefined
			}
		},
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function() {
				}, function(result) {
					cb(null, result)
				})
			},
			"I should get the second item in the array": function(result) {
				assert.equal(result,"One")
			}
		}, 
	}
}).export(module);

vows.describe('priest manifests').addBatch({
	'Having a Runtime with no configuration': {
		topic: function() {
			require.paths.unshift(path.join(__dirname,'manifests/testModules/node_modules')); // because we are testing in a different directory
			
			return new Runtime()
		},
		"when I set up a runtime with a manifest with two modules ": {
			topic:function(runtime) {
				
				runtime.loadFromManifestFile(path.join(__dirname,"manifests/testModules/priest.manifest.json"))
				return runtime
			},
			"the expression expressionModule1 should be loaded": function(runtime) {
				assert.isTrue(runtime.isExpressionLoaded("expressionModule1"))
			},
			"the expression expressionModule2 should be loaded": function(runtime) {
				assert.isTrue(runtime.isExpressionLoaded("expressionModule2"))
			},
			"and once the modules are loaded": {
				"we test the first": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("expressionModule1", contextBase ,null)
					},
					"it should work properly": function(err, res) {
					 	assert.equal(res, "Hello World expressionModule1")
					}
				},
				"we test the second": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("expressionModule2", contextBase ,null)
					},
					"it should work properly": function(err, res) {
					 	assert.equal(res, "Hello World expressionModule2")
					}
				}
			}
		}
	},
	'when I set up a runtime with a manifest and missing configuration for a module': {
		"the load from manifest should fail": function() {
			require.paths.unshift(path.join(__dirname,'manifests/testConfigMissing/node_modules')); // because we are testing in a different directory
			var runtime = new Runtime()
			assert.throws(function() {
				runtime.loadFromManifestFile(path.join(__dirname,"manifests/testConfigMissing/priest.manifest.json"))
				})
		},
		"the load from manifest should fail with message": function() {
			require.paths.unshift(path.join(__dirname,'manifests/testConfigMissing/node_modules')); // because we are testing in a different directory
			var runtime = new Runtime()
			
			try {
				runtime.loadFromManifestFile(path.join(__dirname,"manifests/testConfigMissing/priest.manifest.json"))
			}catch(moduleErrorMsg) {
				assert.equal(moduleErrorMsg,"database connection info is missing")
			}
		}
	}
}).export(module);

vows.describe('priest environments').addBatch({
	'Having a Runtime running in production': {
		topic: function() {
			process.env.NODE_ENV="production"
			return new Runtime()
		},
		"when I query what is the environment of the runtime ": {
			topic:function(runtime) {
				return runtime.environmentName
			},
			"it should be production": function(env) {
				assert.equal(env,"production")
			}
		}
	},
	'Having a Runtime running in development': {
		topic: function() {
			process.env.NODE_ENV="development"
			return new Runtime()
		},
		"when I query what is the environment of the runtime ": {
			topic:function(runtime) {
				return runtime.environmentName
			},
			"it should be production": function(env) {
				assert.equal(env,"development")
			}
		}
	},
	'Having a Runtime running with no explicit enviroment': {
		topic: function() {
			return new Runtime()
		},
		"when I query what is the environment of the runtime ": {
			topic:function(runtime) {
				return runtime.environmentName
			},
			"it should be development(the default environment)": function(env) {
				assert.equal(env,jsonCode.DEFAULT_ENVIRONMENT)
			}
		}
	}
}).export(module);

vows.describe('priest configurations').addBatch({
	'Working in a custom environment': {
		topic: function() {
			require.paths.unshift(path.join(__dirname,'manifests/testConfig/node_modules')); // because we are testing in a different directory
			process.env.NODE_ENV="customEnv1"
			return new Runtime()
		},
		"when I set up a runtime": {
			topic:function(runtime) {
				runtime.loadFromManifestFile(path.join(__dirname,"manifests/testConfig/priest.manifest.json"))
				return runtime
			},
			"and once the modules are loaded": {
				"and we run it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("module1", contextBase ,null)
					},
					"it should work with the configurations": function(err, res) {
					 	assert.equal(res, "Hello World with configurations, server configuration host is 127.0.0.1 is and the environment is customEnv1")
					}
				}
			}
		}
	}
}).export(module);

vows.describe('priest JSON definition registration').addBatch({
	'Having a JSON document with the definition of a priest expression': {
		topic: function() {
			return new Runtime()
		},
		"then when we register ": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"customJsonExpression",
					json: {
						"@return": 500
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("customJsonExpression", contextBase ,null)
					},
					"it should return the value specified in the priest JSON document given in the definition": function(err, res) {
					 	assert.equal(res, 500)
					}
			}
		}
	}
}).export(module);

vows.describe('priest @each built-in expression').addBatch({
	'Having a JSON document with an @each expression': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEach",
					json: {
						"@set(ids)": ['a552','a553','a554','a555'],
						"@each(ids)": {
							"id":{
								"@get(idsCurrentItem)": null
							}
						}
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEach", contextBase ,null)
					},
					"it should iterate the variable given in the hint and return an array with converted documents from the input": function(err, res) {
					 	assert.deepEqual(res, [{
							"id": "a552"
						},{
							"id": "a553"
						},
						{
							"id": "a554"
						},
						{
							"id": "a555"
						}])
					}
			}
		}
	},
	'Having a JSON document with an @each expression and no hint': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEach",
					json: {
						"@return": ['a552','a553','a554','a555'],
						"@each": {
							"id":{
								"@get(CurrentItem)": null
							}
						}
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEach", contextBase ,null)
					},
					"it should iterate the last value in the block and return an array with converted documents from the input": function(err, res) {
					 	assert.deepEqual(res, [{
							"id": "a552"
						},{
							"id": "a553"
						},
						{
							"id": "a554"
						},
						{
							"id": "a555"
						}])
					}
			}
		}
	}
}).export(module);


vows.describe('priest @if built-in expression').addBatch({
	'Having a JSON document with an @if expression and there is no result in the block': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIf",
					json: {
						"@if": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIf", contextBase ,null)
					},
					"it should return undefined": function(err, res) {
					 	assert.isUndefined(res)
					}
			}
		}
	},
	'Having a JSON document with an @if expression which previous statement is true': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIf",
					json: {
						"@return": true,
						"@if": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIf", contextBase ,null)
					},
					"should return the input": function(err, res) {
					 	assert.equal(res,"Got them!")
					}
			}
		}
	},
	'Having a JSON document with an @if expression with a path that doesn not exist': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIf",
					json: {
						"@if(doesntExist)": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIf", contextBase ,null)
					},
					"should return undefined": function(err, res) {
					 	assert.isUndefined(res)
					}
			}
		}
	},
	'Having a JSON document with an @if expression with a path that returns false': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIf",
					json: {
						"@set(contactFound)" : false,
						"@if(contactFound)": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIf", contextBase ,null)
					},
					"should return false": function(err, res) {
					 	assert.isUndefined(res)
					}
			}
		}
	},
	'Having a JSON document with an @if expression with a path that returns true': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIf",
					json: {
						"@set(contactFound)" : true,
						"@if(contactFound)": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIf", contextBase ,null)
					},
					"should return false": function(err, res) {
					 	assert.equal(res, "Got them!")
					}
			}
		}
	}
}).export(module);



vows.describe('priest booleans').addBatch({
	'Having a JSON document with a boolean value false': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testFalse",
					json: {
						"@return": false
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testFalse", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.strictEqual(res, false)
					}
			}
		}
	},
	'Having a JSON document with a boolean value true': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testTrue",
					json: {
						"@return": true
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testTrue", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.strictEqual(res, true)
					}
			}
		}
	}
}).export(module);

vows.describe('priest @unless built-in expression').addBatch({
	'Having a JSON document with an @unless expression and there is no result in the block': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testUnless",
					json: {
						"@unless": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testUnless", contextBase ,null)
					},
					"it should return the input": function(err, res) {
					 	assert.equal(res, "Got them!")
					}
			}
		}
	},
	'Having a JSON document with an @unless expression which previous statement is true': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testUnless",
					json: {
						"@return": true,
						"@unless": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testUnless", contextBase ,null)
					},
					"should return true literal value": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a JSON document with an @unless expression which previous statement a string': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testUnless",
					json: {
						"@return": "Some String",
						"@unless": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testUnless", contextBase ,null)
					},
					"should return true literal value": function(err, res) {
					 	assert.equal(res, "Some String")
					}
			}
		}
	},
	'Having a JSON document with an @unless expression with a path that doesn not exist': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testUnless",
					json: {
						"@unless(doesntExist)": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testUnless", contextBase ,null)
					},
					"should return undefined": function(err, res) {
					 	assert.equal(res, "Got them!")
					}
			}
		}
	},
	'Having a JSON document with an @unless expression with a path that returns false': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testUnless",
					json: {
						"@set(contactFound)" : false,
						"@unless(contactFound)": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testUnless", contextBase ,null)
					},
					"should return false": function(err, res) {
					 	assert.equal(res, "Got them!")
					}
			}
		}
	},
	'Having a JSON document with an @unless expression with a path that returns true': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testUnless",
					json: {
						"@set(contactFound)" : true,
						"@unless(contactFound)": "Got them!"
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testUnless", contextBase ,null)
					},
					"should return false": function(err, res) {
					 	assert.isUndefined(res)
					}
			}
		}
	}
}).export(module);


vows.describe('priest @equals').addBatch({
	'Having a @equals expressions without at least two comparable values': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals": []
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should should return undefined": function(err, res) {
					 	assert.isUndefined(res)
					}
			}
		}
	},
	'Having a @equals expressions with two identical values': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals": ['Same', 'Same']
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should should true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a @equals expressions with two different values': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals": ['Same', 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
	'Having a @equals expressions with two similar values but not with the same type': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals": [5, '5']
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a @equals expressions with three similar values but not with the same type': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals": [5, '5', 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a @equals expressions with more than three similar values but not with the same type': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals": [5, '5', 5, 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a @equals expressions with two similar values but not with the same type in strict mode': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals(strict)": [5, '5']
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
	'Having a @equals expressions with two similar values and type in strict mode': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testEquals",
					json: {
						"@equals(strict)": [5, 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testEquals", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
}).export(module);




vows.describe('priest @notEquals').addBatch({
	'Having a @notEquals expressions without at least two comparable values': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals": []
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should should return undefined": function(err, res) {
					 	assert.isUndefined(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with two identical values': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals": ['Same', 'Same']
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should should false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with two different values': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals": ['Same', 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with two similar values but not with the same type': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals": [5, '5']
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with three similar values but not with the same type': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals": [5, '5', 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with more than three similar values but not with the same type': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals": [5, '5', 5, 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with two similar values but not with the same type in strict mode': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals(strict)": [5, '5']
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should return true": function(err, res) {
					 	assert.isTrue(res)
					}
			}
		}
	},
	'Having a @notEquals expressions with two similar values and type in strict mode': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testNotEquals",
					json: {
						"@notEquals(strict)": [5, 5]
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testNotEquals", contextBase ,null)
					},
					"it should return false": function(err, res) {
					 	assert.isFalse(res)
					}
			}
		}
	},
}).export(module);

vows.describe('priest @increment').addBatch({
	'Having a @increment expression using a undefined variable': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIncrement",
					json: {
						"@increment(x)": 1
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIncrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @increment expression using a undefined variable': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIncrement",
					json: {
						"@increment(x)": 1
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIncrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @increment expression using a null variable': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIncrement",
					json: {
						"@set(x)": null,
						"@increment(x)": 1
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIncrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @increment expression using a undefined input': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIncrement",
					json: {
						"@set(x)": 426.1,
						"@increment(x)": undefined
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIncrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @increment expression using a null input': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIncrement",
					json: {
						"@set(x)": 426.1,
						"@increment(x)": null
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIncrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @increment expression using number variable and input': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testIncrement",
					json: {
						"@set(x)": 425,
						"@increment(x)": 25
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testIncrement", contextBase ,null)
					},
					"it should should return the sum": function(err, res) {
					 	assert.equal(res,450)
					}
			}
		}
	}
}).export(module);


vows.describe('priest @decrement').addBatch({
	'Having a @decrement expression using a undefined variable': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testDecrement",
					json: {
						"@decrement(x)": 1
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testDecrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @decrement expression using a undefined variable': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testDecrement",
					json: {
						"@increment(x)": 1
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testDecrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @decrement expression using a null variable': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testDecrement",
					json: {
						"@set(x)": null,
						"@increment(x)": 1
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testDecrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @decrement expression using a undefined input': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testDecrement",
					json: {
						"@set(x)": 426.1,
						"@increment(x)": undefined
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testDecrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @decrement expression using a null input': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testDecrement",
					json: {
						"@set(x)": 426.1,
						"@increment(x)": null
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testDecrement", contextBase ,null)
					},
					"it should should return NaN": function(err, res) {
					 	assert.isNaN(res)
					}
			}
		}
	},
	'Having a @decrement expression using number variable and input': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testDecrement",
					json: {
						"@set(x)": 425,
						"@decrement(x)": 25
					}
				})
				return runtime
			},
			"and execute it": {
					topic: function(runtime) {
						var self = this
						var contextBase = {};
						contextBase._resultCallback = function(res) {
							self.callback(null, res)
						}
						contextBase._loopCallback = function() {};
						contextBase._inputExpression  = function() {};
						contextBase._variables = {};            
						contextBase._errorCallback =  function() {};
						runtime.runExpressionByName("testDecrement", contextBase ,null)
					},
					"it should should return the substraction": function(err, res) {
					 	assert.equal(res,400)
					}
			}
		}
	}
}).export(module);

vows.describe('priest async execution').addBatch({
	'When I have a JSON doc that creates a regular object based on async expression keys': {
		topic: function() {
			return {
				"enlistedPersons": {
					"@testTickedReturn(1000)": [1,2,3,4]
				},
				"disabledPersons": {
					"@testTickedReturn(200)": [5,6,7,8,9]
				}
			};    
		},
		
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var testtickedReturnPath = path.join(__dirname, "expressions/tickedReturn.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"", function(err) {
					throw err
				},[testtickedReturnPath])
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be an object with the result of all the async expresion keys" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, {
					"enlistedPersons": [1,2,3,4],
					"disabledPersons": [5,6,7,8,9]
				});
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	},
	'When I have a JSON doc that creates a regular array based on async expressions': {
		topic: function() {
			return [
				{
					"@testTickedReturn(1000)": [1,2,3,4]
				},
				50000
				,
				{
					"@testTickedReturn(200)": [5,6,7,8,9]
				},40000
			];    
		},
		
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var testtickedReturnPath = path.join(__dirname, "expressions/tickedReturn.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"", function(err) {
					throw err
				},[testtickedReturnPath])
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be an array with the results in the right order" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, [[1,2,3,4],50000,[5,6,7,8,9],40000]);
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	},
	'When I have a JSON doc that returns values async': {
		topic: function() {
			return {
					"@testTickedReturn(1000)": "First Expression",
					"@testTickedReturn(200)": "Last Expression"
			};    
		},
		
		"and I run it": {
			topic:function(topic) {
				var cb = this.callback
				var count = 0;
				var testtickedReturnPath = path.join(__dirname, "expressions/tickedReturn.js")
				jsonCode._testOnly_runJSONObject(topic,{}, function(sendInput) {
					sendInput("Lots of Crap")
				}, function(){
					// break
				}, function(result) {
					count++
					cb(null, {
						result:result,
						count:count
					})
				},getTempTestOutputFileName('json2code.js'),"", function(err) {
					throw err
				},[testtickedReturnPath])
			},
			"the result should not be null" : function(expressionResult) {
				assert.isNotNull(expressionResult.result)
			},
			"the result should be the last value" : function(expressionResult) {
				assert.deepEqual(expressionResult.result, "Last Expression");
			},
			"the result callback should be called only once":  function(expressionResult) {
				assert.equal(expressionResult.count, 1)
			}
		}
	}

}).export(module);

vows.describe('priest @input').addBatch({
	'Having a JSON code that returns the input using a @input at first level': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testInput",
					json: {
						"@return": {
							"@input": null
						}
					}
				})
				return runtime
			},
			"and execute it": {
				topic: function(runtime) {
					var self = this
					var contextBase = {};
					contextBase._resultCallback = function(res) {
						self.callback(null, res)
					}
					contextBase._loopCallback = function() {};
					contextBase._inputExpression  = function() {
						this.setResult("super input Result")
					};
					contextBase._variables = {};            
					contextBase._errorCallback =  function() {};
					runtime.runExpressionByName("testInput", contextBase ,null)
				},
				"it should return the input callback": function(err, res) {
					assert.equal(res,"super input Result")
				}
			}
		}
	},
	'Having a JSON code that returns the input using a @input at third level': {
		topic: function() {
			return new Runtime()
		},
		"when we register it": {
			topic:function(runtime) {
				runtime.registerWellKnownExpressionDefinition({
					name:"testInput",
					json: {
						"@return": {
							"@return": {
								"@return": {
									"@input": null
								}
							}
						}
					}
				})
				return runtime
			},
			"and execute it": {
				topic: function(runtime) {
					var self = this
					var contextBase = {};
					contextBase._resultCallback = function(res) {
						self.callback(null, res)
					}
					contextBase._loopCallback = function() {};
					contextBase._inputExpression  = function() {
						this.setResult("super input Result")
					};
					contextBase._variables = {};            
					contextBase._errorCallback =  function() {};
					runtime.runExpressionByName("testInput", contextBase ,null)
				},
				"it should return the input callback": function(err, res) {
					assert.equal(res,"super input Result")
				}
			}
		}
	},
}).export(module);;



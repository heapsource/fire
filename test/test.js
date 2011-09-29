var vows = require('vows')
var assert = require('assert')
var jsonCode = require('../src/core.js')
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
				"@set":"Super Result on the same level",
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
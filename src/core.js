var vm = require('vm')
var util = require('util')
var StringBuffer = require('./StringBuffer')
var NameGenerator = require('./NameGenerator')
var Error = require('./Error')
var fs = require('fs')
var path = require('path')
var RuntimeError = require('./RuntimeError')
module.exports.Error = Error

function throwInternalError(msg) {
	console.trace()
	throw "JSONCode internal error, " + msg
}

var SPECIAL_KEY_SYMBOL = "@"
var HINT_START_SYMBOL = "("
var HINT_END_SYMBOL = ")"

function trimString(str) {
	if(str == null || str == undefined) return str
	
	return str.replace(/^\s\s*/,'').replace(/\s\s*$/,'')
}
//Untested
function isSpecialKey(propName) {
	//	console.warn(propName)
	var n = trimString(propName)
	return n.indexOf(SPECIAL_KEY_SYMBOL) == 0
}

function keyHasHint(propName) {
	return propName.indexOf(HINT_START_SYMBOL) > -1
}

function getHint(propName) {
	if(!keyHasHint(propName)) return undefined;
	var hintEndIndex = propName.indexOf(HINT_END_SYMBOL)
	if(hintEndIndex > 1) {
		return propName.substring(propName.indexOf(HINT_START_SYMBOL) + 1,hintEndIndex)
	}
	return propName.substring(propName.indexOf(HINT_START_SYMBOL) + 1,propName.length)
}

function getHint4Js(hint) {
	return JSON.stringify(hint)
}

function getHint4JsFromPropName(propName) {
	var hint = getHint(propName)
	return getHint4Js(hint)
}

function getExpressionNameFromSpecialKey(propName) {
	if(!isSpecialKey(propName)){
		throwInternalError("Asked to extract special from a key that is not a special key, the key was '" + propName + "'")
	}
	propName = trimString(propName)
	if(keyHasHint(propName)) {
		propName = propName.substring(0,propName.indexOf(HINT_START_SYMBOL))
	}
	return propName.substring(1,propName.length)
}

function isPureJSONValue(jsonObj) {
	if(jsonObj == null) {
		return false;
	}
	else if(typeof(jsonObj) === 'number') {
		return true;
	}
	else if(typeof(jsonObj) === 'string') {
		return true;
	}
	else if(typeof(jsonObj) === 'object') {
		if(jsonObj instanceof Array) {
			// Check all the items.
			for(var index in jsonObj) {
				var item = jsonObj[index]
				if(!isPureJSONValue(item)) {
					return false
				}
			}
			return true;
			//throwInternalError("Can't process arrays yet")
		} else if(jsonObj instanceof Object) {
			for(var propName in jsonObj) {
				if(isSpecialKey(propName)) {
					return false
				}
				if(!isPureJSONValue(jsonObj[propName])) {
					return false
				}
			}
			return true;
		}
	}
	throwInternalError("can't recognize the following value: " + jsonObj);
}

function objectIsExpression(jsonObj) {
	for(var propName in jsonObj) 
	{
		if(isSpecialKey(propName)) {
			return true
		}
	}
	return false;
}

function checkIfIsIsNotMixingKeys(jsonObj) {
	for(var propName in jsonObj) 
	{
		if(!isSpecialKey(propName)) {
			throw new Error("JS1001","Regular key '" + propName +"' was found in a expression block. Regular JSON keys and expression keys can not be mixed at the same level of the document.")
		}
	}
}

function navigateKeys(obj,callback) {
	var keys = Object.keys(obj)
	var l = keys.length
	for(var i = 0;i < l;i++) {
		callback({
			key:keys[i],
			isLast: i == l -1
		})
	}
}

function generateExpressionReadyFunction(jsonObj, buffer, names) {
	buffer.writeLine("function() {")
	buffer.indent()
	var selfVarname = names.name("self")
	var resultVarName = selfVarname + "._blockContext._result"
	buffer.writeLine("var " + selfVarname +  " = this;")
	buffer.writeLine("var " + names.name("callbackVar") + " = this._blockContext._resultCallback;")
	buffer.writeLine("var " + names.name("localBlockContext") + " = this._blockContext;")
	buffer.writeLine("var " + names.name("localContext") + " = this;")
	
	if(isPureJSONValue(jsonObj)) {
		buffer.writeLine(resultVarName + " = " + JSON.stringify(jsonObj) + ";")
		buffer.writeLine("this._blockContext._resultCallback(" + resultVarName +  ");")
	} else {
		if(jsonObj instanceof Array) {
			// Second level blocks
				buffer.writeLine(resultVarName + " = [];")
				for(var index in jsonObj) {
					var childInputJsonObj = jsonObj[index]
					var isLast = index == jsonObj.length - 1
					generateExpressionBlockFunctionWrapper(childInputJsonObj, buffer, names, function(blockBuffer, blockNames) {
						blockBuffer.writeLine("function("+ blockNames.name("subLevelResArg") +"){")
						blockBuffer.indent()
						blockBuffer.writeLine(resultVarName + ".push(" + blockNames.name("subLevelResArg") + ");")
						if(isLast) {
							// if this is the last expression of the array, call the result callback.
							blockBuffer.writeLine(names.name("callbackVar") + "("+ resultVarName +");")
						}
						blockBuffer.unindent()
						blockBuffer.writeLine("}")
					},null)
				}
		}
		else if(jsonObj instanceof Object) {
			if(objectIsExpression(jsonObj)) {
				checkIfIsIsNotMixingKeys(jsonObj)
				// Render all the block expressions.
				navigateKeys(jsonObj, function(iteration) {
					var propName = iteration.key
					//console.warn("propName =============================== , ", propName)
					var childInputJsonObj = jsonObj[propName];
					
					buffer.writeLine("this._runExp(")
					buffer.indent()
					var childExprName = getExpressionNameFromSpecialKey(propName)
					buffer.writeLine('"' + childExprName + '"')
					
					// Begin Input Callback Generation
					buffer.writeLine(",{_inputExpression:")
					generateExpressionReadyFunction(childInputJsonObj, buffer, names.createInner());
					
					//End of Input Callback Generation
					
					// Begin Result Callback Generation
					buffer.writeLine(", _resultCallback: function(" + names.name("incResult") + "){")
					buffer.indent()
					buffer.writeLine(resultVarName + " = " + names.name("incResult") + ";")
					if(iteration.isLast) {
						// if this is the last expression of the block, call the result callback.
						buffer.writeLine(names.name("callbackVar") + "("+ names.name("incResult") +");")
					}
					buffer.unindent()
					buffer.writeLine("}")
					//End of Result Callback Generation
					buffer.writeLine(", _hint: " + getHint4JsFromPropName(propName))
					buffer.unindent()
					buffer.writeLine("});")
				}); // end of properties iteration
			} else {
				// Second level blocks
				buffer.writeLine(resultVarName + " = {};")
				navigateKeys(jsonObj, function(iteration) {
					var propName = iteration.key
					//console.warn("regular propName =============================== , ", propName)
					var childInputJsonObj = jsonObj[propName];
					
					generateExpressionBlockFunctionWrapper(childInputJsonObj, buffer, names, function(blockBuffer, blockNames) {
						blockBuffer.writeLine("function("+ blockNames.name("subLevelResArg") +"){")
						blockBuffer.indent()
						blockBuffer.writeLine(resultVarName + "['"+ propName +"'] = " + blockNames.name("subLevelResArg") + ";")
						if(iteration.isLast) {
							// if this is the last expression of the block, call the result callback.
							blockBuffer.writeLine(names.name("callbackVar") + "("+ resultVarName +");")
						}
						blockBuffer.unindent()
						blockBuffer.writeLine("}")
					},getHint(propName))
					/*
					generateExpressionBlockFunction(childInputJsonObj, buffer, names, function(childBLockResultArgName) {
						buffer.writeLine(names.name("callbackVar") + "("+names.name("incResult")+");")
					})*/
				});
			}
		}
	}

	buffer.unindent()
	buffer.writeLine("}")
}

function generateExpressionBlockFunctionWrapper(jsonObj, buffer, names, writeResultCallback, hint) {
	/*if(hint === undefined){
		throwInternalError("generateExpressionBlockFunctionWrapper requires hint")
	}*/
		// Create call to runExpressionByFunc, check signature to understand what we are doing here.
	buffer.writeLine("this._runExp(")
	buffer.indent()
	generateExpressionReadyFunction(jsonObj, buffer, names.createInner())
	buffer.writeLine(",{")
	buffer.writeLine("_resultCallback: ");
	writeResultCallback(buffer, names),
	buffer.write(","),
	buffer.writeLine("_hint: " + getHint4Js(hint))
	buffer.write("}"),
	buffer.unindent()
	buffer.writeLine(");")
}

function generateFunctionFromJSONExpression(jsonBlock, virtualFileName, hint) {
	var buffer = new StringBuffer()
	var names = new NameGenerator()

	buffer.writeLine("var _expressionFunc = function() {")
	buffer.indent()
	buffer.writeLine("this._runExp(")
	buffer.indent()
	generateExpressionReadyFunction(jsonBlock, buffer, names.createInner())
	buffer.writeLine(",null");
	buffer.unindent()
	buffer.writeLine(");")
	buffer.unindent()
	buffer.writeLine("};")

	return buffer.toString()
}

var compileExpressionFuncFromJSON = function(jsonBlock, virtualFileName, outputFileName, hint) {
	var generatedSourceCode = null
	if(outputFileName != undefined) {
		generatedSourceCode = generateFunctionFromJSONExpression(jsonBlock, outputFileName, hint);
		fs.writeFileSync(outputFileName, generatedSourceCode)
	} else {
		generatedSourceCode = generateFunctionFromJSONExpression(jsonBlock, virtualFileName, hint);
	}
	//console.warn("ABOUT TO LOAD THE FOLLOWING JS INTO THE VM:", generatedSourceCode)

	vm.runInThisContext(generatedSourceCode,virtualFileName, true)
	return _expressionFunc; // defined inside the script.
}

var Runtime = function() {
	this.loadedExpressions = {}; // Contains a member per expression implementation <Function>
	this.loadedExpressionsMeta = {}; // Contains a member per full definition of the expression, like {title:<String>, implementation:<Function>}
	var dirName = path.join(__dirname, "built-in")
	this.registerWellKnownExpressionDir(dirName)
	
}

Runtime.prototype.registerWellKnownExpressionDir = function(absoluteDirPath) {
	var fileNames = fs.readdirSync(absoluteDirPath)
	fileNames.forEach(function(file) {
		var absoluteFileName = path.join(absoluteDirPath, file)
		this.registerWellKnownExpressionFile(absoluteFileName)
	}, this)
}

Runtime.prototype.registerWellKnownExpressionFile = function(absoluteFilePath) {
	var definition = require(absoluteFilePath)
	this.registerWellKnownExpressionDefinition(definition)
}

Runtime.prototype.registerWellKnownExpressionDefinition = function(expressionDefinition) {
	this.loadedExpressions[expressionDefinition.name] = expressionDefinition.implementation 
	this.loadedExpressionsMeta[expressionDefinition.name] = expressionDefinition
}

Runtime.prototype.runExpressionByName = function(expressionName, base_context, context_overrides) {
	//console.warn("Calling expression with name ", expressionName)
	var expFunc = this.loadedExpressions[expressionName]
	if(expFunc == undefined) {
		throw new Error('JS1002', "Expression '" + expressionName +  "' is not registered or was not loaded.");
	}
	this.runExpressionByFunc(expFunc, base_context, context_overrides)
}

Runtime.prototype.runExpressionByFunc = function(expFunc, block_context_base, context_block_overrides) {
	//console.warn("block_context_base",block_context_base)
	//console.warn("context_block_overrides",context_block_overrides)
	if(expFunc === undefined || expFunc == null || typeof(expFunc) != 'function') {
		throwInternalError("expFunc is required and must be a function")
	}
	if(block_context_base === undefined || typeof(block_context_base) != 'object' || block_context_base == null) {
		throwInternalError("block_context_base is required and must be an non-null object")
	}
	if(context_block_overrides === undefined) {
		throwInternalError("context_block_overrides must be an object or null")
	}
	if(block_context_base._breakCallback === undefined || block_context_base._breakCallback === null  || typeof(block_context_base._breakCallback) != 'function') {
		throwInternalError("block_context_base._breakCallback must be a function")
	}
	if(block_context_base._inputExpression === undefined || block_context_base._inputExpression === null  || typeof(block_context_base._inputExpression) != 'function') {
		throwInternalError("block_context_base._inputExpression must be a function")
	}
	if(block_context_base._variables === undefined || block_context_base._variables === null  || typeof(block_context_base._variables) != 'object') {
		throwInternalError("block_context_base._variables must be an object")
	}
	//console.warn("runExpressionByFunc validation passed")
	/* 
		// block_context_base members structure
		{
			_resultCallback: <Function>,
			_breakCallback: <Function>,
			_inputExpression: <Function>, // needs to be called with _runExp
			_variables: <Object>,
			_parentVariables: <Object>,
			_hint: <Object> (optional),
			_errorCallback: <Function>,
			_parentResult: <Object>, // Caller Expression Block last Result
			_result: <Object>
		}
	*/
	var localVariables = {}; 
	if(block_context_base._variables != undefined && block_context_base._variables != null) {
		for(var k in block_context_base._variables) {
			localVariables[k] = block_context_base._variables[k]
		}
	}
	
	var _blockContext = {};
	_blockContext._variables = localVariables;
	for(var k in block_context_base) {
		_blockContext[k] = block_context_base[k]
	}
	_blockContext._runtime = this; 
	_blockContext._hint = undefined; //formality
	_blockContext._result = undefined; //formality
	_blockContext._parentResult = block_context_base._result
	
	_blockContext._parentVariables = block_context_base._variables
	_blockContext._parentContext = block_context_base
	
	if(context_block_overrides != null) {
		for(var k in context_block_overrides) {
			if(k == "_runtime" ||  k == "_parentVariables" || k == "_variables" || k == "_result" || k == "_parentContext" || k == "_errorInfo") continue; // can't replace these
 			_blockContext[k] = context_block_overrides[k]
		}
	}
	
	var context = {
		_blockContext: _blockContext,
		_runExp: _runExp,
		_raiseError: _raiseError,
		_runInput: _runInput,
		_setError: _setError,
		_resetError: _resetError
	};
	//context._runExp = _runExp.bind(context)
	var blockFunc = expFunc.bind(context) // copy the function and bind it to the context
	//console.warn("runExpressionByFunc is calling block with context", context)
	blockFunc(); // run it
};

function _runExp(exp, context_block_overrides) {
	//console.warn("Calling expression ", exp)
	if(typeof(exp) == 'function') {
		this._blockContext._runtime.runExpressionByFunc(exp, this._blockContext, context_block_overrides )
	} else if(typeof(exp) == 'string') {
		this._blockContext._runtime.runExpressionByName(exp, this._blockContext, context_block_overrides )
	} else {
		throwInternalError("exp must be a expression name or a function")
	}
}

function _raiseError(err) {
	//console.warn("_raiseError:", err)
	var errorInfo = new RuntimeError(this._blockContext, err)
	this._blockContext._errorCallback(errorInfo)
}

function _runInput(context_block_overrides) {
	this._runExp(this._blockContext._inputExpression, context_block_overrides);
}

function _setError(errorInfo) {
	this._blockContext._parentContext._errorInfo = errorInfo
}

function _resetError() {
	this._blockContext._parentContext._errorInfo = undefined
}

module.exports.Runtime = Runtime

function _testOnly_runJSONObjectFromJSON(jsonBlock, variables, inputCallback, breakCallback, resultCallback, outputFileName, hint, errorCallback, additionalExpressionsFiles) {
	if(errorCallback === undefined) {
		errorCallback = function(errInfo) {
			console.warn("_testOnly_runJSONObjectFromJSON default errorCallback just catched an error:", errInfo)
		}
	}
	if(hint === undefined) {
		hint = undefined
	}
	var baseFunc = compileExpressionFuncFromJSON(jsonBlock, outputFileName === undefined? "test-in-memory.js" : outputFileName, outputFileName, hint)
	var runtime = new Runtime()
	
	if(additionalExpressionsFiles !== undefined && additionalExpressionsFiles !== null) {
		additionalExpressionsFiles.forEach(function(fileName) {
			runtime.registerWellKnownExpressionFile(fileName)
		})
	}
	
	var contextBase = {
		_resultCallback: resultCallback,
		_breakCallback: breakCallback,
		_inputExpression: inputCallback,
		//_parentVariables: variables,
		_variables:variables,
		_hint: hint,
		_errorCallback: errorCallback
	};
	runtime.runExpressionByFunc(baseFunc, contextBase, null)
}

module.exports.exportTestOnlyFunctions = function() {
	module.exports._testOnly_getExpressionNameFromSpecialKey = getExpressionNameFromSpecialKey
	module.exports._testOnly_runJSONObject = _testOnly_runJSONObjectFromJSON
	module.exports._testOnly_compileExpressionFuncFromJSON = compileExpressionFuncFromJSON
	module.exports._testOnly_getHint = getHint
}


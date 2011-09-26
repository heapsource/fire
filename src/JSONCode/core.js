var vm = require('vm')
var util = require('util')
var StringBuffer = require('./StringBuffer')
var NameGenerator = require('./NameGenerator')
var Error = require('./Error')
var fs = require('fs')
var path = require('path')
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
			throwInternalError("Can't process arrays yet")
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
	var resultVarName = names.name("result")
	buffer.writeLine("var " + resultVarName +  " = undefined;")
	buffer.writeLine("var " + names.name("callbackVar") + " = this._blockContext._resultCallback;")
	buffer.writeLine("var " + names.name("localBlockContext") + " = this._blockContext;")
	buffer.writeLine("var " + names.name("localContext") + " = this;")
	
	if(isPureJSONValue(jsonObj)) {
		buffer.writeLine(resultVarName + " = " + JSON.stringify(jsonObj) + ";")
		buffer.writeLine("this._blockContext._resultCallback(" + resultVarName +  ");")
	} else {
		if(jsonObj instanceof Array) {
			throwInternalError("Can't process arrays yet or generate code")
		}
		if(jsonObj instanceof Object) {
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
					buffer.writeLine(",{_inputCallback:")
					
					// Begin Input Callback Generation
					buffer.writeLine("function(" + names.name("sendInputCb") + ") {")
					buffer.indent()
					
					buffer.writeLine(names.name("localContext") +"._runExp(")
					buffer.indent()
					generateExpressionReadyFunction(childInputJsonObj, buffer, names.createInner())
					buffer.writeLine(",{ _resultCallback: ")
					buffer.writeLine("function(" + names.name("childResult") + "){")
					buffer.indent()
					buffer.writeLine(names.name("sendInputCb") + "("+names.name("childResult")+");")
					buffer.unindent()
					buffer.writeLine("}}")
					buffer.unindent()
					buffer.writeLine(");")
					buffer.unindent()
					buffer.writeLine("}")
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
			//	throwInternalError("Can't work with second level blocks yet")
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

	generateExpressionBlockFunctionWrapper(jsonBlock, buffer,names, function() {
		buffer.writeLine("this._blockContext._resultCallback")
	},hint)

	buffer.unindent()
	buffer.writeLine("};")

	//console.warn("generate js for " + virtualFileName +": \n", buffer.toString())

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
	this.loadedExpressions = {};
	var fileNames = fs.readdirSync(path.join(__dirname, "built-in"))
	fileNames.forEach(function(file) {
		this.loadedExpressions[file.substring(0, file.length -3)] = require('./built-in/' + file)
	}, this)
}

Runtime.prototype.runExpressionByName = function(expressionName, base_context, context_overrides) {
	console.warn("Calling expression with name ", expressionName)
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
	if(block_context_base._inputCallback === undefined || block_context_base._inputCallback === null  || typeof(block_context_base._inputCallback) != 'function') {
		throwInternalError("block_context_base._inputCallback must be a function")
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
			_inputCallback: <Function>,
			_variables: <Object>,
			_hint: <Object> (optional)
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
	_blockContext._hint == undefined;
	
	if(context_block_overrides != null) {
		for(var k in context_block_overrides) {
			if(k == "_runtime") continue; // can't replace _runtime
 			_blockContext[k] = context_block_overrides[k]
		}
	}
	
	var context = {
		_blockContext: _blockContext,
		
	};
	context._runExp = _runExp.bind(context)
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

module.exports.Runtime = Runtime

function _testOnly_runJSONObjectFromJSON(jsonBlock, variables, inputCallback, breakCallback, resultCallback, outputFileName, hint) {
	if(hint === undefined) {
		hint = undefined
	}
	var baseFunc = compileExpressionFuncFromJSON(jsonBlock, outputFileName === undefined? "test-in-memory.js" : outputFileName, outputFileName, hint)
	var runtime = new Runtime()
	var contextBase = {
		_resultCallback: resultCallback,
		_breakCallback: breakCallback,
		_inputCallback: inputCallback,
		_variables: variables,
		_parentVariables:variables,
		_hint: hint
	};
	runtime.runExpressionByFunc(baseFunc, contextBase, null)
}

module.exports.exportTestOnlyFunctions = function() {
	module.exports._testOnly_getExpressionNameFromSpecialKey = getExpressionNameFromSpecialKey
	module.exports._testOnly_runJSONObject = _testOnly_runJSONObjectFromJSON
	module.exports._testOnly_compileExpressionFuncFromJSON = compileExpressionFuncFromJSON
	module.exports._testOnly_getHint = getHint
}


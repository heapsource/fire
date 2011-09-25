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
	//	console.log(propName)
	var n = trimString(propName)
	return n.indexOf(SPECIAL_KEY_SYMBOL) == 0
}

function keyHasHint(propName) {
	return propName.indexOf(HINT_START_SYMBOL) > -1
}

function getHint(propName) {
	if(!keyHasHint(propName)) return "";
	var hintEndIndex = propName.indexOf(HINT_END_SYMBOL)
	if(hintEndIndex > 1) {
		return propName.substring(propName.indexOf(HINT_START_SYMBOL) + 1,hintEndIndex)
	}
	return propName.substring(propName.indexOf(HINT_START_SYMBOL) + 1,propName.length)
}

function getHint4Js(propName) {
	var hint = getHint(propName)
	return '"' + hint +  '"'
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
					//console.log("propName =============================== , ", propName)
					var childInputJsonObj = jsonObj[propName];

					buffer.writeLine("this._blockContext._runtime.runExpressionByName(")
					buffer.indent()
					var childExprName = getExpressionNameFromSpecialKey(propName)
					buffer.writeLine('"' + childExprName + '"')
					buffer.writeLine(",this._blockContext._variables,")
					
					// Begin Input Callback Generation
					buffer.writeLine("function(" + names.name("sendInputCb") + ") {")
					buffer.indent()
					
					buffer.writeLine(names.name("localBlockContext") +"._runtime.runExpressionByFunc(")
					buffer.indent()
					generateExpressionReadyFunction(childInputJsonObj, buffer, names.createInner())
					buffer.writeLine("," + names.name("localBlockContext") +"._variables,")
					buffer.writeLine(names.name("localBlockContext") +"._inputCallback,")
					buffer.writeLine(names.name("localBlockContext") +"._breakCallback,")
					buffer.writeLine("function(" + names.name("childResult") + "){")
					buffer.indent()
					buffer.writeLine(names.name("sendInputCb") + "("+names.name("childResult")+");")
					buffer.unindent()
					buffer.writeLine("},")
					buffer.writeLine(getHint4Js("")); // anonymous blocks don't use hints
					buffer.unindent()
					buffer.writeLine(");")
					buffer.unindent()
					buffer.writeLine("},")
					//End of Input
					
					buffer.writeLine("this._blockContext._breakCallback,")
					buffer.writeLine("function(" + names.name("incResult") + "){")
					buffer.indent()
					buffer.writeLine(resultVarName + " = " + names.name("incResult") + ";")
					if(iteration.isLast) {
						// if this is the last expression of the block, call the result callback.
						buffer.writeLine(names.name("callbackVar") + "("+ names.name("incResult") +");")
					}
					buffer.unindent()
					buffer.writeLine("}")
					buffer.write(","),
					buffer.writeLine(getHint4Js(propName))
					buffer.unindent()
					buffer.writeLine(");")
				}); // end of properties iteration
			} else {
			//	throwInternalError("Can't work with second level blocks yet")
				buffer.writeLine(resultVarName + " = {};")
				navigateKeys(jsonObj, function(iteration) {
					var propName = iteration.key
					//console.log("regular propName =============================== , ", propName)
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
	if(hint === undefined){
		throwInternalError("generateExpressionBlockFunctionWrapper requires hint")
	}
		// Create call to runExpressionByFunc, check signature to understand what we are doing here.
	buffer.writeLine("this._blockContext._runtime.runExpressionByFunc(")
	buffer.indent()
	generateExpressionReadyFunction(jsonObj, buffer, names.createInner())
	buffer.writeLine(",this._blockContext._variables,")
	buffer.writeLine("this._blockContext._inputCallback,")
	buffer.writeLine("this._blockContext._breakCallback,")
	writeResultCallback(buffer, names),
	buffer.write(","),
	buffer.writeLine(getHint4Js(hint))
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

	//console.log("generate js for " + virtualFileName +": \n", buffer.toString())

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
	//console.log("ABOUT TO LOAD THE FOLLOWING JS INTO THE VM:", generatedSourceCode)

	vm.runInThisContext(generatedSourceCode,virtualFileName, true)
	return _expressionFunc; // defined inside the script.
}

var createExpressionBlockFunc = function(f, context) {
	if(context == null || context === undefined)
	throwInternalError("Can't create expression block instance function without context")
	return f.bind(context)
}

var Runtime = function() {
	this.loadedExpressions = {};
	var fileNames = fs.readdirSync(path.join(__dirname, "built-in"))
	fileNames.forEach(function(file) {
		this.loadedExpressions[file.substring(0, file.length -3)] = require('./built-in/' + file)
	}, this)
}

Runtime.prototype.runExpressionByName = function(expressionName, variables, inputCallback, breakCallback, resultCallback, hint) {

	var expFunc = this.loadedExpressions[expressionName]
	if(expFunc == undefined) {
		throw new Error('JS1002', "Expression '" + expressionName +  "' is not registered or was not loaded.");
	}
	this.runExpressionByFunc(expFunc, variables, inputCallback, breakCallback, resultCallback, hint)
}

Runtime.prototype.runExpressionByFunc = function(expFunc, variables, inputCallback, breakCallback, resultCallback, hint) {
	if(hint === undefined) {
		console.trace()
		throw "hint is required"
	}
	var context = {
		_blockContext: {
			"_runtime": this,
			"_variables": variables,
			"_inputCallback": inputCallback,
			"_breakCallback": breakCallback,
			"_resultCallback": resultCallback,
			"_hint": hint
		}
	};
	var blockFunc = createExpressionBlockFunc(expFunc, context)
	blockFunc(); // run it
};

module.exports.Runtime = Runtime

function _testOnly_runJSONObjectFromJSON(jsonBlock, variables, inputCallback, breakCallback, resultCallback, outputFileName, hint) {
	if(hint === undefined) {
		hint = ""
	}
	var baseFunc = compileExpressionFuncFromJSON(jsonBlock, outputFileName === undefined? "test-in-memory.js" : outputFileName, outputFileName, hint)
	var runtime = new Runtime()
	runtime.runExpressionByFunc(baseFunc, variables, inputCallback, breakCallback, resultCallback, hint)
}

module.exports.exportTestOnlyFunctions = function() {
	module.exports._testOnly_getExpressionNameFromSpecialKey = getExpressionNameFromSpecialKey
	module.exports._testOnly_runJSONObject = _testOnly_runJSONObjectFromJSON
	module.exports._testOnly_compileExpressionFuncFromJSON = compileExpressionFuncFromJSON
	module.exports._testOnly_getHint = getHint
}


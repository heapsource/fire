var fire = require('../src/core.js')
var Runtime = fire.Runtime
var Expression = fire.Expression
var Ast = require('../src/Ast.js')
function blockContextHasHint(blockContext) {
	return blockContext && blockContext._hint
}
function _testOnly_runJSONObjectFromJSON(jsonBlock, variables, inputCallback, loopCallback, resultCallback, outputFileName, hint, errorCallback, additionalExpressionsFiles) {
	if(errorCallback === undefined) {
		errorCallback = function(errInfo) {
			console.warn("_testOnly_runJSONObjectFromJSON default errorCallback just catched an error:", errInfo)
		}
	}
	if(hint === undefined) {
		hint = undefined
	}
	//var baseFunc = compileExpressionFuncFromJSON(jsonBlock, outputFileName === undefined? "test-in-memory.js" : outputFileName, outputFileName, hint)
	var runtime = new Runtime()
	runtime.registerWellKnownExpressionDefinition({
		name: "_testOnly_runJSONObjectFromJSON",
		json: jsonBlock
	})
	if(additionalExpressionsFiles !== undefined && additionalExpressionsFiles !== null) {
		additionalExpressionsFiles.forEach(function(fileName) {
			runtime.registerWellKnownExpressionFile(fileName)
		})
	}
	var variablesObjects = {}
	for(var k in variables) {
		setVarCore(runtime, variablesObjects, k, variables[k])
	}
	var contextBase = {}
	contextBase._resultCallback = resultCallback
	contextBase._loopCallback = loopCallback
	contextBase._inputExpression = inputCallback
	contextBase._variables = variablesObjects
	contextBase._hint = hint
	contextBase._errorCallback = errorCallback
	/*
	var contextBase = {
		_resultCallback: resultCallback,
		_loopCallback: loopCallback,
		_inputExpression: inputCallback,
		//_parentVariables: variables,
		_variables:variablesObjects,
		_hint: hint,
		_errorCallback: errorCallback
	};
	*/
	runtime.load(function(initErr) {
		if(initErr) {
			//console.trace()
			contextBase._errorCallback("_testOnly_runJSONObjectFromJSON runtime init error:" + initErr)
		}
		runtime._testOnly_runExpressionByName("_testOnly_runJSONObjectFromJSON", contextBase, null)
	})
}


Runtime.prototype._testOnly_runExpressionInstance = function(expressionInstance, block_context_base, context_block_overrides) {
	//console.warn("block_context_base",block_context_base)
	//console.warn("context_block_overrides",context_block_overrides)
	/*if(expFunc === undefined || expFunc == null || typeof(expFunc) != 'function') {
		throwInternalError("expFunc is required and must be a function")
	}*/
	if(expressionInstance === undefined || expressionInstance == null || !(expressionInstance instanceof Expression)) {
		throwInternalError("expressionInstance is required to be an instance or derived from Expression")
	}
	if(block_context_base === undefined || typeof(block_context_base) != 'object' || block_context_base == null) {
		throwInternalError("block_context_base is required and must be an non-null object")
	}
	if(context_block_overrides === undefined) {
		throwInternalError("context_block_overrides must be an object or null")
	}
	if(block_context_base._loopCallback === undefined || block_context_base._loopCallback === null  || typeof(block_context_base._loopCallback) != 'function') {
		throwInternalError("block_context_base._loopCallback must be a function")
	}
	if(block_context_base._inputExpression === undefined || block_context_base._inputExpression === null  || typeof(block_context_base._inputExpression) != 'function') {
		throwInternalError("block_context_base._inputExpression must be a function")
	}
	if(block_context_base._variables === undefined || block_context_base._variables === null  || typeof(block_context_base._variables) != 'object') {
		throwInternalError("block_context_base._variables must be an object")
	}
	//console.warn("runExpressionFunc validation passed")
	/* 
		// block_context_base members structure
		{
			_resultCallback: <Function>,
			_loopCallback: <Function>,
			_inputExpression: <Function>, // needs to be called with runExp
			_variables: <Object>,
			//_parentVariables: <Object>,
			_hint: <Object> (optional),
			_errorCallback: <Function>,
			_parentResult: <Object>, // Caller Expression Block last Result
			_result: <Object>
			_parentContext: <Object>
		}
	*/
	
	
	var _blockContext = {};
	Object.keys(block_context_base).forEach(function(k) {
		_blockContext[k] = block_context_base[k]
	})
	
	var localVariables = null;
	var useSameScopeVariables = context_block_overrides == null || context_block_overrides._sameScope !== true
	if(useSameScopeVariables) {
		//
		// If it's not running on the same scope, then copy all the variables.
		//
		localVariables = {}//Object.create(block_context_base._variables) //block_context_base._variables; 
		//console.warn("Copying Variables")
		if(block_context_base._variables != undefined && block_context_base._variables != null) {
			Object.keys(block_context_base._variables).forEach(function(k) {
				//console.warn("Copying var ", k, " with value ", block_context_base._variables[k])
				localVariables[k] = block_context_base._variables[k]
			})
		}
	} else {
		// Use the same Scope Varaibles
		localVariables = block_context_base._variables
	}
	
	_blockContext._hint = undefined; //formality
	if(context_block_overrides != null) {
		for(var k in context_block_overrides) {
			if(k == "_runtime" ||  k == "_parentVariables" || k == "_variables" || k == "_result" || k == "_parentContext" || k == "_errorInfo") continue; // can't replace these
 			_blockContext[k] = context_block_overrides[k]
		}
	}
	
	
	_blockContext._variables = localVariables;
	_blockContext._runtime = this; 
	_blockContext._result = undefined; //formality
	_blockContext._parentResult = block_context_base._result
	_blockContext._parentContext = block_context_base
	_blockContext._rootExpression = undefined // _rootScope can not be inherited.
	
	// The override key '_initialResult' can set the initial value of the calling expression block.
	if(context_block_overrides && context_block_overrides._initialResult != null && context_block_overrides._initialResult != undefined) {
		_blockContext._result = context_block_overrides._initialResult
	}
	
	expressionInstance._blockContext = _blockContext
	expressionInstance.ensureInitialized()
	// new Expressions model
	var localVarsKeys = Object.keys(localVariables)
	for(var i = 0; i < localVarsKeys.length; i++) {
		expressionInstance.vars[localVarsKeys[i]] = localVariables[localVarsKeys[i]]
	}
	expressionInstance.resultCallback = _blockContext._resultCallback;
	expressionInstance.errorCallback = _blockContext._errorCallback;
	expressionInstance.loopCallback = _blockContext._loopCallback;
	expressionInstance.createInputExpression = function() {
		var exp = new Expression()
		exp.execute = function() {
			var self = this
			var pseudoExp = {
				setResult: function(res) {
					self.end(res)
				},
				execute: _blockContext._inputExpression
			}
			pseudoExp.execute()
		}
		return exp
	}
	expressionInstance.runtime = this
	expressionInstance.hint = _blockContext._hint
	expressionInstance.run() // run it
};


Runtime.prototype._testOnly_runExpressionByName = function(expressionName, base_context, context_overrides) {
	//console.warn("Calling expression with name ", expressionName, " context_overrides ", context_overrides)
	var expDefinition = this.loadedExpressionsMeta[expressionName]
	if(expDefinition == undefined) {
		throw "Expression '" + expressionName +  "' is not registered or was not loaded.";
	}
	
	var supportHints = expDefinition.flags && expDefinition.flags.indexOf("hint") != -1
	if(!supportHints &&  blockContextHasHint(context_overrides)) {
		throw new Error('UnsupportedHint', "Expression '" + expressionName + "' does not support hints")
	}
	var expObject = expDefinition.implementation
	var expressionObject = new expObject()
	this._testOnly_runExpressionInstance(expressionObject, base_context, context_overrides)
}


TEST_PRINT_TRACE_ON_INTERNAL_ERROR = true
fire._testOnly_getExpressionNameFromSpecialKey = Ast.getExpressionNameFromSpecialKey
fire._testOnly_runJSONObject = _testOnly_runJSONObjectFromJSON
fire._testOnly_getHint = Ast.getHintFromSpecialKey
	

var RuntimeError = require('./RuntimeError')

function Expression() {
	
}
Expression.prototype.reset = function() {
	this.createInputExpression = null
	this.parent = null
	this.resultCallback = null
	this.inputExpression = null
	this.errorCallback = null
	
	// Unlink Variables
	delete this.vars._parent
}
Expression.prototype.execute = function() {
	console.trace()
	throw "Expression requires derived classes or instances to override the 'execute' function with a expression-compliant function"
}
Expression.prototype.getParentResult = function() {
	return this.parent !== undefined ? this.parent.getCurrentResult() : undefined
}
Expression.prototype.finish = function() {
	this.end(this.getCurrentResult())
}
Expression.prototype.end = function(res) {
	var self = this
	if(!this.resultCallback) {
		throw "resultCallback not implemented"
	}else {
		var callback = this.resultCallback
		var parent = this.parent
		self.reset()
		process.nextTick(function() {
			callback(res, parent)
		})
		
	}
}
Expression.prototype.setCurrentResult = function(res) {
	this.vars._result = res 
}
Expression.prototype.getCurrentResult = function() {
	return this.vars._result
}
Expression.prototype.bypass = function(res) {
	this.end(this.getParentResult())
}
Expression.prototype.header = null
Expression.prototype.hint = null
Expression.prototype.input = undefined
Expression.prototype.createInputExpression = null
Expression.prototype.parent = null
Expression.prototype.resultCallback = null
Expression.prototype.errorCallback = null
Expression.prototype.inputExpression = null
Expression.prototype.runtime = null
Expression.prototype.isInput = false
Expression.prototype.initialized = false
Expression.prototype.onPrepareInput = null

Expression.prototype.runInput = function(onResult) {
	var self = this
	if(this.createInputExpression) {
		this.inputExpression = this.createInputExpression()
		this.inputExpression.resultCallback = function(res) {
			onResult(res)
		}
		if(this.onPrepareInput) {
			this.onPrepareInput()
		}
		this.inputExpression.run(this)
	} else {
		onResult(this.input)
	}
}

Expression.prototype.linkChildVars = function(childExpression) {
	
}
Expression.prototype.ensureInitialized = function() {
	if(!this.initialized) {
		this.vars = {
			_parent: null,
			_result: undefined,
			_error: null
		}
		this.isRoot = false
		
		this.initialized = true
	}
}
Expression.prototype.run = function(callingParent) {
	this.ensureInitialized()
	
	this.parent = callingParent || null
	if(this.parent) {
		this.vars._parent = this.parent.vars
		this.runtime = this.parent.runtime
		var self = this
		if(!this.errorCallback) {
			this.errorCallback = function(err) {
				self.parent.bubbleUpError(err)
			} 
		}
	}
	this.execute()
}

Expression.prototype.raiseError = function(err) {
	//console.warn("raiseError:", err)
	var errorInfo = new RuntimeError(this._blockContext, err)
	this.bubbleUpError(errorInfo)
}

Expression.prototype.bubbleUpError = function(errorInfo) {
	if(!this.errorCallback) {
		throw "errorCallback not implemented"
	}else {
		this.errorCallback(errorInfo)
	}
}
Expression.prototype.getError = function() {
	return this.vars._error
}
Expression.prototype.setError = function(errorInfo) {
	this.vars._error = errorInfo
}

Expression.prototype.clearError = function() {
	this.setError(null)
}

Expression.prototype.setParentError = function(errorInfo) {
	this.parent.setError(errorInfo)
}

Expression.prototype.getParentError = function() {
	return this.parent.getError()
}

Expression.prototype.clearParentError = function() {
	this.parent.clearError()
}

Expression.prototype.loopControl = function(payload) {
	this._blockContext._loopCallback(payload)
}

Expression.prototype.bypass = function() {
	this.end(this.getParentResult())
}

Expression.prototype.setVar = function(name, value) {
	setVarCore(this.runtime, this.vars, name, value)
}

Expression.prototype.setScopeVar = function(name, value) {
	setVarCore(this.runtime, this.vars, name, value, true)
}

Expression.prototype.setParentScopeVar = function(name, value) {
	setVarCore(this._blockContext._runtime, this._blockContext._parentContext._variables, name, value, true)
}

Expression.prototype.getVar = function(name) {
	return this._blockContext._runtime.getPaths().run(this._blockContext._variables, name)
}

Expression.prototype.setParentVar = function(path, value) {
	if(this.parent) {
		setVarCore(this.runtime, this.parent.vars, path, value)
	} else {
		
			console.trace()
		throw "setParentVar can't be used in root expressions"
	}
}

Expression.prototype.getParentVar = function(name) {
	return this.runtime.getPaths().run(this.parent.vars, name)
}

Expression.prototype.getParentResult = function() {
	return this.parent ? this.parent.getCurrentResult() : undefined
}

Expression.prototype.setParentResult = function(val) {
	if(this.parent) {
		this.parent.setCurrentResult(val)	
	} else {
		throw "setParentResult can't be used in root expressions"
	}
}

Expression.prototype.hasHint = function() {
	return this.hint
}

Expression.prototype.getHintValue = function() {
	return this.hasHint() ? this.hint : undefined
}

Expression.prototype.getHintVariableValue = function() {
	return this.hasHint() ? this.getParentVar(this.hint) : undefined
}

Expression.prototype.setResult = function(res) {
	this._blockContext._resultCallback(res)
}

Expression.prototype.getExpressionName = function() {
	return !this.expressionName ? "<Anonymous>" : this.expressionName
}

Expression.prototype.getRootBlockContext = function() {
	var _rootExpressionContext = null
	var currentBlockScope = this._blockContext._parentContext
	while(true) {
		if(!currentBlockScope) {
			break;
		}
		if(currentBlockScope._rootExpression) {
			_rootExpressionContext = currentBlockScope
			break
		}
		currentBlockScope = currentBlockScope._parentContext
	}
	return _rootExpressionContext
}

Expression.prototype.requireHint = function() {
	if(!this.hasHint()) {
		this.raiseError("Expression '" + this.getExpressionName()  + "' requires a hint")
		return false
	}
	return true
}

function setVarCore(runtime, bag, path, value, forceCreate) {
	runtime.getPaths().runWrite(bag, path, value, forceCreate)
}

Expression.prototype.runExp = function(exp, context_block_overrides) {
	//console.warn("Calling expression ", exp)
	if(typeof(exp) == 'function') {
		this._blockContext._runtime.runExpressionFunc(exp, this._blockContext, context_block_overrides )
	} else if(typeof(exp) == 'string') {
		this._blockContext._runtime.runExpressionByName(exp, this._blockContext, context_block_overrides )
	} else {
		throwInternalError("exp must be a expression name or a function")
	}
}

var TEST_PRINT_TRACE_ON_INTERNAL_ERROR = false

function throwInternalError(msg) {
	if(TEST_PRINT_TRACE_ON_INTERNAL_ERROR)
	{
		console.trace()
	}
	throw "fire.js internal error, " + msg
}

module.exports.Expression = Expression
module.exports.setVarCore = setVarCore
module.exports.TEST_PRINT_TRACE_ON_INTERNAL_ERROR = TEST_PRINT_TRACE_ON_INTERNAL_ERROR
module.exports.throwInternalError = throwInternalError
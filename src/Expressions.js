var RuntimeError = require('./RuntimeError')
var Variable = require('./Variable')

function Expression() {
	
}

Expression.prototype.execute = function() {
	console.trace()
	throw "Expression requires derived classes or instances to override the 'run' function with a expression-capable function"
}

Expression.prototype.raiseError = function(err) {
	//console.warn("raiseError:", err)
	var errorInfo = new RuntimeError(this._blockContext, err)
	this._blockContext._errorCallback(errorInfo)
}

Expression.prototype.runInput = function(context_block_overrides) {
	if(context_block_overrides !== undefined && context_block_overrides !== null) {
		context_block_overrides._sameScope = true // don't copy the variables when running input expressions
	}
	this.runExp(this._blockContext._inputExpression, context_block_overrides);
}

Expression.prototype.setError = function(errorInfo) {
	this._blockContext._parentContext._errorInfo = errorInfo
}

Expression.prototype.resetError = function() {
	this._blockContext._parentContext._errorInfo = undefined
}

Expression.prototype.loopControl = function(payload) {
	this._blockContext._loopCallback(payload)
}

Expression.prototype.skip = function() {
	this._blockContext._resultCallback(this._blockContext._parentResult)
}

Expression.prototype.setVar = function(name, value) {
	setVarCore(this._blockContext._variables, name, value)
}

Expression.prototype.getVar = function(name) {
	return this._blockContext._runtime.getPaths().run(this._blockContext._variables, name)
}

Expression.prototype.setParentVar = function(name, value) {
	setVarCore(this._blockContext._parentContext._variables, name, value)
}

Expression.prototype.getParentVar = function(name) {
	return this._blockContext._runtime.getPaths().run(this._blockContext._parentContext._variables, name)
}

Expression.prototype.getParentResult = function() {
	return this._blockContext._parentContext._result
}

Expression.prototype.setParentResult = function(val) {
	this._blockContext._parentContext._result = val
}

Expression.prototype.hasHint = function(val) {
	return this._blockContext._hint !== undefined && this._blockContext._hint !== null && this._blockContext._hint !== ''
}

Expression.prototype.getHintValue = function() {
	return this.hasHint() ? this._blockContext._hint : undefined
}

Expression.prototype.setResult = function(res) {
	this._blockContext._resultCallback(res)
}

function setVarCore(bag, name, value) {
	if(bag[name] == undefined) {
		var v = new Variable()
		v.set(value)
		bag[name] = v
	} else {
		bag[name].set(value)
	}
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
	throw "priest internal error, " + msg
}

module.exports.Expression = Expression
module.exports.setVarCore = setVarCore
module.exports.TEST_PRINT_TRACE_ON_INTERNAL_ERROR = TEST_PRINT_TRACE_ON_INTERNAL_ERROR
module.exports.throwInternalError = throwInternalError
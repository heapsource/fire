var RuntimeError = require('./RuntimeError')
var Variable = require('./Variable')

function Expression() {
	
}

Expression.prototype.execute = function() {
	console.trace()
	throw "Expression requires derived classes or instances to override the 'run' function with a expression-capable function"
}

Expression.prototype._raiseError = function(err) {
	//console.warn("_raiseError:", err)
	var errorInfo = new RuntimeError(this._blockContext, err)
	this._blockContext._errorCallback(errorInfo)
}

Expression.prototype._runInput = function(context_block_overrides) {
	if(context_block_overrides !== undefined && context_block_overrides !== null) {
		context_block_overrides._sameScope = true // don't copy the variables when running input expressions
	}
	this._runExp(this._blockContext._inputExpression, context_block_overrides);
}

Expression.prototype._setError = function(errorInfo) {
	this._blockContext._parentContext._errorInfo = errorInfo
}

Expression.prototype._resetError = function() {
	this._blockContext._parentContext._errorInfo = undefined
}

Expression.prototype._loopControl = function(payload) {
	this._blockContext._loopCallback(payload)
}

Expression.prototype._skip = function() {
	this._blockContext._resultCallback(this._blockContext._parentResult)
}

Expression.prototype._setVar = function(name, value) {
	_setVarCore(this._blockContext._variables, name, value)
}

Expression.prototype._getVar = function(name) {
	return _getVarCore(this._blockContext._runtime, this._blockContext._variables, name)
}

Expression.prototype._setParentVar = function(name, value) {
	_setVarCore(this._blockContext._parentContext._variables, name, value)
}

Expression.prototype._getParentVar = function(name) {
	return this._blockContext._runtime.getPaths().run(this._blockContext._parentContext._variables, name)
}

function _setVarCore(bag, name, value) {
	if(bag[name] == undefined) {
		var v = new Variable()
		v.set(value)
		bag[name] = v
	} else {
		bag[name].set(value)
	}
}

Expression.prototype._runExp = function(exp, context_block_overrides) {
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
module.exports._setVarCore = _setVarCore
module.exports.TEST_PRINT_TRACE_ON_INTERNAL_ERROR = TEST_PRINT_TRACE_ON_INTERNAL_ERROR
module.exports.throwInternalError = throwInternalError
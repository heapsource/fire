var RuntimeError = require('./RuntimeError')

function Expression() {
	
}
Expression.prototype.reset = function() {
	this.createInputExpression = null
	this.parent = null
	this.resultCallback = null
	this.inputExpression = null
	this.errorCallback = null
	this.loopCallback = null
	
	// If we own the variables, then unlink the _parent
	if(!this.scopeBypass) {
		delete this.vars._parent
	}
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
Expression.prototype.getPath = function() {
	return null
}
Expression.prototype.hint = null
Expression.prototype.input = undefined
Expression.prototype.createInputExpression = null
Expression.prototype.parent = null
Expression.prototype.resultCallback = null
Expression.prototype.errorCallback = null
Expression.prototype.loopCallback = null
Expression.prototype.inputExpression = null
Expression.prototype.runtime = null
Expression.prototype.isInput = false
Expression.prototype.initialized = false
Expression.prototype.isRoot = false
Expression.prototype.scopeBypass = false

Expression.prototype.onPrepareInput = null

Expression.prototype.runInput = function(onResult) {
	this.runInputFromTarget(this, onResult)
}

Expression.prototype.runInputFromTarget = function(target, onResult) {
	var self = this
	if(typeof(onResult) !== 'function') {
		console.trace()
		throw "runInputFromTarget requires a function as callback"
	}
	if(target.createInputExpression) {
		target.inputExpression = target.createInputExpression()
		target.inputExpression.resultCallback = function(res, parent) {
			onResult(res, parent)
		}
		if(target.onPrepareInput) {
			target.onPrepareInput()
		}
		target.inputExpression.run(this)
	} else {
		onResult(target.input, this)
	}
}

Expression.prototype.ensureInitialized = function() {
	if(!this.initialized) {
		if(!this.scopeBypass){
			this.vars = {
				_parent: null,
				_result: undefined,
				_error: null
			}
		}
		this.initialized = true
	}
}
Expression.prototype.run = function(callingParent) {
	this.ensureInitialized()
	this.parent = callingParent || null
	if(this.parent) {
		if(this.scopeBypass) {
			this.vars = this.parent.vars
		} else {
			this.vars._parent = this.parent.vars
		}
		this.runtime = this.parent.runtime
	}
	this.execute()
}

Expression.prototype.raiseError = function(err) {
	//console.warn("raiseError:", err)
	var errorInfo = new RuntimeError(this._blockContext, err)
	this.propagateError(errorInfo)
}

Expression.prototype.propagateError = function(errorInfo) {
	if(this.errorCallback) {
		this.errorCallback(errorInfo, this.parent, this);
  } else if(this.parent) {
    this.parent.propagateError(errorInfo);
	} else {
		throw "errorCallback not implemented"
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
  this.propagateLoopControl(payload);
}

Expression.prototype.propagateLoopControl = function(payload) {
  if(this.loopCallback) {
    this.loopCallback(payload, this.parent, this);
  } else if(this.parent) {
    this.parent.propagateLoopControl(payload);
  } else {
		throw "loopCallback not implemented"
  }
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
	this.parent.setScopeVar(name, value)
}

Expression.prototype.getVar = function(name) {
	return this.runtime.getPaths().run(this.vars, name)
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

Expression.prototype.getExpressionName = function() {
	return !this.expressionName ? "<Anonymous>" : this.expressionName
}

Expression.prototype.getRootParent = function() {
	var _rootExpressionContext = null
	var currentParent = this
	while(currentParent) {
		if(currentParent.isRoot) {
			return currentParent
		}
		currentParent = currentParent.parent
	}
	return null
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

module.exports.Expression = Expression
module.exports.setVarCore = setVarCore

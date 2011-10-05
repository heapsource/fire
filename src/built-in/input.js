var Expression = require("../Expressions").Expression

function Input() {

}
Input.prototype = new Expression()
Input.prototype.execute = function() {
	var self = this
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
	if(!_rootExpressionContext) {
		// Crap! They are trying to call @input from a custom implementation... shouldn't they be using runInput function?
		throw "@input can not be directly used by custom implementations. Only priest.js compiler is allowed to use it. You should be using the runInput function instead."
	}
	// run the input...
	this.runInputFunction(_rootExpressionContext._inputExpression, {
		_resultCallback: function(res) {
			// and return the values. any errors are bubbled up
			self.setResult(res)
		}
	});
}

module.exports = {
	name:"input",
	implementation:Input
}
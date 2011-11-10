var Expression = require("../Expressions").Expression

function Input() {

}
Input.prototype = new Expression()
Input.prototype.execute = function() {
	var self = this
	var _rootExpressionContext = this.getRootBlockContext()
	if(!_rootExpressionContext) {
		// Crap! They are trying to call @input from a custom implementation... shouldn't they be using runInput function?
		throw "@input can not be directly used by custom implementations. Only fire.js compiler is allowed to use it. You should be using the runInput function instead."
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
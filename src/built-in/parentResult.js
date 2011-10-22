var Expression = require("../Expressions").Expression

function ParentResult() {

}
ParentResult.prototype = new Expression()
ParentResult.prototype.execute = function() {
	var self = this
	var _rootExpressionContext = this.getRootBlockContext()
	if(!_rootExpressionContext) {
		// Crap! They are trying to call @input from a custom implementation... shouldn't they be using runInput function?
		throw "@parentResult can not be directly used by custom implementations. Only priest.js compiler is allowed to use it. You should be using the getParentResult function instead."
	}
	// run the input...
	this.runInputFunction(_rootExpressionContext._inputExpression, {
		_resultCallback: function(res) {
			// and return the values. any errors are bubbled up
			self.setResult(_rootExpressionContext._parentResult)
		}
	});
}

module.exports = {
	name: "parentResult",
	implementation: ParentResult
}
var Expression = require("../Expressions").Expression

function ParentResult() {

}
ParentResult.prototype = new Expression()
ParentResult.prototype.execute = function() {
	var self = this
	var _rootExpressionContext = this.getRootBlockContext()
	if(!_rootExpressionContext) {
		// Crap! They are trying to call @parentResult from a custom implementation... shouldn't they be using getParentResult function?
		throw "@parentResult can not be directly used by custom implementations. Only fire.js compiler is allowed to use it. You should be using the getParentResult function instead."
	}
	self.setResult(_rootExpressionContext._parentResult)
}

module.exports = {
	name: "parentResult",
	implementation: ParentResult
}
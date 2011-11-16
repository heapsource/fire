var Expression = require("../Expressions").Expression

function ParentResult() {

}
ParentResult.prototype = new Expression()
ParentResult.prototype.execute = function() {
	var self = this
	var rootParent = this.getRootParent()
	if(!rootParent) {
		// Crap! They are trying to call @parentResult from a custom implementation... shouldn't they be using getParentResult function?
		throw "@parentResult can not be directly used by custom implementations. Only fire.js compiler is allowed to use it. You should be using the getRootParent().getCurrentResult() function instead."
	}
	this.end(rootParent.getParentResult())
}

module.exports = {
	name: "parentResult",
	implementation: ParentResult
}
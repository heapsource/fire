var Expression = require("../Expressions").Expression

function IsEmpty() {

}
IsEmpty.prototype = new Expression()
IsEmpty.prototype.execute = function() {
	var self = this
	
	var met = this.hasHint() ? this.getHintVariableValue() : this.getParentResult();
	
	var isEmpty = !met || met == ''
	this.setResult(isEmpty)
}

module.exports = {
	name:"isEmpty",
	flags: "hint",
	implementation:IsEmpty
}
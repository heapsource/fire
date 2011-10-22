var Expression = require("../Expressions").Expression

function IsNotEmpty() {

}
IsNotEmpty.prototype = new Expression()
IsNotEmpty.prototype.execute = function() {
	var self = this
	
	var met = this.hasHint() ? this.getHintVariableValue() : this.getParentResult();
	
	var isEmpty = (met != undefined && met != null && met != '')
	this.setResult(isEmpty)
}

module.exports = {
	name:"isNotEmpty",
	flags: "hint",
	implementation:IsNotEmpty
}
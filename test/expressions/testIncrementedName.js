var Expression = require("../../src/Expressions").Expression
function testIncrementedName() {

}
testIncrementedName.prototype = new Expression()
testIncrementedName.prototype.execute = function() {
	var varName = this.getHintValue()+ "var";
	if(this.getParentVar(varName) == undefined) {
		this.setParentVar(varName, -1)
	}
	this.setParentVar(varName, this.getParentVar(varName) + 1)
	this.end(this.getHintValue() + this.getParentVar(varName))
}
module.exports = {
	name:"testIncrementedName",
	flags: ["hint"],
	implementation:testIncrementedName
}
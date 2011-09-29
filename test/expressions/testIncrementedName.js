var Expression = require("../../src/Expressions").Expression
function testIncrementedName() {

}
testIncrementedName.prototype = new Expression()
testIncrementedName.prototype.execute = function() {
	var self = this
	var varName = self._blockContext._hint+ "var";
	if(self.getParentVar(varName) == undefined) {
		self.setParentVar(varName, -1)
	}
	self.setParentVar(varName, self.getParentVar(varName) + 1)
	self._blockContext._resultCallback(self._blockContext._hint + self.getParentVar(varName))
}
module.exports = {
	name:"testIncrementedName",
	implementation:testIncrementedName
}
var Expression = require("../../src/Expressions").Expression
function testReturnParentResult() {

}
testReturnParentResult.prototype = new Expression()
testReturnParentResult.prototype.execute = function() {
	this.bypass()
}

module.exports = {
	name:"testReturnParentResult",
	implementation:testReturnParentResult
}
var Expression = require("../../src/Expressions").Expression
function testReturnParentResult() {

}
testReturnParentResult.prototype = new Expression()
testReturnParentResult.prototype.execute = function() {
	this._blockContext._resultCallback(this._blockContext._parentResult)
}

module.exports = {
	name:"testReturnParentResult",
	implementation:testReturnParentResult
}
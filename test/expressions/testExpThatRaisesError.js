var Expression = require("../../src/Expressions").Expression
function testExpThatRaisesError() {

}
testExpThatRaisesError.prototype = new Expression()
testExpThatRaisesError.prototype.execute = function() {
	this.raiseError("Help!!!... Chuck Norris is in da house!")
}

module.exports = {
	name:"testExpThatRaisesError",
	implementation:testExpThatRaisesError
}
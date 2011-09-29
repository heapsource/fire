var Expression = require("../../src/Expressions").Expression
function testDoLoopControl() {
	
}
testDoLoopControl.prototype = new Expression()
testDoLoopControl.prototype.execute = function() {
	this.loopControl()
}

module.exports = {
	name: "testDoLoopControl",
	implementation: testDoLoopControl
}
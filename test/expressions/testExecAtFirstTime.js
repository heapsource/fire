var Expression = require("../../src/Expressions").Expression
function testExecAtFirstTime() {

}
testExecAtFirstTime.prototype = new Expression()
testExecAtFirstTime.prototype.execute = function() {
	if(this.getParentVar("testExecAtSecondTimeCount") == undefined) {
		this.setParentVar("testExecAtSecondTimeCount", 0)
		this.bypass()
	} else if(this.getParentVar("testExecAtSecondTimeCount") == 1) {
		this.setParentVar("testExecAtSecondTimeCount", this.getParentVar("testExecAtSecondTimeCount") +1)
		var self = this
		this.runInput( function(res) {
				self.bypass()
			})
	}else {
		this.setParentVar("testExecAtSecondTimeCount", this.getParentVar("testExecAtSecondTimeCount") +1)
		this.bypass()
	}
}

module.exports = {
	name: "testExecAtFirstTime",
	implementation: testExecAtFirstTime
}
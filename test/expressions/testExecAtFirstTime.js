var Expression = require("../../src/Expressions").Expression
function testExecAtFirstTime() {

}
testExecAtFirstTime.prototype = new Expression()
testExecAtFirstTime.prototype.execute = function() {
	var self = this
	if(this.getParentVar("testExecAtSecondTimeCount") == undefined) {
		this.setParentVar("testExecAtSecondTimeCount", 0)
		self.skip()
	} else if(this.getParentVar("testExecAtSecondTimeCount") == 1) {
		this.setParentVar("testExecAtSecondTimeCount", this.getParentVar("testExecAtSecondTimeCount") +1)
		this.runInput({
			_resultCallback: function(res) {
				self.skip()
			}
		})
	}else {
		this.setParentVar("testExecAtSecondTimeCount", this.getParentVar("testExecAtSecondTimeCount") +1)
		self.skip()
	}
}

module.exports = {
	name: "testExecAtFirstTime",
	implementation: testExecAtFirstTime
}
var Expression = require("../../src/Expressions").Expression
function testExecAtThirdTime() {

}
testExecAtThirdTime.prototype = new Expression()
testExecAtThirdTime.prototype.execute = function() {
	var self = this
	//console.warn("testExecAtThirdTime", self.getVar("testExecAtThirdTimeCount"))
	if(self.getParentVar("testExecAtThirdTimeCount")  == undefined) {

		//console.warn("initializing testExecAtThirdTimeCount")
		self.setParentVar("testExecAtThirdTimeCount", 0) 
		//console.warn("testExecAtThirdTimeCount:", self.getParentVar("testExecAtThirdTimeCount"))
		this.skip()
		//return
	} else {
		if(self.getParentVar("testExecAtThirdTimeCount")  < 2) {
			//console.warn("incrementing testExecAtThirdTimeCount", self.getParentVar("testExecAtThirdTimeCount"))
			self.setParentVar("testExecAtThirdTimeCount", self.getParentVar("testExecAtThirdTimeCount") +1)
			this.skip()
			//return
		} else {
			//console.warn("executing testExecAtThirdTimeCount")
			this.runInput({
				_resultCallback: function(res) {
					self.skip()
				}
			})
		}
	}
}

module.exports = {
	name:"testExecAtThirdTime",
	implementation:testExecAtThirdTime
}
var Expression = require("../../src/Expressions").Expression
function testExecAtThirdTime() {

}
testExecAtThirdTime.prototype = new Expression()
testExecAtThirdTime.prototype.execute = function() {
	//console.warn("testExecAtThirdTime", this.getVar("testExecAtThirdTimeCount"), typeof(this.getVar("testExecAtThirdTimeCount")))

	if(this.getParentVar("testExecAtThirdTimeCount")  === undefined) {

		//console.warn("initializing testExecAtThirdTimeCount")
		this.setParentVar("testExecAtThirdTimeCount", 0) 
		//console.warn("testExecAtThirdTimeCount:", this.getParentVar("testExecAtThirdTimeCount"), this.parent.vars)
		this.bypass()
		//return
	} else {
		if(this.getParentVar("testExecAtThirdTimeCount")  < 2) {
			//console.warn("incrementing testExecAtThirdTimeCount", this.getParentVar("testExecAtThirdTimeCount"))
			this.setParentVar("testExecAtThirdTimeCount", this.getParentVar("testExecAtThirdTimeCount") +1)
			this.bypass()
			//return
		} else {
			//console.warn("executing testExecAtThirdTimeCount")
			var self = this
			this.runInput(function(res) {
					self.bypass()
				})
		}
	}
}

module.exports = {
	name:"testExecAtThirdTime",
	implementation:testExecAtThirdTime
}
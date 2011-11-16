var Expression = require("../../src/Expressions").Expression
var objCount = 0
function testTickedReturn() {
	objCount++
	this.returnName = "return " + objCount
}
testTickedReturn.prototype = new Expression()
testTickedReturn.prototype.execute = function() {
	//console.warn("executing testTickedReturn ", this.returnName)
	var self = this
	
	process.nextTick(function() {
		self.runInput( function(res) {
				process.nextTick(function() {
					var interval = 0
					//console.warn("testTickedReturn ", self.returnName, " will wait ", self.getHintValue())
					interval = setInterval(function() {
						//console.warn("setting result for testTickedReturn ", self.returnName)
						self.end(res)
						clearInterval(interval)
					},parseInt(self.getHintValue()));
				});
		})
	})
}

module.exports = {
	name:"testTickedReturn",
	flags: "hint",
	implementation:testTickedReturn
}
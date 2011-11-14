var Expression = require("../Expressions").Expression
function Return() {

}
Return.prototype = new Expression()
Return.prototype.execute = function() {
	var self = this
	this.runInput(function(res) {
			self.end(res)
		});
}

module.exports = {
	name: "return",
	implementation: Return
}
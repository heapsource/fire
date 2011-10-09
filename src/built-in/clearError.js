var Expression = require("../Expressions").Expression

function ClearError() {

}
ClearError.prototype = new Expression()
ClearError.prototype.execute = function() {
	var self = this
	self.clearError()
	self.skip();
}

module.exports = {
	name:"clearError",
	implementation:ClearError
}
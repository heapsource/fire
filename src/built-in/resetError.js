var Expression = require("../Expressions").Expression

function ResetError() {

}
ResetError.prototype = new Expression()
ResetError.prototype.execute = function() {
	var self = this
	self.resetError()
	self.skip();
}

module.exports = {
	name:"resetError",
	implementation:ResetError
}
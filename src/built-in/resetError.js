var Expression = require("../Expressions").Expression

function ResetError() {

}
ResetError.prototype = new Expression()
ResetError.prototype.execute = function() {
	var self = this
	self._resetError()
	self._skip();
}

module.exports = {
	name:"resetError",
	implementation:ResetError
}
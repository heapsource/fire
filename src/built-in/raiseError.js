var Expression = require("../Expressions").Expression
function RaiseError() {

}
RaiseError.prototype = new Expression()
RaiseError.prototype.execute = function() {
	var self = this
	this.runInput({
		_resultCallback: function(res) {
			self.raiseError(res)
		}
	});
}

module.exports = {
	name: "raiseError",
	implementation: RaiseError
}
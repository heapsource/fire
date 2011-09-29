var Expression = require("../Expressions").Expression
function Try() {

}
Try.prototype = new Expression()
Try.prototype.execute = function() {
	var self = this
	this._runInput({
		_errorCallback: function(error) {
			self._setError(error)
			self._blockContext._resultCallback(self._blockContext._parentResult)
		},
		_resultCallback: function(res) {
			self._blockContext._resultCallback(res)
		}
	});
}

module.exports = {
	name:"try",
	implementation:Try
}
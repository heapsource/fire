var Expression = require("../Expressions").Expression

function Catch() {

}
Catch.prototype = new Expression()
Catch.prototype.execute = function() {
	var self = this
	var errInfo = this._blockContext._parentContext._errorInfo
	self.clearError()
	if(errInfo != undefined) {
		// there is an error, run the input...
		this._blockContext._variables.errorInfo = errInfo // let the input know about the error
		this.runInput({
			_resultCallback: function(res) {
				// and return the values. any errors are bubbled up
				self._blockContext._resultCallback(res)
			}
		});
	} else {
		// No errors found, return the parent result inmediately
		self.skip()
	}
}

module.exports = {
	name:"catch",
	implementation:Catch
}
var Expression = require("../Expressions").Expression
function Return() {

}
Return.prototype = new Expression()
Return.prototype.execute = function() {
	var rc = this._blockContext._resultCallback
	this._runInput({
		_resultCallback: function(res) {
			rc(res)
		}
	});
}

module.exports = {
	name: "return",
	implementation: Return
}
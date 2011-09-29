var Expression = require("../Expressions").Expression
function ReturnError() {

}
ReturnError.prototype = new Expression()
ReturnError.prototype.execute = function() {
	this._blockContext._resultCallback(this._blockContext._parentContext._errorInfo)
}


module.exports = {
	name: "returnError",
	implementation: ReturnError
}
var Expression = require("../Expressions").Expression
function ReturnError() {

}
ReturnError.prototype = new Expression()
ReturnError.prototype.execute = function() {
	if(this._blockContext._parentContext._errorInfo) {
		this.setResult(this._blockContext._parentContext._errorInfo.error)
	} else {
		this.setResult(undefined)
	}
}


module.exports = {
	name: "returnError",
	implementation: ReturnError
}
var Expression = require("../Expressions").Expression
function Continue() {

}
Continue.prototype = new Expression()
Continue.prototype.execute = function() {
	this._loopControl('continue')
}

module.exports = {
	name:"continue",
	implementation:Continue
}
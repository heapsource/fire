var Expression = require("../Expressions").Expression

function Undefined() {

}

Undefined.prototype = new Expression()
Undefined.prototype.execute = function() {
	this.setResult(undefined)
}

module.exports = {
	name:"undefined",
	implementation:Undefined
}
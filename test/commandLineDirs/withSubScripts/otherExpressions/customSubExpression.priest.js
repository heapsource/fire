var priest = require('priest')

function customSubExpression() {
	
}
customSubExpression.prototype = new priest.Expression()
customSubExpression.prototype.execute = function() {
	this.setResult("customSubExpression")
}

module.exports = {
	name: "customSubExpression",
	implementation: customSubExpression
}
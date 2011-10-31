var priest = require('priest')

function customExpression() {
	
}
customExpression.prototype = new priest.Expression()
customExpression.prototype.execute = function() {
	this.setResult("customExpression")
}

module.exports = {
	name: "customExpression",
	implementation: customExpression
}
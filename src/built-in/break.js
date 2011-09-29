var Expression = require("../Expressions").Expression

function Break() {
	
}
Break.prototype = new Expression();
Break.prototype.execute = function() {
	this.loopControl('break')
}

module.exports = {
	name:"break",
	implementation:Break
}
/*
 Object used when an error occurrs in the execution of an initializer expression
*/
function InitializerError(epDef, error) {
	this.expressionDefinition = epDef;
	this.error = error;
};
InitializerError.prototype.toString = function() {
	return "priest runtime initializer '" + this.expressionDefinition.name + "' failed with error: '" + this.error + "'"
}
module.exports = InitializerError;
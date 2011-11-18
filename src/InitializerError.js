/*
 Object used when an error occurrs in the execution of an initializer expression
*/
function InitializerError(epDef, error) {
	this.expressionDefinition = epDef;
	this.error = error;
};
InitializerError.prototype.toString = function() {
	return "fire.js runtime initializer '" + this.expressionDefinition.name + "' failed with error: '" + this.error + "'"
}
InitializerError.prototype.toJSONObject = function() {
	return {
		expression: {
			name: this.expressionDefinition.name,
			sourceUri: this.expressionDefinition.sourceUri
		},
		error: (this.error.toJSONObject ? this.error.toJSONObject() : this.error.toString())
	}
}
module.exports = InitializerError;
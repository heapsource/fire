/*
 Object used when an error occurrs in the execution of a igniter initializer
*/
function ModuleInitializerError(module, error) {
	this.module = module;
	this.error = error;
};
ModuleInitializerError.prototype.toString = function() {
	return "fire.js module initializer '" + this.module.ignition.path + "' failed with error: '" + this.error + "'"
}
ModuleInitializerError.prototype.toJSONObject = function() {
	return {
		modulePath:this.module.ignition.path,
		error: (this.error.toJSONObject ? this.error.toJSONObject() : this.error.toString())
	}
}
module.exports = ModuleInitializerError;
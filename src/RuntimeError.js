var RuntimeError = function(blockContext, error) {
	this.blockContext = blockContext;
	this.error = error;
};
RuntimeError.prototype.toString = function() {
	return "priest runtime error: " + this.error
}
module.exports = RuntimeError;
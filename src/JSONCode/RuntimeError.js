var RuntimeError = function(blockContext, error) {
	this.blockContext = blockContext;
	this.error = error;
};

module.exports = RuntimeError;
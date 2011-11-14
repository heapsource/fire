function CompilationError(sourceName, path, message, code) {
	this.sourceName = sourceName
	this.path = path
	this.message = message
}
CompilationError.prototype.toString = function() {
	
}

module.exports = CompilationError
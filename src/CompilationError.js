function CompilationError(sourceUri, path, message, code) {
	this.sourceUri = sourceUri || null
	this.path = path || null
	this.message = message || null
	this.code = code || null
}
CompilationError.prototype.toString = function() {
	return "#CompilationError"
}

module.exports = CompilationError
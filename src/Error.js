var Error = function(code, message) {
	this.code = code;
	this.message = message;
};
Error.prototype.toString = function() {
	return "priest error " + this.code + ": " + this.message
}
module.exports = Error;
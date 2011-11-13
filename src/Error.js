var Error = function(code, message) {
	this.code = code;
	this.message = message;
};
Error.prototype.toString = function() {
	return "fire.js error " + this.code + ": " + this.message
}
module.exports = Error;
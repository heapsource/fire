
var StringBuffer = function() {
	this.str = ""
	this.indentLevel = 0;
}

StringBuffer.prototype.indent = function() {
	this.indentLevel++
}

StringBuffer.prototype.unindent = function() {
	if(this.unindentLevel == 0) return;
	this.indentLevel--
}
StringBuffer.prototype.createIndent = function() {
	var s = ""
	var max = this.indentLevel * 2;
	for(var i = 0;i < max; i++) {
		s+=" "
	}
	return s
}

StringBuffer.prototype.toString = function() {
	return this.str
}

StringBuffer.prototype.write = function(str) {
	this.str+=str
}

StringBuffer.prototype.writeLine = function(str) {
	this.write(this.createIndent())
	this.write(str)
	this.write("\n")
}

module.exports = StringBuffer;

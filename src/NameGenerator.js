var NameGenerator = function(c) {
	this.count = c == undefined ? 0 : c
}

NameGenerator.prototype.name = function(base) {
	return "_v" + this.count + base
}

NameGenerator.prototype.createInner = function() {
	return new NameGenerator(this.count + 1)
}

module.exports = NameGenerator
var Variable = function(c) {
	
}

Variable.prototype.get = function() {
	return this._val
}
Variable.prototype.set = function(val) {
	this._val = val
}

module.exports = Variable
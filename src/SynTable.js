function SynTable() {
	this.count = 0
	this.prefix = "_"
	this.names= {}
}

SynTable.prototype.syn = function(name) {
	var syn = this.names[name]
	if(!syn) {
		syn = this.names[name] = this.prefix + (++this.count)
	}
	return syn
}
module.exports = SynTable
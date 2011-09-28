var Iterator = function(collection) {
	if(!(collection instanceof Array)) {
		throw "Iterator requires the collection to be an array but '" + collection + "' was given instead"
	}
	this._lastIndex= collection.length - 1;
	this._index = -1;
	this._collection = collection;
}

Iterator.prototype.index = function() {
	return this._index
}
Iterator.prototype.isFirst = function() {
	return this._index === 0
}
Iterator.prototype.isLast = function() {
	return this._index === this._lastIndex
}

Iterator.prototype.current = function() {
	return this._collection[this._index]
}

Iterator.prototype.count = function() {
	return this._collection.length
}

Iterator.prototype.next = function() {
	if(this.isLast()) return false;
	this._index++;
	return true;
}

module.exports = Iterator
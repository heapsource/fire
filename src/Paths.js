var Variable = require('./Variable')
var StringBuffer = require('./StringBuffer')
var AstEntryType = {
	"Unknown": 0,
	"Property": 1,
	"Index": 2
}

var PathBuilder = function() {
	this._compiledPaths = {}
}

var Entry = function(type) {
	this.key = ''
	this.type = type
}

Entry.prototype.isEmpty = function() {
	return this.key === undefined || this.key === null || this.key === ''
}

var EXPECTING_ANYTHING = 0
var EXPECTING_PROPERTY_NAME = 1
var EXPECTING_INDEX_NAME = 2
var EXPECTING_PROPERTY_NAME = 3

PathBuilder.prototype.parse = function(pathStr) {
	var list = []
	var currentEntry = new Entry(AstEntryType.Property)
	var phase = undefined
	for(var i in pathStr) {
		var c = pathStr.charAt(i)
		if(c === '.') {
			console.warn("period found at char 					" + i)
			if(currentEntry.isEmpty() && currentEntry.type !== AstEntryType.Unknown) {
				throw "Error at char index " + i + ": Can not get the property without an object"
			}
			if(currentEntry.type != AstEntryType.Unknown) {
				list.push(currentEntry)
			}
			currentEntry = new Entry(AstEntryType.Property)// new property entry
			phase = EXPECTING_PROPERTY_NAME
		} else if(c === '[') {
			console.warn("Begin of Index found at char	" + i)
			if(currentEntry.isEmpty() && currentEntry.type !== AstEntryType.Unknown) {
				throw "Error at char index " + i + ": Can not get the index without an object"
			}
			if(currentEntry.type != AstEntryType.Unknown) {
				list.push(currentEntry)
			}
			currentEntry = new Entry(AstEntryType.Index) // new index Entry
			phase = EXPECTING_INDEX_NAME
		} else if(c === ']') {
			console.warn("End of Index found at char	" + i)
			if(currentEntry.isEmpty()) {
				throw "Error at char index " + i + ": Index key can not be blank"
			}
			if(currentEntry.type !== AstEntryType.Index) {
				throw "Error at char index " + i + ": Unexpected end of index number"
			}
			if(currentEntry.type != AstEntryType.Unknown) {
				list.push(currentEntry)
			}
			currentEntry = new Entry(AstEntryType.Unknown)
			phase = EXPECTING_ANYTHING
		} else if(c === ' ') {
			throw "Error at char index " + i + ": White spaces are not supported in names"
		}
		else {
			console.warn("Literal char "+ c + " found at char	" + i)
			if(currentEntry.type == AstEntryType.Unknown) {
				currentEntry.type = AstEntryType.Property
			}
			currentEntry.key += c
			phase = EXPECTING_ANYTHING
		}
	}
	console.warn("end of parse")
	if(phase === EXPECTING_PROPERTY_NAME) {
		throw "Unexpected end path, expecting property name"
	}
	else if(phase === EXPECTING_INDEX_NAME) {
		throw "Unexpected end path, expecting index number"
	}
	if(!currentEntry.isEmpty()) {
		list.push(currentEntry)
	}
	return list
}

PathBuilder.prototype.compile = function(pathStr) {
	
}

PathBuilder.prototype.isCompiled = function(pathStr) {
	return this._compiledPaths[pathStr] !== undefined
}
PathBuilder.prototype._runCore = function(variables, path) {
	return path(variables)
}
PathBuilder.prototype.run = function(variables, pathStr) {
	var path = this._compiledPaths[pathStr]
	if(path === undefined) {
		path = this.compile(pathStr)
	} 
	return this._runCore(variables,path)
}

module.exports.PathBuilder = PathBuilder
module.exports.AstEntryType = AstEntryType
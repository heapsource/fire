var Variable = require('./Variable')
var StringBuffer = require('./StringBuffer')
var vm = require('vm')
var Iterator = require('./Iterator')

var AstEntryType = {
	"Unknown": 0,
	"Property": 1,
	"Index": 2
}

var PathCache = function() {
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
var VALID_NUMBERS = "0123456789"

function isDigit(c){
	return VALID_NUMBERS.indexOf(c) !== -1
}

PathCache.prototype.parse = function(pathStr) {
	var list = []
	var currentEntry = new Entry(AstEntryType.Property)
	var phase = undefined
	for(var i in pathStr) {
		var c = pathStr.charAt(i)
		if(c === '.') {
			//console.warn("period found at char 					" + i)
			if(currentEntry.isEmpty() && currentEntry.type !== AstEntryType.Unknown) {
				throw "Error at char index " + i + ": Can not get the property without an object"
			}
			if(currentEntry.type != AstEntryType.Unknown) {
				list.push(currentEntry)
			}
			currentEntry = new Entry(AstEntryType.Property)// new property entry
			phase = EXPECTING_PROPERTY_NAME
		} else if(c === '[') {
			//console.warn("Begin of Index found at char	" + i)
			if(currentEntry.isEmpty() && currentEntry.type !== AstEntryType.Unknown) {
				throw "Error at char index " + i + ": Can not get the index without an object"
			}
			if(currentEntry.type != AstEntryType.Unknown) {
				list.push(currentEntry)
			}
			currentEntry = new Entry(AstEntryType.Index) // new index Entry
			phase = EXPECTING_INDEX_NAME
		} else if(c === ']') {
			//console.warn("End of Index found at char	" + i)
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
			//console.warn("Literal char "+ c + " found at char	" + i)
			if(currentEntry.type == AstEntryType.Unknown) {
				currentEntry.type = AstEntryType.Property
			}
			if(currentEntry.type == AstEntryType.Index && !isDigit(c)) {
				throw "Error at char index " + i + ": Indexes takes numbers only"
			}
			currentEntry.key += c
			phase = EXPECTING_ANYTHING
		}
	}
	//console.warn("end of parse")
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

PathCache.prototype.compile = function(pathStr) {
	var pathFileName = pathStr + ".path.js"
	var ast = this.parse(pathStr)
	var buffer = new StringBuffer()
	
	buffer.writeLine("_compiledFunction = function(variables, path){")
	buffer.indent()
	buffer.writeLine("var res = undefined;")
	var iterator = new Iterator(ast);
	while(iterator.next()) {
		var entry = iterator.current();
		if(iterator.isFirst()) {
			buffer.writeLine("var varObj = variables['" + entry.key +"'];")
			buffer.writeLine("if(varObj !== undefined) {")
			buffer.indent()
			buffer.writeLine("res = varObj.get();")
			buffer.unindent()
			buffer.writeLine("}")
			buffer.writeLine("if(res === undefined || res === null) return res;")
		} else if(entry.type == AstEntryType.Property) {
			buffer.writeLine("res = res['" + entry.key +"'];")
			buffer.writeLine("if(res === undefined || res === null) return res;")
		}
		else if(entry.type == AstEntryType.Index) {
			buffer.writeLine("res = res[" + entry.key +"];")
			buffer.writeLine("if(res === undefined || res === null) return res;")
		}
	}
	buffer.writeLine("return res;")
	buffer.unindent()
	buffer.writeLine("}")
	var compilationResults = {
		"_compiledFunction": null
	}
	vm.runInNewContext(buffer.toString(), compilationResults, pathFileName);
	
	return this._compiledPaths[pathStr] = compilationResults._compiledFunction
}

PathCache.prototype.isCompiled = function(pathStr) {
	return this._compiledPaths[pathStr] !== undefined
}
PathCache.prototype._runCore = function(variables, path) {
	return path(variables)
}
PathCache.prototype.run = function(variables, pathStr) {
	var path = this._compiledPaths[pathStr]
	if(path === undefined) {
		path = this.compile(pathStr)
	} 
	return this._runCore(variables, path)
}

module.exports.PathCache = PathCache
module.exports.AstEntryType = AstEntryType
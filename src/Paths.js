// Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var StringBuffer = require('./StringBuffer')
var vm = require('vm')
var Iterator = require('./Iterator')

var AstEntryType = {
	"Unknown": 0,
	"Property": 1,
}

function PathCache() {
	this._compiledPaths = {}
	this._compiledWritePaths = {}
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
var VALID_NUMBERS = "0123456789"

function isDigit(c){
	return VALID_NUMBERS.indexOf(c) !== -1
}

PathCache.prototype.parse = function(pathStr) {
	var list = []
	var currentEntry = new Entry(AstEntryType.Property)
	var phase = undefined
	for(var i = 0; i < pathStr.length;i++) {
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
		} else if(c === ' ') {
			throw "Error at char index " + i + ": White spaces are not supported in names"
		}
		else {
			//console.warn("Literal char "+ c + " found at char	" + i)
			if(currentEntry.type == AstEntryType.Unknown) {
				currentEntry.type = AstEntryType.Property
			}
			currentEntry.key += c
			phase = EXPECTING_ANYTHING
		}
	}
	//console.warn("end of parse")
	if(phase === EXPECTING_PROPERTY_NAME) {
		throw "Unexpected end path, expecting property name"
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
	buffer.writeLine("//get: " + pathStr)
	buffer.writeLine("_compiledFunction = function(variablesSeed, path){")
	buffer.indent()
	buffer.writeLine("var res = undefined;")
	buffer.writeLine("var variables = undefined;")
	var iterator = new Iterator(ast);
	while(iterator.next()) {
		var entry = iterator.current();
		buffer.writeLine("//." + entry.key)
		if(iterator.isFirst()) {
			
			buffer.writeLine("var currentVariables = variablesSeed")
			buffer.writeLine("while(currentVariables)")
			buffer.writeLine("{")
			buffer.indent()
			buffer.writeLine("res = currentVariables['" + entry.key +"']")
			buffer.writeLine("if(res !== undefined)")
			buffer.writeLine("{")
			buffer.indent()
			buffer.writeLine("variables = currentVariables")
			buffer.writeLine("break")
			buffer.unindent()
			buffer.writeLine("}")
			
			buffer.writeLine("currentVariables = currentVariables._parent")
			buffer.unindent()
			buffer.writeLine("} // while")
			buffer.writeLine("if(!variables)")
			buffer.writeLine("{")
			buffer.indent()
			buffer.writeLine("variables = variablesSeed")
			buffer.writeLine("res = variables['" + entry.key +"'];")
			buffer.unindent()
			buffer.writeLine("}")
			
		} else if(entry.type == AstEntryType.Property) {
			buffer.writeLine("res = res['" + entry.key +"'];")
		}
		buffer.writeLine("if(res === undefined || res === null) return res;")
	}
	buffer.writeLine("return res;")
	buffer.unindent()
	buffer.writeLine("}")
	var compilationResults = {
		"_compiledFunction": null
	}
	var sourceCode = buffer.toString()
	vm.runInNewContext(sourceCode, compilationResults, pathFileName);
	
	return this._compiledPaths[pathStr] = compilationResults._compiledFunction
}

PathCache.prototype.isCompiled = function(pathStr) {
	return this._compiledPaths[pathStr] !== undefined
}
PathCache.prototype.writeIsCompiled = function(pathStr) {
	return this._compiledWritePaths[pathStr] !== undefined
}
PathCache.prototype._runCore = function(variables, path) {
	return path(variables)
}
PathCache.prototype._runWriteCore = function(variables, path, value, forceCreate) {
	return path(variables, path, value, forceCreate)
}
PathCache.prototype.run = function(variables, pathStr) {
	var path = this._compiledPaths[pathStr]
	if(path === undefined) {
		path = this.compile(pathStr)
	} 
	return this._runCore(variables, path)
}

PathCache.prototype.compileWrite = function(pathStr) {
	var pathFileName = pathStr + ".writePath.js"
	var ast = this.parse(pathStr)
	var buffer = new StringBuffer()
	buffer.writeLine("//set: " + pathStr)
	buffer.writeLine("_compiledFunction = function(variablesSeed, path, value, forceCreate){")
	buffer.indent()
	buffer.writeLine("var variables = undefined;")
	var iterator = new Iterator(ast);
	while(iterator.next()) {
		
		var entry = iterator.current();
		buffer.writeLine("//." + entry.key)
		if(iterator.isFirst()) {
		
			buffer.writeLine("if(forceCreate) {")
			buffer.indent()
			buffer.writeLine("variables = variablesSeed")
			buffer.unindent()
			buffer.writeLine("}")
			buffer.writeLine("else {")
			buffer.indent()
			buffer.writeLine("var currentVariables = variablesSeed")
			buffer.writeLine("while(currentVariables)")
			buffer.writeLine("{")
			//buffer.writeLine("console.warn(currentVariables)")
			buffer.indent()
			
			buffer.writeLine("if(currentVariables['" + entry.key +"'] !== undefined)")
			buffer.writeLine("{")
			buffer.indent()
			buffer.writeLine("variables = currentVariables")
			buffer.writeLine("break")
			buffer.unindent()
			buffer.writeLine("}")
			
			buffer.writeLine("currentVariables = currentVariables._parent")
			buffer.unindent()
			buffer.writeLine("} // while")
			
			buffer.writeLine("if(!variables)")
			buffer.writeLine("{")
			buffer.indent()
			buffer.writeLine("variables = variablesSeed")
			buffer.unindent()
			buffer.writeLine("}")
			
			buffer.unindent()
			buffer.writeLine("} // else")
			buffer.writeLine("var currentVal = variables['" + entry.key +"'];")
			if(iterator.isLast()) {
				buffer.writeLine("variables['" + entry.key +"'] = value");
			} else {
				buffer.writeLine("if(!currentVal) {");
				buffer.indent()
				buffer.writeLine("currentVal = variables['" + entry.key +"'] = {}");
				buffer.unindent()
				buffer.writeLine("}");
			}
		} else if(entry.type == AstEntryType.Property) {
			if(iterator.isLast()) {
				buffer.writeLine("currentVal['" + entry.key +"'] = value;")
			} else {
				buffer.writeLine("var varVal = currentVal['" + entry.key +"']");
				buffer.writeLine("if(!varVal){")
				buffer.indent()
				buffer.writeLine("varVal = currentVal['" + entry.key +"'] = {};")
				buffer.unindent()
				buffer.writeLine("}")
				buffer.writeLine("currentVal = varVal;");
			}
		}
	}
	buffer.unindent()
	buffer.writeLine("}")
	var compilationResults = {
		"_compiledFunction": null,
		console: console
	}
	var sourceCode = buffer.toString()
	//console.log(sourceCode)
	vm.runInNewContext(sourceCode, compilationResults, pathFileName);
	
	return this._compiledWritePaths[pathStr] = compilationResults._compiledFunction
}

PathCache.prototype.runWrite = function(variables, pathStr, value, forceCreate) {
	var path = this._compiledWritePaths[pathStr]
	if(path === undefined) {
		path = this.compileWrite(pathStr)
	} 
	return this._runWriteCore(variables, path, value, forceCreate)
}

module.exports.PathCache = PathCache
module.exports.AstEntryType = AstEntryType
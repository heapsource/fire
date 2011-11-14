var Ast = require('./Ast')
var AstNodeType = require('./AstNodeType')
var Iterator = require('./Iterator')
var fs = require('fs')
var StringBuffer = require('./StringBuffer')
var vm = require('vm')
var Expression = require('./Expressions').Expression

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

function Compiler(runtime) {
	this.runtime = runtime
	this.buffer = new StringBuffer()
	this.expSynTable = new SynTable()
	this.expSynTable.prefix = "E"
	this.typeDefinitions = []
}
Compiler.prototype.outputFile = null
Compiler.prototype.load = function() {
	var context = {
		Expression: Expression,
		Runtime: this.runtime
	}
	vm.runInNewContext(this.buffer.toString(), context, this.outputFile)
	this.dictionaryType = context.Dictionary
	console.warn("===")
	console.warn(this.buffer.toString())
	console.warn("===")
	console.warn("Compiler.load")
	console.warn("dictionary", this.dictionaryType)
}
Compiler.prototype.generateAstNodeCode = function(astNode) {
	if(astNode.isLiteral()) {
		this.buffer.writeLine("this.end(" + JSON.stringify(astNode.value) + ")")
	} else {
		throw "can compile code yet"
	}
}
Compiler.prototype.generateExpressionType = function(typeDefinition) {
	var expDefinition = typeDefinition.definition
	var expSynName = this.expSynTable.syn(expDefinition.name)
	this.buffer.writeLine("//" + expDefinition.name)
	this.buffer.writeLine("function " + expSynName + "(){};")
	this.buffer.writeLine(expSynName + ".prototype = new Expression()")
	if(typeDefinition.isRoot) {
		this.buffer.writeLine(expSynName + ".prototype.isRoot = true")
	}
	this.buffer.writeLine(expSynName + ".prototype.execute = function() {")
	var ast = new Ast.Tree()
	ast.parse(expDefinition.json)
	console.log()
	this.buffer.indent()
	this.generateAstNodeCode(ast.getRootNode())
	this.buffer.unindent()
	this.buffer.writeLine("};")
	//this.buffer.writeLine('List["' + expDefinition.name + '"] = ' + expSynName + ";")
	var pureExpDefinition = {}
	var expDefinitionKeys = Object.keys(expDefinition)
	for(var i = 0; i < expDefinitionKeys.length; i++) {
		var key = expDefinitionKeys[0]
		if(key != 'json') {
			pureExpDefinition[key] = expDefinition[key]	
		}
	}
	if(typeDefinition.isRoot) {
		var defSynName = expSynName + "Def"
		this.buffer.writeLine("var " + defSynName + " = " + JSON.stringify(pureExpDefinition) + "")
		this.buffer.writeLine(defSynName + ".implementation = " + expSynName)
		this.buffer.writeLine("Runtime.registerWellKnownExpressionDefinition(" + defSynName + ")")
	}
}
Compiler.prototype.addExpressionTypeDefinition = function(typeDefinition) {
	this.typeDefinitions.push(typeDefinition)
}
Compiler.prototype.compile = function(expressions, callback) {
	for(var i = 0; i < expressions.length; i++) {
		var expDef = expressions[i];
		this.addExpressionTypeDefinition({
			definition:expDef,
			isRoot: true
		});
	}
	var self = this
	console.warn("Compiler.compile")
	console.warn("compiling to ", this.outputFile)
	//this.buffer.writeLine("var List = {}")
	this.iterator = new Iterator(this.typeDefinitions)
	var continueNextExpression = function() {
		process.nextTick(function() {
			if(self.iterator.next()) {
				var typeDefinition = self.iterator.current()
				self.generateExpressionType(typeDefinition, {
						isRoot: true
					})
				continueNextExpression()
			} else {
				fs.writeFileSync(self.outputFile, self.buffer.toString())
				self.load()
				callback(self.dictionaryType)
			}
		});
	};
	continueNextExpression()
}
module.exports = Compiler
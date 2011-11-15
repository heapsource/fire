var Ast = require('./Ast')
var AstNodeType = require('./AstNodeType')
var Iterator = require('./Iterator')
var fs = require('fs')
var StringBuffer = require('./StringBuffer')
var vm = require('vm')
var Expression = require('./Expressions').Expression
var CompilationError = require('./CompilationError')

function Compiler(runtime) {
	this.runtime = runtime
	this.buffer = new StringBuffer()
	this.typeDefinitions = []
}
Compiler.prototype.outputFile = null
Compiler.prototype.expSynTable = null
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
Compiler.prototype.generateCodeBlockChain = function(iterator, executeOnParent) {
	var self = this
	if(iterator.next()) {
		var expNode = iterator.current()
		var headerValue = expNode.value
		var expressionName = Ast.getExpressionNameFromSpecialKey(headerValue)
		this.buffer.writeLine("//" + expNode.value)
		this.buffer.writeLine("var exp = new(Runtime.loadedExpressionsSyn." + self.expSynTable.syn(expressionName) + ")")
		this.buffer.writeLine("exp.runtime = Runtime")
		var expValNode = expNode.children[0]
		if(expValNode.isPureValue()) {
			this.buffer.writeLine("exp.input = " + JSON.stringify(expValNode.value) )
		} else {
			this.buffer.writeLine("exp.createInputExpression = function() {")
			this.buffer.indent()
			this.buffer.writeLine("var exp = new Expression()")
			this.buffer.writeLine("exp.execute = function() {")
			this.buffer.indent()
			this.generateAstNodeCode(expValNode)
			this.buffer.unindent()
			this.buffer.writeLine("}")
			this.buffer.writeLine("return exp")
			this.buffer.unindent()
			this.buffer.writeLine("}")
		}
		var hintValue = Ast.getHintFromSpecialKey(headerValue)
		if(hintValue) {
			this.buffer.writeLine("exp.hint = " + JSON.stringify(hintValue) )
		}
		this.buffer.writeLine("exp.resultCallback = function(res, parent) {")
		this.buffer.indent()
		this.buffer.writeLine("parent.setCurrentResult(res)")
		if(iterator.isLast()) {
			this.buffer.writeLine("parent.finish()")
		} else {
			this.generateCodeBlockChain(iterator, 
				true // generate for execution by parent and not 'this'
				)
		}
		this.buffer.unindent()
		this.buffer.writeLine("}")
		this.buffer.writeLine("exp.run(" + (executeOnParent ? "parent" : "this") + ")")
	}
}
Compiler.prototype.generateCodeHashChain = function(hashNode, executeOnParent) {
	var self = this
	var targetName = (executeOnParent ? "parent" : "this")
	this.buffer.writeLine("var hashResult = {}")
	this.buffer.writeLine(targetName + ".setCurrentResult(hashResult)")
	var iterator = new Iterator(hashNode.children)
	this.generateCodeHashChainExpressions(iterator, targetName)
}
Compiler.prototype.generateCodeHashChainExpressions = function(iterator, target) {
	var self = this
	if(iterator.next()) {
		var propNode = iterator.current()
		if(propNode.isPureValue()) {
			this.buffer.writeLine("hashResult[" + JSON.stringify(propNode.value) + "] = "+ JSON.stringify(propNode.children[0].value))
			if(iterator.isLast()) {
				this.buffer.writeLine(target + ".finish()")
			} else {
				this.generateCodeHashChainExpressions(iterator, target)
			}
		}else {
			// Generate Anonymous Expression Block
			this.buffer.writeLine("var exp = new Expression()")
			this.buffer.writeLine("exp.execute = function() {")
			this.buffer.indent()
			this.generateAstNodeCode(propNode.children[0])
			this.buffer.unindent()
			this.buffer.writeLine("}")
			this.buffer.writeLine("exp.resultCallback = function(res, parent) {")
			this.buffer.indent()
			this.buffer.writeLine("parent.getCurrentResult()[" + JSON.stringify(propNode.value) + "] = res")
			if(iterator.isLast()) {
				this.buffer.writeLine("parent.finish()")
			} else {
				this.generateCodeHashChainExpressions(iterator, "parent")
			}
			this.buffer.unindent()
			this.buffer.writeLine("}")
			this.buffer.writeLine("exp.run(" + target + ")")
		}
	}
}
Compiler.prototype.generateCodeArrayChain = function(hashNode, executeOnParent) {
	var self = this
	var targetName = (executeOnParent ? "parent" : "this")
	this.buffer.writeLine("var arrayResult = []")
	this.buffer.writeLine(targetName + ".setCurrentResult(arrayResult)")
	var iterator = new Iterator(hashNode.children)
	this.generateCodeHashChainExpressions(iterator, targetName)
}
Compiler.prototype.generateCodeArrayChainExpressions = function(iterator, target) {
	var self = this
	if(iterator.next()) {
		var propNode = iterator.current()
		if(propNode.isPureValue()) {
			this.buffer.writeLine("arrayResult[" + JSON.stringify(propNode.value) + "] = "+ JSON.stringify(propNode.children[0].value))
			if(iterator.isLast()) {
				this.buffer.writeLine(target + ".finish()")
			} else {
				this.generateCodeArrayChainExpressions(iterator, target)
			}
		}else {
			// Generate Anonymous Expression Block
			this.buffer.writeLine("var exp = new Expression()")
			this.buffer.writeLine("exp.execute = function() {")
			this.buffer.indent()
			this.generateAstNodeCode(propNode.children[0])
			this.buffer.unindent()
			this.buffer.writeLine("}")
			this.buffer.writeLine("exp.resultCallback = function(res, parent) {")
			this.buffer.indent()
			this.buffer.writeLine("parent.getCurrentResult()[" + JSON.stringify(propNode.value) + "] = res")
			if(iterator.isLast()) {
				this.buffer.writeLine("parent.finish()")
			} else {
				this.generateCodeArrayChainExpressions(iterator, "parent")
			}
			this.buffer.unindent()
			this.buffer.writeLine("}")
			this.buffer.writeLine("exp.run(" + target + ")")
		}
	}
}
Compiler.prototype.generateAstNodeCode = function(astNode) {
	if(astNode.isPureValue()) {
		this.buffer.writeLine("this.end(" + JSON.stringify(astNode.value) + ")")
	} else {
		if(astNode.type == AstNodeType.block) {
			var iterator = new Iterator(astNode.children)
			this.generateCodeBlockChain(iterator)
		} 
		else if(astNode.type == AstNodeType.hash) {
			this.generateCodeHashChain(astNode)
		}
		else if(astNode.type == AstNodeType.array) {
			this.generateCodeArrayChain(astNode)
		}
		else {
			console.trace()
			throw "can compile code yet for type " + astNode.type
		}
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
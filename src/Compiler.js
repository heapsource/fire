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
	//this.buffer.indentStep = 4
	this.typeDefinitions = []
}
Compiler.prototype.outputFile = null
Compiler.prototype.expSynTable = null
Compiler.prototype.load = function() {
	/*console.warn("===")
	console.warn(this.buffer.toString())
	console.warn("===")*/
	var loadIntoRuntime = vm.runInThisContext(this.buffer.toString(), this.outputFile, true)
	loadIntoRuntime(this.runtime, Expression)
	
}
Compiler.prototype.generateCodeBlockChain = function(iterator, runTargetName) {
	var self = this
	if(iterator.next()) {
		var expNode = iterator.current()
		var headerValue = expNode.value
		var expressionName = Ast.getExpressionNameFromSpecialKey(headerValue)
		this.buffer.writeLine("//" + expNode.value)
		var expVarName = "exp"
		this.buffer.writeLine("var "+expVarName+" = new Runtime.loadedExpressionsSyn." + self.expSynTable.syn(expressionName) + "()")
		this.buffer.writeLine(expVarName+".header = "+ JSON.stringify(headerValue))
		this.buffer.writeLine(expVarName+".runtime = Runtime")
		var expValNode = expNode.children[0]
		if(expValNode.isPureValue()) {
			this.buffer.writeLine(expVarName+".input = " + JSON.stringify(expValNode.value) )
		} else {
			this.buffer.writeLine(expVarName+".createInputExpression = function() {")
			this.buffer.indent()
			this.buffer.writeLine("var inputExp = new Expression()")
			this.buffer.writeLine("inputExp.isInput = true")
			this.buffer.writeLine("inputExp.execute = function() {")
			this.buffer.indent()
			this.generateAstNodeCode(expValNode)
			this.buffer.unindent()
			this.buffer.writeLine("}")
			this.buffer.writeLine("return inputExp")
			this.buffer.unindent()
			this.buffer.writeLine("}")
		}
		var hintValue = Ast.getHintFromSpecialKey(headerValue)
		if(hintValue) {
			this.buffer.writeLine(expVarName+".hint = " + JSON.stringify(hintValue) )
		}
		var parentVarName = "parent"
		this.buffer.writeLine(expVarName+".resultCallback = function(res, "+parentVarName+") {")
		this.buffer.indent()
		this.buffer.writeLine(parentVarName+".setCurrentResult(res)")
		if(iterator.isLast()) {
			this.buffer.writeLine(parentVarName+".finish()")
		} else {
			this.generateCodeBlockChain(iterator, 
				parentVarName
				)
		}
		this.buffer.unindent()
		this.buffer.writeLine("}")
		this.buffer.writeLine(expVarName+".run(" + runTargetName + ")")
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
	this.generateCodeArrayChainExpressions(iterator, targetName)
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
			this.generateCodeBlockChain(iterator, "this")
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
		var key = expDefinitionKeys[i]
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
	
	/*console.warn("Compiler.compile")
	console.warn("compiling to ", this.outputFile)*/
	this.buffer.writeLine("(function(Runtime, Expression){")
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
				self.buffer.writeLine("})")
				fs.writeFileSync(self.outputFile, self.buffer.toString())
				self.load()
				callback(self.dictionaryType)
			}
		});
	};
	continueNextExpression()
}
module.exports = Compiler
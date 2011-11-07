var vows = require('vows')
var assert = require('assert')
var Tree = require('../src/Ast.js').Tree
var AstNodeType = require('../src/AstNodeType.js')

vows.describe('AST - Parsing Root Literal Values').addBatch({
	"When I parse a literal value 'null' document": {
		"the root node of the ast should be literal 'null' type":  function() {
			var doc = null
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.null)
		}
	},
	"When I parse a literal value '240' document": {
		"the root node of the ast should be literal 'number' type":  function() {
			var doc = 240
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.number)
		}
	},
	"When I parse a literal value '\"Some Cool Text\"' document": {
		"the root node of the ast should be literal 'string' type":  function() {
			var doc = "Some Cool Text"
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.string)
		}
	}
	,"When I parse a literal value '{x:10}' document": {
		"the root node of the ast should be literal 'hash' type":  function() {
			var doc = {x:10}
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.hash)
		}
	}
	,"When I parse a literal value '[2,3]' document": {
		"the root node of the ast should be literal 'array' type":  function() {
			var doc = [2,3]
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.array)
		}
	}
	,"When I parse a literal value '{\"@return\": null}' document": {
		"the root node of the ast should be literal 'block' type":  function() {
			var doc = {"@return": null}
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.block)
		}
	}
}).export(module)

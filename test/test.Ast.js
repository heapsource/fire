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
		topic: function() {
			var doc = {x:10}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be literal 'hash' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.hash)
		},
		"the first node should be a 'property' type":  function(ast) {
			assert.equal(ast.getRootNode().children[0].type, AstNodeType.property)
		},
		"the first node should have the value 'x'":  function(ast) {
			assert.equal(ast.getRootNode().children[0].value, "x")
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
	,"When I parse an expression block '{\"@return\": null}' document": {
		topic: function() {
			var doc = {"@return": null}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be of 'block' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.block)
		},
		"the first node should be a 'expression' type":  function(ast) {
			assert.equal(ast.getRootNode().children[0].type, AstNodeType.expression)
		},
		"the first node should have the value '@return'":  function(ast) {
			assert.equal(ast.getRootNode().children[0].value, "@return")
		}
	},
	"When I parse a literal value '[\"First Item\", 1]' document": {
		topic: function() {
			var doc = ["First Item", null]
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be literal 'array' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.array)
		},
		"the first node should be a 'index' type":  function(ast) {
			assert.equal(ast.getRootNode().children[0].type, AstNodeType.index)
		},
		"the first node should have the value '0'":  function(ast) {
			assert.equal(ast.getRootNode().children[0].value, 0)
		},
		"the second node should be a 'index' type":  function(ast) {
			assert.equal(ast.getRootNode().children[1].type, AstNodeType.index)
		},
		"the second node should have the value '1'":  function(ast) {
			assert.equal(ast.getRootNode().children[1].value, 1)
		}
	},
	"When I parse a literal value '[]' document": {
		"the root node of the ast should be literal 'array' type":  function() {
			var doc = []
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.array)
		}
	},
	"When I parse a literal value '{}' document": {
		"the root node of the ast should be literal 'hash' type":  function() {
			var doc = {}
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().type, AstNodeType.hash)
		}
	},
}).export(module)

vows.describe('AST - Parsing Arrays').addBatch({
	"When I parse an array '[\"First Item\", 1]' document": {
		topic: function() {
			var doc = ["First Item", 233]
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be literal 'array' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.strictEqual(ast.getRootNode().type, AstNodeType.array)
		},
		"the first node should be of 'index' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].type, AstNodeType.index)
		},
		"the first node should have the value 0":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].value, 0)
		},
		"the sub-node of the first node should be of 'index' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].type, AstNodeType.string)
		},
		"the sub-node of the first node should have the value '0'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].value, "First Item")
		},
		"the second node should be of 'index' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].type, AstNodeType.index)
		},
		"the second node should have the value 1":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].value, 1)
		},
		"the sub-node of the second node should be of 'number' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].type, AstNodeType.number)
		},
		"the sub-node of the second node should have the value '233'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].value, 233)
		},
	}
}).export(module)

vows.describe('AST - Parsing Hashes').addBatch({
	"When I parse a hash '{\"Name\": \"Chuck\",\"age\": 40}' document": {
		topic: function() {
			var doc ={"Name": "Chuck","age": 40}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be literal 'hash' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.strictEqual(ast.getRootNode().type, AstNodeType.hash)
		},
		"the first node should be of 'property' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].type, AstNodeType.property)
		},
		"the first node should have the value 'Name'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].value, "Name")
		},
		"the sub-node of the first node should be of 'string' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].type, AstNodeType.string)
		},
		"the sub-node of the first node should have the value 'Chuck'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].value, "Chuck")
		},
		"the second node should be of 'property' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].type, AstNodeType.property)
		},
		"the second node should have the value 'age'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].value, "age")
		},
		"the sub-node of the second node should be of 'number' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].type, AstNodeType.number)
		},
		"the sub-node of the second node should have the value 40":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].value, 40)
		},
	}
}).export(module)

vows.describe('AST - Parsing Blocks').addBatch({
	"When I parse a hash '{\"@return\": 23, \"@get(var.o)\": null}' document": {
		topic: function() {
			var doc ={"@return": 23,"@get(var.o)": null}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be of 'block' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.strictEqual(ast.getRootNode().type, AstNodeType.block)
		},
		"the first node should be of 'expression' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].type, AstNodeType.expression)
		},
		"the first node should have the value '@return'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].value, "@return")
		},
		"the sub-node of the first node should be of 'number' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].type, AstNodeType.number)
		},
		"the sub-node of the first node should have the value 23":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].value, 23)
		},
		"the second node should be of 'expression' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].type, AstNodeType.expression)
		},
		"the second node should have the value '@get(var.o)'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].value, "@get(var.o)")
		},
		"the sub-node of the second node should be of 'null' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].type, AstNodeType.null)
		},
		"the sub-node of the second node should have a null value":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].value, null)
		},
	}
}).export(module)

vows.describe('AST - Mixed Keys Parsing').addBatch({
	"When I parse a hash with mixed keys '{\"@return\": 23, \"get(var.o)\": null}' document": {
		topic: function() {
			var doc ={"@return": 23,"get(var.o)": null}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should be of 'hash' type":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.strictEqual(ast.getRootNode().type, AstNodeType.hash)
		},
		"the first node should be of 'property' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].type, AstNodeType.property)
		},
		"the first node should have the value '@return'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].value, "@return")
		},
		"the sub-node of the first node should be of 'number' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].type, AstNodeType.number)
		},
		"the sub-node of the first node should have the value 23":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[0].children[0].value, 23)
		},
		"the second node should be of 'property' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].type, AstNodeType.property)
		},
		"the second node should have the value 'get(var.o)'":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].value, "get(var.o)")
		},
		"the sub-node of the second node should be of 'null' type":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].type, AstNodeType.null)
		},
		"the sub-node of the second node should have a null value":  function(ast) {
			assert.strictEqual(ast.getRootNode().children[1].children[0].value, null)
		},
	}
}).export(module)

vows.describe('AST - Node Paths').addBatch({
	"When I parse a literal value 'null' document": {
		"the root node of the ast should have the path part 'null'":  function() {
			var doc = null
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.strictEqual(ast.getRootNode().getPathPart(), 'null')
		}
	},
	"When I parse a literal value '240' document": {
		"the root node of the ast should have the path part '240'":  function() {
			var doc = 240
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.strictEqual(ast.getRootNode().getPathPart(), '240')
		}
	},
	"When I parse a literal value '\"Some Cool Text\"' document": {
		"the root node of the ast should have the path part '\"Some Cool Text\"'":  function() {
			var doc = "Some Cool Text"
			var ast = new Tree()
			ast.parse(doc)
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().getPathPart(), "\"Some Cool Text\"")
		}
	},
	"When I parse a literal value '{x:10}' document": {
		topic: function() {
			var doc = {x:10, name:"Chuck"}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should have the path part '{}'":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().getPathPart(), "{}")
		},
		"the first sub-node should have the path path 'x'": function(ast) {
			assert.equal(ast.getRootNode().children[0].getPathPart(), 'x')
		},
		"the second sub-node should have the path path 'name'": function(ast) {
			assert.equal(ast.getRootNode().children[1].getPathPart(), 'name')
		}
	},
	"When I parse a literal value '[2,3]' document": {
		topic: function() {
			var doc = [2,3]
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should have the path part '[]'":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().getPathPart(), "[]")
		},
		"the first sub-node should have the path path '0'": function(ast) {
			assert.equal(ast.getRootNode().children[0].getPathPart(), "0")
		},
		"the second sub-node should have the path path '1'": function(ast) {
			assert.equal(ast.getRootNode().children[1].getPathPart(), "1")
		}
	},
	"When I parse a block value '{\"@return\": null, \"@get(my.variable)\": null}' document": {
		topic: function() {
			var doc = {"@return": null, "@get(my.variable)": null}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the root node of the ast should have the path part '{@}'":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().getPathPart(), "{@}")
		},
		"the first sub-node should have the path path '@return'": function(ast) {
			assert.equal(ast.getRootNode().children[0].getPathPart(), "@return")
		},
		"the second sub-node should have the path path '@get(my.variable)'": function(ast) {
			assert.equal(ast.getRootNode().children[1].getPathPart(), "@get(my.variable)")
		}
	},
	"When I parse a full document": {
		topic: function() {
			var doc = {
				"myProp": {
					"@return": [
						{
							"@set(some.var)": {
								"tags": [
									"simple"
								]
							}
						}
					]
				}
			}
			var ast = new Tree()
			ast.parse(doc)
			return ast
		},
		"the path of the deepest child should be the path plus all the parent path parts without leading or trailing separator":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].getPath(), 
			'{}/myProp/{@}/@return/[]/0/{@}/@set(some.var)/{}/tags/[]/0/"simple"')
		},
		"the path of the root should be the path part of the root node":  function(ast) {
			assert.isNotNull(ast.getRootNode())
			assert.equal(ast.getRootNode().getPath(), 
			'{}')
		},
	}
}).export(module)

vows.describe('AST - Delegate Parsing').addBatch({
  "When I parse a document with a delegate property": {
    topic: function() {
      var doc = {"#json": {"@return": 1}};
      var ast = new Tree();
      ast.parse(doc);
      return ast;
    },
    "the root node of the ast should be of 'composite_hash' type":  function(ast) {
      assert.isNotNull(ast.getRootNode());
      assert.strictEqual(ast.getRootNode().type, AstNodeType.composite_hash);
    },
    "the first node should be of 'delegate' type":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[0].type, AstNodeType.delegate);
    },
    "the value of the first node should be '#json'":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[0].value, "#json");
    },
    "the sub-node of the first node should be of 'block' type":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[0].children[0].type, AstNodeType.block);
    }
  },
  "When I parse a document with a delegate property and a literal property": {
    topic: function() {
      var doc = {"#json": {"@return": 1}, "message": "Super Message"};
      var ast = new Tree();
      ast.parse(doc);
      return ast;
    },
    "the root node of the ast should be of 'composite_hash' type":  function(ast) {
      assert.isNotNull(ast.getRootNode());
      assert.strictEqual(ast.getRootNode().type, AstNodeType.composite_hash);
    },
    "the first node should be of 'delegate' type":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[0].type, AstNodeType.delegate);
    },
    "the value of the first node should be '#json'":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[0].value, "#json");
    },
    "the sub-node of the first node should be of 'block' type":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[0].children[0].type, AstNodeType.block);
    },
    "the second node should be of 'property' type":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[1].type, AstNodeType.property);
    },
    "the value of the second node should be 'message'":  function(ast) {
      assert.strictEqual(ast.getRootNode().children[1].value, "message");
    }
  }

}).export(module)

var vows = require('vows')
var assert = require('assert')
var PathCache = require('../src/Paths').PathCache
var AstEntryType = require('../src/Paths').AstEntryType
var Variable = require('../src/Variable')

vows.describe('priest Paths').addBatch({
	"When I have a brand new cache": {
		topic: function() {
			return new PathCache()
		},
		"and I ask for a non-compiled path status it should return false": function(topic){
			assert.isFalse(topic.isCompiled("var1"))
		}
	}
}).export(module);

vows.describe('priest Paths Valid AST').addBatch({
	"When I have the path 'var1'": {
		topic: function() {
			return new PathCache()
		},
		"the AST should be a single Object variable": function(topic){
			assert.deepEqual(topic.parse("var1"), [
				{
					key:'var1',
					type:AstEntryType.Property
				}
			])
		}
	},
	"When I have the path 'var1.var2'": {
		topic: function() {
			return new PathCache()
		},
		"the AST should be two Object variables": function(topic){
			assert.deepEqual(topic.parse("var1.var2"), [
				{
					key: 'var1',
					type: AstEntryType.Property
				},
				{
					key: 'var2',
					type: AstEntryType.Property
				}
			])
		}
	},
	"When I have the path 'var1[0]'": {
		topic: function() {
			return new PathCache()
		},
		"the AST should be one property and one index": function(topic){
			assert.deepEqual(topic.parse("var1[0]"), [
				{
					key:'var1',
					type: AstEntryType.Property
				},
				{
					key:'0',
					type: AstEntryType.Index
				}
			])
		}
	},
	"When I have the path 'var1[0].var2'": {
		topic: function() {
			return new PathCache()
		},
		"the AST should be one property, index and property entries": function(topic){
			assert.deepEqual(topic.parse("var1[0].var2"), [
				{
					key: 'var1',
					type: AstEntryType.Property
				},
				{
					key: '0',
					type: AstEntryType.Index
				},
				{
					key: 'var2',
					type: AstEntryType.Property
				}
			])
		}
	},
	"When I have the path 'var1[4][5]'": {
		topic: function() {
			return new PathCache()
		},
		"the AST should be property, index and index entries": function(topic){
			assert.deepEqual(topic.parse("var1[4][5]"), [
				{
					key:'var1',
					type: AstEntryType.Property
				},
				{
					key:'4',
					type: AstEntryType.Index
				},
				{
					key:'5',
					type: AstEntryType.Index
				}
			])
		}
	}
}).export(module);

vows.describe('priest Paths Invalid AST').addBatch({
	"When I am checking errors and I have the path 'var1..'": {
		topic: function() {
			return "var1.."
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathCache().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 5: Can not get the property without an object'": function(topic){
			try{
				new PathCache().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Error at char index 5: Can not get the property without an object")
			}
		}
	},"When I am checking errors and I have the path 'var1.'": {
		topic: function() {
			return "var1."
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathCache().parse(topic)
			})
		},
		"I should get an exception message 'Unexpected end path, expecting property name'": function(topic){
			try{
				new PathCache().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Unexpected end path, expecting property name")
			}
		}
	}
	,"When I am checking errors and I have the path 'var1['": {
		topic: function() {
			return "var1["
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathCache().parse(topic)
			})
		},
		"I should get an exception message 'Unexpected end path, expecting index number'": function(topic){
			try{
				new PathCache().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Unexpected end path, expecting index number")
			}
		}
	}
	,"When I am checking errors and I have the path 'var1]'": {
		topic: function() {
			return "var1]"
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathCache().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 4: Unexpected end of index number'": function(topic){
			try{
				new PathCache().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Error at char index 4: Unexpected end of index number")
			}
		}
	}
	,"When I am checking errors and I have the path '[1]'": {
		topic: function() {
			return "[1]"
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathCache().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 0: Can not get the index without an object'": function(topic){
			try{
				new PathCache().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Error at char index 0: Can not get the index without an object")
			}
		}
	},"When I am checking errors and I have the path 'list[a345]'": {
		topic: function() {
			return "list[a345]"
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathCache().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 5: Indexes takes numbers only'": function(topic){
			try{
				new PathCache().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Error at char index 5: Indexes takes numbers only")
			}
		}
	},
}).export(module);

vows.describe('priest Paths Values').addBatch({
	"When I have a path cache": {
		topic: function() {
			return new PathCache()
		},
		"and I run a path": function(topic){
			assert.equal(topic.run({
				"x":new Variable(200)
			},"x"), 200)
		},
		"it should stay compiled to be reused for further executions": function(topic) {
			assert.isTrue(topic.isCompiled("x"))
			assert.equal(topic.run({
				"x":new Variable(200)
			},"x"), 200)
		}
	},
	"When I run the path 'var1' and the variables are properly registered": {
		topic: function() {
			return "var1"
		},
		"I should get the variable value": function(topic){
			assert.deepEqual(new PathCache().run({
				"var1": new Variable('value of variable 1')
			},topic), 'value of variable 1');
		}
	},
	"When I run the path 'point.x' and the variables are properly registered": {
		topic: function() {
			return "point.x"
		},
		"I should get the variable value": function(topic){
			assert.deepEqual(new PathCache().run({
				"point": new Variable({
					"x": 200
				})
			},topic), 200);
		}
	},
	"When I run the path 'point.x.y' and the variables are properly registered": {
		topic: function() {
			return "point.x.y"
		},
		"I should get undefined since x is a number and there is no member y": function(topic){
			assert.isUndefined(new PathCache().run({
				"point": new Variable({
					"x": 200
				})
			},topic));
		}
	}
	,
	"When I run the path 'point[4]' and the variables are properly registered": {
		topic: function() {
			return "point[4]"
		},
		"I should get the fourth item in the point array": function(topic){
			assert.equal(new PathCache().run({
				"point": new Variable([
					"One",
					"Two",
					"Three",
					"Four",
					"Five"
				])
			},topic),"Five");
		}
	},
	"When I run the path 'point[3][1]' and the variables are properly registered": {
		topic: function() {
			return "point[3][1]"
		},
		"I should get the second item at the fourth position of the point array": function(topic){
			assert.equal(new PathCache().run({
				"point": new Variable([
					"One",
					"Two",
					"Three",
					[
						"One",
						"Second at Third Array"
					],
					"Five"
				])
			},topic),"Second at Third Array");
		}
	}
}).export(module);

vows.describe('priest Write Paths').addBatch({
	"When I write a variable using a single part path": {
		topic: function(){
			var pathCache = new PathCache()
			var variables = {};
			pathCache.runWrite(variables, "x" , "Root Val");
			return {
				variables: variables,
				pathCache: pathCache
			}
		},
		"the variables bag should contain the variable assigned": function(res) {
			assert.instanceOf(res.variables.x, Variable)
			assert.equal(res.variables.x.get(), "Root Val")
		},
		"the path should remain compiled": function(res) {
			assert.isTrue(res.pathCache.writeIsCompiled("x"), "writeIsCompiled should return true")
		}
	}, 
	"When I write a variable using a two object parts variable path": {
		topic: function(){
			var pathCache = new PathCache()
			var variables = {};
			pathCache.runWrite(variables, "point.x" , 534);
			return {
				variables: variables,
				pathCache: pathCache
			}
		},
		"the variable should contain the assigned member": function(res) {
			assert.instanceOf(res.variables.point, Variable)
			assert.deepEqual(res.variables.point.get(), {
				x: 534
			})
		}	,
			"then when I assign another variable at the same level": {
				topic: function(res) {
					var pathCache = res.pathCache
					var variables = res.variables
					pathCache.runWrite(variables, "point.y" , 632);
					return {
						variables: variables,
						pathCache: pathCache
					}
				},
				"the first and second assignment should remain in the object": function(res) {
					assert.instanceOf(res.variables.point, Variable)
					assert.deepEqual(res.variables.point.get(), {
							x: 534,
							y: 632
					})
				}
			}
	}, 
	"When I write a variable using a three object parts variable path": {
		topic: function(){
			var pathCache = new PathCache()
			var variables = {};
			pathCache.runWrite(variables, "rect.point1.x" , 534);
			return {
				variables: variables,
				pathCache: pathCache
			}
		},
		"the variable should contain the assigned third part variable": function(res) {
			assert.instanceOf(res.variables.rect, Variable)
			assert.deepEqual(res.variables.rect.get(), {
				point1: {
					x: 534
				}
			})
		},
		"then when I assign another variable at the same level": {
			topic: function(res) {
				var pathCache = res.pathCache
				var variables = res.variables
				pathCache.runWrite(variables, "rect.point1.y" , 632);
				return {
					variables: variables,
					pathCache: pathCache
				}
			},
			"the first and second assignment should remain in the object": function(res) {
				assert.instanceOf(res.variables.rect, Variable)
				assert.deepEqual(res.variables.rect.get(), {
					point1: {
						x: 534,
						y: 632
					}
				})
			}
		}
	},
	"When I write a variable using forceCreate": {
		topic: function(){
			var pathCache = new PathCache()
			var originalVar = new Variable("Original Value")
			var variables = {
				rect: originalVar
			};
			pathCache.runWrite(variables, "rect.point1.x" , 534, 
				true // force create
			);
			return {
				variables: variables,
				pathCache: pathCache,
				originalVar: originalVar
			}
		},
		"the variable should contain the assigned third part variable": function(res) {
			assert.instanceOf(res.variables.rect, Variable)
			assert.deepEqual(res.variables.rect.get(), {
				point1: {
					x: 534
				}
			})
		},
		"the original variable value should not be modified": function(res) {
			assert.instanceOf(res.originalVar, Variable)
			assert.equal(res.originalVar.get(), "Original Value")
		}
	}
}).export(module);

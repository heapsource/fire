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

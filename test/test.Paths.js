var vows = require('vows')
var assert = require('assert')
var PathBuilder = require('../src/Paths').PathBuilder
var AstEntryType = require('../src/Paths').AstEntryType

vows.describe('priest Paths').addBatch({
	"When I have a brand new builder": {
		topic: function() {
			return new PathBuilder()
		},
		"and I ask for a non-compiled path status it should return false": function(topic){
			assert.isFalse(topic.isCompiled("var1"))
		}
	}
}).export(module);

vows.describe('priest Paths Valid AST').addBatch({
	"When I have the path 'var1'": {
		topic: function() {
			return new PathBuilder()
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
			return new PathBuilder()
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
			return new PathBuilder()
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
			return new PathBuilder()
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
			return new PathBuilder()
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

vows.describe('priest Paths Errors').addBatch({
	"When I am checking errors and I have the path 'var1..'": {
		topic: function() {
			return "var1.."
		},
		"I should get an exception": function(topic){
			assert.throws(function() {
				new PathBuilder().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 5: Can not get the property without an object'": function(topic){
			try{
				new PathBuilder().parse(topic)
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
				new PathBuilder().parse(topic)
			})
		},
		"I should get an exception message 'Unexpected end path, expecting property name'": function(topic){
			try{
				new PathBuilder().parse(topic)
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
				new PathBuilder().parse(topic)
			})
		},
		"I should get an exception message 'Unexpected end path, expecting index number'": function(topic){
			try{
				new PathBuilder().parse(topic)
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
				new PathBuilder().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 4: Unexpected end of index number'": function(topic){
			try{
				new PathBuilder().parse(topic)
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
				new PathBuilder().parse(topic)
			})
		},
		"I should get an exception message 'Error at char index 0: Can not get the index without an object'": function(topic){
			try{
				new PathBuilder().parse(topic)
			}catch(msg) {
				assert.equal(msg,"Error at char index 0: Can not get the index without an object")
			}
		}
	},
}).export(module);

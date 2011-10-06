var vows = require('vows')
var assert = require('assert')
var Variable = require('../src/Variable')
var setBlockContextVariable = require('../src/core.js').setBlockContextVariable

vows.describe('priest Variable').addBatch({
	"When I have a variable": {
		topic: function() {
			return new Variable()
		},
		"get should return undefined": function(topic) {
			assert.isUndefined(topic.get())
		},
		"and when I set a value": {
			topic: function(topic) {
				topic.set("something")
				return topic
			}
			,"get should return the given value": function(topic) {
				assert.equal(topic.get(),"something")
			}
		}
	}
}).export(module);

vows.describe('priest setBlockContextVariable').addBatch({
	"When I set a variable in some context object": {
		topic: function() {
			var block = {}
			setBlockContextVariable(block,"name","johan")
			return block
		},
		"the set variable must be a instance of Variable": function(block) {
			assert.instanceOf(block._variables.name, Variable)
		},
		"and get should return the value of the variable": function(block) {
			assert.equal(block._variables.name.get(), "johan")
		},
		"and when I set another variable": {
			topic: function(block) {
				setBlockContextVariable(block,"lastName","hernandez")
				return block
			},
			"the second set variable must be a instance of Variable": function(block){
				assert.instanceOf(block._variables.lastName, Variable)
			},
			"and get should return the value of the variable": function(block) {
				assert.equal(block._variables.lastName.get(), "hernandez")
			},
			"and the two variables should be set": function(block) {
				assert.equal(block._variables.name.get(), "johan")
				assert.equal(block._variables.lastName.get(), "hernandez")
			}
		}
	}
}).export(module);

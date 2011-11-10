var vows = require('vows')
var assert = require('assert')
var Variable = require('../src/Variable')
var setBlockContextVariable = require('../src/core.js').setBlockContextVariable
var Runtime = require('../src/core.js').Runtime

vows.describe('firejs Variable').addBatch({
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

vows.describe('firejs setBlockContextVariable').addBatch({
	"When I set a variable in some context object": {
		topic: function() {
			var runtime = new Runtime()
			var block = {}
			setBlockContextVariable(runtime, block,"name","johan")
			return {
				block: block,
				runtime: runtime
			}
		},
		"the set variable must be a instance of Variable": function(res) {
			assert.instanceOf(res.block._variables.name, Variable)
		},
		"and get should return the value of the variable": function(res) {
			assert.equal(res.block._variables.name.get(), "johan")
		},
		"and when I set another variable": {
			topic: function(res) {
				setBlockContextVariable(res.runtime, res.block,"lastName","hernandez")
				return res
			},
			"the second set variable must be a instance of Variable": function(res){
				assert.instanceOf(res.block._variables.lastName, Variable)
			},
			"and get should return the value of the variable": function(res) {
				assert.equal(res.block._variables.lastName.get(), "hernandez")
			},
			"and the two variables should be set": function(res) {
				assert.equal(res.block._variables.name.get(), "johan")
				assert.equal(res.block._variables.lastName.get(), "hernandez")
			}
		}
	}
}).export(module);

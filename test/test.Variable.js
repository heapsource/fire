var vows = require('vows')
var assert = require('assert')
var Variable = require('../src/Variable')

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
	},
}).export(module);

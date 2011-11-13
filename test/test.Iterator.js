var vows = require('vows')
var assert = require('assert')
var Iterator = require('../src/Iterator')

vows.describe('firejs Iterator').addBatch({
	"When I have an Iterator created with an empty array": {
		topic: function() {
			return new Iterator([])
		},
		"the count should be zero": function(topic) {
			assert.equal(topic.count(), 0)
		},
		"isLast should return true": function(topic) {
			assert.isTrue(topic.isLast())
		}
		,
		"current should return undefined": function(topic) {
			assert.isUndefined(topic.current())
		},
		"the count should be -1": function(topic) {
			assert.equal(topic.index(), -1)
		},
	},
	"When I have an Iterator created with an array of one element": {
		topic: function() {
			return new Iterator(["First"])
		},
		"the count should be 1": function(topic) {
			assert.equal(topic.count(), 1)
		},
		"the index should be -1": function(topic) {
			assert.equal(topic.index(), -1)
		},
		"isLast should return false": function(topic) {
			assert.isFalse(topic.isLast())
		},
		"current should return undefined": function(topic) {
			assert.isUndefined(topic.current())
		},
		"and when I ask for the next item": {
			topic: function(topic) {
				return topic.next()
			},
			"it should return true": function(result) {
				assert.isTrue(result)
			}
		},
		"and when I ask for the next item": {
			topic: function(topic) {
				topic.next()
				return topic
			},
			"the current element should be the first item": function(topic) {
				assert.equal(topic.current(), "First")
			}
		}
	},
	"When I have an Iterator created with an array of two elements": {
		topic: function() {
			console.warn("Creatin Iterator instance with two elemtns")
			return new Iterator(["First","Second"])
		},
		"the count should be 2": function(topic) {
			assert.equal(topic.count(), 2)
		},
		"isLast should return false": function(topic) {
			assert.isFalse(topic.isLast())
		},
		"current should return undefined": function(topic) {
			assert.isUndefined(topic.current())
		},
		"the index should be -1": function(topic) {
			assert.equal(topic.index(), -1)
		}
	}
	,
	"When I have an Iterator created with an array of two elements": {
		topic: function() {
			return new Iterator(["First","Second"])
		},
		"and when I ask for the next item one time": {
			topic: function(topic) {
				assert.isTrue(topic.next())
				return topic
			},
			"the index should be 0": function(topic) {
				assert.equal(topic.index(), 0)
			},
			"the current element should be the first item": function(topic) {
				assert.equal(topic.current(), "First")
			}
		}
	},
	"When I have an Iterator created with an array of two elements": {
		topic: function() {
			return new Iterator(["First","Second"])
		},
		"and when I ask for the next item two times": {
			topic: function(topic) {
				assert.isTrue(topic.next())
				assert.isTrue(topic.next())
				return topic
			},
			"the current element should be the last item": function(topic) {
				assert.equal(topic.current(), "Second")
			}
			,
			"isLast should return true": function(topic) {
				assert.isTrue(topic.isLast())
			}
		}
	}
	,
	"When I create an iterator with something is not an array": {
		 "I should get an error": {
			"with no arguments": function() {
				assert.throws(function() {
					new Iterator()
				})
			},
			"with null": function() {
				assert.throws(function() {
					new Iterator(null)
				})
			},
			"with number": function() {
				assert.throws(function() {
					new Iterator(2)
				})
			},
			"with string": function() {
				assert.throws(function() {
					new Iterator("")
				})
			}
		}
	}	,
		"When I load the firejs.js module the Iterator type must be exported":  function(){
			var fireExports = require('../index')
			assert.isFunction(fireExports.Iterator)
			assert.equal(Iterator, fireExports.Iterator)
		}
	}).export(module);

var vows = require('vows')
var assert = require('assert')
var extractComparableValues = require('../src/Comparable').extractComparableValues

vows.describe('firejs comparable values').addBatch({
	"the comparable values of any array it's the array itself": function() {
		var comparables = extractComparableValues(['1','2'])
		assert.deepEqual(comparables, ['1','2'])
	},
	"the comparables of null is an empty array": function() {
		var comparables = extractComparableValues(null)
		assert.deepEqual(comparables, [])
	}
	,
	"the comparable values of undefined is an empty arrayy": function() {
		var comparables = extractComparableValues()
		assert.deepEqual(comparables, [])
	},
	"the comparable values of an empty object is an empty array": function() {
		var comparables = extractComparableValues({})
		assert.deepEqual(comparables, [])
	},
	"the comparables values of any object are all the values of the first-level keys": function() {
		var comparables = extractComparableValues({x:500,y:700})
		assert.deepEqual(comparables, [500,700])
	},
	"the comparables of a non object value like a boolean is an empty array": function() {
		var comparables = extractComparableValues(true)
		assert.deepEqual(comparables, [])
		
		comparables = extractComparableValues(false)
		assert.deepEqual(comparables, [])
	},
	"the comparables of a String are all the characters of the array": function() {
		var comparables = extractComparableValues("Word")
		assert.deepEqual(comparables, ['W','o','r','d'])
	}
	/*
		NOTE: If you add a new case, make sure you update the fire.js specification, section "Comparable Values"
	*/
}).export(module);
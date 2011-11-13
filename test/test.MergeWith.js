var vows = require('vows')
var assert = require('assert')

var mergeWith = require('../src/mergeWith.js')

vows.describe('firejs mergeWith').addBatch({
	"When I merge an object with properties at first level": {
		"with another object no properties the original object should remain intact": function() {
			var expectedObject = {
				"x": 100,
				"y": 200
			};
			var originalObject = {
				"x": 100,
				"y": 200
			};
			var mergeObject =  {
				
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		}
		,"with another object with one additional properties the merged object should contain the additional property": function() {
			var expectedObject = {
				"x": 100,
				"y": 200,
				"z": 300
			};
			var originalObject = {
				"x": 100,
				"y": 200
			};
			var mergeObject =  {
				"z": 300
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		}
		,"with another object at second level the merged object should contain the new property with the nested object": function() {
			var expectedObject = {
				"x": 100,
				"y": 200,
				"info": {
					"id": "Favorite Point"
				}
			};
			var originalObject = {
				"x": 100,
				"y": 200
			};
			var mergeObject =  {
				"info": {
					"id": "Favorite Point"
				}
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		}
		,"with another object that at second level contains an array, the merged object should contain the array": function() {
			var expectedObject = {
				"x": 100,
				"y": 200,
				"info": {
					"id": "Favorite Point",
					"tags": ["starters", "mids"]
				}
			};
			var originalObject = {
				"x": 100,
				"y": 200
			};
			var mergeObject =  {
				"info": {
					"id": "Favorite Point",
					"tags": ["starters", "mids"]
				}
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		}
	}
	,"When I merge an object with array properties of simple values at first level": {
		"with another object with arrays of simple values for the same properties, the original object should have the merged arrays with no duplicated values": function() {
			var expectedObject = {
				"tags": ["tag1", "tag2", "tag3"]
			};
			var originalObject = {
				"tags": ["tag1"]
			};
			var mergeObject =  {
				"tags": ["tag2", "tag3", "tag1"]
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		},
		"with another object with arrays of complex values for the same properties, the original object should have the merged arrays with simple and complex values with no duplicated values": function() {
			var expectedObject = {
				"tags": ["tag1", 	{
						"name": "tech-news",
						"description": "all about news"
					}]
			};
			var originalObject = {
				"tags": ["tag1"]
			};
			var mergeObject =  {
				"tags": [
				"tag1",
				{
					"name": "tech-news",
					"description": "all about news"
				}]
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		}
	}
	,"When I merge an object with array properties of complex objects and some missing properties at first level": {
		"with another object with arrays of complex objects for the same properties, the original object should have the merged properties and complemented properties": function() {
			var expectedObject = {
				"point1": {
					"x": 20
				},
				"point2": {
					"x": 30,
					"y": 40
				}
			};
			var originalObject = {
				"point1": {
					"x": 20
				},
				"point2": null
			};
			var mergeObject =  {
				"point1": {
					"x": 140
				},
				"point2": {
					"x": 30,
					"y": 40
				}
			};
			mergeWith(originalObject, mergeObject);
			assert.deepEqual(originalObject, expectedObject);
		}
	}
}).export(module);

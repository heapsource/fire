var vows = require('vows')
var assert = require('assert')
var servicesCore = require('../src/services/core.js')
var priest = require('../src/main.js')

var fs = require('fs'),
	path = require('path')

vows.describe('servicesCore').addBatch({
	'When servicesCore is asked to retrieve the list of valid services files': {
		'in a directory with a lot of crappy file extensions and only 2 are valid files': {
            "should return only 2 files": function () {
				var validServiceFiles = servicesCore.getEndpointDefinitonFilesNames("test/universes/test.filteringServicesFilesUniverse/services")
				assert.length(validServiceFiles,2);
				assert.deepEqual(['valid.endpoint.endpoint.json', 'validendpoint2.endpoint.json'], validServiceFiles )
            }
        }
    },
	'When servicesCore wants to work with a .endpoint.json file': {
		'and the file does not have a valid JSON format': {
            "should fail with error PUE10008": function () {
				var test = function() {
					var JSONDefinition = servicesCore.loadDefinitionFile("test/universes/test.invalidServiceJSONFilesUniverse/services/weirdJSON.endpoint.json")
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "PUE10008")
				}
            }
        },
		'and the HTTP method is missing': {
            "should fail with error PSE10002": function () {
				var test = function() {
					var JSONDefinition = servicesCore.loadDefinitionFile("test/universes/test.missingEndpointAttributesUniverse/services/missingMethod.endpoint.json")
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "PSE10002")
				}
            }
        },
		'and the Route is missing': {
            "should fail with error PSE10003": function () {
				var test = function() {
					var JSONDefinition = servicesCore.loadDefinitionFile("test/universes/test.missingEndpointAttributesUniverse/services/missingRoute.endpoint.json")
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "PSE10003")
				}
            }
        },
		'and the Implementation is missing': {
            "should fail with error PSE10004": function () {
				var test = function() {
					var JSONDefinition = servicesCore.loadDefinitionFile("test/universes/test.missingEndpointAttributesUniverse/services/missingImplementation.endpoint.json")
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "PSE10004")
				}
            }
        },
		'and the Implementation is not a Hash': {
            "should fail with error PSE10004": function () {
				var test = function() {
					var JSONDefinition = servicesCore.loadDefinitionFile("test/universes/test.missingEndpointAttributesUniverse/services/wrongImplementation.endpoint.json")
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "PSE10004")
				}
            }
        }
    }
}).export(module); 
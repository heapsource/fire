var vows = require('vows')
var assert = require('assert')
var PathCache = require('../src/Paths').PathCache
var AstEntryType = require('../src/Paths').AstEntryType
var Variable = require('../src/Variable')
var exec  = require('child_process').exec

vows.describe('priest command line utility').addBatch({
	"When I run the command line with no args": {
		topic: function() {
			var self = this
			exec('bin/./priest', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the copyright and version": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "Firebase")
			assert.include(output.stdout, "version")
		}
	},
	"When I run the command line in a directory with a single folder and single JSON file": {
		topic: function() {
			var self = this
			exec(' (cd test/commandLineDirs/simple && ../../../bin/./priest mySimpleMain.json)', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the output of the priest expression": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "Hello World from the Simplest JSON Expression")
		}
	},
	"When I run the command line in a directory with a single folder with a JSON file and a Manifest and the module returns a value from the configuration section": {
		topic: function() {
			var self = this
			//exec('cd test/commandLineDirs/withManifest2 && ../../../bin/./priest myMain.json', function (error, stdout, stderr) {
			exec('bin/./priest test/commandLineDirs/withManifest2/myMain.json', function (error, stdout, stderr) {
				self.callback(error, {
					error: error, 
					stdout: stdout, 
					stderr: stderr
				})
			});
		},
		"I should see the configuration value in the console": function(output){
			assert.equal(output.stderr,'')
			assert.isNotNull(output.stdout)
			assert.include(output.stdout, "The Chuck Norris Four")
		}
	}
}).export(module);
var vows = require('vows')
var assert = require('assert')
var priest = require('../src/main.js')


vows.describe('Universe').addBatch({
	'When loading a Universe without options': {
		'is loaded': {
            "should fail with code PUE10001": function () {
				try {
					var universe = new priest.Universe();
				}catch(ex) {
					assert.instanceOf(ex, priest.PriestError)
					assert.equal(ex.code, "PUE10001")
				}
            }
        }
    },
	'When loading a Universe without valid name': {
		'is loaded': {
            "should fail with code PUE10002": function () {
					var test = null;
					test = function() {
						new priest.Universe({});
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10002")
					}
					
					test = function() {
						new priest.Universe({ name: null })
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10002")
					}
					
					test = function() {
						new priest.Universe({name: "" });
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10002")
					}
            }
        }
    },
	'When loading a Universe without valid expressApp app': {
		'is loaded': {
            "should fail with code PUE10003": function () {
					var test = null;
					test = function() {
						new priest.Universe( {
						name: "test.universe"
					});
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10003")
					}
					
					var test = null;
					test = function() {
						new priest.Universe( {
						name: "test.universe",
						expressApp: null,
					});
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10003")
					}
					
            }
        }
    },
	'When loading a Universe with missing baseDir option': {
		'is loaded': {
            "should fail with code PUE10004": function () {
	
					var test = null;
					test = function() {
						new priest.Universe( {
						name: "test.universe",
						expressApp: 1
					});
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10004")
					}
					
					var test = null;
					test = function() {
						new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: null
					});
					};
					assert.throws(function() {
						test()
					}, priest.PriestError)
					try {
						test();
					}catch(ex) {
						assert.equal(ex.code, "PUE10004")
					}
            }
        }
    },
	'When a Universe with illegal baseDir': {
		'is loaded and the path does not exists': {
            "should fail with code PUE10005": function () {
				var test = function() {
					var universe = new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: "universesXXX"
					});
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					assert.equal(ex.code, "PUE10005")
				}
            }
        },
		'is loaded and the path is not a directory': {
            "should fail with code PUE10006": function () {
				var test = function() {
					var universe = new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: "test/universes/test.UniverseFile.txt"
					});
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					assert.equal(ex.code, "PUE10006")
				}
            }
        }
    },
	'When a Universe without the proper directory structure': {
		'is loaded with missing services directory': {
            "should fail with code PUE10007": function () {
				var test = function() {
					var universe = new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: "test/universes/test.missingServicesDirUniverse"
					});
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					//console.log(ex)
					assert.equal(ex.code, "PUE10007")
				}
            }
        },
		'is loaded with invalid services directory': {
            "should fail with code PUE10007": function () {
				var test = function() {
					var universe = new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: "test/universes/test.invalidServicesDirUniverse"
					});
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					assert.equal(ex.code, "PUE10007")
				}
            }
        },
		'is loaded with invalid collections directory': {
            "should fail with code PUE10007": function () {
				var test = function() {
					var universe = new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: "test/universes/test.missingCollectionsDirUniverse"
					});
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					assert.equal(ex.code, "PUE10007")
				}
            }
        },
		'is loaded with invalid messages directory': {
            "should fail with code PUE10007": function () {
				var test = function() {
					var universe = new priest.Universe( {
						name: "test.universe",
						expressApp: 1,
						baseDir: "test/universes/test.missingMessagesDirUniverse"
					});
				}
				assert.throws(function() {
					test();
				}, priest.PriestError)
                try {
					test();
				}catch(ex) {
					assert.equal(ex.code, "PUE10007")
				}
            }
        }
    },
}).export(module); 

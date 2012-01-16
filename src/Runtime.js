// Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var RuntimeDictionary = require('./RuntimeDictionary.js')
var SynTable = require('./SynTable')
var path = require('path')
var PathCache = require('./Paths').PathCache
var constants = require('./constants.js')
var EventEmitter = require('events').EventEmitter
var Utils  = require('./Utils')
var Iterator = require('./Iterator')
var fs = require('fs')
var Compiler = require('./Compiler.js')
var url = require('url')
var mergeWith = require('./mergeWith.js')
var InitializerError = require('./InitializerError.js')
var ModuleInitializerError = require('./ModuleInitializerError.js')

function Runtime() {
	this.loadedExpressions = {}; // Contains a member per expression implementation <Function>
	this.loadedExpressionsSyn = {}; // Contains a synonymous member per expression implementation <Function>
	this.loadedExpressionsMeta = new RuntimeDictionary(); // Contains a member per full definition of the expression, like {name:<String>, implementation:<Function>}
	this.loadedModules = []
	this.expSynTable = new SynTable()
	this.expSynTable.prefix = "E"
	
	var dirName = path.join(__dirname, "built-in")
	this.registerWellKnownExpressionDir(dirName)
	this._paths = new PathCache()
	this.environmentName = process.env.NODE_ENV === undefined ? constants.DEFAULT_ENVIRONMENT : process.env.NODE_ENV 
	this.scriptDirectories = []
	this.moduleRequire = function(moduleName) {
		return require(moduleName)
	}
	this.events = new EventEmitter()
	
	
	this.mergedManifest = {
		modules: []
	}
	this.baseDir = path.resolve('.')
	this.JSONDefinitions = new RuntimeDictionary()
	this.applicationName = ''
  this.configurations = {};
}


Runtime.prototype.getExpressionDefinition = function(name) {
	var res = this.loadedExpressionsMeta[name] || (this.JSONDefinitions[name] || null)
	return res
}

/*
 * Returns the expression definitions objects for all expressions registered and loaded.
 */
Runtime.prototype.getWellKnownExpressions = function() {
	return this.loadedExpressionsMeta;
}

/*
 * Returns all the fire.js modules loaded on the runtime.
 */
Runtime.prototype.getModules = function() {
	return this.loadedModules;
}

Runtime.prototype.getPaths = function() {
	return this._paths
}


/*
 * Load .fjson and .fjs files from a directory.
 */
Runtime.prototype.scanScriptsDir = function(dirInfo) {
	var absoluteDirPath = dirInfo.path
	var fileNames = Utils.getFilesWithExtension(absoluteDirPath, constants.DEFAULT_SCRIPT_EXTENSION)
	fileNames.forEach(function(file) {
		var absoluteFileName = path.join(absoluteDirPath, file)
		this.registerWellKnownJSONExpressionFile(absoluteFileName, dirInfo.attributes)
	}, this)
	
	fileNames = Utils.getFilesWithExtension(absoluteDirPath, constants.DEFAULT_CUSTOM_SCRIPT_EXTENSION)
	fileNames.forEach(function(file) {
		var absoluteFileName = path.join(absoluteDirPath, file)
		this.registerWellKnownExpressionFile(absoluteFileName, dirInfo.attributes)
	}, this)
}

Runtime.prototype.scanScriptsDirs = function() {
	var self = this
	this.scriptDirectories.forEach(function(scriptDirInfo) {
		self.scanScriptsDir(scriptDirInfo)
	})
}

/*
 * Load directores for the current environment. The path must be absolute. If the path does not exists it will do nothing
 */
Runtime.prototype.registerInitializersDir = function(initializersDirPath) {
	if(path.existsSync(initializersDirPath)) {
		var envInitPath = path.join(initializersDirPath, this.environmentName);
		
		if(path.existsSync(envInitPath)) {
			this.scriptDirectories.push({
				path: envInitPath,
				attributes: {
					initialize: [this.environmentName]
				}
			})
		}
	}
}

/*
 * Load .js files from a directory using require. Used by built-in functions. Can be used to load absolute-path .js files.
 */
Runtime.prototype.registerWellKnownExpressionDir = function(absoluteDirPath) {
	var fileNames = fs.readdirSync(absoluteDirPath)
	fileNames.forEach(function(file) {
		var absoluteFileName = path.join(absoluteDirPath, file)
		this.registerWellKnownExpressionFile(absoluteFileName)
	}, this)
}
Runtime.prototype.loaded = false
/*
Prepares the Runtime to Run. Since the introduction of initializer expressions, you can provide a callback to know when the initialization finishes. If no callback is provided no initialization will be executed.
*/
Runtime.prototype.load = function(initializationCallback) {
	if(this.loaded) {
		throw "Runtime already initialized"
	}
	this.loaded = true
	if(!this.applicationName) {
		this.applicationName = process.pid.toString()
	}
	this.scriptDirectories.push({
		path: this.pathFromBaseDir('.')
	})
	this.registerInitializersDir(this.pathFromBaseDir(constants.INITIALIZERS_DIR_NAME))
	var self = this
	this.loadManifestModules()
	
	
	// STEP 4. Load scripts. This must be after the Modules so the modules have a change to specify additional directories.
	this.scanScriptsDirs()
	this._compile(function(compilationError) {
		if(compilationError) {
			initializationCallback(compilationError)
		} else {
			// STEP 1. Load Configurations from Manifest
			// (Configurations must be loaded first so the ignition.init callback of all modules can work properly)
			var mergedEnvironments = this.mergedManifest.environments || {};
      if(mergedEnvironments['all']) {
        // Merge configurations targeted for all environments.
        mergeWith(this.configurations, mergedEnvironments['all']);
      }
      var currentEnvConfig = mergedEnvironments[self.environmentName] || {};
      if(currentEnvConfig) {
        // Merged configurations targeted for the current environment.
        mergeWith(this.configurations, currentEnvConfig);
      }
			this._replaceTokensInManifest()
			this.events.emit('load', this)
			this.events.removeAllListeners('load')
			
			var runInitExpressions = function() {
				var initializeExpressions = []
				self.loadedExpressionsMeta.names().forEach(function(expName) {
					var expDef = this.loadedExpressionsMeta[expName]
					if(expDef.initialize && expDef.initialize.indexOf(self.environmentName) != -1) {
						// it's a initializer for the current environment
						initializeExpressions.push(expDef)
					}
				}, self)
				if(initializationCallback) {
					if(initializeExpressions.length > 0) {
						var initIterator = new Iterator(initializeExpressions)
						self._runNextInitializer(initIterator, initializationCallback)
					} else {
						initializationCallback(null)
					}
				}
			}
			
			var initializableModules = []
			this.loadedModules.forEach(function(fireModule) {
				if(fireModule.ignition && fireModule.ignition.init) {
					initializableModules.push(fireModule)
				}
			}, this)
			
			// Initialize all the Modules
			if(initializationCallback) {
				if(initializableModules.length > 0) {
					var initIterator = new Iterator(initializableModules)
					this._runNextModuleInitializer(initIterator, function(err) {
						if(err) {
							initializationCallback(err)
						} else {
							runInitExpressions()
						}
					})
				} else {
					runInitExpressions()
				}
			}
		}
	})
}

Runtime.prototype._runNextModuleInitializer = function(iterator, finishCallback) {
	var self = this
	if(!iterator.next()) {
		finishCallback()
		return
	}
	var fireModule = iterator.current()
	fireModule.ignition.init(this, function(err) {
		if(err) {
			finishCallback(new ModuleInitializerError(fireModule, err))
		} else {
			self._runNextModuleInitializer(iterator, finishCallback)
		}
	})
}

Runtime.prototype._runNextInitializer = function(iterator, finishCallback) {
	var self = this
	if(!iterator.next()) {
		finishCallback(null)
		return
	}
	var expDef = iterator.current()
	var exp = new(expDef.implementation)
	exp.runtime = this
	exp.resultCallback = function() {
		self._runNextInitializer(iterator, finishCallback)
	}
	exp.errorCallback = function(err) {
		finishCallback(new InitializerError(expDef, err))
	}
	exp.run()
}

Runtime.prototype.registerWellKnownExpressionFile = function(absoluteFilePath, attributes) {
	var definition = require(absoluteFilePath)
	if(attributes) {
		mergeWith(definition, attributes)
	}
	if(!definition.sourceUri) {
		definition.sourceUri = url.format({protocol: constants.FILE_EXPRESSION_URI_PROTOCOL, pathname: ("/" + absoluteFilePath)})
	}
	this.registerWellKnownExpressionDefinition(definition)
	return definition
}

/*
 * Load .fjson file, attributes can be specified.
 */
Runtime.prototype.registerWellKnownJSONExpressionFile = function(absoluteFilePath, attributes) {
	var jsonSourceCode = fs.readFileSync(absoluteFilePath, 'utf8')
	var definition = JSON.parse(jsonSourceCode)
	if(attributes) {
		mergeWith(definition, attributes)
	}
	if(!definition.sourceUri) {
		definition.sourceUri = url.format({protocol: constants.FILE_EXPRESSION_URI_PROTOCOL, pathname: ("/" + absoluteFilePath)})
	}
	this.registerWellKnownExpressionDefinition(definition)
	return definition
}
function validateDefinitionHeader(expressionDefinition) {
	if(!expressionDefinition) {
		throw "expressionDefinition argument is required"
	}
	if(!expressionDefinition.name) {
		throw "name is a required attribute of the expression definition"
	}
}
Runtime.prototype.registerWellKnownExpressionDefinition = function(expressionDefinition) {
	validateDefinitionHeader(expressionDefinition)
	var name = expressionDefinition.name
	var implementation = expressionDefinition.implementation
	if(!implementation) {
		this.JSONDefinitions[name] = expressionDefinition

		if(!expressionDefinition.sourceUri) {
			expressionDefinition.sourceUri = url.format({protocol: constants.VIRTUAL_EXPRESSION_URI_PROTOCOL, pathname: ("/" + expressionDefinition.name + constants.DEFAULT_SCRIPT_EXTENSION)})
		}
	} else {
		expressionDefinition.implementation = implementation
		expressionDefinition.implementation.prototype.expressionName = expressionDefinition.name
		
		if(!expressionDefinition.sourceUri) {
			expressionDefinition.sourceUri = url.format({protocol: constants.VIRTUAL_EXPRESSION_URI_PROTOCOL, pathname: ("/" + expressionDefinition.name + constants.DEFAULT_CUSTOM_SCRIPT_EXTENSION)})
		}
		
		this.loadedExpressions[name] = implementation
		this.loadedExpressionsSyn[this.expSynTable.syn(name)] = implementation
		this.loadedExpressionsMeta[name] = expressionDefinition
	}
}

Runtime.prototype.isExpressionLoaded = function(name) {
	return this.loadedExpressionsMeta[name] !== undefined
}

Runtime.prototype.getModuleConfiguration = function(moduleName) {
	if(!this.configurations) return null;
	return this.configurations[moduleName]
}

Runtime.prototype.setModuleConfiguration = function(moduleName, value) {
	this.configurations[moduleName] = value
}

Runtime.prototype.loadModuleInstance = function(fireModule, fictionalName) {
	if(!fictionalName) throw "loadModuleInstance requires a fictionalName"
	if(this.loadedModules.indexOf(fireModule) != -1) return false
	var fireExports = fireModule.ignition
	var fireExpressions = fireExports ? fireExports.expressions :  undefined
	if(!fireExpressions) {
		throw "Module '" + fictionalName + "' is not a fire.js module"
	}
	if(fireModule.ignition) {
		if(fireModule.ignition.manifestFile) {
			this._mergeWithManifestFile(fireModule.ignition.manifestFile, fireModule.ignition.moduleRequire)
		}
		if(fireModule.ignition.initializersDir) {
			this.registerInitializersDir(fireModule.ignition.initializersDir)
		}
		if(fireModule.ignition.scriptDirs) {
			this.scriptDirectories = this.scriptDirectories.concat(fireModule.ignition.scriptDirs)
		}
	}
	fireExpressions.forEach(function(expressionDefintion) {
		this.registerWellKnownExpressionDefinition(expressionDefintion)
		}, this)
	this.loadedModules.push(fireModule)
	return true
}

Runtime.prototype.loadNamedModule = function(moduleName, moduleRequire) {
	var fireModule = moduleRequire ? moduleRequire(moduleName) : this.moduleRequire(moduleName)
	this.loadModuleInstance(fireModule, moduleName)
}
Runtime.prototype._replaceTokensInManifest = function() {
	var replaceInObject = null
	var SpecialEnv = {
		FIRE_APP_NAME: this.applicationName,
		FIRE_ENV_NAME: this.environmentName,
		FIRE_APP_PID: process.pid,
    FIRE_BASE: this.baseDir
	}
	replaceInObject = function(val) {
		/*
		 * Thanks to Kingpin13, courpse and rewt from #regex at Freenode for helping out with these Regular Expressions
		 */
		if(typeof(val) === 'string') {
			var tokenReplacements = val.match(/\{\{(.*?)\}\}/g)
			if(tokenReplacements) {
				for(var i = 0;i < tokenReplacements.length;i++) {
					var token = tokenReplacements[i]
					var tokenMatch = (/\{\{([^|]+)(?:\|(.*?))?\}\}/ig).exec(token)
					var envKey = tokenMatch[1]
					var defaultValue = tokenMatch[2] || ''
					var envVal = SpecialEnv[envKey] || process.env[envKey] || defaultValue
					while(val.indexOf(token) != -1){
						val = val.replace(token, envVal)
					}
				}
			}
		}else if(typeof(val) == 'object' && val != null) {
			if(val instanceof Array) {
				for(var i = 0;i < val.length;i++) {
					val[i] = replaceInObject(val[i])
				}
			} else {
				var keys = Object.keys(val)
				for(var i = 0;i < keys.length;i++) {
					var key = keys[i]
					val[key] = replaceInObject(val[key])
				}
			}
		}
		return val
	}
	replaceInObject(this.mergedManifest)
}
Runtime.prototype._mergeWithManifestFile = function(manifestFile, moduleRequire) {
	
	var manifestDirName = path.resolve(path.dirname(manifestFile))
	var self = this
	var jsonStr = fs.readFileSync(manifestFile, 'utf8')
	var manifest = JSON.parse(jsonStr)
	if(manifest) {
		if(moduleRequire) {
			if(manifest.modules && (manifest.modules instanceof Array)) {
				for(var i = 0; i < manifest.modules.length; i++) {
					var moduleName = manifest.modules[i]
					manifest.modules[i] = {
						name: moduleName,
						require: moduleRequire
					}
				}
			} 
		}
		mergeWith(self.mergedManifest, manifest)
		// STEP 2. Extract additional script directories and append them to the main array.
		if(manifest && manifest.scriptDirectories) {
			manifest.scriptDirectories.forEach(function(dirName) {
				self.scriptDirectories.push({
					path: path.join(manifestDirName,dirName)
				})
			})
		}
	}
}

Runtime.prototype.setBaseDir = function(dir) {
	this.baseDir = dir
}

Runtime.prototype.pathFromBaseDir = function(dir) {
	return path.join(this.baseDir, dir)
}

Runtime.prototype.loadFromManifestFile = function(manifestFile, initializationCallback) {
	this.setBaseDir(path.dirname(manifestFile))
	this._mergeWithManifestFile(manifestFile)
	this.load(initializationCallback)
	return true
}

Runtime.prototype._loadModules = function(modulesList) {
	for(var i = 0;i < modulesList.length;i++) {
		var currentModuleCount = modulesList.length
		var moduleInfo = modulesList[i]
		if(typeof(moduleInfo) === 'string') {
			this.loadNamedModule(moduleInfo)
		}
		else {
			this.loadNamedModule(moduleInfo.name, moduleInfo.require)
		}
		// Check if new modules has been added to the list
		if(currentModuleCount != modulesList.length) {
			i = 0
		}
	}
}
Runtime.prototype.loadManifestModules = function() {
	this._loadModules(this.mergedManifest.modules)
}

Runtime.prototype._compile = function(finished) {
	var self = this
	var compiler = new Compiler(this);
	compiler.expSynTable = this.expSynTable
	var toCompile = []
	var expressions = this.JSONDefinitions.toArray()
	for(var i = 0; i < expressions.length; i++) {
		var exp = expressions[i]
		toCompile.push(exp)
	}
	
	compiler.compile(toCompile, function(compilationError) {
		finished.call(self, compilationError)
	})
}

module.exports = Runtime

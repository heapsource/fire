var path = require('path')
var constants = require('./constants.js')
function ModuleInitializer(thirdPartyModule, moduleRequire) {
	this.thirdPartyModule = thirdPartyModule
	this.thirdPartyModule.exports.ignition = thirdPartyModule.exports.ignition || {}
	this.thirdPartyModule.exports.ignition.expressions = thirdPartyModule.exports.ignition.expressions || []
	//this.thirdPartyModule.exports.ignition.init = moduleInit
	this.thirdPartyModule.exports.ignition.moduleRequire = moduleRequire
	this.thirdPartyModule.exports.ignition.path = thirdPartyModule.filename
	
	var moduleDirName = this.moduleDirName = path.dirname(thirdPartyModule.filename)
	var moduleManifestFile = path.join(moduleDirName, constants.DEFAULT_MANIFEST_FILE_NAME)
	if(path.existsSync(moduleManifestFile)) {
		thirdPartyModule.exports.ignition.manifestFile = moduleManifestFile
	}
	var initializersDir = path.join(moduleDirName, constants.INITIALIZERS_DIR_NAME)
	if(path.existsSync(initializersDir)) {
		thirdPartyModule.exports.ignition.initializersDir = initializersDir
	}
	this.thirdPartyModule.exports.ignition.scriptDirs = []
	
	// automatically add the root of the module as a scripts directory.
	this.exportScriptsDir('.')
	Object.defineProperty(this, "initializer", {
		get: function() {
			return this.thirdPartyModule.exports.ignition.init
		},
		set: function(value) {
			this.thirdPartyModule.exports.ignition.init = value
		}
	})
}

ModuleInitializer.prototype.exportExpressions = function(expDefArray) {
	var self = this
	if(!(expDefArray instanceof Array)) {
		throw "exportExpressions requires an Array with all the expression defintions"
	}
	expDefArray.forEach(function(expDef) {
		self.thirdPartyModule.exports.ignition.expressions.push(expDef)
	})
}

ModuleInitializer.prototype.exportScriptsDir = function(dir, attributes) {
	var dirFullPath = path.join(this.moduleDirName, dir)
	if(!path.existsSync(dirFullPath)) {
		throw "ModuleInitializer could't find the scripts directory '" + dirFullPath + "'. Make sure the directory exists before using exportScriptsDir." 
	}
	this.thirdPartyModule.exports.ignition.scriptDirs.push({
		path: dirFullPath,
		attributes: attributes
	})
}

ModuleInitializer.prototype.exportExpression = function(expDef) {
	this.thirdPartyModule.exports.ignition.expressions.push(expDef)
}
module.exports = ModuleInitializer
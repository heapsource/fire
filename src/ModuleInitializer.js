var path = require('path')
var constants = require('./constants.js')
function ModuleInitializer(thirdPartyModule, moduleInit) {
	if(moduleInit && typeof(moduleInit) != 'function') {
		throw new "moduleInit must be a function"
	}
	this.thirdPartyModule = thirdPartyModule
	this.thirdPartyModule.exports.priest = thirdPartyModule.exports.priest || {}
	this.thirdPartyModule.exports.priest.expressions = thirdPartyModule.exports.priest.expressions || []
	this.thirdPartyModule.exports.priest.init = moduleInit
	
	var moduleDirName = this.moduleDirName = path.dirname(thirdPartyModule.filename)
	var moduleManifestFile = path.join(moduleDirName, constants.DEFAULT_MANIFEST_FILE_NAME)
	if(path.existsSync(moduleManifestFile)) {
		thirdPartyModule.exports.priest.manifestFile = moduleManifestFile
	}
	var initializersDir = path.join(moduleDirName, constants.INITIALIZERS_DIR_NAME)
	if(path.existsSync(initializersDir)) {
		thirdPartyModule.exports.priest.initializersDir = initializersDir
	}
	this.thirdPartyModule.exports.priest.scriptDirs = []
	
	// automatically add the root of the module as a scripts directory.
	this.exportScriptsDir('.')
}

ModuleInitializer.prototype.exportExpressions = function(expDefArray) {
	var self = this
	if(!(expDefArray instanceof Array)) {
		throw "exportExpressions requires an Array with all the expression defintions"
	}
	expDefArray.forEach(function(expDef) {
		self.thirdPartyModule.exports.priest.expressions.push(expDef)
	})
}

ModuleInitializer.prototype.exportScriptsDir = function(dir, attributes) {
	var dirFullPath = path.join(this.moduleDirName, dir)
	if(!path.existsSync(dirFullPath)) {
		throw "ModuleInitializer could't find the scripts directory '" + dirFullPath + "'. Make sure the directory exists before using exportScriptsDir." 
	}
	this.thirdPartyModule.exports.priest.scriptDirs.push({
		path: dirFullPath,
		attributes: attributes
	})
}

ModuleInitializer.prototype.exportExpression = function(expDef) {
	this.thirdPartyModule.exports.priest.expressions.push(expDef)
}
module.exports = ModuleInitializer
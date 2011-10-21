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
	
	var moduleDirName = path.dirname(thirdPartyModule.filename)
	var moduleManifestFile = path.join(moduleDirName, constants.DEFAULT_MANIFEST_FILE_NAME)
	if(path.existsSync(moduleManifestFile)) {
		thirdPartyModule.exports.priest.manifestFile = moduleManifestFile
	}
	var initializersDir = path.join(moduleDirName, constants.INITIALIZERS_DIR_NAME)
	if(path.existsSync(initializersDir)) {
		thirdPartyModule.exports.priest.initializersDir = initializersDir
	}
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

ModuleInitializer.prototype.exportExpression = function(expDef) {
	this.thirdPartyModule.exports.priest.expressions.push(expDef)
}
module.exports = ModuleInitializer
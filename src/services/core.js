var Utils = require('../Utils')
var PriestError = require('../PriestError.js')
var fs = require('fs')
var FILE_EXTENSION = ".endpoint.json"
var SPECIAL_DIR_NAME = "services"

module.exports.getEndpointDefinitonFilesNames = function(absoluteBaseDir) {
	return Utils.getFilesWithExtension(absoluteBaseDir, FILE_EXTENSION)
}

module.exports.SPECIAL_DIR_NAME = SPECIAL_DIR_NAME
module.exports.FILE_EXTENSION = FILE_EXTENSION

module.exports.loadDefinitionFile = function(fileUnderServicesDir) {
	var definition = Utils.loadJSONFile(fileUnderServicesDir);
	if(Utils.isNullOrEmpty(definition.method)) {
		throw new PriestError("PSE10002", "Endpoint in source " +  fileUnderServicesDir + " defines an endpoint with no HTTP method");
	}
	if(Utils.isNullOrEmpty(definition.route)) {
		throw new PriestError("PSE10003", "Endpoint in source" +  fileUnderServicesDir + " defines an endpoint with no route");
	}
	if(Utils.isNullOrEmpty(definition.as)) {
		throw new PriestError("PSE10004", "Endpoint in source" +  fileUnderServicesDir + "  has an implementation issue, the implementation is missing");
	}
	if(definition.as.length === 0) {
		throw new PriestError("PSE10004", "Endpoint in source" +  fileUnderServicesDir + "  has an implementation issue, the implementation is empty");
	}
	
	return definition;
}

module.exports.loadJSONDefinitionFiles = function(filesNames) {
	
}
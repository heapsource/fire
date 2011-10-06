var path = require('path')
var fs = require('fs')
var assert = require('assert')
//var PriestError = require('./Error.js')


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
module.exports.endsWith = endsWith


/*
	Returns the files with a specific extension. Return the file name and not the path.
*/
module.exports.getFilesWithExtension = function(absoluteDirPath, extension) {
	var fileNames = fs.readdirSync(absoluteDirPath)
	var list = []
	fileNames.forEach(function(fileName) {
		if(endsWith(fileName,extension))
		{
			list.push(fileName)
		}
	})
	return list
}

/*
module.exports.loadJSONFile = function(fileUnderServicesDir) {
	var jsonDefinition = null;
	try {
		jsonDefinition = JSON.parse(fs.readFileSync(fileUnderServicesDir, 'utf8'));
	}catch(ex) {
		throw new PriestError("PUE10008", "Source " +  fileUnderServicesDir + " content is not valid as a JSON structure. The error was " + ex.message);
	}
	return jsonDefinition;
}

function isNullOrEmpty(value) {
	return value === undefined || value == null || value === ""
}

module.exports.isNullOrEmpty = isNullOrEmpty
*/

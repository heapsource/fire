var path = require('path')
var fs = require('fs')
var assert = require('assert')


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
module.exports.endsWith = endsWith


/*
	Returns the files with a specific extension. Returns the file name and not the path.
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
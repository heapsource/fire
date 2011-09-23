var servicesCore = require('./services/core.js')
var dataCore = require('./data/core.js')
var messagingCore = require('./messaging/core.js')

var PriestError = require("./PriestError")
var path = require('path')
var fs = require('fs')
var assert = require('assert')

function prepareSpecialDirectory(absoluteBaseDir, specialDirName) {
	var specialDirPath = path.join(absoluteBaseDir, specialDirName)
	var specialDirStat = null;
	try {
		specialDirStat = fs.statSync(specialDirPath)
	}catch(ex) {
		throw new PriestError("PUE10007", "Universe is missing the special directory " + specialDirName + ", The error was " + ex.message)
	}
	if(!specialDirStat.isDirectory()) {
		throw new PriestError("PUE10007", "Universe is missing the special directory " + specialDirName + ", The error was " + specialDirPath +  " is not a directory")
	}
	return specialDirPath
}

var Universe = function(options) {
	if(options == undefined || options == null) {
		throw new PriestError("PUE10001", 'Universe options are missing')
	}
	if(options.name == undefined || options.name == null || options.name === "") {
		throw new PriestError("PUE10002", 'Universe name option is missing or is invalid')
	}
	if(options.expressApp == undefined || options.expressApp == null) {
		throw new PriestError("PUE10003", 'Universe expressApp option is missing')
	}
	if(options.baseDir == undefined || options.baseDir == null) {
		throw new PriestError("PUE10004", 'Universe baseDir option is missing')
	}
	var absoluteBaseDir = path.resolve(options.baseDir)
	var absoluteBaseDirStat = null
	try {
		absoluteBaseDirStat = fs.statSync(absoluteBaseDir)
	}catch(ex) {
		throw new PriestError("PUE10005", "Universe baseDir does not exists or can not be accessed. The error was '" + ex.message + "'")
	}
	if(!absoluteBaseDirStat.isDirectory()) {
		throw new PriestError("PUE10006", "Universe baseDir with path " + absoluteBaseDir + " is not a directory")
	}
	
	// Check Special Directories
	// Checking for services...
	this.servicesDir = prepareSpecialDirectory(absoluteBaseDir, servicesCore.SPECIAL_DIR_NAME)
	
	// Checking for data directory...
	this.messagingDir = prepareSpecialDirectory(absoluteBaseDir, messagingCore.SPECIAL_DIR_NAME)
	
	// Checking for messages...
	this.dataDir = prepareSpecialDirectory(absoluteBaseDir, dataCore.SPECIAL_DIR_NAME)
	
	this.options = options
	this.absoluteBaseDir = absoluteBaseDir
};

Universe.prototype = {
	bigBang: function() {
		
	}
}

module.exports = Universe;
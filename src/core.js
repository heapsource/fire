var vm = require('vm')
var util = require('util')
var StringBuffer = require('./StringBuffer')
var NameGenerator = require('./NameGenerator')
var Error = require('./Error')
var fs = require('fs')
var path = require('path')
var RuntimeError = require('./RuntimeError')
var Iterator = require('./Iterator')
var Variable = require('./Variable')
var Expression = require('./Expressions').Expression
var setVarCore = require('./Expressions').setVarCore
var TEST_PRINT_TRACE_ON_INTERNAL_ERROR = require('./Expressions').TEST_PRINT_TRACE_ON_INTERNAL_ERROR
var throwInternalError = require('./Expressions').throwInternalError
var EventEmitter = require('events').EventEmitter
var InitializerError = require('./InitializerError.js')
var PathCache = require('./Paths').PathCache
var Iterator = require('./Iterator')
var mergeWith = require('./mergeWith.js')
var ModuleInitializer = require('./ModuleInitializer.js')
module.exports.Error = Error
module.exports.Expression = Expression
module.exports.Iterator = Iterator

var constants = require('./constants.js')


var DEFAULT_ENVIRONMENT = constants.DEFAULT_ENVIRONMENT
var DEFAULT_MANIFEST_FILE_NAME = constants.DEFAULT_MANIFEST_FILE_NAME
var DEFAULT_SCRIPT_EXTENSION = constants.DEFAULT_SCRIPT_EXTENSION

mergeWith(module.exports, constants)


var SPECIAL_KEY_SYMBOL = "@"
var HINT_START_SYMBOL = "("
var HINT_END_SYMBOL = ")"

function trimString(str) {
	if(str == null || str == undefined) return str
	
	return str.replace(/^\s\s*/,'').replace(/\s\s*$/,'')
}
//Untested
function isSpecialKey(propName) {
	//	console.warn(propName)
	var n = trimString(propName)
	return n.indexOf(SPECIAL_KEY_SYMBOL) == 0
}

function keyHasHint(propName) {
	return propName.indexOf(HINT_START_SYMBOL) > -1
}

function getHint(propName) {
	if(!keyHasHint(propName)) return undefined;
	var hintEndIndex = propName.indexOf(HINT_END_SYMBOL)
	if(hintEndIndex > 1) {
		return propName.substring(propName.indexOf(HINT_START_SYMBOL) + 1,hintEndIndex)
	}
	return propName.substring(propName.indexOf(HINT_START_SYMBOL) + 1,propName.length)
}

function getHint4Js(hint) {
	return JSON.stringify(hint)
}

function getHint4JsFromPropName(propName) {
	var hint = getHint(propName)
	return getHint4Js(hint)
}

function getExpressionNameFromSpecialKey(propName) {
	if(!isSpecialKey(propName)){
		throwInternalError("Asked to extract special from a key that is not a special key, the key was '" + propName + "'")
	}
	propName = trimString(propName)
	if(keyHasHint(propName)) {
		propName = propName.substring(0,propName.indexOf(HINT_START_SYMBOL))
	}
	return propName.substring(1,propName.length)
}

function isPureJSONValue(jsonObj) {
	if(jsonObj == null) {
		return true;
	}
	else if(typeof(jsonObj) === 'number') {
		return true;
	}
	else if(typeof(jsonObj) === 'string') {
		return true;
	}
	else if(typeof(jsonObj) === 'boolean') {
		return true;
	}
	else if(typeof(jsonObj) === 'object') {
		if(jsonObj instanceof Array) {
			// Check all the items.
			for(var index in jsonObj) {
				var item = jsonObj[index]
				if(!isPureJSONValue(item)) {
					return false
				}
			}
			return true;
			//throwInternalError("Can't process arrays yet")
		} else if(jsonObj instanceof Object) {
			for(var propName in jsonObj) {
				if(isSpecialKey(propName)) {
					return false
				}
				if(!isPureJSONValue(jsonObj[propName])) {
					return false
				}
			}
			return true;
		}
	}
	throwInternalError("can't recognize the following value: " + jsonObj + ", typeof " + typeof(jsonObj) );
}

function objectIsExpression(jsonObj) {
	for(var propName in jsonObj) 
	{
		if(isSpecialKey(propName)) {
			return true
		}
	}
	return false;
}

function checkIfIsIsNotMixingKeys(jsonObj) {
	for(var propName in jsonObj) 
	{
		if(!isSpecialKey(propName)) {
			throw new Error("JS1001","Regular key '" + propName +"' was found in a expression block. Regular JSON keys and expression keys can not be mixed at the same level of the document.")
		}
	}
}

function navigateKeys(obj,callback) {
	var keys = Object.keys(obj)
	var l = keys.length
	for(var i = 0;i < l;i++) {
		callback({
			key:keys[i],
			isLast: i == l -1
		})
	}
}

function genExpressionBlockChain(iterator,jsonObj, buffer, blockNames, names,resultVarName) {
	if (!iterator.next()) return;
	var propName = iterator.current()
	//console.warn("propName =============================== , ", propName)
	var childInputJsonObj = jsonObj[propName];

	buffer.writeLine(blockNames.name("self") + ".runExp(")
	buffer.indent()
	var childExprName = getExpressionNameFromSpecialKey(propName)
	buffer.writeLine('"' + childExprName + '"')

	// Begin Input Callback Generation
	buffer.writeLine(",{_inputExpression:")
	buffer.indent()
	generateExpressionReadyFunction(childInputJsonObj, buffer, names.createInner());
	buffer.unindent()
	//End of Input Callback Generation

	// Begin Result Callback Generation
	buffer.writeLine(", _resultCallback: function(" + blockNames.name("incResult") + "){")
	buffer.indent()


	buffer.writeLine(resultVarName + " = " + blockNames.name("incResult") + ";")
	if(iterator.isLast()) {
		// if this is the last expression of the array, call the result callback.
		buffer.writeLine(blockNames.name("callbackVar") + "("+ resultVarName +");")
	} else {
		buffer.indent()
		genExpressionBlockChain(iterator, jsonObj, buffer, blockNames, names.createInner(),resultVarName)
		buffer.unindent()
	}

	buffer.unindent()
	buffer.writeLine("}")
	//End of Result Callback Generation
	buffer.writeLine(", _hint: " + getHint4JsFromPropName(propName))
	buffer.unindent()
	buffer.writeLine("});")
}

function genExpressionArrayChain(iterator, buffer,jsonObj, blockNames, names,resultVarName) {
	if (!iterator.next()) return;

	var childInputJsonObj = jsonObj[iterator.current()]
	var isLast = iterator.isLast()
	//buffer.writeLine("var " + names.name("self") + "=" + blockNames.name("self") + ";")
	generateExpressionBlockFunctionWrapper(childInputJsonObj, buffer, blockNames, names, function(blockBuffer, callbackBlockNames) {
		blockBuffer.writeLine("function("+ names.name("subLevelResArg") +"){")
		blockBuffer.indent()
		blockBuffer.writeLine(resultVarName + ".push(" + names.name("subLevelResArg") + ");")
		if(isLast) {
			// if this is the last expression of the array, call the result callback.
			blockBuffer.writeLine(blockNames.name("callbackVar") + "("+ resultVarName +");")
		} else {
			blockBuffer.indent()
			genExpressionArrayChain(iterator, blockBuffer,jsonObj, blockNames, names.createInner(), resultVarName)
			blockBuffer.unindent()
		}
		blockBuffer.unindent()
		blockBuffer.writeLine("}")
		},null)
	}


function genExpressionHashChain(iterator, buffer, jsonObj, blockNames, names,resultVarName) {
	if (!iterator.next()) return;
	var propName = iterator.current()
	//console.warn("regular propName =============================== , ", propName)
	var childInputJsonObj = jsonObj[propName];
	var isLast = iterator.isLast()
	generateExpressionBlockFunctionWrapper(childInputJsonObj, buffer, blockNames, names, function(blockBuffer, callbackBlockNames) {
		blockBuffer.writeLine("function("+ names.name("subLevelResArg") +"){")
		blockBuffer.indent()
		blockBuffer.writeLine(resultVarName + "['"+ propName +"'] = " + names.name("subLevelResArg") + ";")
		if(isLast) {
			// if this is the last expression of the block, call the result callback.
			blockBuffer.writeLine(blockNames.name("callbackVar") + "("+ resultVarName +");")
		} else {
			blockBuffer.indent()
			genExpressionHashChain(iterator, blockBuffer,jsonObj, blockNames, names.createInner(), resultVarName)
			blockBuffer.unindent()
		}
		blockBuffer.unindent()
		blockBuffer.writeLine("}")
		},getHint(propName))
		/*
		generateExpressionBlockFunction(childInputJsonObj, buffer, names, function(childBLockResultArgName) {
		buffer.writeLine(names.name("callbackVar") + "("+names.name("incResult")+");")
		})*/
	/*
	//console.warn("propName =============================== , ", propName)
	var childInputJsonObj = jsonObj[propName];

	buffer.writeLine(blockNames.name("self") + ".runExp(")
	buffer.indent()
	var childExprName = getExpressionNameFromSpecialKey(propName)
	buffer.writeLine('"' + childExprName + '"')

	// Begin Input Callback Generation
	buffer.writeLine(",{_inputExpression:")
	buffer.indent()
	generateExpressionReadyFunction(childInputJsonObj, buffer, names.createInner());
	buffer.unindent()
	//End of Input Callback Generation

	// Begin Result Callback Generation
	buffer.writeLine(", _resultCallback: function(" + blockNames.name("incResult") + "){")
	buffer.indent()


	buffer.writeLine(resultVarName + " = " + blockNames.name("incResult") + ";")
	if(iterator.isLast()) {
		// if this is the last expression of the array, call the result callback.
		buffer.writeLine(blockNames.name("callbackVar") + "("+ resultVarName +");")
	} else {
		buffer.indent()
		genExpressionBlockChain(iterator, jsonObj, buffer, blockNames, names.createInner(),resultVarName)
		buffer.unindent()
	}

	buffer.unindent()
	buffer.writeLine("}")
	//End of Result Callback Generation
	buffer.writeLine(", _hint: " + getHint4JsFromPropName(propName))
	buffer.unindent()
	buffer.writeLine("});")*/
}

function generateExpressionReadyFunction(jsonObj, buffer, names) {
	buffer.writeLine("function() {")
	buffer.indent()
	var selfVarname = names.name("self")
	var resultVarName = selfVarname + "._blockContext._result"
	buffer.writeLine("var " + selfVarname +  " = this;")
	buffer.writeLine("var " + names.name("callbackVar") + " = this._blockContext._resultCallback;")
	//buffer.writeLine("var " + names.name("localBlockContext") + " = this._blockContext;")
	//buffer.writeLine("var " + names.name("localContext") + " = this;")
	
	if(isPureJSONValue(jsonObj)) {
		buffer.writeLine(resultVarName + " = " + JSON.stringify(jsonObj) + ";")
		buffer.writeLine("this._blockContext._resultCallback(" + resultVarName +  ");")
	} else {
		if(jsonObj instanceof Array) {
			// Second level blocks
			buffer.writeLine(resultVarName + " = [];")
			var iterator = new Iterator(Object.keys(jsonObj))
			genExpressionArrayChain(iterator,buffer,jsonObj, names, names.createInner(), resultVarName)
		}
		else if(jsonObj instanceof Object) {
			if(objectIsExpression(jsonObj)) {
				checkIfIsIsNotMixingKeys(jsonObj)
				// Render all the block expressions as a chain, one expression after the result of the other
				var iterator = new Iterator(Object.keys(jsonObj))
				genExpressionBlockChain(iterator,jsonObj, buffer, names, names.createInner(),resultVarName)
				
			} else {
				// Second level blocks
				
				buffer.writeLine(resultVarName + " = {};")
				var iterator = new Iterator(Object.keys(jsonObj))
				genExpressionHashChain(iterator,buffer,jsonObj, names, names.createInner(), resultVarName)
			}
		}
	}

	buffer.unindent()
	buffer.writeLine("}")
}

function generateExpressionBlockFunctionWrapper(jsonObj, buffer, blockNames, names, writeResultCallback, hint) {
	buffer.writeLine(blockNames.name("self") + ".runExp(")
	buffer.indent()
	generateExpressionReadyFunction(jsonObj, buffer, names.createInner())
	buffer.writeLine(",{")
	buffer.writeLine("_resultCallback: ");
	writeResultCallback(buffer, names),
	buffer.write(","),
	buffer.writeLine("_hint: " + getHint4Js(hint))
	buffer.write("}"),
	buffer.unindent()
	buffer.writeLine(");")
}

function generateFunctionFromJSONExpression(jsonBlock, virtualFileName, hint) {
	var buffer = new StringBuffer()
	var names = new NameGenerator()
	buffer.writeLine("var _expressionFunc = function() {")
	buffer.indent()
	buffer.writeLine("this._blockContext._rootExpression = true;")
	buffer.writeLine("this.runExp(")
	buffer.indent()
	generateExpressionReadyFunction(jsonBlock, buffer, names.createInner())
	buffer.writeLine(",null");
	buffer.unindent()
	buffer.writeLine(");")
	buffer.unindent()
	buffer.writeLine("};")

	return buffer.toString()
}

var compileExpressionFuncFromJSON = function(jsonBlock, virtualFileName, outputFileName, hint) {
	var generatedSourceCode = null
	if(outputFileName != undefined) {
		generatedSourceCode = generateFunctionFromJSONExpression(jsonBlock, outputFileName, hint);
		fs.writeFileSync(outputFileName, generatedSourceCode)
	} else {
		generatedSourceCode = generateFunctionFromJSONExpression(jsonBlock, virtualFileName, hint);
	}
	//console.warn("ABOUT TO LOAD THE FOLLOWING JS INTO THE VM:")
	/*if(virtualFileName == "Assert.NonEmpty.implementation.js")
	{
		console.warn(generatedSourceCode)
	}*/

	vm.runInThisContext(generatedSourceCode,virtualFileName, true)
	return _expressionFunc; // defined inside the script.
}

function PriestCollection() {
	
}

/*
 * Returns the name of all modules loaded.
 */
PriestCollection.prototype.names = function() {
	return Object.keys(this)
}

function Runtime() {
	this.loadedExpressions = {}; // Contains a member per expression implementation <Function>
	this.loadedExpressionsMeta = new PriestCollection(); // Contains a member per full definition of the expression, like {name:<String>, implementation:<Function>}
	this.loadedModules = []
	
	var dirName = path.join(__dirname, "built-in")
	this.registerWellKnownExpressionDir(dirName)
	this._paths = new PathCache()
	this.environmentName = process.env.NODE_ENV === undefined ? DEFAULT_ENVIRONMENT : process.env.NODE_ENV 
	this.moduleRequire = function(moduleName) {
		return require(moduleName)
	}
	this.events = new EventEmitter()
	this.scriptDirectories = [{
		path: '.'
	}]
	
	this.mergedManifest = {
		modules: []
	}
}

/*
 * Returns the expression definitions objects for all expressions registered and loaded.
 */
Runtime.prototype.getWellKnownExpressions = function() {
	return this.loadedExpressionsMeta;
}

/*
 * Returns all the priest.js modules loaded on the runtime.
 */
Runtime.prototype.getModules = function() {
	return this.loadedModules;
}

Runtime.prototype.getPaths = function() {
	return this._paths
}
var Utils  = require('./Utils')

/*
 * Load .priest.json files from a directory.
 */
Runtime.prototype.scanScriptsDir = function(dirInfo) {
	var absoluteDirPath = dirInfo.path
	var fileNames = Utils.getFilesWithExtension(absoluteDirPath, DEFAULT_SCRIPT_EXTENSION)
	fileNames.forEach(function(file) {
		var absoluteFileName = path.join(absoluteDirPath, file)
		this.registerWellKnownJSONExpressionFile(absoluteFileName, dirInfo.attributes)
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

Runtime.prototype.registerWellKnownExpressionFile = function(absoluteFilePath) {
	var definition = require(absoluteFilePath)
	this.registerWellKnownExpressionDefinition(definition)
	return definition
}

/*
 * Load .priest.json file, attributes can be specified.
 */
Runtime.prototype.registerWellKnownJSONExpressionFile = function(absoluteFilePath, attributes) {
	var jsonSourceCode = fs.readFileSync(absoluteFilePath, 'utf8')
	var definition = JSON.parse(jsonSourceCode)
	if(attributes) {
		mergeWith(definition, attributes)
	}
	this.registerWellKnownExpressionDefinition(definition)
	return definition
}

Runtime.prototype.registerWellKnownExpressionDefinition = function(expressionDefinition) {
	if(expressionDefinition === undefined || expressionDefinition === null) {
		throwInternalError("expression definition is required")
	}
	var name = expressionDefinition.name
	if(name === undefined || name === null) {
		throwInternalError("expression definition doesn't have any name")
	}
	var implementation = expressionDefinition.implementation
	if(implementation=== undefined) {
		if(expressionDefinition.json === undefined || expressionDefinition.json === null) {
			throwInternalError("expression definition requires either an implementation or a json block")
		}
		var implementationFunc = compileExpressionFuncFromJSON(expressionDefinition.json, name + ".implementation.js")
		
		var expressionClass = function() {};
		expressionClass.prototype = new Expression()
		expressionClass.prototype.execute = implementationFunc
		implementation = expressionClass;
	}
	expressionDefinition.implementation = implementation
	expressionDefinition.implementation.prototype.expressionName = expressionDefinition.name
	this.loadedExpressions[name] = implementation
	this.loadedExpressionsMeta[name] = expressionDefinition
}

Runtime.prototype.isExpressionLoaded = function(name) {
	return this.loadedExpressionsMeta[name] !== undefined
}

Runtime.prototype.getModuleConfiguration = function(moduleName) {
	if(this.configurations === undefined) return undefined;
	return this.configurations[moduleName]
}

Runtime.prototype.setModuleConfiguration = function(moduleName, value) {
	if(this.configurations === undefined) {
		this.configurations  = {}
	}
	this.configurations[moduleName] = value
}

Runtime.prototype.loadModuleInstance = function(priestModule, fictionalName) {
	if(!fictionalName) throw "loadModuleInstance requires a fictionalName"
	if(this.loadedModules.indexOf(priestModule) != -1) return false
	var priestExports = priestModule.priest
	var priestExpressions = priestExports ? priestExports.expressions :  undefined
	if(!priestExpressions) {
		throw "Module '" + fictionalName + "' is not a priest module"
	}
	if(priestModule.priest) {
		if(priestModule.priest.manifestFile) {
			this._mergeWithManifestFile(priestModule.priest.manifestFile)
		}
		if(priestModule.priest.initializersDir) {
			this.registerInitializersDir(priestModule.priest.initializersDir)
		}
	}
	priestExpressions.forEach(function(expressionDefintion) {
		this.registerWellKnownExpressionDefinition(expressionDefintion)
		}, this)
	this.loadedModules.push(priestModule)
	return true
}

Runtime.prototype.loadNamedModule = function(moduleName) {
	var priestModule = this.moduleRequire(moduleName)
	this.loadModuleInstance(priestModule, moduleName)
}

Runtime.prototype._loadManifestFile = function(manifestFile) {
	var jsonStr = fs.readFileSync(manifestFile, 'utf8')
	return JSON.parse(jsonStr)
}

Runtime.prototype._mergeWithManifestFile = function(manifestFile) {
	var manifestDirName = path.dirname(manifestFile)
	var self = this
	var manifest = this._loadManifestFile(manifestFile)
	if(manifest) {
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
Runtime.prototype.loadFromManifestFile = function(manifestFile, initializationCallback) {
	this._mergeWithManifestFile(manifestFile)
	this.load(initializationCallback)
	return true
}

Runtime.prototype._loadModules = function(modulesList) {
	for(var i = 0;i < modulesList.length;i++) {
		var currentModuleCount = modulesList.length
		var moduleName = modulesList[i]
		this.loadNamedModule(moduleName)
		// Check if new modules has been added to the list
		if(currentModuleCount != modulesList.length) {
			i = 0
		}
	}
}

Runtime.prototype.loadManifestModules = function() {
	this._loadModules(this.mergedManifest.modules)
}

/*
Prepares the Runtime to Run. Since the introduction of initializer expressions, you can provide a callback to know when the initialization finishes. If no callback is provided no initialization will be executed.
*/
Runtime.prototype.load = function(initializationCallback) {
	this.registerInitializersDir(path.resolve(constants.INITIALIZERS_DIR_NAME))
	var self = this
	this.loadManifestModules()
	
	// Intialize all the Modules
	this.loadedModules.forEach(function(priestModule) {
		if(priestModule.priest && priestModule.priest.init) {
			priestModule.priest.init(self)
		}
	})
	
	// STEP 4. Load scripts. This must be after the Modules so the modules have a change to specify additional directories.
	this.scanScriptsDirs()
	
	// STEP 1. Load Configurations from Manifest
	// (Configurations must be loaded first so the priest.init callback of all modules can work properly)
	var configurations = this.mergedManifest.environments;
	if(configurations) {
		self.configurations = configurations[self.environmentName]
	}
	this.events.emit('load', this)
	this.events.removeAllListeners('load')
	
	var initializeExpressions = []
	this.loadedExpressionsMeta.names().forEach(function(expName) {
		var expDef = this.loadedExpressionsMeta[expName]
		if(expDef.initialize && expDef.initialize.indexOf(this.environmentName) != -1) {
			// it's a initializer for the current environment
			initializeExpressions.push(expDef)
		}
	}, this)
	if(initializationCallback) {
		if(initializeExpressions.length > 0) {
			var initIterator = new Iterator(initializeExpressions)
			this._runNextInitializer(initIterator, initializationCallback)
		} else {
			initializationCallback(null)
		}
	}
}

Runtime.prototype._runNextInitializer = function(iterator, finishCallback) {
	var self = this
	if(!iterator.next()) {
		finishCallback(null)
		return
	}
	var expDef = iterator.current()
	this.runExpressionByName(expDef.name, {
		_variables: {},
		_resultCallback: function() {
			self._runNextInitializer(iterator, finishCallback)
		}
		,_errorCallback: function(err) {
			finishCallback(new InitializerError(expDef, err))
		},
		_loopCallback: function(cmd) {},
		_inputExpression: function() {
			this.setResult(null)
		}
	}, null)
}

module.exports.InitializerError = InitializerError

function blockContextHasHint(blockContext) {
	return blockContext && blockContext._hint
}

Runtime.prototype.runExpressionByName = function(expressionName, base_context, context_overrides) {
	//console.warn("Calling expression with name ", expressionName, " context_overrides ", context_overrides)
	var expDefinition = this.loadedExpressionsMeta[expressionName]
	if(expDefinition == undefined) {
		throw new Error('JS1002', "Expression '" + expressionName +  "' is not registered or was not loaded.");
	}
	
	var supportHints = expDefinition.flags && expDefinition.flags.indexOf("hint") != -1
	if(!supportHints &&  blockContextHasHint(context_overrides)) {
		throw new Error('UnsupportedHint', "Expression '" + expressionName + "' does not support hints")
	}
	var expObject = expDefinition.implementation
	var expressionObject = new expObject()
	this.runExpressionInstance(expressionObject, base_context, context_overrides)
}

Runtime.prototype.runExpressionFunc = function(expFunc, block_context_base, context_block_overrides) {
	if(expFunc === undefined || expFunc == null || typeof(expFunc) != 'function') {
		throwInternalError("expFunc is required and must be a function")
	}
	var expressionObject = new Expression();
	expressionObject.execute = expFunc.bind(expressionObject)
	this.runExpressionInstance(expressionObject, block_context_base, context_block_overrides)
};

Runtime.prototype.runExpressionInstance = function(expressionInstance, block_context_base, context_block_overrides) {
	//console.warn("block_context_base",block_context_base)
	//console.warn("context_block_overrides",context_block_overrides)
	/*if(expFunc === undefined || expFunc == null || typeof(expFunc) != 'function') {
		throwInternalError("expFunc is required and must be a function")
	}*/
	if(expressionInstance === undefined || expressionInstance == null || !(expressionInstance instanceof Expression)) {
		throwInternalError("expressionInstance is required to be an instance or derived from Expression")
	}
	if(block_context_base === undefined || typeof(block_context_base) != 'object' || block_context_base == null) {
		throwInternalError("block_context_base is required and must be an non-null object")
	}
	if(context_block_overrides === undefined) {
		throwInternalError("context_block_overrides must be an object or null")
	}
	if(block_context_base._loopCallback === undefined || block_context_base._loopCallback === null  || typeof(block_context_base._loopCallback) != 'function') {
		throwInternalError("block_context_base._loopCallback must be a function")
	}
	if(block_context_base._inputExpression === undefined || block_context_base._inputExpression === null  || typeof(block_context_base._inputExpression) != 'function') {
		throwInternalError("block_context_base._inputExpression must be a function")
	}
	if(block_context_base._variables === undefined || block_context_base._variables === null  || typeof(block_context_base._variables) != 'object') {
		throwInternalError("block_context_base._variables must be an object")
	}
	//console.warn("runExpressionFunc validation passed")
	/* 
		// block_context_base members structure
		{
			_resultCallback: <Function>,
			_loopCallback: <Function>,
			_inputExpression: <Function>, // needs to be called with runExp
			_variables: <Object>,
			//_parentVariables: <Object>,
			_hint: <Object> (optional),
			_errorCallback: <Function>,
			_parentResult: <Object>, // Caller Expression Block last Result
			_result: <Object>
			_parentContext: <Object>
		}
	*/
	
	
	var _blockContext = {};
	Object.keys(block_context_base).forEach(function(k) {
		_blockContext[k] = block_context_base[k]
	})
	
	var localVariables = null;
	var useSameScopeVariables = context_block_overrides == null || context_block_overrides._sameScope !== true
	if(useSameScopeVariables) {
		//
		// If it's not running on the same scope, then copy all the variables.
		//
		localVariables = {}//Object.create(block_context_base._variables) //block_context_base._variables; 
		//console.warn("Copying Variables")
		if(block_context_base._variables != undefined && block_context_base._variables != null) {
			Object.keys(block_context_base._variables).forEach(function(k) {
				//console.warn("Copying var ", k, " with value ", block_context_base._variables[k])
				localVariables[k] = block_context_base._variables[k]
			})
		}
	} else {
		// Use the same Scope Varaibles
		localVariables = block_context_base._variables
	}
	
	_blockContext._hint = undefined; //formality
	if(context_block_overrides != null) {
		for(var k in context_block_overrides) {
			if(k == "_runtime" ||  k == "_parentVariables" || k == "_variables" || k == "_result" || k == "_parentContext" || k == "_errorInfo") continue; // can't replace these
 			_blockContext[k] = context_block_overrides[k]
		}
	}
	
	
	_blockContext._variables = localVariables;
	_blockContext._runtime = this; 
	_blockContext._result = undefined; //formality
	_blockContext._parentResult = block_context_base._result
	_blockContext._parentContext = block_context_base
	_blockContext._rootExpression = undefined // _rootScope can not be inherited.
	
	// The override key '_initialResult' can set the initial value of the calling expression block.
	if(context_block_overrides && context_block_overrides._initialResult != null && context_block_overrides._initialResult != undefined) {
		_blockContext._result = context_block_overrides._initialResult
	}
	
	expressionInstance._blockContext = _blockContext
	expressionInstance.execute() // run it
};


module.exports.Runtime = Runtime

function _testOnly_runJSONObjectFromJSON(jsonBlock, variables, inputCallback, loopCallback, resultCallback, outputFileName, hint, errorCallback, additionalExpressionsFiles) {
	if(errorCallback === undefined) {
		errorCallback = function(errInfo) {
			console.warn("_testOnly_runJSONObjectFromJSON default errorCallback just catched an error:", errInfo)
		}
	}
	if(hint === undefined) {
		hint = undefined
	}
	var baseFunc = compileExpressionFuncFromJSON(jsonBlock, outputFileName === undefined? "test-in-memory.js" : outputFileName, outputFileName, hint)
	var runtime = new Runtime()
	
	if(additionalExpressionsFiles !== undefined && additionalExpressionsFiles !== null) {
		additionalExpressionsFiles.forEach(function(fileName) {
			runtime.registerWellKnownExpressionFile(fileName)
		})
	}
	var variablesObjects = {}
	for(var k in variables) {
		setVarCore(runtime, variablesObjects, k, variables[k])
	}
	var contextBase = {}
	contextBase._resultCallback = resultCallback
	contextBase._loopCallback = loopCallback
	contextBase._inputExpression = inputCallback
	contextBase._variables = variablesObjects
	contextBase._hint = hint
	contextBase._errorCallback = errorCallback
	/*
	var contextBase = {
		_resultCallback: resultCallback,
		_loopCallback: loopCallback,
		_inputExpression: inputCallback,
		//_parentVariables: variables,
		_variables:variablesObjects,
		_hint: hint,
		_errorCallback: errorCallback
	};
	*/
	runtime.runExpressionFunc(baseFunc, contextBase, null)
}



module.exports.enableModule = function(thirdPartyModule, moduleInit) {
	return new ModuleInitializer(thirdPartyModule, moduleInit)
}

module.exports.setBlockContextVariable = function(runtime, blockContext, name, value) {
	if(!(runtime instanceof Runtime)) {
		throw "setBlockContextVariable requires a runtime instance" 
	}
	if(!blockContext._variables) {
		blockContext._variables = {}
	} 
	setVarCore(runtime, blockContext._variables, name, value)
}

module.exports.inferExpressionNameByFileName = function(fileName) {
	if(!fileName) return null
	if(fileName.indexOf(DEFAULT_SCRIPT_EXTENSION) == -1) return null
	return fileName.substring(0, fileName.indexOf(DEFAULT_SCRIPT_EXTENSION))
}

module.exports.exportTestOnlyFunctions = function() {
	TEST_PRINT_TRACE_ON_INTERNAL_ERROR = true
	module.exports._testOnly_getExpressionNameFromSpecialKey = getExpressionNameFromSpecialKey
	module.exports._testOnly_runJSONObject = _testOnly_runJSONObjectFromJSON
	module.exports._testOnly_compileExpressionFuncFromJSON = compileExpressionFuncFromJSON
	module.exports._testOnly_getHint = getHint
	
}


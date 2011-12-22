var AstNodeType = require('./AstNodeType.js')
var SPECIAL_KEY_SYMBOL = "@"
var DELEGATE_KEY_SYMBOL = "#"
var HINT_START_SYMBOL = "("
var HINT_END_SYMBOL = ")"

function Tree(doc) {
	
}

Tree.prototype.parse = function(doc) {
	this.doc = doc
	this._rootNode = new Node().parse(doc)
}

Tree.prototype.getRootNode = function() {
	return this._rootNode
}

function Node() {
	this.children = []
	this.parent = null
}
Node.prototype.type = null
function trimString(str) {
	if(str == null || str == undefined) return str
	return str.replace(/^\s\s*/,'').replace(/\s\s*$/,'')
}
function isSpecialKey(propName) {
	var n = trimString(propName)
	return n.indexOf(SPECIAL_KEY_SYMBOL) == 0;
}
function isExpressionKey(propName) {
	var n = trimString(propName)
	return n.indexOf(SPECIAL_KEY_SYMBOL) == 0;
}

function isDelegateKey(propName) {
	var n = trimString(propName)
	return n.indexOf(DELEGATE_KEY_SYMBOL) == 0;
}

function isBlock(jsonObj) {
	var keys = Object.keys(jsonObj)
	if(keys.length == 0) return false
	for(var i = 0; i < keys.length; i++) {
		var propName = keys[i]
		if(!isSpecialKey(propName)) {
			return false
		}
	}
	return true
}

function isCompositeHash(jsonObj) {
	var keys = Object.keys(jsonObj)
	if(keys.length == 0) return false
	for(var i = 0; i < keys.length; i++) {
		var propName = keys[i]
		if(isDelegateKey(propName)) {
			return true
		}
	}
	return false
}
function keyHasHint(propName) {
	return propName.indexOf(HINT_START_SYMBOL) > -1
}
function getExpressionNameFromSpecialKey(propName) {
	if(!isSpecialKey(propName)){
		throw "Asked to extract special from a key that is not a special key, the key was '" + propName + "'"
	}
	propName = trimString(propName)
	if(keyHasHint(propName)) {
		propName = propName.substring(0,propName.indexOf(HINT_START_SYMBOL))
	}
	return propName.substring(1,propName.length)
}
Node.prototype.parse = function(value) {
	this.value = value
	if(this.type == null)
	{
    var valueType = typeof(value);
		if(value === null) {
			this.type = AstNodeType.null
		}
		else if(valueType === "number") {
			this.type = AstNodeType.number
		}
		else if(valueType === "string" && isExpressionKey(value)) {
			this.type = AstNodeType.expression
		}
    else if(valueType === "string" && isDelegateKey(value)) {
			this.type = AstNodeType.delegate;
		}
		else if(valueType === "string") {
			this.type = AstNodeType.string
		}
		else if(valueType === "object" && (value instanceof Array)) {
			this.type = AstNodeType.array
		}
		else if(valueType === "object" && isBlock(value)) {
			this.type = AstNodeType.block
		}
    else if(valueType === "object" && isCompositeHash(value)) {
			this.type = AstNodeType.composite_hash;
		}
		else if(valueType === "object") {
			this.type = AstNodeType.hash
		}
		else if(valueType === "boolean") {
			this.type = AstNodeType.boolean
		}
		else {
			throw "Failed to recognize JSON type for '" + value + "', typeof '" + valueType + "'"
		}
	}
	if(this.shouldParseChildren()) {
		this.parseChildren()
	}
	return this
}

Node.prototype.shouldParseChildren = function() {
	return AstNodeType.PARENT_TYPES.indexOf(this.type) != -1;
}

Node.prototype.parseChildren = function() {
	if(this.type == AstNodeType.block) {
		var keys = Object.keys(this.value)
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var node = new Node()
			node.type = AstNodeType.expression
			node.parse(key)
			this.addChild(node)
			
			var subNode = new Node()
			subNode.parse(this.value[key])
			node.addChild(subNode)
		}
	}
  else if(this.type == AstNodeType.hash) {
		var keys = Object.keys(this.value)
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var node = new Node()
			node.type = AstNodeType.property
			node.parse(key)
			this.addChild(node)
			
			var subNode = new Node()
			subNode.parse(this.value[key])
			node.addChild(subNode)
		}
	}
  else if(this.type == AstNodeType.composite_hash) {
		var keys = Object.keys(this.value)
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var node = new Node();
			node.type = isDelegateKey(key) ? AstNodeType.delegate : AstNodeType.property;
			node.parse(key);
			this.addChild(node);
			
			var subNode = new Node();
			subNode.parse(this.value[key]);
			node.addChild(subNode);
		}
  }
  else if(this.type == AstNodeType.array) {
		for(var i = 0; i < this.value.length; i++) {
			var node = new Node()
			node.type = AstNodeType.index
			node.parse(i)
			this.addChild(node)
			
			var subNode = new Node()
			subNode.parse(this.value[i])
			node.addChild(subNode)
		}
	}
}

Node.prototype.getPathPart = function() {
	if(this.type == AstNodeType.block) {
		return "{@}"
	} else if(this.type == AstNodeType.hash) {
		return "{}"
	} else if(this.type == AstNodeType.array) {
		return "[]"
	}
	else if(this.type == AstNodeType.expression) {
		return this.value
	}
	else if(this.type == AstNodeType.property) {
		return this.value
	}
	return JSON.stringify(this.value)
}
Node.prototype.getPath = function() {
	var path = ''
	var currentNode = this
	while(currentNode) {
		if(path.length > 0){
			path = "/" + path
		}
		path = currentNode.getPathPart() + path
		currentNode = currentNode.parent
	
	}
	return path
}
Node.prototype.addChild = function(node) {
	node.parent = this
	this.children.push(node)
}

Node.prototype.hasChildren = function() {
	return this.children.length > 0
}
Node.prototype.isPureValue = function() {
	if(AstNodeType.SPECIAL_TYPES.indexOf(this.type) != -1) {
		return false
	}
	return this.areChildrenPureValues();
}
Node.prototype.areChildrenPureValues = function() {
  if(this.hasChildren()) {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i]
			if(!child.isPureValue()) {
				return false;
			}
		}
	}
  return true;
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
module.exports.SPECIAL_KEY_SYMBOL = SPECIAL_KEY_SYMBOL
module.exports.Tree = Tree
module.exports.isSpecialKey = isSpecialKey
module.exports.keyHasHint = keyHasHint
module.exports.getExpressionNameFromSpecialKey = getExpressionNameFromSpecialKey
module.exports.getHintFromSpecialKey = getHint

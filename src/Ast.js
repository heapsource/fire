var AstNodeType = require('./AstNodeType.js')
var SPECIAL_KEY_SYMBOL = "@"
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
}
Node.prototype.type = null
function trimString(str) {
	if(str == null || str == undefined) return str
	return str.replace(/^\s\s*/,'').replace(/\s\s*$/,'')
}
function isSpecialKey(propName) {
	var n = trimString(propName)
	return n.indexOf(SPECIAL_KEY_SYMBOL) == 0
}
function isBlock(jsonObj) {
	for(var propName in jsonObj) {
		if(isSpecialKey(propName)) {
			return true
		}
	}
	return false
}

Node.prototype.parse = function(value) {
	this.value = value
	if(this.type == null)
	{
		if(value === null) {
			this.type = AstNodeType.null
		}
		else if(typeof(value) === "number") {
			this.type = AstNodeType.number
		}
		else if(typeof(value) === "string" && isSpecialKey(value)) {
			this.type = AstNodeType.expression
		}
		else if(typeof(value) === "string") {
			this.type = AstNodeType.string
		}
		else if(typeof(value) === "object" && isBlock(value)) {
			this.type = AstNodeType.block
		}
		else if(typeof(value) === "object" && !(value instanceof Array)) {
			this.type = AstNodeType.hash
		}
		else if(typeof(value) === "object" && (value instanceof Array)) {
			this.type = AstNodeType.array
		}
		else {
			throw "Failed to recognize JSON type for '" + value + "', typeof '" + typeof(value) + "'"
		}
	}
	if(this.shouldParseChildren()) {
		this.parseChildren()
	}
	return this
}

Node.prototype.shouldParseChildren = function() {
	return this.type == AstNodeType.array || this.type == AstNodeType.block || this.type == AstNodeType.hash
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
	} else if(this.type == AstNodeType.hash) {
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
	} else if(this.type == AstNodeType.array) {
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

Node.prototype.addChild = function(node) {
	this.children.push(node)
}

Node.prototype.isLiteral = function() {
	return true
}

module.exports.SPECIAL_KEY_SYMBOL = SPECIAL_KEY_SYMBOL
module.exports.Tree = Tree
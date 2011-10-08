var Expression = require("../Expressions").Expression
var extractComparableValues = require('../Comparable').extractComparableValues
var comparableAreEqual = require('../Comparable').areEqual
var STRICT = 'strict'
function Equals() {

}
Equals.prototype = new Expression()
Equals.prototype.execute = function() {
	var self = this
	var strict = false
	if(this.hasHint() && this.getHintValue().indexOf(STRICT) != -1) {
		strict = true
	}
	this.runInput({
		_resultCallback: function(res) {
			var values = extractComparableValues(res)
			if(values.length < 2) {
				self.setResult(undefined)
				return
			}
			var res = comparableAreEqual(values, strict)
			self.setResult(res)
		}
	});
}

module.exports = {
	name:"equals",
	flags: "hint",
	implementation:Equals
}
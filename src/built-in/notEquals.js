var Expression = require("../Expressions").Expression
var extractComparableValues = require('../Comparable').extractComparableValues
var comparableAreNotEqual = require('../Comparable').areNotEqual
var STRICT = 'strict'
function NotEquals() {

}
NotEquals.prototype = new Expression()
NotEquals.prototype.execute = function() {
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
			var res = comparableAreNotEqual(values, strict)
			self.setResult(res)
		}
	});
}

module.exports = {
	name:"notEquals",
	flags: "hint",
	implementation:NotEquals
}
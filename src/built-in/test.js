var Expression = require("../Expressions").Expression

function Test() {

}
Test.prototype = new Expression()
Test.prototype.execute = function() {
	var self = this
	var operand = this.hasHint() ? this.getHintVariableValue() : this.getParentResult();
	this.runInput({
		_resultCallback: function(res) {
			if(typeof(res) == 'string') {
				self.setResult(new RegExp(res).test(operand))
			} else if(typeof(res) == 'object') {
				self.setResult(new RegExp(res.expression, res.modifiers).test(operand))
			} else {
				self.setResult(false)
			}
		}
	})
}
module.exports = {
	name:"test",
	flags: "hint",
	implementation:Test
}

var Expression = require("../Expressions").Expression

function Decrement() {
	
}
Decrement.prototype = new Expression()
Decrement.prototype.execute = function() {
	var self = this
	var value = this.hasHint() ? this.getHintVariableValue() : this.getParentResult();
	if(isNaN(value) || value === undefined || value === null) {
		this.setResult(NaN)
	} else {
		// run the input...
		this.runInput({
			_resultCallback: function(res) {
				if(isNaN(res) || res === undefined || res === null) {
					self.setResult(NaN)
				} else {
					var res = value - res
					self.setResult(res)
				}
			}
		});
	}
}

module.exports = {
	name: "decrement",
	flags: "hint",
	implementation: Decrement
}
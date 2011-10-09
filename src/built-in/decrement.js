var Expression = require("../Expressions").Expression

function Decrement() {
	
}
Decrement.prototype = new Expression()
Decrement.prototype.execute = function() {
	var self = this
	if(!this.requireHint()) return;
	
	var value = this.getHintVariableValue()
	
	if(isNaN(value) || value === undefined || value === null) {
		this.setParentVar(this.getHintValue(), NaN)
		this.skip()
	} else {
		// run the input...
		this.runInput({
			_resultCallback: function(res) {
				if(isNaN(res) || res === undefined || res === null) {
					self.setParentVar(self.getHintValue(), NaN)
					self.skip()
				} else {
					var res = value - res
					self.setParentVar(self.getHintValue(), res)
					self.skip()
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
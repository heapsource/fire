var Expression = require("../Expressions").Expression

function IndexExpression() {
	
}

IndexExpression.prototype = new Expression()
IndexExpression.prototype.execute = function() {
	var self = this
	var result = this.hasHint() ? this.getHintVariableValue() : this.getParentResult()
	if(result)
	{
		if(typeof(result) === 'object') {
			this.runInput({
				_resultCallback: function(res) {
					self.setResult(result[res])
				}
			})
		} else {
			this.skip()
		}
	} else {
		this.skip()
	}
}

module.exports = {
	name:"index",
	flags: "hint",
	implementation:IndexExpression
}
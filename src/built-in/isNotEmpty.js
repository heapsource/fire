var Expression = require("../Expressions").Expression

function IsNotEmpty() {

}
IsNotEmpty.prototype = new Expression()
IsNotEmpty.prototype.isNotEmptyCore = function(val) {
	var isEmpty = (val != undefined && val != null && val != '')
	this.setResult(isEmpty)
}
IsNotEmpty.prototype.execute = function() {
	var self = this
	
	if(this.hasHint()) {
		this.isNotEmptyCore(this.getHintVariableValue())
	} else {
		this.runInput({
			_resultCallback: function(res) {
				self.isNotEmptyCore(res)
			}
		})
	}
}
module.exports = {
	name:"isNotEmpty",
	flags: "hint",
	implementation:IsNotEmpty
}

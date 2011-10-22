var Expression = require("../Expressions").Expression

function IsEmpty() {

}
IsEmpty.prototype = new Expression()
IsEmpty.prototype.isEmptyCore = function(val) {
	var isEmpty = (val == undefined || val == null || val == '')
	this.setResult(isEmpty)
}
IsEmpty.prototype.execute = function() {
	var self = this
	
	if(this.hasHint()) {
		this.isEmptyCore(this.getHintVariableValue())
	} else {
		this.runInput({
			_resultCallback: function(res) {
				self.isEmptyCore(res)
			}
		})
	}
}

module.exports = {
	name:"isEmpty",
	flags: "hint",
	implementation:IsEmpty
}
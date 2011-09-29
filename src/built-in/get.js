var Expression = require("../Expressions").Expression

function Get() {

}

Get.prototype = new Expression()
Get.prototype.execute = function() {
	var self = this
	var rc = this._blockContext._resultCallback
	var v = this._blockContext._variables
	var val = undefined;
	var hint = this._blockContext._hint
	if(hint != undefined && hint != undefined && hint != null)
	{
		val = self.getParentVar(this._blockContext._hint)
		rc(val)
	} else {
		this.skip()
	}
}

module.exports = {
	name:"get",
	implementation:Get
}
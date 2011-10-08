var Expression = require("../Expressions").Expression

function Set() {

}
Set.prototype = new Expression()
Set.prototype.execute = function(){
	var self = this
	var hint = this._blockContext._hint
	var validHint = hint != undefined && hint != undefined && hint != null 
	if(validHint) {
		this.runInput({
		_resultCallback: function(res) {
			self.setParentVar(hint, res)
			self.skip()
		}
	});
	} else {
		self.skip()
	}
	
}

module.exports = {
	name:"set",
	flags: "hint",
	implementation:Set
}
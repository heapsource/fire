var Expression = require("../Expressions").Expression

function ScopeSet() {

}
ScopeSet.prototype = new Expression()
ScopeSet.prototype.execute = function(){
	var self = this
	var hint = this._blockContext._hint
	var validHint = hint != undefined && hint != undefined && hint != null 
	if(validHint) {
		this.runInput({
		_resultCallback: function(res) {
			self.setParentScopeVar(hint, res)
			self.skip()
		}
	});
	} else {
		self.skip()
	}
	
}

module.exports = {
	name:"scopeSet",
	flags: "hint",
	implementation:ScopeSet
}
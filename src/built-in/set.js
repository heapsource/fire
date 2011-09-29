var Expression = require("../Expressions").Expression

function Set() {

}
Set.prototype = new Expression()
Set.prototype.execute = function(){
	var self = this
	var rc = this._blockContext._resultCallback
	var pv = this._blockContext._parentVariables
	var val = undefined;

	var rc = this._blockContext._resultCallback
	var hint = this._blockContext._hint
	var validHint = hint != undefined && hint != undefined && hint != null 

	this.runInput({
		_resultCallback: function(res) {
			if(validHint) {
				self.setParentVar(hint, res)
			}
			rc(res)
		}
	});
}

module.exports = {
	name:"set",
	implementation:Set
}
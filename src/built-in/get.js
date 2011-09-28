module.exports = {
	name:"get",
	implementation:
	function() {
		var self = this
		var rc = this._blockContext._resultCallback
		var v = this._blockContext._variables
		var val = undefined;
		var hint = this._blockContext._hint
		var validHint = hint != undefined && hint != undefined && hint != null 
		//console.warn("Calling GET with hint", hint)
		//console.warn("... variables:", this._blockContext._variables)
		//console.warn(this._blockContext._variables)
		//console.warn("Valid hint:",hint)
		if(validHint)
		{
			val = self._getParentVar(this._blockContext._hint)
			rc(val)
		} else {
			this._skip()
		}
		
	}
}
module.exports = {
	name:"get",
	implementation:
	function() {
		var rc = this._blockContext._resultCallback
		var v = this._blockContext._variables
		var val = undefined;
		var hint = this._blockContext._hint
		var validHint = hint != undefined && hint != undefined && hint != null 
		//console.warn("Calling GET with hint", hint)
		//console.warn("... variables:", this._blockContext._variables)
		if(validHint)
		{
			val = v[this._blockContext._hint]
		} else {
			//console.warn("calling GET with undefined hint")
		}
		rc(val)
	}
}
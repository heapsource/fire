module.exports = function() {
	var rc = this._blockContext._resultCallback
	var v = this._blockContext._variables
	var val = undefined;
	var hint = this._blockContext._hint
	var validHint = hint != undefined && v != undefined && v != null
	console.warn("Calling GET with hint", hint)
	if(validHint)
	{
		val = v[this._blockContext._hint]
	} else {
		console.warn("calling GET with undefined hint")
	}
	rc(val)
}
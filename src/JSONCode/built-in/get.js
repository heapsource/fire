module.exports = function() {
	var rc = this._blockContext._resultCallback
	var v = this._blockContext._variables
	var val = undefined;
	if(this._blockContext._hint != undefined && v != undefined && v != null)
	{
		val = v[this._blockContext._hint]
	}
	rc(val)
}
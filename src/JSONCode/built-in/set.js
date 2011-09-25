module.exports = function() {
	var rc = this._blockContext._resultCallback
	var v = this._blockContext._parentVariables
	var val = undefined;
	
	var rc = this._blockContext._resultCallback
	var hint = this._blockContext._hint
	var validHint = hint != undefined && v != undefined && v != null 
	
	this._blockContext._inputCallback(function(res) {
		if(validHint) {
			 v[hint] = res
		}
		rc(res)
	});
}
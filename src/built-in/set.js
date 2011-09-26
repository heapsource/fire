module.exports = {
	name:"set",
	implementation:function() {
		//console.warn("calling SET")
		var rc = this._blockContext._resultCallback
		var v = this._blockContext._parentVariables
		var val = undefined;

		var rc = this._blockContext._resultCallback
		var hint = this._blockContext._hint
		var validHint = hint != undefined && v != undefined && v != null 

		if(this._blockContext._inputExpression) {
			this._runExp(this._blockContext._inputExpression, {
				_resultCallback: function(res) {
					if(validHint) {
						v[hint] = res
					}
					rc(res)
				}
			});
		}
	}
}
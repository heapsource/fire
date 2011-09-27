module.exports = {
	name:"set",
	implementation:function() {
		//console.warn("calling SET")
		var rc = this._blockContext._resultCallback
		var pv = this._blockContext._parentVariables
		//var v = this._blockContext._variables
		var val = undefined;

		var rc = this._blockContext._resultCallback
		var hint = this._blockContext._hint
		var validHint = hint != undefined && hint != undefined && hint != null 

		if(this._blockContext._inputExpression) {
			this._runExp(this._blockContext._inputExpression, {
				_resultCallback: function(res) {
					if(validHint) {
						//v[hint] = res
						pv[hint] = res
					}
					rc(res)
				}
			});
		}
	}
}
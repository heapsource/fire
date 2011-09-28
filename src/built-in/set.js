module.exports = {
	name:"set",
	implementation:function() {
		//console.warn("calling SET")
		var self = this
		var rc = this._blockContext._resultCallback
		var pv = this._blockContext._parentVariables
		//var v = this._blockContext._variables
		var val = undefined;

		var rc = this._blockContext._resultCallback
		var hint = this._blockContext._hint
		var validHint = hint != undefined && hint != undefined && hint != null 

			this._runInput({
				_resultCallback: function(res) {
					if(validHint) {
						//v[hint] = res
						self._setParentVar(hint, res)
					}
					rc(res)
				}
			});
		}
	
}
module.exports = {
	name: "return",
	implementation: function() {
		//console.log("Running @return, this is: ", this)
		var rc = this._blockContext._resultCallback

		if(this._blockContext._inputExpression) {
			this._runExp(this._blockContext._inputExpression, {
				_resultCallback: function(res) {
					rc(res)
				}
			});
		}
	}
}
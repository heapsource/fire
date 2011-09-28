module.exports = {
	name: "return",
	implementation: function() {
		//console.log("Running @return, this is: ", this)
		var rc = this._blockContext._resultCallback
		this._runInput({
			_resultCallback: function(res) {
				rc(res)
			}
		});
	}
}
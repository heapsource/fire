module.exports = function() {
	//console.log("Running @return, this is: ", this)
	var rc = this._blockContext._resultCallback

	this._blockContext._inputCallback(function(res) {
		//console.log("@®eturn will return:", res)
		rc(res)
	})
}
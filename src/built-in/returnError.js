module.exports = {
	name: "returnError",
	implementation: function() {
		this._blockContext._resultCallback(this._blockContext._parentContext._errorInfo)
	}
}
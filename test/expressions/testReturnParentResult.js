module.exports = {
	name:"testReturnParentResult",
	implementation:function() {
		this._blockContext._resultCallback(this._blockContext._parentResult)
	}
}
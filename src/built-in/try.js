module.exports = {
	name:"try",
	implementation:function() {
		var self = this
		this._runInput({
			_errorCallback: function(error) {
				//console.warn("try catched an error:", error)
				self._setError(error)
				self._blockContext._resultCallback(self._blockContext._parentResult)
			},
			_resultCallback: function(res) {
				self._blockContext._resultCallback(res)
			}
		});
	}
}
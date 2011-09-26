module.exports = {
	name:"try",
	implementation:function() {
		var self = this
		this._runInput({
			_errorCallback: function(error) {
				self._blockContext._resultCallback(error)
			},
			_resultCallback: function(res) {
				self._blockContext._resultCallback(res)
			}
		});
	}
}
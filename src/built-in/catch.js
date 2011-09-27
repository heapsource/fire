module.exports = {
	name:"catch",
	implementation:function() {
		var self = this
		var errInfo = this._blockContext._parentContext._errorInfo
			self._resetError()
		//console.warn("Catch error info from parent:",errInfo)
		if(errInfo != undefined) {
			// there is an error, run the input...
			this._blockContext._variables.errorInfo = errInfo // let the input know about the error
			this._runInput({
				_resultCallback: function(res) {
					// and return the values. any errors are bubbled up
					self._blockContext._resultCallback(res)
				}
			});
		} else {
			// No errors found, return the parent result inmediately
			self._skip()
		}
	}
}
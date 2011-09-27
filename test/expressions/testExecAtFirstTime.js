module.exports = {
	name:"testExecAtFirstTime",
	implementation:function() {
		var self = this
		if(this._blockContext._parentVariables.testExecAtSecondTimeCount == undefined) {
			this._blockContext._parentVariables.testExecAtSecondTimeCount = 0
			self._skip()
		} else if(this._blockContext._parentVariables.testExecAtSecondTimeCount == 1) {
			this._blockContext._parentVariables.testExecAtSecondTimeCount++
			this._runInput({
				_resultCallback: function(res) {
					self._skip()
				}
			})
		}else {
			this._blockContext._parentVariables.testExecAtSecondTimeCount++
			self._skip()
		}
	}
}
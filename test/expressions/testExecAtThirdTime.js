module.exports = {
	name:"testExecAtThirdTime",
	implementation:function() {
		var self = this
		//console.warn("testExecAtThirdTime")
		if(this._blockContext._parentVariables.testExecAtThirdTimeCount == undefined) {
			this._blockContext._parentVariables.testExecAtThirdTimeCount  = 0
			this._skip()
			//console.warn("initializing testExecAtThirdTimeCount")
			//return
		} else {
			if(self._blockContext._parentVariables.testExecAtThirdTimeCount < 2) {
				//console.warn("incrementing testExecAtThirdTimeCount", self._blockContext._parentVariables.testExecAtThirdTimeCount )
				self._blockContext._parentVariables.testExecAtThirdTimeCount++
				this._skip()
				//return
			} else {
				//console.warn("executing testExecAtThirdTimeCount")
				this._runInput({
					_resultCallback: function(res) {
						self._skip()
					}
				})
			}
		}
	}
}
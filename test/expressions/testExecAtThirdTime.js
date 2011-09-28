module.exports = {
	name:"testExecAtThirdTime",
	implementation:function() {
		var self = this
		//console.warn("testExecAtThirdTime", self._getVar("testExecAtThirdTimeCount"))
		if(self._getParentVar("testExecAtThirdTimeCount")  == undefined) {
			
			//console.warn("initializing testExecAtThirdTimeCount")
			self._setParentVar("testExecAtThirdTimeCount", 0) 
			//console.warn("testExecAtThirdTimeCount:", self._getParentVar("testExecAtThirdTimeCount"))
			this._skip()
			//return
		} else {
			if(self._getParentVar("testExecAtThirdTimeCount")  < 2) {
				//console.warn("incrementing testExecAtThirdTimeCount", self._getParentVar("testExecAtThirdTimeCount"))
				self._setParentVar("testExecAtThirdTimeCount", self._getParentVar("testExecAtThirdTimeCount") +1)
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
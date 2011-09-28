module.exports = {
	name:"testIncrementedName",
	implementation:function() {
		var self = this
		var varName = self._blockContext._hint+ "var";
		if(self._getParentVar(varName) == undefined) {
			self._setParentVar(varName, -1)
		}
		self._setParentVar(varName, self._getParentVar(varName) + 1)
		self._blockContext._resultCallback(self._blockContext._hint + self._getParentVar(varName))
	}
}
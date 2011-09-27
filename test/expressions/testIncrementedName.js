module.exports = {
	name:"testIncrementedName",
	implementation:function() {
		var self = this
		var varName = self._blockContext._hint+ "var";
		if(self._blockContext._parentVariables[varName] == undefined) {
			self._blockContext._parentVariables[varName] = -1
		}
		self._blockContext._parentVariables[varName] = self._blockContext._parentVariables[varName] + 1
		self._blockContext._resultCallback(self._blockContext._hint + self._blockContext._parentVariables[varName])
	}
}
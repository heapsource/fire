module.exports = {
	name: "loop",
	implementation: function() {
		//console.warn("loop")
		var rc = this._blockContext._resultCallback
		var self = this
		var result = []

		var callInput = null;
		callInput = function() {
			//console.warn("callInput")
			self._runInput({
				_loopCallback: function(cmd) {
					if(cmd == "break") {
						rc(result) // return the array
					} else if(cmd == "continue") {
						callInput() // call the next iteration
					} else {
						throw "Invalid loop command " + cmd
					}
				},
				_resultCallback: function(res) {
					//console.warn("adding result to array")
					result.push(res)
					callInput() // call the next iteration
				}
			});
		}
		callInput() // trigger the first iteration

	}
}
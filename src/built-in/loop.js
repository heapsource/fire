var Expression = require("../Expressions").Expression
function Loop() {

}
Loop.prototype = new Expression()
Loop.prototype.execute = function() {
	var rc = this._blockContext._resultCallback
	var self = this
	var result = []

	var callInput = null;
	callInput = function() {
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
				result.push(res)
				callInput() // call the next iteration
			}
		});
	}
	callInput() // trigger the first iteration

}

module.exports = {
	name: "loop",
	implementation: Loop
}
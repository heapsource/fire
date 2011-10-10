var Expression = require("../Expressions").Expression
function Loop() {

}
Loop.prototype = new Expression()
Loop.prototype.execute = function() {
	var rc = this._blockContext._resultCallback
	var self = this
	var result = []
	var count = -1
	var callInput = null;
	var CurrentIndexVarName = this.hasHint() ? this.getHintValue() + 'CurrentIndex' : 'CurrentIndex'
	
	callInput = function() {
		count++
		self.setVar(CurrentIndexVarName,count)
		self.runInput({
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
	flags: "hints",
	implementation: Loop
}
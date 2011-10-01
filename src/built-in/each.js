var Expression = require("../Expressions").Expression
var Iterator = require('../Iterator')
function Each() {
	
}
Each.prototype = new Expression()
Each.prototype.execute = function() {
	var rc = this._blockContext._resultCallback
	var self = this
	var result = []

	var callInput = null;
	var varVal = null
	if(this.hasHint()) {
		varVal = this.getVar(this._blockContext._hint)
	} else {
		varVal = this.getParentResult()
	}
	var itemVarName = this.hasHint() ? this.getHintValue() + 'CurrentItem' : 'CurrentItem'
	var iterator = new Iterator(varVal)
	callInput = function() {
		if(!iterator.next()) {
			rc(result)
			return
		}
		self.setVar(itemVarName, iterator.current())
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
	name: "each",
	implementation: Each
}
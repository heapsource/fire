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
	varVal = this.getParentResult()
	if(!(varVal instanceof Array)) {
		this.setResult([])
		return
	}
	var itemVarName = this.hasHint() ? this.getHintValue() + 'CurrentItem' : 'CurrentItem'
	var CurrentIndexVarName = this.hasHint() ? this.getHintValue() + 'CurrentIndex' : 'CurrentIndex'
	var iterator = new Iterator(varVal)
	var count = -1
	callInput = function() {
		if(!iterator.next()) {
			rc(result)
			return
		}
		count++
		self.setVar(CurrentIndexVarName,count)
		
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
	flags: "hint",
	implementation: Each
}
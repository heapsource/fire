// Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


var Expression = require("../Expressions").Expression
var Iterator = require('../Iterator')
function Each() {
	
}
Each.prototype = new Expression()
Each.prototype.onPrepareInput = function() {
	var self = this
	this.inputExpression.scopeBypass = true
	this.inputExpression.loopCallback = function(cmd) {
		if(cmd == "break") {
			self.end(self._result) // return the array
		} else if(cmd == "continue") {
			process.nextTick(function() {
				self._iterate() // call the next iteration
			})
		} else {
			throw "Invalid loop command " + cmd
		}
	}
}
Each.prototype._iterate = function() {
	var self = this
	if(!this._iterator.next()) {
		self.end(this._result)
		return
	}
	this._count++
	this.setVar(this._CurrentIndexVarName, this._count)
	this.setVar(this._itemVarName, this._iterator.current())
	this.runInput(function(res) {
		self._result.push(res)
		process.nextTick(function() {
			self._iterate() // call the next iteration
		})
	});
}
Each.prototype.execute = function() {
	this._result = []
	this._varVal = this.getParentResult()
	if(!(this._varVal instanceof Array)) {
		this.end(this._result)
		return
	}
	this._itemVarName = this.hasHint() ? this.getHintValue() + 'CurrentItem' : 'CurrentItem'
	this._CurrentIndexVarName = this.hasHint() ? this.getHintValue() + 'CurrentIndex' : 'CurrentIndex'
	this._iterator = new Iterator(this._varVal)
	this._count = -1
	this._iterate(); // call the first iteration
}

module.exports = {
	name: "each",
	flags: ["hint"],
	implementation: Each
}
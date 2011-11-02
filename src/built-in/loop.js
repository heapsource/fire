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
					process.nextTick(function() {
						rc(result) // return the array
					})
				} else if(cmd == "continue") {
					process.nextTick(function() {
						callInput() // call the next iteration
					})
				} else {
					throw "Invalid loop command " + cmd
				}
			},
			_resultCallback: function(res) {
				result.push(res)
				process.nextTick(function() {
					callInput() // call the next iteration
				})
			}
		});
	}
	callInput() // trigger the first iteration

}

module.exports = {
	name: "loop",
	flags: ["hint"],
	implementation: Loop
}
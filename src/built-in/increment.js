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

function Increment() {
	
}
Increment.prototype = new Expression()
Increment.prototype.execute = function() {
	var self = this
	if(!this.requireHint()) return;
	
	var value = this.getHintVariableValue()
	
	if(isNaN(value) || value === undefined || value === null) {
		this.setParentVar(this.getHintValue(), NaN)
		this.bypass()
	} else {
		// run the input...
		this.runInput(function(res) {
				if(isNaN(res) || res === undefined || res === null) {
					self.setParentVar(self.getHintValue(), NaN)
					self.bypass()
				} else {
					var res = value + res
					self.setParentVar(self.getHintValue(), res)
					self.bypass()
				}
			});
	}
}

module.exports = {
	name:"increment",
	flags: ["hint"],
	implementation:Increment
}
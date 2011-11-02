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

function IsNotEmpty() {

}
IsNotEmpty.prototype = new Expression()
IsNotEmpty.prototype.isNotEmptyCore = function(val) {
	var isEmpty = (val != undefined && val != null && val != '')
	this.setResult(isEmpty)
}
IsNotEmpty.prototype.execute = function() {
	var self = this
	
	if(this.hasHint()) {
		this.isNotEmptyCore(this.getHintVariableValue())
	} else {
		this.runInput({
			_resultCallback: function(res) {
				self.isNotEmptyCore(res)
			}
		})
	}
}
module.exports = {
	name:"isNotEmpty",
	flags: ["hint"],
	implementation:IsNotEmpty
}

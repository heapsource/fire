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
var extractComparableValues = require('../Comparable').extractComparableValues

function ConcatExpression() {

}
ConcatExpression.prototype = new Expression()
ConcatExpression.prototype.execute = function() {
	var self = this
	this.runInput(function(res) {
			var values = extractComparableValues(res)
			var len = values.length
			var result = null
			for(var i = 0;i < len; i++) {
				var val = values[i]
				if(result === null) {
					if(val !== undefined && val !== null) {
						// use the first not-null value as seed to concatenate the next values
						result = val
					} else {
						break
					}
				} else {
					if(result.concat) {
						result = result.concat(val)
					} else {
						// can't no longer concate values.
						break
					}
				}
			}
			self.end(result)
		});
}

module.exports = {
	name: "concat",
	implementation: ConcatExpression
}
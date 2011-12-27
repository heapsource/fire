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

var Expression = require('../Expressions').Expression

//
// Invokes the delegate in the hint path and returns the result. The input is ignored, null is suggested.
//
function Trigger() {

}
Trigger.prototype = new Expression();
Trigger.prototype.execute = function() {
  var hintValue = this.getHintVariableValue();
  if(typeof(hintValue) !== 'function') {
    // Is not a function, the delegate block was inlined by the compiler and it's the literal is already there.
    return this.end(hintValue);
  } else {
    // It's a function, we need to call it so we get an instance of the expression block.
    var delegateExpression = hintValue();
    delegateExpression.resultCallback = function(res, parent) {
      parent.end(res); // Return the result of the delegate.
    };
    // Execute the delegate
    delegateExpression.run(this);
  }
};

exports.name = 'trigger';
exports.implementation = Trigger;
exports.flags = ['hint'];

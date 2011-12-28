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

function Xunless() {

}
Xunless.prototype = new Expression();
Xunless.prototype.execute = function() {
  // run the input...
  this.runInput(function(res, parent) {
    if(!res) {
      return parent.end(undefined);
    }
    var met = parent.hasHint() ? parent.getHintVariableValue() : parent.getParentResult();
    if(!met) {
      // Return '#then' delegate result
      var thenDelegate = res['#then'];
      if(typeof(thenDelegate) === 'function') {
        var exp = thenDelegate();
        exp.resultCallback = function(dres, dparent) {
          dparent.end(dres);
        };
        exp.run(parent);
      } else {
        parent.end(thenDelegate);
      }
    } else {
      // Return '#else' delegate result
      var elseDelegate = res['#else'];
      if(typeof(elseDelegate) === 'function') {
        var exp = elseDelegate();
        exp.resultCallback = function(dres, dparent) {
          dparent.end(dres);
        };
        exp.run(parent);
      } else {
        parent.end(elseDelegate);
      }
    }
  });
};

exports.name = 'xunless';
exports.flags = ['hint'];
exports.implementation = Xunless;

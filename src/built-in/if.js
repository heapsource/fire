var Expression = require("../Expressions").Expression

function If() {

}
If.prototype = new Expression()
If.prototype.execute = function() {
	var self = this
	
	var met = this.hasHint() ? this.getHintValue() : this.getParentResult();
	
	if(met) {
		// run the input...
		this.runInput({
			_resultCallback: function(res) {
				// and return the values. any errors are bubbled up
				self._blockContext._resultCallback(res)
			}
		});
	} else {
		// Condition not met, return the parent result inmediately
		self.skip()
	}
}

module.exports = {
	name:"if",
	implementation:If
}
var priest = require('priest')

function ParsedMain() {
	
}
ParsedMain.prototype = new priest.Expression()
ParsedMain.prototype.execute = function() {
	this.setResult(process.parsedArgv.argv.cooked)
}
module.exports = {
	name: "Parsed.Argv",
	implementation: ParsedMain
}
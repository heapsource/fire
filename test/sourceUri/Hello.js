var fire = require('../../src/core.js')

function Hello(){};
Hello.prototype = new fire.Expression()

module.exports = {
	name:"Hello",
	implementation: Hello
}
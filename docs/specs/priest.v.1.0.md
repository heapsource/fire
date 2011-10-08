
## @input

When used inside some priest code, it executes the input of the root expression. Specially intended for custom expressions coded in priest lang.

Example:

    // My.Custom.Expression.json
	{
		"name": "My.Custom.Expression",
		"json": {
			"@return": {
				"@input": null
			}
		}
	}
    
    // consumer.json
	{
		"name": "consumer",
		"json": {
			"@return": {
				"@My.Custom.Expression": "This is the input of the custom expression and result of the whole program"
			}
		}
	}

Running it with command line tool:

	
	$ priest consumer.json
	"This is the input of the custom expression and result of the whole program"
    

## Variables Names

Variable names that you provide via hint to `@get` and `@set` can not contain any punctuation marks including _ $ or any other special character.

## Dealing with JSON Keys with the same name

JSON keys must be unique, if there is a repeated key the parser will ignore it.

Example, the following JsonCode is a valid JSON Document but only one @set expression will reach the JSONCode compiler:

    {
		"@set(x)": 23,
		"@set(x)": 25
        "@return": {
			"@get(x)": null
		}
    }

The result will be usually 23 but since this is an error of the JSON Document the JSON parser is free to take any decision. TO solve this situation JSONCode compiler will ignore any whitespace before the `@` symbol, so for JSON you actually have different keys but for JSONCode compiler is just a repeated expression.

Example:

    {
		"@set(x)": 23,
		" @set(x)": 25
        "@return": {
			"@get(x)": null
		}
    }

You can place as many white-spaces as you want.

## Error Handling


### Paths

Paths are used in expressions like "@get" to retrieve any nested value inside a variable including the variable itself.

Paths can only have two type of access: property names or indexes. You use property names to access members of some object including the root variable.

The following path retrieves a variable called "name":

     name

The following path retrieves the value of the *property* name inside the 'person' variable:

     person.name

The following path retrieves the *index* 2 of the 'names' variable, which turns to be an array:

     names[2]

The following path retrieves the name of first person in the list:

     persons[0]

The following path retrieves the tags of the first post:

     blog.posts[0].tags

## Manifest

Manifest specifies information for the runtime work properly, like what modules to load.

### Manifest Modules

Specifies a list of modules inside "node_modules" to gather expressions.

    
	{
		"modules": [
			"expressionModule1",
			"expressionModule2"
		]
	}
    

Loading manifest:

    
	var runtime = new Runtime()
	runtime.loadFromManifestFile("priest.manifest.json")

### Environments & Configurations

Environment are a set of configurations or requirements for each stage of the product, like "development", "staging", "production" and priest follows the standard node.js environment variable NODE_ENV to act accordingly. Each runtime has a environment name to know which configurations must be loaded.

Example:

	var runtime = new Runtime()
	console.log(runtime.environmentName) // defaults to "development" if NODE_ENV is not present.
    

Manifest can contain configurations for each environment as follows:

	{
		"modules": [
			"expressionModule1",
			"expressionModule2"
		],
		"environments": {
			"production": {
				"expressionModule1": {
					"config1": "config value for expressionModule1",
					"config2": 200
				},
				"expressionModule2": {
					"config1": "value2",
					"config2": 200
				}
			}
		}
	}

## Custom Modules

priest modules are regular Node.js modules inside node_modules which main script exports a list of expression definitions.

### Example Custom Module

*main.js*
    
	var Expression = require("priest").Expression
	function exampleExpression() {
		
	}
	exampleExpression.prototype = new Expression()
	exampleExpression.prototype.execute = function() {
		this._blockContext._resultCallback("Hello World");
	}

	module.exports.priestExpressions = [{
		name: "exampleExpression",
		implementation: exampleExpression
	}]
    
*package.json*
	
	{
		"name" : "priest-exampleExpression",
  		"main" : "./main.js" 
    }

These two files has to be inside the node_modules directory and can be referenced from the manifest file. When a Runtime is loaded from a manifest using loadFromManifestFile all the modules are automatically loaded.

### Initialization

Some modules may require some configuration or initialize something in the environment or the runtime, for that pouposes there is a callback called priestModuleInit that we can export in the module.

    
	module.exports.priestModuleInit = function(runtime) {
		//Here you can do do some initialization stuff...
		//... like checking some configuration.
	}
    
## Credits
**Author**: Johan Hernandez. *johan@firebase.co*

## Revisions

* Sep 23, 2011: First Submission
* Sep 28, 2011: Paths
* Sep 29, 2011: Manifest Modules, Environments, Configurations, Custom Modules, Conditionals, @if, @unless, @equals, @notEquals, @negate, @increment, @decrement, @sum, @subtract, @divide, @modulus, @undefined, @NaN, @concat
* Sep 30, 2011: Update @set behavior. It returns the block result all the time, it no longer returns the input value. Strictness comparison for @equals and @notEquals.
#priest.js Compiler 1.0
Specification for Priest compiler.
***

priest.js is basically a set of special expressions embedded as 'keys' with the intention to manipulate and transform a JSON documents in memory, which turns to be a simple manipulation of javascript objects.

## Example 1:

    {
        "@return": 25
    }

Result:

    25

## Example 1.2:

    {
		"@set(variable1)": 25
        "@return": {
			"@get(variable1)": null
		}
    }

Result:

    20

## Example 2:

    {
	    "name": "Johan",
		"age": {
			"@return": 25
		}
    }

Result:

    {
	    "name": "Johan",
		"age": 25
    }

## Example 3:

    {
	    "name": "Johan",
		"age": 25,
		"fibonacci": {
			"@set(i)": 1,
			"@return": {
				"@while(i < 10)": {
					"@set(i)": {
						"@sum": [
							"@get(i)":null,
							"@literal": 1
						]
					}
					@"return": {
						"@get(i)": null
					}
				}
			}
		}
    }

Result:

    {
	    "name": "Johan",
		"age": 25,
		"fibonacci":[0,1,1,2,3,5,8,13,21]
    }

## Example 3.1:

    {
	    "name": "Johan",
		"age": 25,
		"fibonacci": {
			"@set(i)": 1,
			"@loop": {
				"@set(i)": {
					"@sum": [
						{
						"@get(i)":null},
						{"@literal": 1}
					]
				},
				"@if(i < 21)": {
					"@break": null
				},
				"@return": {
					"@get(i)": null
				}
			}
			
		}
    }

Result:

    {
	    "name": "Johan",
		"age": 25,
		"fibonacci":[0,1,1,2,3,5,8,13,21]
    }

## Example 4:

    {
		"@Data.Create": {
			"collection": "contacts",
			"item": {
				"email": "some@example.com",
				"name": "John Doe",
				"home": true
			}
		},
	    "@Data.FindOne": {
			"collection": "contacts",
			"condition": {
				"home": "true"
			}
		},
		"@return": {
			"isAtHome":{
				"@bind(item.home)": null
			},
			"contact": {
				"@if(item == null)": {
					"@return": null
				},
				"@else": {
					"email": {
						"@bind(item.email)": null
					},
					"name": {
						"@bind(item.name)": null
					}
				}
			}
		}
    }

Result:

    {
	    "isAtHome": true,
		"contact": {
			"email": "some@example.com",
			"name": "John Doe"
		}
    }

# Expressions

In JSONCode any object can be converted to a Expression.

All the expressions begin with the at symbol `@`.

Example:

    {
	    "@return":50
    }

Result

    50

## Parts

Any expression has at least 3 parts.

* Key: Name of the expression.
* hint: (Optional) A random string that can be used as a simple hint for the expression to execute.
* Input: (Optional) Object used as arguments of the expression.

In the following example `set` is the name of the expression, `variable1` is the hint and `2` is the input.

    {
	    "@set(variable1)": 2
    }

The syntax would be like this:

    {
	    "@<expression-name>(<hint>)": <expression>
    }

## Expression blocks

When a expression-key is present in a object definition that object becomes an expression-block and no JSON regular keys are allowed anymore.

The following expression-block is illegal, it contains both expressions and and regular JSON keys in the same object definition:

    {
	    "@set(name)": "Name",
		"regularJSONNumber": 2000 // This is illegal, @set already converted this object into a expression-block.
    }

The code should be formatted as follows:

    {
	    "@set(name)": "Name",
		"@return": {
			"regularJSONNumber": 2000
		}
    }

And the result would be:

    {
        "regularJSONNumber": 2000	
    }

Only the last expression of the block is actually took in count as the result of the whole block.

Example:
    
    {
	    "@return": 2,
	    "@return": 5,
    }

The result:

    5

## Input Processing

Since the input can be any JSON value it can also become another JSONCode expression.

In the following example you can see how the input of the high level `@return` is actually the result of nested `@return` Example:

    {
	    "@return": {
	    	"@return": {
				"point": {
					"x": 22.4,
					"y": 45.8
				}
			}
		}
    }

The result:

    {
		"point": {
			"x": 22.4,
			"y": 45.8
		}
	}

Depending of how the expression works the input can be ignored or processed. Conditional expressions like `@if` and `@else` uses this technique.

Example:

    {
		"@set(chuckNorrisIsHere)": false,
		"@if(chuckNorrisIsHere)": "Chuck is here, You are dead!",
		"@else": "It's never here!, you are safe!"
    }

The result is:

    "It's never here!, you are safe!"

## Built-in expressions

### @return
Returns the input expression as a result. Typically is the last expression in a block.

### @get
Returns the variable path in the hint. If no hint is given it returns the input.

### @set
Sets the input as the value of the variable name provided in the hint. If no hint is given it ignores the hint. Always returns the same value in the block.

### @if
Conditional expression, takes a hint as a JS expression and executes and return the result of the input if the condition is met.  If there is no hint, it uses `lastStatusFlag` to determinate if it should return the input or not.

### @else
Conditional expression, takes a hint as a JS expression and executes and return the result of the input if the condition IS NOT MET. If there is no hint, it uses `lastStatusFlag` to determinate if it should return the input or not.

## Loops

Loops are repetitive expressions that process the input many times return an array of results.

### @loop
Process the input forever or until it founds a loop control expression. Returns an array with the results of every input processing.

### @while
Process the input as long as the expression given in the hint is true or until it founds a loop control statement statement. Returns an array with the results of every input processing.

### @each
Takes a hint as a variable name or uses the last result of the expression-block and Process the input per item found in the given array or object. Returns an array with the results of every input processing (even if the input is undefined or null).

#### @break

Immediately stops the execution of the current or any other iteration. Any result in the current iteration will *NOT* be added to the loop.

### @continue

Immediately stops the execution of the current iteration. Any result in the current iteration will be added to the loop.

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

priest uses expressions to catch and respond to errors.

### @try

Catches any error originated in the input and returns it, otherwise, it returns the value from the input so other expressions like `@catch` can work properly.

### @catch

Returns the input as a result if any errors was catch by @try. Otherwise it returns the current value in the expression block. Catche clears the last error.

### @returnError

Returns the error in the current expression block.

### @resetError

Clears the last error in the expression block.

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


### Comparable Values and Operands

Due the flexibility of the Javascript object-system, priest behaves in certain ways when a conditional expression needs to compare the values of a given input(mostly known as operand). Internally priest will try to convert anything to an array of comparable values before execute any comparison and it follows some simple rules:

* the comparable values of *any array* it's the array itself
* the comparable values of *null* is an empty array
* the comparable values of *undefined* is an empty array
* the comparable values of *an empty object* is an empty array
* the comparable values of *any object* are all the values of the first-level properties
* the comparable values of *any boolean* is an empty array
* the comparable values of *any string* are all the chars in the String

## Conditional Expressions

### @if

Executes and returns the input if the operand is evaluated as true(following the Javascript evaluation rules for booleans), otherwise it returns the result in the block. The operand can be a path in the hint or the previous result.

### @unless

Executes and returns the input if the operand is evaluated as false(following the Javascript evaluation rules for booleans). The operand can be a variable name in the hint or the previous result.

### @equals

Returns true if all the comparable values are equal, otherwise returns false. A hint with 'strict' can force the expression to compare types too, by default this is turned off. If operand doesn't have at least two comparable values it will return undefined. Ignores any input.


#### Non-Strict Sample:

    {
		"@equals": ['1',1] // Returns true
    }

#### Strict Sample:

    {
		"@equals(strict)": ['1',1] // Returns false
    }

### @notEquals

Returns true if all the comparable values are not equal, otherwise returns false. A hint with 'strict' can force the expression to compare types too, by default this is turned off. If operand doesn't have at least two comparable values it will return undefined. Ignores any input.


#### Non-Strict Sample:

    {
		"@notEquals": ['1',1] // Returns false
    }

#### Strict Sample:

    {
		"@notEquals(strict)": ['1',1] // Returns true
    }

### @or

### @and

### @size

### @greater

### @less

### @greaterEquals

### @lessEquals

### @negate

Negates the operand(following the Javascript evaluation rules for booleans) and returns the opposite. Ignores any input.

## Arithmetic Expressions

### @increment

Increments the operant by the value given in the input. If the operant or the input are not numbers it will return NaN. The operand can be a variable name in the hint or the previous result.

### @decrement

Decrement the operant by the value given in the input. If the operant or the input are not numbers it will return NaN. The operand can be a variable name in the hint or the previous result.

### @sum

Takes the items of an array or the values of the first-level keys of an object in the input and returns the sum. If some value is not a number it will return NaN. Ignores the hint.

### @subtract

Takes the items of an array or the values of the first-level keys of an object in the input and returns the subtraction. If some value is not a number it will return NaN. Ignores the hint.

### @divide

Takes the items of an array or the values of the first-level keys of an object in the input and returns the division. If some value is not a number or there is not at least two numbers to perform the division it will return NaN. Ignores the hint.

### @modulus

Takes the items of an array or the values of the first-level keys of an object in the input and returns the reminder of the division _for the last two values_. If some value is not a number or there is not at least two numbers to perform the division it will return NaN. Ignores the hint.

## Literal Values

### @undefined

Returns an undefined value. The undefined value can not be represented in JSON, but it has a meaning for priest and Javascript. Ignores any  input.

### @NaN

Returns NaN value. Ignores any input.

## Utility Expressions


### @concat

Takes the items of an array or the values of the first-level keys of an object in the input and returns the concatenations of all the strings. Ignores the hint.

### @uppercase

Returns the input as an uppercase string.

### @lowercase

Returns the input as a lowercase string.

## Compiler & Runtime Errors Table
    Error Code			Message
	JS1001				Key KEY_NAME was found in a expression block. Regular JSON keys and expression keys can not be mixed at the same level of the document.
	JS1002				Expression EXPRESSION_NAME is not registered or was not loaded.


### Replacement tokens for the Error Messages.

**KEY_NAME** Name of the key or property involved in the error.

**EXPRESSION_NAME** is the name of the expression involved in the error.

## Credits
**Author**: Johan Hernandez. *johan@firebase.co*

## Revisions

* Sep 23, 2011: First Submission
* Sep 28, 2011: Paths
* Sep 29, 2011: Manifest Modules, Environments, Configurations, Custom Modules, Conditionals, @if, @unless, @equals, @notEquals, @negate, @increment, @decrement, @sum, @subtract, @divide, @modulus, @undefined, @NaN, @concat
* Sep 30, 2011: Update @set behavior. It returns the block result all the time, it no longer returns the input value. Strictness comparison for @equals and @notEquals.
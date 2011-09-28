#priest.js Compiler 1.0
Specification for JSONCode compiler.
***

priest.js is basically a set of special expressions embedded as 'keys' with the intention to manipulate and transform the document.

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
Sets the input as the value of the variable name provided in the hint. If no hint is given it process the input without setting it to any variable. Always returns the input.

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
Takes a hint as a variable name or uses the last result of the expression-block and Process the input per item found in the given array or object. Returns an array with the results of every input processing.

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
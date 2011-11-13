# fire.js

fire.js is an experimental Framework that uses JSON structures to simplify the definition of complex behaviors from asynchronous sources in Node.js.

The goal is to reuse "building blocks" called "expressions" so you can define behavior on the server side without dealing with the infamous *Javascript asynchronous spaghetti code*.

The Runtime takes a JSON document and compiles it to asynchronous Javascript:

    JSON Document -> Deserialization -> Compilation to Javascript -> Execution

### Example

Example JSON Structure using a [MongoDB](http://www.mongodb.org/) database:

    {
	    "enabledEmails": {
			"@Mongo.Find(users)": {
				"enabled": true
			},
			"@each": {
				"@get(CurrentItem.email)": null
			}
		},
		"disabledEmails": {
			"@Mongo.Find(users)": {
				"enabled": false
			},
			"@each": {
				"@get(CurrentItem.email)": null
			}
		}
    }

The result will be:

	{
		"enabledEmails": [...],
		"disabledEmails": [...]
	}

### Is it a replacement for Javascript in Node.js?

Definitely no. In fact, fire.js is itself written in Javascript, you can define your own expressions in Javascript and the runtime will compile all the JSON source code to Javascript, Node.JS will do the rest.
	
## More Information

+ [Tutorials](https://github.com/firejs/firejs/wiki/Tutorials)

+ [Wiki](https://github.com/firejs/firejs/wiki)


## Cloning the Repository

    git clone https://github.com/firejs/firejs.git


### Tests

    make run-tests

### Contributors

* Johan (author). Email: *johan@firebase.co*

## MIT License

Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
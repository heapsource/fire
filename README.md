# fire.js
[![Build Status](https://secure.travis-ci.org/firejs/fire.png)](http://travis-ci.org/firejs/fire)

Fire.js is an experimental framework that aims to reduce the amount of javascript code and callbacks when developing in Node.js by the orchestration of tiny building blocks called Expressions defined in JSON documents.

### Example

Example JSON app using a [MongoDB](http://www.mongodb.org/) database and the [MongoDB expressions](https://github.com/firebaseco/mongodb-expressions):

`MongoApp.fjson`

    {
		"name": "MongoApp.Main",
		"json": {
		    "enabledEmails": {
				"@Mongo.Find(users)": {
					"conditions": {
						"enabled": true	
					}
				},
				"@each": {
					"@get(CurrentItem.email)": null
				}
			},
			"disabledEmails": {
				"@Mongo.Find(users)": {
					"conditions": {
						"enabled": false
					}
				},
				"@each": {
					"@get(CurrentItem.email)": null
				}
			}
	    }
	}

The result will be:

	{
		"enabledEmails": ["email1@example.com", "email2@example.com", "email3@example.com"],
		"disabledEmails": ["email4@example.com", "email5@example.com", "email6@example.com"]
	}

## Installation

The easiest way to install fire.js is using the awesome Node Package Manager.

    npm install -g fire

The `firejs` command line utility should be ready to run your scripts.

## Learn more

+ [Tutorials](https://github.com/firejs/fire/wiki/Tutorials)

+ [Wiki](https://github.com/firejs/fire/wiki)

+ [Official Blog](http://firejs.firebase.co)

+ [Fire.js IDE](https://github.com/firejs/fire-ide)

## Supported Node Versions

* 0.4.5 and above
* 0.5
* 0.6

## Cloning the Repository

    git clone https://github.com/firejs/fire.git


## Tests

    npm test

## Contributors

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
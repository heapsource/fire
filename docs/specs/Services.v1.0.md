#Priest Services Specification 1.0
Specification for Services artifacts.
***

Services works as a set of exposed RESTful endpoints in express.js. 

## Defining an Endpoint

A *endpoint* defines a reachable operation with URI and HTTP method. Endpoints files uses *.endpoint.json* file extensions.

The following attributes are part of an endpoint definition.

### route(String)
*Required:* String that specifies the URI in which the operation will be served.  The URI can contain placeholders that can be retrieved when the operation is being served.

Example: The following route defines a possible URI to serve operations on a specific blog:

    {
		...
		route: "/blog/:blog_name/",
		...
	}

### method(String)
*Required:* String that specifies which HTTP method will be accepted to reach this operation.

Example 1: The following endpoint serves information about a blog:

    {
		method: "GET",
		route: "/blog/:blog_name/",
		...
	}
	
Example 2: The following endpoint allows to Create a new blog:

    {
		method: "POST",
		route: "/blog",
		...
	}

Example 3: The following endpoint allows to update a blog information:

    {
		method: "PUT",
		route: "/blog/:blog_name/",
		...
	}

**Note: The combination of route and method must be unique in the Priest Universe.**

//////////////////////////////////////
TODO:

New Concepts:

* ContextRequest: Object that is used as a common space to share info of the current request. Is completely separated from express.js request object to avoid conflicts.
* Endpoint filters(acts over the endpoint itself instead of the input message and set stuff in the context of the request)
* 

//////////////////////////////////////

### in(Hash)
*Optional:* Define how the incoming message should be processed.

#### message(String)
*Optional:* String with the name of the message.

#### routeBindings(Array)
*Optional:* Array of hashes where each hash specifies how the route placeholders fills properties of the incoming message.

Example:

	...
		routeBindings: [
					{
						from: ':blog_name', //Name of the Placeholder in the route.
						to: 'blogName', //Name of the property in the incoming message.
						converters: {
							// A list of converters for this binding.
					}
				]
	...

Attributes of this hash:

* from
* to
* converters

##### from(String)
*Required:* name of the route placeholder to take the value from.

##### to(String)
*Required:* name of the property to be set in the incoming message.

##### converters(String)
*Optional:* A list of hashes describing what converters execute on the value taken from the route and to be assigned in the incoming message.

Example:

	...
		converters: [
			{
				name: "System.Test.StringToUpperCase"
			}, 
			{
				name: "System.Security.PasswordToMD5"
			}
		]
	...
	
Attributes of this hash:

* name
* options

###### name(String)
*Required:* String with the name of the converter to execute.

###### options(Hash)
*Optional:* Hash with all the options that conforms the message required by the converter.

Example:

	...
		converters: [, 
			{
				name: "System.Security.PasswordToMD5",
				options: {
					saltConfigZone: 'passwords'
				}
			}
		]
	...

#### filters(Array)
*Optional:* Array of hashes describing the filters to execute in the incoming message.

Attributes of each hash:

* property
* name
* options

Example:

	...
		filters: [
				{
					property: "content", // name of the property in the incoming message.
					name:"System.NonEmpty", // name of the filter
					options: {
						// Some options to execute the filter.
					}
				}
			]
	...

##### property(String)
*Required:* name of the property in the incoming message in which to apply the filter.

##### name(String)
*Required:* name of filter we want to execute.

##### options(Hash)
*Optional:* A hash with all the options to execute in the filter.

### result(String)
*Optional:* String with the name of the message to send as a result.

### as(Array)
*Required:* Implementation of the Endpoint, define as set of actions and payloads to execute.

Each action takes a name and a payload to execute.

Example:

	{
		action: 'transform', // transform is smart enough to transform arrays or single objects.
		payload: {
			name: 'My.Blog.PostFromData'
		}
	}


Full example:

	// blog.posts.endpoint.json
	{
		"method": "GET",
		"route": "/blog/:blog_name/posts",
		"in": {
				"message": "My.Blog.PostsQuery",
				"routeBindings": [
					{
						"from": ":blog_name",
						"to": "blogName",
						"converters": [
							// Put some converters here
						]
				],
				"filters": [
					{
						"property": "content",
						"name": "System.NonEmpty",
					}
				]
			}
		"result": "My.Blog.PostsResult"
		"as": [
			{
				"action": "System.Data.Find",
				"payload": {
					"collection": "Posts",
					"condition": {
						"blog_name": {
								"$inputPath": "blogName"
							}
						}
					}
				}
			},
			{
				"action": "transform", // transform is smart enough to transform arrays or a single object.
				"payload": {
					"name": "My.Blog.PostFromData"
				}
			},
			{
				"action": "set",
				"payload": {
					"target": {
						"$outputPath": "posts"
					}
				}
			}
		]
	}

### Errors Table
    Error Code			Message
	PSE1				Endpoint ENDPOINT_NAME is defined multiple times in the Universe.
	PSE10002			Endpoint in SOURCE_NAME defines an endpoint with no HTTP method.
	PSE10003			Endpoint in SOURCE_NAME defines an endpoint with no Route.
	PSE10004			Endpoint in SOURCE_NAME has an implementation issue, ERROR
	PSE5				Endpoint ENDPOINT_NAME uses the converter CONVERTER_NAME but the options provided are not compliant with the message expected.
	PSE6				Endpoint ENDPOINT_NAME action has an empty name.
	PSE7				Endpoint ENDPOINT_NAME action ACTION was not recognized as a valid action.

### Replacement tokens for the Error Messages.

**PROP_NAME** Name of the property involved in the error.

**CONVERTER_NAME** is the name of the converter involved in the error.

**SOURCE_NAME** name of the definition source. Usually is the name of the *.endpoint.json* ile where the error occurred.

**MESSAGE_NAME** is the name of the message involved in the error.

## Credits
**Author**: Johan Hernandez. *johan@firebase.co*

**Date:** Sept 22, 2011
#Priest Messaging Specification: A full guide to .pmd(Priest Message Definition) Files Format 1.0
Specification for Structures of incoming and out-coming messages of REST operations.
***

## How JSON gets involved
*.pmd.js* files are plain JSON files that describes the structure of a Priest Message. To make the editing of those files very convenient for everyone the official file system extension is **pmd.js**.

## Structure

The definition is basically the name of the message, properties and base messages.

### Attributes

#### name(String)
*Required:* String that describes the name of the message. This is the only attribute required to define a structure.

Example: the following pmd file describes the input for a login operation of an app called "HelloWorld":

    {
		name:"HelloWorld.Accounts.LoginCredentials",
    }

**Note: Message names are case-insensitive and must be unique in the Priest Messaging Universe**

#### properties(Hash)
*Optional:* Hash where the key is the name of the property and the value is a string with the name of the datatype or structure.

Example: the following pmd file describes the input for a login operation of an app called "HelloWorld":

    {
		name:"HelloWorld.Accounts.LoginCredentials",
		properties: {
			email: "String",
			password: "String"
		}
    }

**Note: Property names are case-insensitive and must be unique in the same message definition file**

#### bases(Array)
*Optional* Array with the name of all base messages.

    {
		name:"HelloWorld.Accounts.RememberEnabledLoginCredentials",
		base: ["HelloWorld.Accounts.LoginCredentials"]
    }

This feature is explained with more details further in this document in the Inheritance section.

## Data Types

Priest Messaging supports most of all built-in JSON data types and other custom messages as well.

### Supported JSON Built-in types:

* Number: double precision floating-point format. Supports null.
* String: double-quoted Unicode, with backslash escaping. Supports null.
* Boolean: true or false. Supports null.
* Date: Date values. Supports null.
* Null: Accepts any data type, from a build type to compound messages and null itself.

### Unsupported JSON Built-in types:

* Error
* Math
* Regular Expression
* Function

### Compound messages

Other priest messages can be used as datatypes for other messages properties as follows:

    // Canvas.Point.pmd.js
    {
		name:"Canvas.Point",
		properties: {
			x: "Number",
			y: "Number"
		}
    }

    // Canvas.Line.pmd.js
    {
		name:"Canvas.Line",
		properties: {
			point1: "Canvas.Point",
			point2: "Canvas.Point"
		}
    }

Ass you see Canvas.Line uses two properties based in Canvas.Point. This is known as Compound messages.

### Lists

List are the equivalent to Arrays in JSON but typed to use a specific type.

Example 1: The following is an input message of an app called "MathMaster" that holds a list of numbers to sum.

    // MathMaster.Aggregate.Sum.pmd.js
    {
		name:"MathMaster.Aggregate.Sum",
		properties: {
			aBunchOfNumbers: ["Number"]
		}
    }

Example 2: The following is an output message of an app called "ContactsMaster" and holds a list of contacts.

    // ContactsMaster.ContactsResult.pmd.js
    {
		name:"ContactsMaster.ContactsResult",
		properties: {
			contacts: ["ContactsMaster.Contact"]
		}
    }
    
    // ContactsMaster.Contact.pmd.js
    {
		name:"ContactsMaster.Contact",
		properties: {
			firstName: "String",
			lastName: "String",
			email: "String"
		}
    }

## Inheritance

Custom messages can inherit the properties of other messages. When the message definition is loaded into the Messaging Universe the runtime copy the properties of the base messages in the inheriting message.

    // App.Generic.LangEnabled.pmd.js
    {
		name:"App.Generic.CreateWithLang",
		properties: {
			lang: "String"
		}
    }
    
    // App.Generic.NameEnabled.pmd.js
    {
		name:"App.Generic.CreateWithName",
		properties: {
			name: "String"
		}
    }
    
    // App.Generic.IdEnabled.pmd.js
    {
		name:"App.Generic.CreateWithName",
		properties: {
			id: "String"
		}
    }
    
    // App.Generic.LangNameIdEnabled.pmd.js
    {
		name:"App.Generic.LangNameIdEnabled",
		bases: ["App.Generic.LangEnabled", "App.Generic.NameEnabled", "App.Generic.IdEnabled"]
		properties: {
			/* 	lang: "String", // Don't need to, it's already defined by "App.Generic.LangEnabled"
				name: "String", // Don't need to, it's already defined by "App.Generic.NameEnabled"
				id: "String" 	// Don't need to, it's already defined by "App.Generic.IdEnabled"
			*/
		}
    }

Base messages can be inspected at runtime depending on the implementation.

### Conflicts in inherited properties.

Priest Messaging defines how to solve conflicts with inheritance using the following table of rules:

* Same field name in multiple bases with same data type: It's ok.
* Same field name in multiple bases with different data type: Error code "PMD1"

## Naming

### Messages

As you noticed, native data types like "String" and "Number" don't use namespaces. However, for custom messages of your app or packages that you want to distribute is strongly advised to use namespaces in the form of "App.Feature.Operation" and "App.Feature.OperationResult" each part in *PascalCase* and without punctuation marks.

Examples of **Good** input and output messages names:

* YourApp.Accounts.ForgotPassword
* YourApp.Accounts.ForgotPasswordResult
* YourApp.Contacts.QueryContacts
* YourApp.Contacts.QueryContactsResult
* YourApp.Contacts.Contact
* YourApp.Contacts.Create
* YourApp.Contacts.CreateResult

Examples of **Bad** input and output messages names:

* ForgotPassword
* ForgotPasswordResult
* QueryContacts
* QueryContactsResult
* Contact
* StringBased
* NumberBased

### Properties

Properties should use *camelCase* and should not use periods or any punctuation marks.

Examples of **Good** property names:

* firstName
* email
* price
* monthOfYear

Examples of **Bad** property names:

* FirstName
* Email
* Price
* MonthOfYear
* $
* Security.Lang

The last two properties listed will cause a PMD3 error.

## The Priest Universe and Errors
A universe is a collection of Priest Messages Definitions loaded at runtime to be used in the app.

When loading the message definitions out of the .pmd.json files the runtime some errors can occurs.

### Errors Table
    Error Code			Message
    PMD1				Property PROP_NAME data type in message MESSAGE_NAME is conflicting with another property of a inherited property.
    PMD2				Property PROP_NAME in message MESSAGE_NAME must be unique.
	PMD3				Property PROP_NAME in message MESSAGE_NAME contains illegal characters.
	PMD4				MESSAGE_NAME contains illegal characters.
	PMD5				MESSAGE_NAME is defined multiple times in the Universe.
	PMD6				SOURCE_NAME defines a message with no name.
	PMD7				SOURCE_NAME does not conforms the JSON format.

### Replacement tokens for the Error Messages.
**PROP_NAME** Name of the property involved in the error.

**MESSAGE_NAME** is the name of the message involved in the error.

**SOURCE_NAME** name of the definition source. Usually is the name of the *.pmd.js* file where the error occurred.

## Credits
**Author**: Johan Hernandez. *johan@firebase.co*

**Date:** Sept 21, 2011
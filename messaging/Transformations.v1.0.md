#Priest Transformation Specification 1.0
Specification for Transformations artifacts between Messages.
***

Transformations works copying the values from the source message into properties in the target message. Sometimes we just need to copy the value, other times we need to use a converter to accomplish the goal.

## Converters

A *converter* defines the copy-behavior between the values of two messages. Converters uses *.pcd.js* file extensions.

### Attributes

#### name(String)
*Required:* String that describes the name of the converter.

**Note: Converter names are case-insensitive and must be unique in the Priest Messaging Universe**

#### operation(function)
*Required:* Function that does the conversion logic. Receives a function as argument that should be called, always!

Example: A stripped version of an uppercase string converter (It's an example, don't use for production apps):

	// System.Test.StringToUpperCase.pcd.js
    {
		name: "System.Test.StringToUpperCase"
		operation: function(next) 
		{
			this.result = this.input.toUpperCase();
			next();  // Call it no matter what.
		}
    }

Even when the converters are meant to work with a single value and result(E.g "this.input" and "this.result") , it can also have access to the source and target messages.

The given function is bound to an object like this:

    {
		input(Object), // The original value.
		result(Object), // The converted value.
		source(Object), // The source message.
		target(Object) // The message being converted.
		context(Object)  // The priest environment context.
    }

#### options(String)
*Optional*: String with the name of the message to accept as options.

Converter can take options to behave slightly different between transformations.

Example: The following converter supposedly Creates MD5 Hashes Passwords from Strings and it takes options to specify the salt or the source of the salt.

	// System.Security.PasswordToMD5Options.pmd.js
    {
		name:"System.Security.PasswordToMD5Options",
		properties: {
			salt: "String",
			saltConfigZone: "String"
		}
    }
	// System.Security.PasswordToMD5.ptd.js
    {
		name: "System.Security.PasswordToMD5"
		options: "System.Security.PasswordToMD5Options"
		operation: function(next) 
		{
			var salt = this.options.salt;
			var saltConfigZoneName = this.options.saltConfigZone;
			// Generate the MD5 using the Salt and set it to the target message.
			next();  // Call it no matter what.
		}
    }

As you see, inside the callback we can access the provided options as "this.options".

## Transformation

A transformation is the orchestration of multiple converters between two messages. Transformations uses *.pdt.js* file extensions.

### Attributes

#### name(String)
*Required:* String that describes the name of the transformation.

**Note: Transformation names are case-insensitive and must be unique in the Priest Messaging Universe**

#### from(String)
*Required:* String that describes the name of the message to be used as source of the transformation.

#### to(String)
*Required:* String that describes the name of the message to be used as target of the transformation.

#### operation(function)
*Optional:* A function to call when some custom operations are required to be executed. Receives a function as argument that should be called, always!

Example:
   	
    // App.Accounts.SignupToAccount.ptd.js
	{
		from: "App.Accounts.Signup",
		to: "App.Data.Account",
		operation: function(next) {
				//use this.source to access the "from" message.
				//use this.targety to access the "to" message.
				next(); // Call it no matter what.
		}
	}

The given function is bound to an object like this:

    {
		source(Object), // The source message.
		target(Object) // The message being converted.
		context(Object)  // The priest environment context.
    }

#### as(Array)
*Optional:* Array of Hashes with all the Copy operation to execute as part of the transformation.

The following attributes are part of each hash:

##### from(String)
*Required:* String with the name of the property to copy the value from the source message.

##### to(String)
*Required:* String with the name of the property to set the value into target message.

Example:

    // App.Accounts.SignupToAccount.ptd.js
	{
		from: "App.Accounts.Signup",
		to: "App.Data.Account",
		as: [,
			{
				from: "email",
				to: "email"
			},
			{
				from: "password",
				to: "password"
			}
		]
	}

#### Copy Converters(Hash)
*Optional:* Each copy operation can optionally contain an array of hashes that specifies what converters should be used between the copy and the assignment of the value.

##### name(String)
*Required:* String with the name of the converter to execute.

##### options(Hash)
*Optional:* Hash with all the options that conforms the message required by the converter.

Example:

    // App.Accounts.SignupToAccount.ptd.js
	{
		from: "App.Accounts.Signup"
		to: "App.Data.Account",
		as: [
			{
				from: "email",
				to: "email"
			},
			{
				from: "password",
				to: "password",
				converters: [
				{
					name: "System.Test.StringToUpperCase"
				}, 
				{
					name: "System.Security.PasswordToMD5",
					options: {
						saltConfigZone: 'passwords'
					}
				}]
			}
		]
	}

### Errors Table
    Error Code			Message
    PTE1				Converter CONVERTER_NAME is missing the operation to execute.
    PTE2				Converter CONVERTER_NAME is missing name.
    PTE3				Name of converter CONVERTER_NAME in source SOURCE_NAME contains illegal characters.
    PTE4				SOURCE_NAME defines a converter with no name.
	PTE5				Converter CONVERTER_NAME is defined multiple times in the Universe.
    PTE7				Transformation TRANSFORMATION_NAME is missing name.
    PTE8				Name of transformation TRANSFORMATION_NAME in source SOURCE_NAME contains illegal characters.
    PTE9				SOURCE_NAME defines a transformation with no name.
	PTE10				Transformation TRANSFORMATION_NAME is defined multiple times in the Universe.
	PTE11				Transformation TRANSFORMATION_NAME is missing the 'from' attribute.
	PTE12				Transformation TRANSFORMATION_NAME is missing the 'to' attribute.
	PTE13				Transformation TRANSFORMATION_NAME defines a copy from PROP_NAME but the property was not found the source message MESSAGE_NAME.
	PTD14				Transformation TRANSFORMATION_NAME defines a copy to PROP_NAME but the property was not found the target message MESSAGE_NAME.
	PTD15				Transformation TRANSFORMATION_NAME uses the converter CONVERTER_NAME but the options provided are not compliant with the message expected.

### Replacement tokens for the Error Messages.
**PROP_NAME** Name of the property involved in the error.

**CONVERTER_NAME** is the name of the converter involved in the error.

**TRANSFORMATION_NAME** is the name of the transformation involved in the error.

**SOURCE_NAME** name of the definition source. Usually is the name of the *.ptd.js* or *.pcd.js* file where the error occurred.

**MESSAGE_NAME** is the name of the message involved in the error.

## Credits
**Author**: Johan Hernandez. *johan@firebase.co*

**Date:** Sept 21, 2011
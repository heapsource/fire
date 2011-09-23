#Priest Universe Specification 1.0
Specification for Universe
***

Universe is the core of priest, it loads the app and configures express.js to serve all the services.

## Initializing a basic Universe in express.js

    var priest = require('priest')
	var universe = new priest.Universe({
		name: "reeeactr"
		expressApp: app,
		baseDir: "universe"
	}); // Loads a Universe
	universe.bigBang();

## Directory Structure
priest requires a very strict set of directories under the baseDir to work properly.

    $BASE_DIR/services
	$BASE_DIR/collections
	$BASE_DIR/messages
	
If one of these directories is missing, the boot will fail with PUE10007 errors.

### Errors Table
    Error Code			Message
    PUE10001			Universe options are missing
    PUE10002			Universe name option is missing or is invalid
	PUE10003			Universe expressApp option is missing
	PUE10004			Universe baseDir option is missing
	PUE10005			Universe baseDir does not exists or can not be accessed. The error was ERROR
	PUE10006			Universe baseDir with path PATH is not a directory.
	PUE10007			Universe is missing the special directory SPECIAL_DIR_PATH, The error was ERROR
	PUE10008			Source SOURCE_NAME content is not valid as a JSON structure. The error was ERROR

### Replacement tokens for the Error Messages.
**PROP_NAME** Name of the property involved in the error.

**CONVERTER_NAME** is the name of the converter involved in the error.

**TRANSFORMATION_NAME** is the name of the transformation involved in the error.

**SOURCE_NAME** name of the definition source. Usually is the name of the *.ptd.js* or *.pcd.js* file where the error occurred.

**MESSAGE_NAME** is the name of the message involved in the error.

**ERROR** is the original error message that originated the error

**UNIVERSE_NAME** is the universe in which the the error occurred. 

**UNIVERSE_DIR** is the universe baseDir where the error occurred.

**SPECIAL_DIR_NAME** is the universe baseDir where the error occurred.

## Credits
**Author**: Johan Hernandez. *johan@firebase.co*

**Date:** Sept 21, 2011
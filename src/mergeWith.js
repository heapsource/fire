function mergeWith(original, override) {
	if(typeof(original) == 'object' && (original instanceof Array)) {
		// Array
		for(var i in override) {
			var overrideVal = override[i]
			if(original.indexOf(overrideVal) == -1) {
				original.push(overrideVal)
			}
		}
		return original
	} else if(typeof(original) == 'object' && !(original instanceof Array)) {
		// Object
		if(override && original) {
			Object.keys(override).forEach(function(overrideKey) {
				if(!original[overrideKey]) {
					original[overrideKey] = override[overrideKey]
				} else {
					original[overrideKey] = mergeWith(original[overrideKey], override[overrideKey])
				}
			})
		} else if(!original) {
			return override
		}
		return original
	}
	return override
}
module.exports = mergeWith

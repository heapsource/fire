/*
Comparables are the comparable values of an object, used by comparison expressions like @equals.
Check test.Comparable.js to know more about the behavior.
*/

module.exports.extractComparableValues = function(val) {
	if(val === undefined || val == null) return [];
	else if(typeof(val) === 'object') {
		if(val instanceof Array) return val
		var values = [];
		Object.keys(val).forEach(function(key){
			values.push(val[key])
		})
		return values
	} else if(typeof(val) === 'string') {
		var values = [];
		for(var charIndex in val) {
			values.push(val.charAt(charIndex))
		}
		return values
	}
	return []
}

function areEqual(values, isStrict) {
	var res = undefined
	var abortComparison = false
	for(var i in values) {
		var currentVal = values[i]
		for(var ic = i - 1; ic >=0 ;ic--){
			var iteratedVal = values[ic]
			if(isStrict ? currentVal !== iteratedVal : currentVal != iteratedVal){
				abortComparison= true
				break;
			}
		}
		if(abortComparison) {
			res = false
			break
		}
	}
	if(res === undefined) res = true
	return res
}
module.exports.areEqual = areEqual


function areNotEqual(values, isStrict) {
	var res = undefined
	var abortComparison = false
	for(var i in values) {
		var currentVal = values[i]
		for(var ic = i - 1; ic >=0 ;ic--){
			var iteratedVal = values[ic]
			if(isStrict ? currentVal === iteratedVal : currentVal == iteratedVal){
				abortComparison= true
				break;
			}
		}
		if(abortComparison) {
			res = false
			break
		}
	}
	if(res === undefined) res = true
	return res
}
module.exports.areNotEqual = areNotEqual
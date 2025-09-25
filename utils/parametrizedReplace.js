import { emptyObject } from "../constants.js";


function getNormalValue(key, data) {
	if (key in data) {
		return { ok: 1, value: data[key] };
	} else {
		return { ok: 0 };
	}
}

function getvalue(data, path, options) {
	
	if (!options.valueByPathAllowed) {
		return getNormalValue(path, data);
	}


	if (path.indexOf('.') === -1) {
		return getNormalValue(path, data);
	}
	
	let chunks = path.split('.');
	let total = chunks.length;
	let obj = data;
	while(total > 1) {
		let key = chunks.shift();
		total = chunks.length;
		let r = getNormalValue(key, obj);
		if (!r.ok) return r;
		obj = r.value; //obj ? obj[key] : undefined;
	}

	return getNormalValue(chunks[0], obj);	


}



/**
 * 
 * @param {*} text 
 * @param {*} pattern 
 * @param {*} data 
 * @param {*} options - { ifUndefined: "", ifNull: "", ifKeyMissing }
 * @returns 
 */

export function parametrizedReplace(text, pattern, data, options) {
	if (!data || typeof data !== 'object') {
		throw new Error('parametrizedReplace: third argument must be an object');
	}
	options = options || emptyObject;
	data = data || emptyObject;
	const result = text.replace(pattern, (match, found) => {
		let dataValue = getvalue(data, found, options);
		if (!dataValue.ok) { return opt(options, 'ifKeyMissing', match); }

		dataValue = dataValue.value;

		if (dataValue === undefined) {
			return opt(options, 'ifUndefined', match);
		} else if (dataValue === null) {
			return opt(options, 'ifNull', match);
		}
		if (options.transform) {
			return options.transform(dataValue, match, found);
		}
		return dataValue;
	});
	return result;
}

function opt(obj, key, def) {
	if (key in obj) { return obj[key]; }
	return def;
}



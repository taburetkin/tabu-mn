import { tabuMnConfig } from "../TabuMnConfig";
import { invokeValue } from "../utils/invokeValue";

export const optionsMixin = {

	getOption(key, options) {
		if (arguments.length === 1 && tabuMnConfig.throwOnMissingGetOptionOptions) {
			throw new Error('calling getOption(key) without options argument is restricted');
		}
		options = normalizeOptions(options, this);
		if (this.options) {
			let value = this.options[key];
			if (value !== undefined) {
				return invoke(value, options);
			}
		}
		const value = this[key];
		return invoke(value, options);
	},

	getOptions(keys, options) {
		if (!keys || typeof keys !== 'object') throw new Error('getOptions first argument must be an array of keys or keys mapping object');

		options = normalizeOptions(options, this);

		const isArray = Array.isArray(keys);
		const result = {};

		const iterateKeys = isArray ? keys : Object.keys(keys);
		for(var x = 0; x < iterateKeys.length; x++) {
			const iterateKey = iterateKeys[x];
			const keyValue = this.getOption(iterateKey, options);
				//optionsMixin.getOption.call(this, iterateKey, options);
			const hashValue = keys[iterateKey];
			
			const outputKey = (isArray || typeof hashValue !== 'string')
				? iterateKey
				: hashValue;
			result[outputKey] = keyValue;
		}

		return result;
	},

	_callOptionsInitialize() {
		if (!this._optionsInitializeCalled && typeof this.options?.initialize == 'function') {
			this._optionsInitializeCalled = true;
			return this.options.initialize.apply(this, arguments);
		}		
	},

	hasOption(key, strict) {
		let hasOptionsValue = this.options[key] !== undefined;
		if (hasOptionsValue || strict) return hasOptionsValue;
		return this[key] !== undefined;
	}

}

const normalizedSymbol = Symbol('getOption-options');

function normalizeOptions(options, context) {
	if (options === true || options === false) {
		options = { invoke: options }
	} else if (options && (normalizedSymbol in options)) {
		return options;
	}

	const result = Object.assign({ [normalizedSymbol]: true, invokeContext: context, invokeArgs: context }, tabuMnConfig.defaultGetOptionOptions, options);

	return result;
}

function invoke(value, options) {
	if (!options.invoke) { return value; }
	const res = invokeValue(value, options.invokeContext, options.invokeArgs);
	return res;
}
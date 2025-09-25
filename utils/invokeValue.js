import { isKnownClass } from "./knownClasses";

export function invokeValue(value, context, args) {

	if (typeof value !== 'function' || isKnownClass(value)) return value;

	if (arguments.length === 1) {
		return value();
	}

	if (Array.isArray(args)) {
		return value.apply(context, args);
	} else if (arguments.length === 3) {
		return value.call(context, args);
	}
	
	return value.call(context);

}

export function invokeProp(obj, key, context, invokeArgs) {
	if (!obj) return;

	if (arguments.length < 3) {
		context = obj;
	}

	if (arguments.length < 4) {
		invokeArgs = context;
	}

	return invokeValue(obj[key], context, invokeArgs);

}
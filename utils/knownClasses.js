//import Backbone from 'backbone';
import { View, Model, Collection, Router } from 'backbone';
import { MnObject, Region } from 'backbone.marionette';
//const { View, Model, Collection, Router } = Backbone;

const ctors = [
	View, Model, Collection, Router, 
	MnObject, Region
]

export function registerClass(ctor) {
	if (typeof ctor !== 'function') {
		throw new Error('provided argument is not a function');
	}
	ctors.push(ctor);
}

export function isKnownClass(arg) {
	if (!arg || typeof arg !== 'function') return false;
	const res = ctors.some(ctor => arg === ctor || arg.prototype instanceof ctor);
	return res;
}
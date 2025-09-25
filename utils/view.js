import { View } from 'backbone';
import { emptyObject } from "../constants.js";
import { manipulateDom } from "./dom";

const supportedMethods = {
	append: 1,
	prepend: 1,
	replace: 1,
}

export function attachView(view, options) {
	options = options || emptyObject;
	const { silent, el } = options;
	if (el == null) {
		throw new Error('attachView: dom element missing');
	}
	let method = options.method || 'append';
	if (method in supportedMethods === false) {
		throw new Error(`attachView: not supported attachView method: "${method}", supported methods: ${Object.keys(supportedMethods)}`)
	}
	

	if (!view.isRendered()) {
		view.render();
	}

	
	if (!silent) {
		view.triggerMethod('before:attach', view);
	}

	manipulateDom(view.el, el, method);

	if (!silent) {
		view._isAttached = true;
		view.triggerMethod('attach', view);
	}

}


export function isView(arg) {
	return arg && arg instanceof View;
}

export function isViewClass(arg) {
	return arg === View || (arg && arg.prototype instanceof View);
}

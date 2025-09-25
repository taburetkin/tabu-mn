import { history, Router } from 'backbone';
import { emptyArray, emptyObject } from './constants';

const _extractParameters = Router.prototype._extractParameters;
const _routeToRegExp = Router.prototype._routeToRegExp;

let pattern = /:([\w_-]+)/gmi;

export const routes = {
	registered:{},
	_extractArgsArray: _extractParameters,
	_routeToRegExp: _routeToRegExp,
	_extractArgs(route, argsArray) {
		const arr = Array.from(argsArray);
		const hash = {};
		route.replace(pattern, (m,f, ...rest) => {
			let value = arr.shift();
			if (/^\d+\.*\d*$/.test(value)) {
				value = parseFloat(value);
			}
			hash[f] = value;
		});
		return hash;
	},

	register(route, callback) {
		if (this.registered[route]) {
			throw new Error(route + ' already registered');
		}
		if (typeof callback !== 'function') {
			throw new Error(route + ' callback is not a function');
		}

		if (route == null) {
			throw new Error('route is undefined for callback ' + callback)
			//console.warn('no route defined');
		}

		route = this.normalizeRoute(route);
		this.registered[route] = callback;
		const regexRoute = this._routeToRegExp(route);
		history.route(regexRoute, fragment => this.execute(fragment, regexRoute, route, callback));

	},

	normalizeRoute(route) {
		if (route === '') {
			return '(/)';
		}

		else if (route.endsWith('/')) {
			return route.substring(0, route.length - 1) + '(/)'
		}

		else if (!route.endsWith('(/)')) {
			return route + '(/)';
		}

		return route;
	},

	async execute(fragment, regexRoute, route, callback) {
		const argsArr = this._extractArgsArray(regexRoute, fragment);
		const args = this._extractArgs(route, argsArr);

		Object.assign(request, { argsArr, args, route, fragment, regexRoute, callback });

		try {

			let res = await callback(args, request);
			if (res && typeof res === 'object' && 'ok' in res) {
				return res;
			}
			res = {
				ok: true,
				value: res
			}
			return res;
		} catch(exc) {
			return {
				ok: false,
				value: exc
			}
		}
	},


	start(options) {
		options = options || emptyObject
		const { pushState = true, hrefClickCapture = true } = options;

		history.on('all', (...args) => console.log('[history]', ...args));
		const found = history.start({ pushState });
		if (hrefClickCapture) {
			console.log('settled hrefClickCapture');
			document.addEventListener('click', hrefClickCapturer);
		}
	},

	stop() {
		history.off();
		history.stop();
		document.removeEventListener('click', hrefClickCapturer);
	}
}
console.warn('routes', routes);

export const request = {}
console.warn('request', request);

function hrefClickCapturer(event) {

	const aEl = event.target.closest('a');
	if (!aEl) { return; }

	const url = toLocalUrl(aEl.href);
	if (!url) { return; }

	const path = url.pathname + url.search + url.hash;
	const inNewTab = aEl.getAttribute('target') === '_blank';
	const thisTab = !inNewTab;
	const noCtrlKey = !event.ctrlKey;
	const hasCtrlKey = !!event.ctrlKey;

	if (inNewTab && noCtrlKey) {
		return;
	}
	else if (thisTab && hasCtrlKey) {
		event.preventDefault();
		return newtab(path);
	}
	else {
		event.preventDefault();
		return navigateTo(path);
	}

}

function toLocalUrl(href) {
	try {
		const url = new URL(href);
		if (!url.protocol.startsWith('http')) return;
		if (url.origin === document.location.origin) {
			return url;
		}
	} catch {
		return;
	}
}


export function smartNavigate(url, options) {
	options = options || emptyObject;
	const { ctrlKey } = options;
	if (ctrlKey) {
		return newtab(url);
	}
	const { trigger = true } = options;
	return navigateTo(url, trigger);
}

function newtab(url) {
	window.open(url, '_blank').focus();
	return;
}

function navigateTo(url, trigger = true) {
	if (url.startsWith('/')) {
		url = url.substring(1);
	}
	return history.navigate(url, { trigger });
}
import { emptyObject } from "../constants.js";
import { manipulateDom } from "../utils/dom.js";
import { invokeProp, invokeValue } from "../utils/invokeValue.js";
import { attachView, isView, isViewClass } from "../utils/view.js";
import { optionsMixin } from "./options.js";
import { Region, View as MnView } from 'backbone.marionette';

const mnRegionSetupChildView = Region.prototype._setupChildView;
const originalGetImmediateChildren = MnView.prototype._getImmediateChildren;


// specific parent options: 
// considerChildViewKeyAs: string, supported values: 'name', 'selector'
//

// specific child options: 
// parentShouldTriggerSetup

export const childrenMixin = {

	_getImmediateChildren() {
		const arr = originalGetImmediateChildren.apply(this, arguments);
		if (!this.children) { return arr; }
		const views = arr.concat(this.children._views);
		return views;
	},

	hasChildren() {
		return this.hasOption('children');
	},

	_initChildren() {
		if (this.getOption('hasChildren', true)) {
			this._children = this.getOption('children', false);
			this.children = new Children(this);
		}
	},

	getChildren() {
		return invokeProp(this, '_children');
	},

	_destroyChildren() {
		if (!this.children) return;
		this.children.destroyAll();
	},

	_renderChildren() {
		//if (this.DEBUGCHILDREN) { debugger; }
		if (!this.children) return;
		
		let children = this.getChildren();
		const isArray = Array.isArray(children);
		let proceed = children && (isArray || typeof children === 'object');
		if (!proceed) return;

		this.triggerMethod('brefore:render:children', this);

		const childViewOptions = this._getChildViewOptions();
		const ChildView = this.getOption('childView', true);
		const considerChildViewKeyAs = getConsiderChildViewKeyAs(this.getOption('considerChildViewKeyAs', true));
		const childViewContainer = this._getChildViewContainer();
		const buildOptions = {
			childViewOptions,
			ChildView,
			considerChildViewKeyAs,
			childViewContainer
		}
		const iterateKeys = isArray ? children : Object.keys(children);
		for (var index = 0; index < iterateKeys.length; index++) {

			const key = isArray ? index : iterateKeys[index];
			const potentialChild = invokeValue(children[key], this, this);
			if (!potentialChild) continue;

			this._renderChild(potentialChild, index, key, buildOptions);

		}

	},

	_renderChild(potentialChild, index, key, buildOptions) {
		
		if (this.DEBUGRENDERCHILD) {
			console.log(this.el, ' -> ', potentialChild, key);
		}
		const childView = this._buildChildView(potentialChild, buildOptions, key);
		if (!childView) return console.error('not builded child');
		
		if (childView.DEBUGPARENTRENDER) {
			console.log(this.el, ' -> ', childView.el);
		}

		let viewData;
		if (childView.getOptions) {
			viewData = childView.getOptions({ 
				'name': 1, 
				'parentContainerSelector': 'selector', 
				'replaceParentContainer': 'replaceElement' 
			}, true);
		} else {
			viewData = {
				name: childView.getOption('name', true),
				selector: childView.getOption('parentContainerSelector', true),
				replaceElement: childView.getOption('replaceParentContainer', true)
			}
		}
		


		let parentContainer;
		if (viewData.selector) {
			const parentContainerEl = this.$(viewData.selector).get(0);
			parentContainer = {
				selector: viewData.selector,
				el: parentContainerEl,
				replaceElement: viewData.replaceElement,
				method: viewData.replaceElement ? 'replace' : 'append'
			}
		}

		const childContext = {
			cid: childView.cid,
			index,
			name: viewData.name,
			childView,
			parentContainer
		}
		this.children.add(childContext);
		this._setupChildView(childContext, buildOptions);
		this._attachChildView(childContext, buildOptions);
	},	


	_getChildViewOptions() {
		const options = this.getOption('childViewOptions', true) || {};
		if (this.model && this.getOption('passDownModel', true)) {
			options.model = this.model;
		}
		if (this.collection && this.getOption('passDownCollection', true)) {
			options.collection = this.collection;
		}
		return options;
	},

	_getChildViewContainer() {
		const container = this.getOptions({ childViewContainerMethod: 'method', childViewContainer: 'selector' }, true);
		container.el = container.selector ? this.$(container.selector).get(0) : this.el;
		return container;
	},



	_buildChildView(potentialChild, buildOptions, _viewName) {

		if (!potentialChild) return;

		if (isView(potentialChild)) {
			return potentialChild.isDestroyed() ? undefined : potentialChild;
		}
		if (typeof _viewName !== 'string') { _viewName = undefined; }


		let ChildView = buildOptions.ChildView;

		let commonChildViewOptions = buildOptions.childViewOptions;
		let personalOptions;
		let namedOptions;

		if (isViewClass(potentialChild)) {
			ChildView = potentialChild;
		} else if (typeof potentialChild === 'object') {
			const childClass = invokeValue(potentialChild.class, this, this);
			if (childClass) {
				ChildView = childClass;
			}
			personalOptions = potentialChild;
		}

		const keyAs = buildOptions.considerChildViewKeyAs;

		const viewName = keyAs.name && _viewName 
								? _viewName
								: personalOptions?.name || ChildView.prototype.name;
		
		const hasNamed = viewName || keyAs.selector;

		if (hasNamed) {
			let named1 = viewName ? { name: viewName } : undefined;
			let named2 = viewName ? this.getOption(viewName + 'Options', true) : undefined;
			let named3 = _viewName && keyAs.selector ? { parentContainerSelector: _viewName } : undefined
			namedOptions = Object.assign({}, named1, named2, named3);
			//console.error('viewName', viewName, named2, hasNamed, keyAs.selector, this );
		}

		if (!ChildView) {
			throw new Error('unable to build child view: constructor missing');
		}

		const options = Object.assign({}, commonChildViewOptions, personalOptions, namedOptions);

		return new ChildView(options);
	},

	_setupChildView(ctx) {
		
		mnRegionSetupChildView.call(this, ctx.childView);
		if (ctx.parentContainer?.replaceElement) {
			this.listenToOnce(ctx.childView, 'before:destroy', () => {
				manipulateDom(ctx.parentContainer.el, ctx.childView.el, 'replace');
			});
		}
		this.triggerMethod('setup:child:view', ctx.childView, ctx.name);
		if (ctx.childView.getOption('parentShouldTriggerSetup', true)) {
			ctx.childView.triggerMethod('setup', this);
		}
		const parentProperty = ctx.childView.getOption('setAsParentProperty', true);
		if (typeof parentProperty === 'string') {
			if (parentProperty in this) {
				console.warn(`parent property "${parentProperty}" was replaced by childView`, ctx.childView.cid);
			}
			this[parentProperty] = ctx.childView;
		}
	},

	_attachChildView(ctx, buildOptions) {
		const container = ctx.parentContainer || buildOptions.childViewContainer;
		const { el, method } = container;
		if (el == null) {
			throw new Error('childViewContainer element not found, selector was: ' + container?.selector);
		}
		const attached = this.isAttached() && this.el.isConnected;
		const silent = this.monitorViewEvents === false || !attached;
		attachView(ctx.childView, { el, method, silent });
		//if (ctx.parentContainer?.el && ctx.parentContainer.)
	},

	_empty(view) { 
		this.children.remove(view.cid);
	}
}



class Children {
	constructor(parent) {
		this.parent = parent;
		this.byCid = {};
		this.byName = {};
	}

	get length() {
		let length = 0;
		for (let key in this.byCid) length++;
		return length;
	}

	get _views() {
		const views = [];
		for(var key in this.byCid) {
			const ctx = this.byCid[key];
			const view = ctx?.childView;
			if (view)
				views.push(view);
		}
		return views;
	}

	add(ctx) {
		this.byCid[ctx.cid] = ctx;
		if (ctx.name) {
			this.byName[ctx.name] = ctx;
		}
	}

	remove(ctx) {
		if (typeof ctx === 'string') {
			ctx = this.byCid[ctx];
		}
		if (!ctx) return;
		if (ctx.name) {
			delete this.byName[ctx.name];
		}
		delete this.byCid[ctx.cid];
		return ctx;
	}

	destroyAll() {
		const keys = Object.keys(this.byCid);
		for(var index = 0; index < keys.length; index++) {
			const cid = keys[index];
			const ctx = this.byCid[cid];
			ctx.childView.destroy();
			// this.remove(ctx);
		}
	}

	attachAll() {
		this._triggerAll('attach', true);
	}

	detachAll() {
		this._triggerAll('detach', false);
	}

	_triggerAll(event, value) {
		for(let cid in this.byCid) {
			const ctx = this.byCid[cid];
			ctx.childView.triggerMethod('before:' + event, ctx.childView);
			ctx.childView.isAttached = value;
			ctx.childView.triggerMethod(event, ctx.childView);
		}
	}
}


function getConsiderChildViewKeyAs(value) {
	
	if (value) {

		let type = typeof value;
		const isArray = Array.isArray(value);
		
		if (type === 'object' && !isArray) {
			return value;
		}
		else if (isArray) {
			return value.reduce((m,v) => { 
				m[v] = 1;
				return m;
			}, {});
		} else {
			return { [value]: 1 };
		}

	} else {
		return {};
	}
}
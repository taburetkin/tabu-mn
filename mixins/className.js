import { invokeProp, invokeValue } from "../utils/invokeValue.js";

export const classNameMixin = {
	_initClassName() {
		let when = this.getOption('updateClassNameOn', true) || {};
		if (typeof when === 'string') {
			when = { [when]: true };
		} else if (Array.isArray(when)) {
			when = when.reduce((memo, value) => { memo[value] = true; return memo;}, {})
		} else if (!(when && typeof when === 'object')) {
			when = {};
		}

		if (when.initialize !== false && this.getOption('updateClassNameOnInitialize', true) !== false) {
			this.updateClassName();
		}

		if (when.render || this.getOption('updateClassNameOnRender', true)) {
			this.on('render', () => this.updateClassName());
		}
		
		if (this.model && when['model:change'] || this.getOption('updateClassNameOnModelChange', true)) {
			this.listenTo(this.model, 'change', () => this.updateClassName());
		}

	},

	_ensureElement() {
		if (!this.el) {
			var attrs = Object.assign({}, invokeProp(this, 'attributes'));
			if (this.id) attrs.id = invokeProp(this, 'id');
			this.setElement(this._createElement(invokeProp(this, 'tagName')));
			this._setAttributes(attrs);
		} else {
			this.setElement(invokeProp(this, 'el'));
		}
	},

	_buildClassNamesHash() {
		const hash = {};
		populateKeys(hash, this.getOption('baseClassName', true), this);
		populateKeys(hash, this.getOption('className', true), this);
		populateKeys(hash, this.getOption('_stateClassNames', true), this);
		populateKeys(hash, this.getOption('_runtimeClassNames', true), this);
		return hash;
	},

	addClassName(className, funcOrValue) {
		funcOrValue = arguments.length === 2 ? funcOrValue : 1;
		let runtime = this._runtimeClassNames;
		if (!runtime) {
			this._runtimeClassNames = runtime = {}
		}
		this._runtimeClassNames[className] = funcOrValue;
	},

	updateClassName() {
		let hash = this._buildClassNamesHash();
		let classes = Object.keys(hash).filter(f => hash[f] !== 0).join(' ');
		if (!classes) {
			this.$el.removeAttr('class')
		} else {
			this._setAttributes({ class: classes });
		}
	},

	// _setAttributes(attributes) {
	// 	this.$el.attr(attributes);
	// }	
}




function populateKeys(hash, arg, context) {
	arg = invokeValue(arg, context, context);
	if (Array.isArray(arg))
		for(let argN of arg)
			set(hash, invokeValue(argN, context, context), 1);
	else if (arg && typeof arg === 'object')
		for(let argK in arg) 
			set(hash, argK, invokeValue(arg[argK], context, context));
	else
		set(hash, invokeValue(arg, context, context), 1);
	
}
// null, 0, '' = false;
// (hash, key) - key is string or falsy, if not falsy - value is 1
// (hash, key, value) - strict value for key, undefined value is ignored
function set(hash, key, value) {
	if (!key || value === undefined) return;
	value = arguments.length === 3 ? value : 1;
	hash[key] = value;
}
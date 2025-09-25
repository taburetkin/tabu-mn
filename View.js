import { optionsMixin } from "./mixins/options.js";
import { View as MnView } from 'backbone.marionette';
import { stringTemplateMixing } from "./mixins/stringTemplate.js";
import { classNameMixin } from "./mixins/className.js";
import { stateMixin } from "./mixins/state.js";
import { childrenMixin } from "./mixins/children.js";

export const View = MnView.extend({

	constructor: function TabuView(options) {
		MnView.apply(this, arguments);
		this._callOptionsInitialize();
		this._initState();
		this._initClassName();
		this._initChildren();
	},

	...optionsMixin,
	...stringTemplateMixing,
	...classNameMixin,
	...stateMixin,
	...childrenMixin,
	

	render: function render() {
		var template = this.getTemplate();

		// skip prerendered or destroyed view 
		if (template === false || this._isDestroyed) {
			return this;
		}


		this.triggerMethod('before:render', this); // If this is not the first render call, then we need to

		this._destroyChildren();

		// re-initialize the `el` for each region
		if (this._isRendered) {
			this._reInitRegions();
		}

		if (template) {
			this._renderTemplate(template);
			this.bindUIElements();
		}

		this._renderChildren();

		this._isRendered = true;
		this.triggerMethod('render', this);
		return this;
	},


});

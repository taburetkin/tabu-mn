import { optionsMixin } from "./mixins/options.js";
import { CollectionView as MnCollectionView } from 'backbone.marionette';

import { stringTemplateMixing } from "./mixins/stringTemplate.js";
import { classNameMixin } from "./mixins/className.js";
import { stateMixin } from "./mixins/state.js";
import { initializeCollectionMixin } from "./mixins/initializeCollection.js";

export const CollectionView = MnCollectionView.extend({
	constructor: function TabuView(options) {
		if (options?.parentView) {
			this.parentView = options?.parentView;
		}
		MnCollectionView.apply(this, arguments);
		this._callOptionsInitialize();
		this._initState();
		this._initClassName();
	},

	...optionsMixin,
	...stringTemplateMixing,
	...classNameMixin,
	...stateMixin,
	...initializeCollectionMixin,


});

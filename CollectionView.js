import { optionsMixin } from "./mixins/options.js";
import { CollectionView as MnCollectionView } from 'backbone.marionette';
import { Collection } from 'backbone';
import { stringTemplateMixing } from "./mixins/stringTemplate.js";
import { classNameMixin } from "./mixins/className.js";
import { stateMixin } from "./mixins/state.js";

export const CollectionView = MnCollectionView.extend({
	constructor: function TabuView(options) {
		MnCollectionView.apply(this, arguments);
		this._callOptionsInitialize();
		this._initState();
		this._initClassName();
	},

	...optionsMixin,
	...stringTemplateMixing,
	...classNameMixin,
	...stateMixin,

	initializeCollection(models) {
		if (this.collection) {
			this.collection.reset(models);
		} else {
			const CollectionClass = this.getOption('Collection', true) || Collection;
			this.collection = new CollectionClass(models);
		}
	}

});

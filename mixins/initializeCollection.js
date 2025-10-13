import { Collection } from 'backbone';
export const initializeCollectionMixin = {
	initializeCollection(models) {
		if (this.collection) {
			this.collection.reset(models);
		} else {
			this.collection = this.createCollection(models);
		}
	},
	createCollection(models, options) {
		const CollectionClass = this.getOption('Collection', true) || Collection;
		const collection = new CollectionClass(models, options);
		return collection;
	},
}
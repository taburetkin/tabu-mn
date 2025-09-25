import { View, Events as BbEvents } from 'backbone';
import { Events as MnEvents, View as MnView } from 'backbone.marionette';
import { uniqueId } from 'underscore';
import { optionsMixin } from './mixins/options.js';
import { registerClass } from './utils/knownClasses.js';
import { invokeProp } from './utils/invokeValue.js';


function MnObject(options) {
	this.cid = uniqueId('obj');
	this._setOptions(options);
	this.initialize(options);
	this._callOptionsInitialize();
}

Object.assign(MnObject.prototype, 
	optionsMixin, BbEvents, MnEvents, 
{

	_setOptions(options) {
      this.options = Object.assign({}, invokeProp(this, 'options'), options);		
	},


	mergeOptions: MnView.prototype.mergeOptions,

	initialize() { }

});

MnObject.extend = View.extend;

registerClass(MnObject);

export {
	MnObject
}
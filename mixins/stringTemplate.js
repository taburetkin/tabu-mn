import { View } from 'backbone.marionette';
import { tabuMnConfig } from '../TabuMnConfig.js';
import { parametrizedReplace } from '../utils/parametrizedReplace.js';

const originalSerializeData = View.prototype.serializeData;
const original_renderHtml = View.prototype._renderHtml;

export const stringTemplateMixing = {
	serializeData() {
		if (tabuMnConfig.useDefaultSerialize !== false) {
			return originalSerializeData.call(this);
		}
		if (this.model) {
			return this.serializeModel();
		}
	},
	_renderHtml(template, data) {
		if (tabuMnConfig.useDefaultRenderHtml !== false) {
			return original_renderHtml.apply(this, arguments);
		}
		if (typeof template === 'string') {
			if (template === '') return template;
			return stringTemplateToHtml(template, data);
		}
		return template(data);
	}
}

const regexStringTemplateReplaceOptions = {
	ifUndefined: '',
	ifNull: '',
	valueByPathAllowed: true,
}

function stringTemplateToHtml(tmpl, data) {
	if (tabuMnConfig.useRegexStringTemplates) {
		const pattern = tabuMnConfig.regexStringTemplateReplacePattern;
		return parametrizedReplace(tmpl, pattern, data, regexStringTemplateReplaceOptions);
	}
}
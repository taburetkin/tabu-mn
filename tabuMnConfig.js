
const regexStringTemplateReplacePatterns = {
		underscore: /\<\%\s*=\s*([\w\._-]+)\s*\%\>/gmi,
		mustache: /\{\{\s*([\w\._-]+)\s*\}\}/gmi
}

export const tabuMnConfig = {
	useDefaultRenderHtml: false,
	useRegexStringTemplates: true,	
	regexStringTemplateReplacePatterns,
	regexStringTemplateReplacePattern: regexStringTemplateReplacePatterns.underscore,
	throwOnMissingGetOptionOptions: true,
	defaultGetOptionOptions: {
		invoke: false
	}
}


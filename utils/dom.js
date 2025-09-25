export function manipulateDom(elToAdd, anchorEl, method) {
	switch(method) {
		case 'replace':
			anchorEl.parentNode.insertBefore(elToAdd, anchorEl);
			anchorEl.remove();
			return;
		case 'append':
			anchorEl.append(elToAdd);
			return;
		case 'prepend':
			anchorEl.prepend(elToAdd);
			return;
	}
}
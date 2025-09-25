export const stateMixin = {
	state(key, value, options) {
		if (key == null) throw new Error('state first argument missing');
		let hash;
		if (typeof key === 'object') {
			hash = key;
			options = value;
		}
		else if (typeof key !== 'object' && arguments.length > 1) {
			hash = { [key]: value }
		}
		this._initState();
		if (hash) {
			return this._setState(hash, options);
		}
		return this._getState(key);
	},
	stateText(key) {
		let value = this._getState(key);
		if (!value) { return ''; }
		return value === true ? key : value;
	},
	_initState() {
		if (this._state || !this.hasOption('initialState')) return;

		let initial = this.getOption('initialState', true);
		if (initial && typeof initial === 'object') { // <--- function will be ignored
			this._setState(initial, { silent: true })
		}
	},
	_getState(key) {
		if (!this._state) { return; }
		return this._state[key];
	},
	_setState(hash, options) {
		if (!this._state) {
			this._state = {};
		}

		const silent = options?.silent;
		let changes = {}
		let hasChanges;
		for (let stateKey in hash) {
			let oldValue = this._state[stateKey];
			let stateValue = hash[stateKey];

			if (oldValue !== stateValue) {
				hasChanges = true;
				this._state[stateKey] = stateValue;
				changes[stateKey] = stateValue;
				if (!silent) {
					this.triggerMethod('state:' + stateKey, stateValue);
				}
			}

		}

		if (!hasChanges) { return; }

		if (!silent) {
			this.triggerMethod('state', changes);
		}
	},
	_stateClassNames() {

		if ('_stateClassNamesArray' in this) {
			return this._stateClassNamesArray;
		}
		let names = this.getOption('stateClassNames', true);
		if (!names) {
			this._stateClassNamesArray = null;
			return;
		}

		//if (!this._state) { this._state = {}; }
		let arr = []
		for (let name of names) {
			arr.push(() => this.stateText(name));
		}
		this._stateClassNamesArray = arr;
		if (this.updateClassName) {
			this.on('state', this.updateClassName);
		}
		return arr;
	}
}
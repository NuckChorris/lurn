'use strict';

/**
 * A class which lets you set and get configuration options as well as register observers for
 * options or groups of options.
 *
 * @author Peter Lejeck <code@plejeck.com>
 * @license MIT
 */
class Settings {
	constructor() {
		this._observers = {};
		this._store = {};
	}

	/**
	 * Register an observer for an option or set of options.
	 * 
	 * @param {String} prop Specifies the options to be observed.  To observe a set, use globs.  For
	 *                      example, an observer on `foo.*` will be notified whenever *any* option
	 *                      with the "foo" prefix is changed
	 * @param {Function(prop, oldVal, newVal)} cb The callback to be triggered whenever the option
	 *                                            changes
	 */
	observe(prop, cb) {
		this._observers[prop] = this._observers[prop] || [];
		this._observers[prop].push(cb);
	}

	/**
	 * Register an observer which only cares about the new value.  Takes a `default` parameter which
	 * is passed to `get` immediately.  You can depend on this to be triggered immediately and again
	 * whenever the option changes.
	 *
	 * @param {String} prop Specifies the option to be gotten
	 * @param def default value which is passed to `get` immediately.
	 * @param {Function(value)} cb The callback to be triggered whenever the option changes.  Also
	 *                             invoked immediately with the default value.
	 */
	using(prop, def, cb) {
		this.observe(prop, (prop, oldVal, newVal) => cb(newVal));
		this.get(prop, def);
	}

	/**
	 * Notify a single observers-key of a changed value.
	 *
	 * @private
	 * @param {String} prop The observers-key to notify of change
	 * @param oldVal The old value, prior to updating
	 * @param newVal The new value, after updating
	 */
	_notify(prop, oldVal, newVal) {
		let observers = this._observers[prop];
		if (!observers) { return; }

		for (var i = observers.length-1; i >= 0; i--) {
			observers[i](prop, oldVal, newVal);
		}
	}

	/**
	 * Publish an option-change event to any observers. *Does not change the option itself.* Assumes
	 * you've already done this.
	 *
	 * @private
	 * @param {String} prop The key to publish a change of
	 * @param oldVal The old value, prior to updating
	 * @param newVal The new value, after updating
	 */
	_publish(prop, oldVal, newVal) {
		// Notify exact observer first
		this._notify(prop, oldVal, newVal);
		// Split it on dot and work outward to notify wildcards 
		let path = prop.split('.');
		for (let i = path.length - 1; i > 0; i--) {
			let key = path.slice(0, i) + '.*';
			this._notify(key, oldVal, newVal);
		}
		// Notify global wildcard
		this._notify('*', oldVal, newVal);
	}

	/**
	 * Set an option and notify all observers.
	 *
	 * @param {String} prop The dot-separated key of the option
	 * @param newVal The new value to assign to the option
	 */
	set(prop, newVal) {
		let oldVal = this._store[prop];
		this._store[prop] = newVal;
		this._publish(prop, oldVal, newVal);
		return this._store[prop];
	}

	/**
	 * Get an option, optionally setting it to a default value.
	 *
	 * @param {String} prop The dot-separated key of the option
	 * @param default [optional] The default value to return if the option isn't set
	 * @param {Boolean} saveDefault [optional, default=true] Whether to save the default
	*                               into the store automatically
	 */
	get(prop, def, saveDefault=true) {
		if (this._store.hasOwnProperty(prop)) {
			return this._store[prop];
		} else {
			if (saveDefault === true) {
				this.set(prop, def);
			}
			return def;
		}
	}
}
export default Settings;

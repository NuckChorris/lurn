'use strict';
import _ from 'vendor/lodash/main';
import $ from 'vendor/zepto';
import hiragana from 'hiragana';
import katakana from 'katakana';

var KanaTrainer = {
	currentSet: [],
	changeSets: function changeSets (hira=['-'], kata=[]) {
		$();
		for(let a of hira) {
			KanaTrainer.currentSet = a;
		}
		this.currentSet = _([
			_(hiragana).select((trash, key) => hira.indexOf(key)),
			_(katakana).select((trash, key) => kata.indexOf(key))
		]).flatten().union();
	}
};

export default KanaTrainer;

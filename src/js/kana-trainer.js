import _ from 'lo-dash';
import $ from 'zepto';

export default {
	currentSet: [],
	changeSets: function changeSets (hira, kata) {
		for(let a of hira) {
			KanaTrainer.currentSet = a;
		}
		this.currentSet = _([
			_(HIRAGANA).select((trash, key) => hira.indexOf(key)),
			_(KATAKANA).select((trash, key) => kata.indexOf(key))
		]).flatten().union();
	}
};

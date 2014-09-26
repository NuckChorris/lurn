'use strict';
import Settings from 'settings-singleton';
import $ from 'vendor/zepto';

const THRESHOLD = 40;

function handleLightChange (event) {
	if (event.value > THRESHOLD) {
		$('body').addClass('theme-light').removeClass('theme-dark');
	} else {
		$('body').removeClass('theme-light').addClass('theme-dark');
	}
}

Settings.using('com.plejeck.lurn.auto-lighting', true, function (val) {
	if (val) {
		window.addEventListener('devicelight', handleLightChange);
	} else {
		window.removeEventListener('devicelight', handleLightChange);
	}
});

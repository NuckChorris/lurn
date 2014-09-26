/* global curl */
'use strict';

/* Configure and boot curl.js */
curl({
	baseUrl: 'js',
	paths: {
		'curl': 'vendor/curl',
		'vendor/zepto': {
			location: 'vendor/zepto.js',
			config: {
				loader: 'curl/loader/legacy',
				factory: function () {
					/* global Zepto */
					return {'default': Zepto};
				},
			}
		},
		'vendor/regenerator': {
			location: 'vendor/regenerator.js',
			config: {
				loader: 'curl/loader/legacy',
				factory: function () {
					/* global regeneratorRuntime */
					return {'default': regeneratorRuntime};
				}
			}
		}
	}
});
curl(['main']);

/* Start at #start */
if (!window.location.hash) {
	window.location.hash = '#start';
}

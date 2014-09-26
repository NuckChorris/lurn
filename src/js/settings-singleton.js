'use strict';
import Settings from 'settings';
var settings = new Settings();
window.settings = settings;
// TODO: automatically save settings to localStorage
settings.observe('*', (prop, oldVal, newVal) => console.log(prop, oldVal, newVal));
export default settings;

Components.utils.import("resource://modules/logger.jsm");

if ( ! DontLoadAllAutoConfUtils ) {
	var DontLoadAllAutoConfUtils = true;
	var scriptLoader = Components
	                        .classes["@mozilla.org/moz/jssubscript-loader;1"]
                            .createInstance(Components.interfaces.mozIJSSubScriptLoader);

	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/PrefUtils.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/ExtUtils.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/DirectoryUtils.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/LDAPquery.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/HTTPquery.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/CurrentIdAndAccount.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/AutoconfStatus.js");
	scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/Autoconfiguration.js");
}
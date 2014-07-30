Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
		  .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");

function AutoconfStatus() {}

AutoconfStatus.PREFNAME="obm-autoconf-client.autoconfstatus";

AutoconfStatus.INITIALCONFIG = 0; // not configured at all
AutoconfStatus.DEFAULT = 1; // when already configured
AutoconfStatus.RECONFIGURE = -1; // needs a re-configuration

AutoconfStatus.getStatus = function() {
	return prefutils_getPreference(AutoconfStatus.PREFNAME,AutoconfStatus.INITIALCONFIG);
}
AutoconfStatus.setStatus = function(newStatus) {
	prefutils_setPreference(AutoconfStatus.PREFNAME, newStatus, "user");
}
// upgrade of existing account
AutoconfStatus.statusExists = function () {
	var test = prefutils_getPreference(AutoconfStatus.PREFNAME,22);
	if ( test == 22 ) return false;
	return true;
}
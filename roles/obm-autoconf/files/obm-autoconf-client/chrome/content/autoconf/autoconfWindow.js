Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
		  .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");

function callback(bool) {
// 	alert("setting status to "+AutoconfStatus.DEFAULT);
	AutoconfStatus.setStatus(AutoconfStatus.DEFAULT);
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
	var sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
			.getService(Components.interfaces.nsIStringBundleService);
	var sb = sbs.createBundle("chrome://obm-autoconf-client/locale/autoconfiguration.properties");
	var a = prompts.alert(window,sb.GetStringFromName("promptRestart.title"),sb.GetStringFromName("promptRestart.caption"));

	Components.classes["@mozilla.org/toolkit/app-startup;1"]
		.getService(Components.interfaces.nsIAppStartup)
		.quit(Components.interfaces.nsIAppStartup.eForceQuit|Components.interfaces.nsIAppStartup.eRestart);
}


/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is PABLO MAJA.
 *
 * The Initial Developer of the Original Code is
 * Nicolas Lascombes.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                             .createInstance(Components.interfaces.mozIJSSubScriptLoader);

scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/AutoconfStatus.js");
try {scriptLoader.loadSubScript("chrome://obm-extension/content/calendar/extension.js");} catch (e) {}
scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/PrefUtils.js");
scriptLoader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/HTTPquery.js");
Components.utils.import("resource://modules/specificRules.jsm");
Components.utils.import("resource://obm-autoconf-client/modules/XMLUtilsOBM.jsm");

var prefsManager = {
	getBranchChildren: prefutils_getPrefBranchChildren,
	getPref: prefutils_getPreference,
	setPref: prefutils_setPreference
};

var ldaptool = { 
	query: function (url) {
// 		logger.log("runLDAPQuery()");
// 		logger.log("URL: "+url);
		var ldapURL = Components.classes["@mozilla.org/network/io-service;1"]
						.getService(Components.interfaces.nsIIOService)
						.newURI(url, null, null)
						.QueryInterface(Components.interfaces.nsILDAPURL);
		var LDAPquery = Components.classes["@mozilla.org/ldapsyncquery;1"].createInstance(Components.interfaces.nsILDAPSyncQuery);
		var res = LDAPquery.getQueryResults(ldapURL, Components.interfaces.nsILDAPConnection.VERSION3);
// 		logger.log("LDAP response: "+res);
		if ( !res ) { return res ;}
		var lines = res.split("\n");
		var back = {};
		for each( var line in lines ) {
			var splindex = line.indexOf("=");
			if ( splindex != -1 ) {
				var k = line.substr(0, splindex );
				var v = line.substr( (splindex+1) );
				if ( !back[k] ) {
					back[k] = [];
				}
				back[k].push(v);
			}
		}
// 		logger.log("ldaptool returns: "+JSON.stringify(back) );
		return back;
	}
};


var obmautoconfclient = {
  
	resetAutoconf: function() {
		//     utils._setPreference("config.3mi.autoconfigStatus", 0, "user" );
		AutoconfStatus.setStatus(AutoconfStatus.RECONFIGURE);
		prefutils_setPreference("config.obm.patch.version", -1,"user");
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
		var dontrestart = prompts.confirmEx(null,
			"Mise à jour de Thunderbird",
			"Thunderbird doit redémarrer afin de se réinitialiser.\nRedémarrer maintenant ?",
			Components.interfaces.nsIPromptService.STD_YES_NO_BUTTONS,
			null,
			null,
			null,
			null,
			{value: false});
		if ( !dontrestart ) {
			var Application = Components.classes["@mozilla.org/steel/application;1"].getService(Components.interfaces.steelIApplication);
			Application.restart();
		}
	},
  
	resetAPE: function() {
		// 	alert ("resetAPE starrting");	  
		var bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
			.getService(Components.interfaces.nsIStringBundleService)
			.createBundle("chrome://obm-autoconf-client/locale/obm-autoconf-client.properties");
		var XMLConf = null;
		if ( ! confirm(bundle.GetStringFromName("extensions.obm-autoconf-client.confirm_reset"))){
			return;
		}
		
// 		try {
			specificRules.getCIA (new CurrentIdAndAccount(), accountManager, prefsManager, function(err,cia) {
				if ( err ) {
// 					logger.log("doAutoconf: specificRules.getCIA failed");
					return ;
				}
				specificRules.getInitialAutoconfURL(cia, accountManager, prefsManager, ldaptool, function(err,obmUrl,cia) {
					if ( err ){
// 						logger.log("Error retrieving OBM server url (initialAutoconfUrl) : "+err);
						return ;
					}
// 					logger.log("OBM server url : "+url);
					reset(getConfig(obmUrl, cia));
	// 				launchAutoConf(cia, url,callback);
				});
			});
			
			
			function reset (XMLConf) {
// 			var XMLConf  = getConfig();
			
				
				var passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
				
				var accountsList = passwordManager.getAllLogins({});
				
				for each ( var acct in accountsList ) {
					passwordManager.removeLogin(acct);
				}
				accountsList = prefutils_getPreference("mail.accountmanager.accounts", "");
				accountsList = accountsList.split(",");
				for each ( var acc in accountsList ) {
					var identities = prefutils_getPreference("mail.account."+acc+".identities", "");
					identities = identities.split(",");
					for each ( var identity in identities ) {
						prefutils_deletePrefBranch("mail.identity."+identity);
					}
					prefutils_deletePrefBranch("mail.account."+acc);
				}
				prefutils_setPreference("mail.accountmanager.accounts", "", "user");

				smtpServers = prefutils_getPreference("mail.smtpservers", "");
				smtpServers = smtpServers.split(",");
				for each( var srv in smtpServers ) {
					prefutils_deletePrefBranch("mail.smtpserver."+srv);
				}
				prefutils_setPreference("mail.smtpservers", "", "user");
				
				//On supprime les serveurs LDAP configurés par l'autoconf des comptes "déjà configurés"
				for each ( var ldapServer3MI in OBMXPath(XMLConf, "obmautoconfclient:directories/obmautoconfclient:directory") ) {
					var serverId = new String(ldapServer3MI.getAttribute("id"));
					//alert("ldap server "+serverId);
					if (serverId.length > 0) {
						prefutils_deletePrefBranch("ldap_2.servers." + serverId + ".description");
					}
				}
				// on supprime le niveau de patch
				prefutils_setPreference('config.obm.patch.version', -1,"user");
			};
// 		} catch (e) {
// 			alert("Ooops : " + e)
// 			Components.reportError("Error while resetting parameters:" + e);
// 			return;
// 		}
		//On fait une RAZ des éléments OBM locaux	
			
		// fail silently if OBM_Reset isn't defined bc the connector extension isn't installed yet
		try {	OBM_Reset(); } catch (e) { }
	// 	alert ("setting autoconf status to initialconfig");
		AutoconfStatus.setStatus(AutoconfStatus.INITIALCONFIG);
	}

};

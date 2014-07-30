Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
		  .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");
Components.utils.import("resource://modules/specificRules.jsm");
Components.utils.import("resource://obm-autoconf-client/modules/XMLUtilsOBM.jsm");
var logger = new obmautoconfclientLogger("Autoconfiguration.js");


var prefsManager = {
	getBranchChildren: prefutils_getPrefBranchChildren,
	getPref: prefutils_getPreference,
	setPref: prefutils_setPreference
};

var ldaptool = { 
	query: function (url) {
		logger.log("runLDAPQuery()");
		logger.log("URL: "+url);
		var ldapURL = Components.classes["@mozilla.org/network/io-service;1"]
						.getService(Components.interfaces.nsIIOService)
						.newURI(url, null, null)
						.QueryInterface(Components.interfaces.nsILDAPURL);
		var LDAPquery = Components.classes["@mozilla.org/ldapsyncquery;1"].createInstance(Components.interfaces.nsILDAPSyncQuery);
		var res = LDAPquery.getQueryResults(ldapURL, Components.interfaces.nsILDAPConnection.VERSION3);
		logger.log("LDAP response: "+res);
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
		logger.log("ldaptool returns: "+JSON.stringify(back) );
		return back;
	}
};

		  
		  
var debug = function(msg) {
// 	alert(msg);
};

function doAutoConf(callback, inUpdate) {
	logger.log("doAutoConf()");
	logger.log("Update: "+inUpdate);
	specificRules.getCIA (new CurrentIdAndAccount(), accountManager, prefsManager, function(err,cia) {
		if ( err ) {
			logger.log("doAutoConf: specificRules.getCIA failed");
			return ;
		}
		if ( inUpdate ) {
			specificRules.getPeriodicAutoconfURL(cia, accountManager, prefsManager, ldaptool, function(err,obmUrl,cia) {
				if ( err ){
					logger.log("Error retrieving OBM server url (periodicAutoconfUrl) : "+err);
					return ;
				}
				logger.log("OBM server url : "+obmUrl);
				launchAutoConf(cia, obmUrl,callback);
			});
		} else {
			specificRules.getInitialAutoconfURL(cia, accountManager, prefsManager, ldaptool, function(err,obmUrl,cia) {
				if ( err ){
					logger.log("Error retrieving OBM server url (initialAutoconfUrl) : "+err);
					return ;
				}
				logger.log("OBM server url : "+obmUrl);
				launchAutoConf(cia, obmUrl,callback);
			});
		}
	});
}

		  
function launchAutoConf(cia, obmUrl, callback) {
	logger.log("launchAutoConf()");
	
	conf = getConfig(obmUrl, cia);
	//TODO : notification in the activity manager ?
	prefutils_setupPreferences(OBMXPathFirst(conf, "obmautoconfclient:preferences"));
	//TODO : notification in the activity manager ?
	directoryUtils_setupDirectories(OBMXPathFirst(conf, "obmautoconfclient:directories"));
	
	importCertificates(conf);
	
	var restart = false;

	var installFeedback = function(rs) {
		if ( rs ) {
			restart = true;
		}
		logger.log("End of auto-configuration, launching callback");
		callback(restart);
	};
	
	var launchPatches = function(rs) {
		logger.log("Applying patches");
		if ( rs ) {
			restart = true;
		}
		
		//
		// bug: on initial configuration of an account an extension setup through a patch 
		// never returns...
		//
		if ( AutoconfStatus.getStatus() == AutoconfStatus.INITIALCONFIG ) {
			return callback(restart);
		}
		applyPatches(conf,installFeedback);
	};
	var listener = new extUtils.installationListener (launchPatches, null);
    extUtils.installExtensions(OBMXPathFirst(conf, "obmautoconfclient:extensions"), listener);
	
// 	applyPatches(conf,installFeedback);

}

function _promptForRestart(bool) {
// 	alert ("prompting for restart ? "+bool);
	AutoconfStatus.setStatus( AutoconfStatus.DEFAULT );
	if (! bool) {
		return;
	}
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
	var sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
          .getService(Components.interfaces.nsIStringBundleService);
	var sb = sbs.createBundle("chrome://obm-autoconf-client/locale/autoconfiguration.properties");
	var result = prompts.confirm(null,sb.GetStringFromName("promptRestart.title"),sb.GetStringFromName("promptRestart.caption"));
	if (result) {
// 		Components.classes["@mozilla.org/toolkit/app-startup;1"]
// 			.getService(Components.interfaces.nsIAppStartup)
// 			.quit(nsIAS.eForceQuit|nsIAS.eRestart);
		var Application = Components.classes["@mozilla.org/steel/application;1"].getService(Components.interfaces.steelIApplication);
		Application.restart();
	} else {
		window.setTimeout(function () {
								_promptForRestart(true);
							}, 1000 * 60 * 5);
	}
}

function checkConf() {
// 	alert("checkConf: starting");
  logger.log("checkConf starting, " + AutoconfStatus.statusExists()+ " "+AutoconfStatus.getStatus()+" "+AutoconfStatus.DEFAULT);
	if (!specificRules.shouldAutoconfRunWithoutAccountCreation && (!AutoconfStatus.statusExists() || AutoconfStatus.getStatus() != AutoconfStatus.DEFAULT)) return; // Must check at each launch
	doAutoConf(_promptForRestart,true);
}

function registerConfCheck() {
		var runCheck = {
			notify: function(timer) {
				checkConf();
			}
		}
		var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(runCheck, 1000 * 60 * 60, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
		// Save timer else it is lost and not fired
		this.timer = timer;
}









var importCertificates = function (aConfigurationData) {
	const BEGIN_CERT_TAG = "-----BEGIN CERTIFICATE-----";
	const END_CERT_TAG = "-----END CERTIFICATE-----";
	// http://www.mozilla.org/projects/security/pki/nss/tools/certutil.html
	const trustFlags = "C,C,C";
	var certDB = Components.classes["@mozilla.org/security/x509certdb;1"]
							.getService(Components.interfaces.nsIX509CertDB2);
	var ioService = Components.classes["@mozilla.org/network/io-service;1"]
								.getService(Components.interfaces.nsIIOService);
	var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
									.getService(Components.interfaces.nsIScriptableInputStream);

// 		_logToFile(LOG_INFO, "Import des certificats.\n");

	for each ( var certificate in OBMXPath(aConfigurationData, "obmautoconfclient:certificates/obmautoconfclient:certificate")) {
		var fingerprint;
		if ( certificate.hasAttribute("md5Fingerprint") ) {
			fingerprint = certificate.getAttribute("md5Fingerprint");
		} else if ( certificate.hasAttribute("sha1Fingerprint") ) {
			fingerprint = certificate.getAttribute("sha1Fingerprint");
		}

		if ( _certificateIsAlreadyInstalled(fingerprint) ) {
// 			alert("Certificat " + certificate.getAttribute("src") + " déjà installé.\n");
// 				_logToFile(LOG_DEBUG, "Certificat " + certificate.getAttribute("src") + " déjà installé.\n");
			continue;
		}

		var certificateContent = getDataHTTP(certificate.getAttribute("src"));
		if ( !certificateContent ) { continue; }
		if ( certificateContent == "failed" ) {
// 			alert("Impossible de télécharger le certificat '" + certificate.getAttribute("src") + "'.\n");
// 				_logToFile(LOG_ERROR, "Impossible de télécharger le certificat '" + certificate.getAttribute("src") + "'.\n");
			continue;
		}
		
		if ( certificateContent == "error" ) {
// 			alert("Erreur lors du téléchargement du certificat '" + certificate.getAttribute("src") + "'.\n");
// 				_logToFile(LOG_ERROR, "Erreur lors du téléchargement du certificat '" + certificate.getAttribute("src") + "'.\n");
			continue;
		}
		
		if ( certificateContent == "" ) {
// 			alert("Le certificat " + certificate.getAttribute("src") + " est vide.\n");
// 				_logToFile(LOG_DEBUG, "Le certificat " + certificate.getAttribute("src") + " est vide.\n");
			continue;
		}
			
		certificateContent = certificateContent.replace(/[\r\n]/g, "");
		var begin = certificateContent.indexOf(BEGIN_CERT_TAG);
		var end = certificateContent.indexOf(END_CERT_TAG);
		certificateContent = certificateContent.substring(begin + BEGIN_CERT_TAG.length, end);

		try {
// 			alert("lancement de addCertFromBase64");
			certDB.addCertFromBase64(certificateContent, trustFlags, ""); // name: not taken into account, so ""!
		} catch (e) {
// 			alert("Installation du certificat " + certificate.getAttribute("src") + " impossible.\n");
// 				_logToFile(LOG_ERROR, "Installation du certificat " + certificate.getAttribute("src") + " impossible.\n");
		}
	}
}

var _certificateIsAlreadyInstalled = function (aCertificateFingerprint) {
	var certDB = Components.classes["@mozilla.org/security/x509certdb;1"]
							.getService(Components.interfaces.nsIX509CertDB);

	var installedCertificates = new Array();

	var certificates = {};
	certDB.findCertNicknames(null, // default token
							Components.interfaces.nsIX509CertDB.TRUSTED_SSL,
							{}, certificates);

	for each ( var certificateDescription in certificates.value ) {
		// format de chaque entrée :
		// (\u0001 Token de stockage)? \u0001 Nom du certificat \u0001 Clé du certificat
		var pieces = certificateDescription.split("\u0001");
		var dbKey = pieces.pop();
		var certificate = certDB.findCertByDBKey(dbKey, null);
		installedCertificates.push(certificate);
	}

	for each ( var certificate in installedCertificates ) {
		if ( certificate.md5Fingerprint == aCertificateFingerprint
		|| certificate.sha1Fingerprint == aCertificateFingerprint ) {
			return true;
		}
	}
	return false;
}





















	
function applyPatches (configurationData, then) {
	
	var _setupProxies = function (aConfigurationData) {
		for each ( var proxy in OBMXPath(aConfigurationData, "obmautoconfclient:proxies/obmautoconfclient:proxy")) {
			if ( proxy.getAttribute("type") == "auto" ) {
				prefutils_setPreference("network.proxy.type", 2, "user");
				prefutils_setPreference("network.proxy.autoconfig_url", proxy.getAttribute("value"),"user");
			} else if ( proxy.getAttribute("type") == "manual" ) {
				prefutils_setPreference("network.proxy.type", 1,"user");
				prefutils_setPreference("network.proxy.share_proxy_settings", true,"user");
				for each ( var protocol in ["http", "ssl", "ftp", "gopher", "socks"] ) {
					prefutils_setPreference("network.proxy." + protocol, proxy.getAttribute("host"), "user");
					prefutils_setPreference("network.proxy." + protocol + "_port", Number(proxy.getAttribute("port")).valueOf(), "user");
				}
				if ( proxy.hasAttribute("exclude") ) {
					prefutils_setPreference("network.proxy.no_proxies_on", proxy.getAttribute("exclude"), "user");
				}
			}
		}
	}

	var _setupAccounts = function(aConfigurationData) {
		// COMPTES
		var accounts = OBMXPathFirst(aConfigurationData, "obmautoconfclient:accounts");

		var currentAccounts = prefutils_getPreference("mail.accountmanager.accounts", "");
		var allAccounts = (currentAccounts != "" ? currentAccounts.split(",") : []);

// 		_logToFile(LOG_INFO, "Configuration des comptes de messagerie.\n");

		for each ( var account in OBMXPath(aConfigurationData, "obmautoconfclient:accounts/obmautoconfclient:account")) {
            var id = account.getAttribute("id");
			if ( currentAccounts.indexOf(id) != -1 ) {
				// compte existe déjà
				continue;
			}
			prefutils_setPreference("mail.account." + id + ".identities",
						account.getAttribute("identities").replace(" ", ","));
			prefutils_setPreference("mail.account." + id + ".server",
						account.getAttribute("server"));
			allAccounts.push(id);
		}

		prefutils_setPreference("mail.accountmanager.accounts", allAccounts.join(","));
		if ( accounts.hasAttribute("defaultAccount") ) {
			prefutils_setPreference("mail.accountmanager.defaultaccount", accounts.getAttribute("defaultAccount"));
		}

		// IDENTITÉS
		var identities = OBMXPathFirst(aConfigurationData, "obmautoconfclient:identities");

		for each ( var identity in OBMXPath(aConfigurationData, "obmautoconfclient:identities/obmautoconfclient:identity") ) {
            var id = identity.getAttribute("id");
			if ( _prefBranchExists("mail.identity." + id) ) {
			// identité existe déjà
				continue;
			}

			prefutils_setPreference("mail.identity." + id + ".fullName", identity.getAttribute("fullName"));
			prefutils_setPreference("mail.identity." + id + ".useremail", identity.getAttribute("fromAddress"));
			prefutils_setPreference("mail.identity." + id + ".smtpServer", identity.getAttribute("smtpServer"));
			if ( identity.hasAttribute("autocompleteDirectory") ) {
				prefutils_setPreference("mail.identity." + id + ".directoryServer", "ldap_2.servers." + identity.getAttribute("autocompleteDirectory"));
				prefutils_setPreference("mail.identity." + id + ".overrideGlobal_Pref", true);
			}
			
			
			if ( identity.hasAttribute("draftFolder_pickerMode") ) {
				prefutils_setPreference("mail.identity." + id + ".drafts_folder_picker_mode", identity.getAttribute("draftFolder_pickerMode"));
			}
			if ( identity.hasAttribute("fccFolder_pickerMode") ) {
				prefutils_setPreference("mail.identity." + id + ".fcc_folder_picker_mode", identity.getAttribute("fccFolder_pickerMode"));
			}
			if ( identity.hasAttribute("stationeryFolder_pickerMode") ) {
				prefutils_setPreference("mail.identity." + id + ".tmpl_folder_picker_mode", identity.getAttribute("stationeryFolder_pickerMode"));
			}
			if ( identity.hasAttribute("draftFolder") ) {
				var value = identity.getAttribute("draftFolder");
				if ( value.match(/.*@.*@/) ) {
					//multi-domain : replace 'login@domain@server' by 'login%40domain@server'
					value = value.replace("@","%40");
				}
				prefutils_setPreference("mail.identity." + id + ".draft_folder", value);
			}
			if ( identity.hasAttribute("fccFolder") ) {
				var value = identity.getAttribute("fccFolder");
				if ( value.match(/.*@.*@/) ) {
					//multi-domain : replace 'login@domain@server' by 'login%40domain@server'
					value = value.replace("@","%40");
				}
				prefutils_setPreference("mail.identity." + id + ".fcc_folder", value);
			}
			if ( identity.hasAttribute("stationeryFolder") ) {
				var value = identity.getAttribute("stationeryFolder");
				if ( value.match(/.*@.*@/) ) {
					//multi-domain : replace 'login@domain@server' by 'login%40domain@server'
					value = value.replace("@","%40");
				}
				prefutils_setPreference("mail.identity." + id + ".stationery_folder", value);
			}
			
			if ( identity.hasAttribute("composeHtml")) {
				prefutils_setPreference("mail.identity." + id + ".compose_html",
										identity.getAttribute("composeHtml") == "true");
			}
			
			if ( identity.hasAttribute("replyOnTop")) {
				var value;
				switch ( identity.getAttribute("replyOnTop") ) {
					case "1":
					value = 1;
					break;
					case "2":
					value = 2;
					break;
					case "3":
					value = 3;
					break;
				}
				prefutils_setPreference("mail.identity." + id + ".reply_on_top",
										value);
			}
			
			if ( identity.hasAttribute("sigBottom")) {
				prefutils_setPreference("mail.identity." + id + ".sig_bottom",
										identity.getAttribute("sigBottom") == "true");
			}
		}

		// SERVEURS
		var servers = OBMXPathFirst(aConfigurationData, "obmautoconfclient:servers");

		for each ( var server in OBMXPath(aConfigurationData, "obmautoconfclient:servers/obmautoconfclient:server[@type='imap' or @type='pop3' or @type='nntp']")) {
			var id = server.getAttribute("id");
			if ( prefutils_prefBranchExists("mail.server." + id) ) {
				// serveur existe déjà
				continue;
			}

			prefutils_setPreference("mail.server." + id + ".hostname", server.getAttribute("hostname"));
			prefutils_setPreference("mail.server." + id + ".type", server.getAttribute("type"));
			prefutils_setPreference("mail.server." + id + ".name", server.getAttribute("label"));
			if ( server.hasAttribute("username") ) {
				prefutils_setPreference("mail.server." + id + ".userName", server.getAttribute("username"));
			}
			if ( server.hasAttribute("port") ) {
				prefutils_setPreference("mail.server." + id + ".port", server.getAttribute("port"));
			}
			if ( server.hasAttribute("secureConnection") ) {
				var value;
				switch ( server.getAttribute("secureConnection") ) {
				case "never":
					value = 0;
					break;
				case "tlsIfAvailable":
					value = 1;
					break;
				case "tls":
					value = 2;
					break;
				case "ssl":
					value = 3;
					break;
				}

				prefutils_setPreference("mail.server." + id + ".socketType", value);
			}
			if ( server.hasAttribute("secureAuthentication") ) {
				prefutils_setPreference("mail.server." + id + ".useSecAuth", server.getAttribute("secureAuthentication") == "true");
			}

			if ( server.hasAttribute("trashFolder") ) {
				var value = server.getAttribute("trashFolder");
				if ( value.match(/.*@.*@/) ) {
					//multi-domain : replace 'logi.getAttribute("domain")@server' by 'login%40domain@server'
					value = value.replace("@","%40");
				}
				prefutils_setPreference("mail.server." + id + ".trash_folder_name", value);
			}
			
			if ( server.hasAttribute("downloadBodies") ) {
				prefutils_setPreference("mail.server." + id + ".download_bodies_on_get_new_mail",
							server.getAttribute("downloadBodies") == "true");
			}
			
			if ( server.hasAttribute("offlineDownload") ) {
				prefutils_setPreference("mail.server." + id + ".offline_download",
							server.getAttribute("offlineDownload") == "true");
			}
			
			if ( server.hasAttribute("useSubscription") ) {
				prefutils_setPreference("mail.server." + id + ".using_subscription",
							server.getAttribute("useSubscription") == "true");
			}
			
			if ( server.hasAttribute("useIdle") ) {
				prefutils_setPreference("mail.server." + id + ".use_idle",
							server.getAttribute("useIdle") == "true");
			}
		}

		var addedServers = [];
		var currentServers = prefutils_getPreference("mail.smtpservers");
		currentServers = (currentServers ? currentServers.split(",") : []);

		for each ( var server in OBMXPath(aConfigurationData, "obmautoconfclient:servers/obmautoconfclient:server[@type='smtp']")) {
			var id = server.getAttribute("id");
			if ( currentServers.indexOf(id.toString()) != -1 ) {
			// serveur existe déjà
			continue;
			}

			prefutils_setPreference("mail.smtpserver." + id + ".hostname",
							server.getAttribute("hostname"));
			prefutils_setPreference("mail.smtpserver." + id + ".description",
							server.getAttribute("label"));
			if ( server.hasAttribute("username") ) {
				prefutils_setPreference("mail.smtpserver." + id + ".username",
							server.getAttribute("username"));
				prefutils_setPreference("mail.smtpserver." + id + ".auth_method", 1);
			} else {
				prefutils_setPreference("mail.smtpserver." + id + ".auth_method", 0);
			}

			if ( server.hasAttribute("port") ) {
				prefutils_setPreference("mail.smtpserver." + id + ".port",
							server.getAttribute("port"));
			}

			if ( server.hasAttribute("secureConnection") ) {
				var value;
				switch ( server.getAttribute("secureConnection") ) {
				case "never":
					value = 0;
					break;
				case "tlsIfAvailable":
					value = 1;
					break;
				case "tls":
					value = 2;
					break;
				case "ssl":
					value = 3;
					break;
				}

				prefutils_setPreference("mail.smtpserver." + id + ".try_ssl", value);
				addedServers.push(id.toString());
			}
		}

		prefutils_setPreference("mail.smtpservers", currentServers.concat(addedServers).join(","));

		if ( servers.hasAttribute("defaultSMTP") ) {
			prefutils_setPreference("mail.smtp.defaultserver", servers.getAttribute("defaultSMTP"));
		}
	};

	var _suppressDirectories = function (aConfigurationData) {
		for each ( var directory in OBMXPath(aConfigurationData, "obmautoconfclient:directories/obmautoconfclient:directory") ) {
			prefutils_deletePrefBranch("ldap_2.servers." + directory.getAttribute("id"));
		}
	};

	var _setupDirectories = function (aConfigurationData) {
		var autoCompleteDirectories = prefutils_getPreference("ldap_2.autoComplete.ldapServers", "");

		for each ( var directory in OBMXPath(aConfigurationData, "obmautoconfclient:directories/obmautoconfclient:directory") ) {
			var id = directory.getAttribute("id");
					
			if ( prefutils_getPreference("ldap_2.servers." + id + ".description") != undefined ) {
				// annuaire existe déjà
				continue;
			}

			// important, sert à supprimer notamment la préférence ".position"
			prefutils_deletePrefBranch("ldap_2.servers." + id);

			prefutils_setPreference("ldap_2.servers." + id + ".description", directory.getAttribute("label"));
			prefutils_setPreference("ldap_2.servers." + id + ".uri", directory.getAttribute("uri"));
			if ( directory.hasAttribute("bindDN") ) {
				prefutils_setPreference("ldap_2.servers." + id + ".auth.dn", directory.getAttribute("bindDN"));
				prefutils_setPreference("ldap_2.servers." + id + ".auth.savePassword", true);
			}
			if ( directory.hasAttribute("maxHits") ) {
				prefutils_setPreference("ldap_2.servers." + id + ".maxHits", Number(directory.getAttribute("maxHits")).valueOf());
			}
			
			// si les prefs suivantes ne sont pas renseignées la complétion d'addresse crashe Thunderbird
			prefutils_setPreference("ldap_2.servers." + id + ".filename", id + ".mab");
			prefutils_setPreference("ldap_2.servers." + id + ".replication.lastChangeNumber", 0);                
			
			if ( directory.hasAttribute("autocomplete") ) {
				//extension multi-ldap : activer l'annuaire pour l'auto-complétion
				if ( !autoCompleteDirectories.match("ldap_2.servers." + id) ) {
					if (autoCompleteDirectories != "") {
					autoCompleteDirectories += ",";
					}
					autoCompleteDirectories += "ldap_2.servers." + id;
				}
			}
			
		}
		//extension multi-ldap : activer tous les annuaires pour l'auto-complétion
		prefutils_setPreference("ldap_2.autoComplete.ldapServers", autoCompleteDirectories);
		prefutils_setPreference("ldap_2.autoComplete.useDirectory", true); 
	};
	
	// applique un patch de supression des préférences
	var _suppressPreferences = function (aConfigurationData) {
		for each ( var preference in OBMXPath(aConfigurationData, "obmautoconfclient:preferences/obmautoconfclient:preference") ) {
			prefutils_deletePrefBranch(preference.getAttribute("name"));
		}
	};

	// positionne les préférences utilisateur, qui seront stockées dans le
	// fichier "prefs.js" du profil Mozilla de l'utilisateur
	var _setupPreferences = function (aConfigurationData) {
// 		debug("entering setupPreferences");
		for each ( var preference in OBMXPath(aConfigurationData, "obmautoconfclient:preferences/obmautoconfclient:preference") ) {
// 			debug("preference :"+preference.getAttribute("name"));
			if (preference.hasAttribute("remove")) {
				if (preference.getAttribute("remove") == "true") {
					prefutils_deletePrefBranch(preference.getAttribute("name"));
				}
			} else {
				var typedValue;
				// créé une variable JavaScript typée
				switch ( preference.getAttribute("type") ) {
					case "string":
					typedValue = preference.getAttribute("value");
					break;
					case "integer":
					typedValue = Number(preference.getAttribute("value")).valueOf(); // NaN ??
					break;
					case "boolean":
					typedValue = (preference.getAttribute("value") == "true");
					break;
					default:
					break;
				}
				logger.log("Setting preference:",preference.getAttribute("name"),"=>",typedValue);
				prefutils_setPreference(preference.getAttribute("name"), typedValue, preference.getAttribute("set"));
			}
		}
	};
		
	var lastVersion = 0;
	var currentVersion = prefutils_getPreference('config.obm.patch.version', -1);

	var patchFns = [];
	var shouldRestart = false;
	
	var next = function(restart) {
		if ( restart ) {
			shouldRestart = true;
		}
		debug("number of patches to apply: "+patchFns.length);
		if ( patchFns.length ) {
			return patchFns.shift()();
		}
		debug("setting config.obm.patch.version to "+lastVersion);
		prefutils_setPreference('config.obm.patch.version', lastVersion,"user");
		//_promptForRestart(shouldRestart);
		then(shouldRestart);
	};

	
	for each (var patch in OBMXPath(configurationData, "obmautoconfclient:patches/obmautoconfclient:patch")) {
		lastVersion = parseInt(patch.getAttribute("version"),10);
		if (currentVersion < lastVersion) {
			logger.log("Patch ",lastVersion,"set to be applied");
			patchFns.push( (function(patch) {
				return function() {
// 					lastVersion = parseInt(patch.getAttribute("version"));
					logger.log("Applying patch #",lastVersion);
// 					debug("applying patch of version "+patch.getAttribute("version"));
					var add = OBMXPathFirst(patch, "obmautoconfclient:add");
					var del = OBMXPathFirst(patch, "obmautoconfclient:delete");
					_setupProxies(add);
					importCertificates(add);
					_setupAccounts(add);
					_suppressDirectories(del);
					_setupDirectories(add);
					_suppressPreferences(del);
					_setupPreferences(add);
					logger.log("patch : end of synchronous setup, launching installationListener");
                    var listener = new extUtils.installationListener (next, function(thing) { debug("progress callback: "+thing); });
                    extUtils.installExtensions(OBMXPathFirst(patch, "obmautoconfclient:extensions"), listener);
				}
			})(patch) );
		}
	}
	debug("patches: got "+patchFns.length+" patches to run");
	if ( !patchFns.length ) {
		return then();
	}
	next();
}

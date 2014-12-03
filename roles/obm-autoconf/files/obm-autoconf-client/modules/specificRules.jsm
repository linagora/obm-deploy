Components.utils.import("resource://modules/logger.jsm");

var EXPORTED_SYMBOLS = ["specificRules"];

var config = {
    obm: {
        autoconfServer: "{{ entry_point }}",
        shouldAutoconfRunWithoutAccountCreation: true,
        mail: {
            incoming: {
                hostname: "{{ autoconf_imap_host }}",
                type: "imap",
                port: 143,
                socketType: 3,
                auth: Components.interfaces.nsMsgAuthMethod.passwordCleartext
            },
            outgoing: {
                hostname: "{{ autoconf_smtp_host }}",
                port: 587,
                socketType: 3,
                auth: Components.interfaces.nsMsgAuthMethod.none
            }
        }
    },
    ldap: {
        primaryUri: "ldap://{{ ldap_host }}/{{ autoconf_search_base }}?{{ autoconf_search_fields }}?sub?{{ autoconf_search_filter }}",
        periodicUri: "ldap://{{ ldap_host }}/{{ autoconf_search_base }}?{{ autoconf_search_fields }}?sub?{{ autoconf_search_filter }}"
    }
}

var configData = {};
var logger = new obmautoconfclientLogger("specificRules");
var specificRules = {

	initialInformationsRetrieval: function(email, ldaptool, callback) {
		var ldapUrl = config.ldap.primaryUri.replace('%email%', email), data = null;

		try {
			data = ldaptool.query(ldapUrl);
		} catch (e) {
		    Components.utils.reportError(e);
		    return callback("LDAP query error");
		}

		if ( data == null ) {
		    return callback("invalidAddress");
		}

		configData = {
			email: email, // this will be used later on this module, but isn't necessary for account creation
			displayname: data.cn[0],
			incoming: {
				type: config.obm.mail.incoming.type,
				port: config.obm.mail.incoming.port,
				hostname: config.obm.mail.incoming.hostname,
				username: data.mailbox[0],
				socketType: config.obm.mail.incoming.socketType,
				auth: config.obm.mail.incoming.auth,
				deleteByAgeFromServer: false
			},
			outgoing: {
				port: config.obm.mail.outgoing.port,
				hostname: config.obm.mail.outgoing.hostname,
				username: data.mailbox[0],
				socketType: config.obm.mail.outgoing.socketType,
				auth: config.obm.mail.outgoing.auth
			}
		};

		callback(null,configData);
	},

	// when the account is created, and BEFORE launching the HTTP request to the autoconf server
	postAccountCreation: function(accountId, accountManager, prefsManager, callback) {
		if ( accountId ) {
			var serverId = prefsManager.getPref("mail.account."+accountId+".server",null);
			if ( serverId && configData.displayname ) {
				prefsManager.setPref("mail.server."+serverId+".name", configData.displayname ,"user");
			}
			var identities = accountManager.getIdentities(accountId);
			if ( identities && identities.length ) {
				var identity = identities[0];
				var smtpServerId = prefsManager.getPref("mail.identity."+identity+".smtpServer",null);
				if ( smtpServerId ) {
					prefsManager.setPref("mail.smtpserver." + smtpServerId + ".description", "AutoConf SMTP Server");
					prefsManager.setPref("mail.smtpserver." + smtpServerId + ".hostname", configData.outgoing.hostname);
				}
			}

			//record accountId
			var accounts = prefsManager.getPref("extensions.autoconf.managed","");
			if ( !accounts ) {
				accounts = [ accountId ];
			} else {
				accounts = accounts.split(",");
				if ( accounts.indexOf(accountId) < 0 ) {
					accounts.push(accountId);
				}
			}
			prefsManager.setPref("extensions.autoconf.managed",accounts.join(","));
		}

		callback();
	},


	getCIA: function(cia, accountManager, prefsManager, callback ){
		logger.log("getCIA()");
// 		var allAccounts = prefsManager.getPref( "mail.accountmanager.accounts","" ).split(",");
// 		for each( accountId in allAccounts ) {
// 			var obmServer = prefsManager.getPref("mail.account."+accountId+".OBMserver", "" );
// 			var obmEmail = prefsManager.getPref("mail.account."+accountId+".OBMemail", "" );
// 			if ( obmServer.length && obmEmail.length ) {
				// found dedicated autoconfigured account
				var accountsString = prefsManager.getPref("extensions.autoconf.managed","");
// 				logger.log("accounts: "+accounts.join(","));
// 				logger.log("accounts.length: "+accounts.length);
				if ( accountsString.length ) {
					var accounts = accountsString.split(",");
					accountId = accounts[0];
					logger.log("working with account id "+accountId);
					var identities = accountManager.getIdentities(accountId);
					logger.log("identities: " + identities);
					if ( identities.length ) {
						var identityId = identities[0];
						logger.log("working with identity id "+ identityId);
						var identity = accountManager.getIdentityProperties(identityId);
						logger.log("identity: "+ JSON.stringify(identity));
						var smtpServerId = accountManager.getSMTPServerId(identityId);
						logger.log("smtpServerId: "+ smtpServerId );
						var outServerId = accountManager.getServerId(accountId);
						logger.log("outServerId: "+ outServerId);
						
						if ( smtpServerId && outServerId ) {
							var outServer = accountManager.getServerProperties( outServerId );
							logger.log("outServerProperties: "+ JSON.stringify(outServer) );
							var smtpServerHostname = accountManager.getSMTPServerProperties(smtpServerId).hostname;
							var hostname = outServer.realhostname ? outServer.realhostname : outServer.hostname;
							var username = outServer.realUsername ? outServer.realUsername : outServer.Username;
							var fullname = identity.fullName;
							var directoryserver = identity.directoryServer;
							var email = identity.useremail;
							cia.smtpServerHostname = smtpServerHostname;
							cia.hostname = hostname;
							cia.username = username;
							cia.fullname = fullname;
							cia.directoryserver = directoryserver;
							cia.email = email;
							logger.log("CIA email : "+cia.email);
							return callback(null, cia);
						}
						
					}
				}
// 			}
// 		}
		logger.log("CIA email : "+cia.email);
		return callback(null, cia);
	},

	//
	// this one is called one time after the initial account creation
	//
	getInitialAutoconfURL: function(cia, accountManager, prefsManager, ldaptool, callback) {
		logger.log("getInitialAutoconfURL: return URL :"+"https://" + config.obm.autoconfServer + "/obm-autoconf/autoconfiguration/" + cia.email)
		return callback(null, "https://" + config.obm.autoconfServer + "/obm-autoconf/autoconfiguration/" + cia.email, cia);
	},

	getPeriodicAutoconfURL: function(cia, accountManager, prefsManager, ldaptool, callback) {
		logger.log("getPeriodicAutoconfURL: obm url: "+"https://" + config.obm.autoconfServer + "/obm-autoconf/autoconfiguration/" + cia.email);
		return callback(null, "https://" + config.obm.autoconfServer + "/obm-autoconf/autoconfiguration/" + cia.email, cia);
	},

  shouldAutoconfRunWithoutAccountCreation: config.obm.shouldAutoconfRunWithoutAccountCreation
};

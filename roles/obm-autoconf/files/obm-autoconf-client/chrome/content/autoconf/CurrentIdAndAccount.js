var logger = new obmautoconfclientLogger("CurrentIdAndAccount");

function CurrentIdAndAccount() {
	logger.log("CurrentIdAndAccount()");
	var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
					.getService(Components.interfaces.nsIMsgAccountManager); 
	var smtpService = Components.classes["@mozilla.org/messengercompose/smtp;1"]
					  .getService(Components.interfaces.nsISmtpService);
	
        var defaultAccount;
        try {
	  defaultAccount = acctMgr.defaultAccount;//FIXME: What if the default account isn't the one we want 
		//(e.g. if the user deleted an identity and the default account turns out to be the local folder)
		// => we should focus on the account created during autoconf ; we should save its id in a custom pref
        } catch (e) {
	}
	if (! defaultAccount ) {
		logger.log("Error: default account not found");
		return;
	}
	var defaultIdentity =  defaultAccount.defaultIdentity;
	if (! defaultIdentity ) {
		logger.log("Error: default identity not found");
		return;
	}
	var incomingServer = defaultAccount.incomingServer;
	if (! incomingServer ) {
		logger.log("Error: default account incoming server not found");
		return;
	}
	
	var smtpServer;
	var smtpServerKey = defaultIdentity.smtpServerKey;
	if (smtpServerKey) {
		smtpServer = smtpService.getServerByKey(smtpServerKey);
	} else {
		smtpServer = smtpService.defaulServer;
	}
	this.smtpServerHostname = smtpServer.hostname;
	
	this.hostname = incomingServer.realHostName;
	if (! this.hostname) {
		this.hostname = incomingServer.hostName;
	}
	
	this.username = incomingServer.realUsername;
	if (! this.username) {
		this.username = incomingServer.username;
	}
	
	this.fullname = defaultIdentity.fullName;
	this.directoryserver = defaultIdentity.directoryServer;
	this.email = defaultIdentity.email;
	
	var me = this;
	
	this.setSMTP = function(newServerHostname) {
		smtpServer.hostname = newServerHostname;
		me.smtpServerHostname = smtpServer.hostname
	}
	
	this.setUserMail = function(newUserMail) {
		defaultIdentity.email = newUserMail;
		me.email = this.defaultIdentity.email;
	}
	
	this.setFullName = function(newFullName) {
		defaultIdentity.fullName = newFullName;
		me.fullname = defaultIdentity.fullName;
	}
	
	this.setHostName = function(newHostname) {
		incomingServer.realHostName = newHostname;
		me.hostname = incomingServer.realHostName;
	}
	
	this.setDirectoryServer = function(newDS) {
		defaultIdentity.directoryServer = newDS;
		me.directoryserver = defaultIdentity.directoryServer;
	}
	
	this.setUsername = function(newUN) {
		incomingServer.realUsername = newUN;
		smtpServer.username = newUN; //TODO : distinguish IMAP and SMTP username ?
		me.username = incomingServer.realUsername;
	}
	
	var _replace = function(match) {
		var result = me[match.replace("|","","g")];
		if ((! result) || ( typeof result !="string")) {
			//debug
			return "ERROR-" + match + "-ERROR";
		}
		return result;
	}
	
	this.fillConfig =function (config) {
		return config.replace(/\|[^\|]*\|/gi,_replace);
	}
}
	

var accountManager = {
	getAccounts: function() {
		var accts = prefutils_getPreference("mail.accountmanager.accounts", "");
		if ( !accts.length ) {
			return [];
		}
		return accts.split(",");
	},
	getAccountId: function(email) {
		var allAccounts = this.getAccounts();
		for each( var acct in allAccounts ) {
			var identities = this.getIdentities(acct);
			for each(identity in identities) {
				var iemail = this.getIdentityEmail(identity).toLowerCase();
				if ( email.toLowerCase() == iemail ) {
					return acct;
				}
			}
		}
	},
	getIdentities: function(accountId) {
		var ids = prefutils_getPreference("mail.account."+accountId+".identities", "");
		if ( !ids.length ) {
			return [];
		}
		return ids.split(",");
	},
	getIdentityEmail: function(identityId) {
		return prefutils_getPreference("mail.identity."+identityId+".useremail", "");
	},
	getSMTPServerId: function(identityId) {
		return prefutils_getPreference("mail.identity."+identityId+".smtpServer", "");
	},
	getServerId: function(accountId) {
		return prefutils_getPreference("mail.account."+accountId+".server", "");
	},
	getSMTPServerProperties: function(smtpServerId) {
		var branch = "mail.smtpserver."+smtpServerId;
		var keys = prefutils_getPrefBranchChildren(branch);
		var back  = {};
		for each ( var k in keys ) {
			k = k.substring(branch.length+1);
			back[k] = prefutils_getPreference("mail.smtpserver."+smtpServerId+"."+k,"");
		}
		return back;
	},
	getIdentityProperties: function(identityId) {
		var branch = "mail.identity."+identityId;
		var keys = prefutils_getPrefBranchChildren(branch);
		var back  = {};
		for each ( var k in keys ) {
			k = k.substring(branch.length+1);
			back[k] = prefutils_getPreference("mail.identity."+identityId+"."+k,"");
		}
		return back;
	},
	getServerProperties: function(serverId) {
		var branch = "mail.server."+serverId;
		var keys = prefutils_getPrefBranchChildren(branch);
		var back  = {};
		for each ( var k in keys ) {
			k = k.substring(branch.length+1);
			back[k] = prefutils_getPreference("mail.server."+serverId+"."+k,"");
		}
		return back;
	}
};




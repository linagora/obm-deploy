var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
loader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");
loader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/PrefUtils.js");
loader.loadSubScript("chrome://obm-autoconf-client/content/autoconf/CurrentIdAndAccount.js");
Components.utils.import("resource://modules/specificRules.jsm");

function redefineEmailConfigWizardJS() {
	EmailConfigWizard.prototype.findConfig = function(domain,mail) {
		var me = this;
		if (this._probeAbortable) {
			gEmailWizardLogger.info("aborting existing config search");
			this._probeAbortable.cancel();
		}
		this.startSpinner("all", "looking_up_settings_isp");
		var initialConfig = defaultConfigObject(mail);
		me._userChangedIncomingProtocol = true;
		me._userChangedIncomingPort = true;
		me._userChangedIncomingSocketType = true;
		me._userChangedIncomingServer = true;
		this._probeAbortable = runLDAPAutoConf(mail,
			function (config) {	//success
				me._probeAbortable = null;
				me._realname = config.displayname;
				me._email = mail;
// 				var autoconf_accounts = prefutils_getPreference("extensions.obm-autoconf-client.autoconfigEmails","") || "";
// 				alert("autoconf_accounts: "+(typeof autoconf_accounts) );
// 				alert("autoconf_accounts length: "+autoconf_accounts.length );
// 				autoconf_accounts = autoconf_accounts.length ? autoconf_accounts.split(",") : [];
// 				alert("autoconf_accounts: "+(typeof autoconf_accounts)+ " "+autoconf_accounts );
// 				autoconf_accounts.push(mail);
// 				alert("autoconf_accounts length: "+autoconf_accounts.length );
// 				alert("autoconf_accounts: "+(typeof autoconf_accounts)+ " "+autoconf_accounts );
// 				
				// store autoconfigured emails so we can handle reset
// 				prefutils_setPreference("extensions.obm-autoconf-client.autoconfigEmails", autoconf_accounts.join(","),"user" );
				me.foundConfig(config);
                me.stopSpinner("found_settings_isp");
                if ( "showEditButton" in me ) {
                   me.showEditButton();
                }
			},
			function (e) { //error
				
				if (e == "invalidAddress") {
					var strbundle = document.getElementById("accountcreation-strings");
					var confirmTitle=strbundle.getString("invalidAddressTitle");
					var confirmCaption=strbundle.getString("invalidAddressCaption");
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
					var needToRestart = prompts.confirmEx(null,
						confirmTitle,
						mail + "\n" + confirmCaption,
						Components.interfaces.nsIPromptService.STD_YES_NO_BUTTONS,
						null,
						null,
						null,
						null,
						{value: false});
					if (needToRestart == 0) {
                        if ( "onBack" in me ) {
                           me.onBack();
                         }
                         return;
					} else {
						me.setError("emailerror", "double_check_email");
						document.getElementById("email").setAttribute("error", "true");
					}
				}
				me._probeAbortable = null;
				me._realname = mail;
				me._email = mail;
                if ( "updateConfig" in me ) {
                  me.updateConfig(initialConfig);
                } else if ( "_prefillConfig" in me ) {
                  me._prefillConfig(initialConfig);
                }
				me.stopSpinner("manually_edit_config");
				me.editConfigDetails();
		});
	};
	
	EmailConfigWizard.prototype.validateRealName = function() {
		this.clearError("nameerror");
		realname.removeAttribute("error");
	};
	
	EmailConfigWizard.prototype.oldFinish = EmailConfigWizard.prototype.finish;
	
	EmailConfigWizard.prototype.finish = function() {
		this.oldFinish();
		
		// this._email
		
		var accountId = accountManager.getAccountId(this._email);
// 		alert(accountId);
		if ( accountId ) {
			var autoconfAccounts = prefutils_getPreference("extensions.autoconf.managedAccounts","");
			if ( autoconfAccounts.length ) {
				autoconfAccounts = autoconfAccounts.split(",");
			} else {
				autoconfAccounts = [];
			}
			autoconfAccounts.push(accountId);
			prefutils_getPreference("extensions.autoconf.managedAccounts",autoconfAccounts.join(",") );
            AutoconfStatus.setStatus(AutoconfStatus.INITIALCONFIG);
		}
		specificRules.postAccountCreation(accountId, accountManager, {
			getBranchChildren: prefutils_getPrefBranchChildren,
			getPref: prefutils_getPreference,
			setPref: prefutils_setPreference
		},function() {
			//TODO preferred originator and recipient
			if (AutoconfStatus.getStatus() == AutoconfStatus.INITIALCONFIG) {
				var winmed = Components.classes['@mozilla.org/appshell/window-mediator;1']
							.getService(Components.interfaces.nsIWindowMediator);
				var win = winmed.getMostRecentWindow("mail:3pane");
				var myDialog = null;
				if (!win) {
					win = window;
				}
				myDialog = win.open("chrome://obm-autoconf-client/content/autoconf/autoconfWindow.xul","AutoconfDialog","chrome=yes,modal=yes,close=no,dialog=yes,centerscreen=yes");
			} else {
              checkConf();
            }
		});
		
		//rename account
	}
}

function redefineEmailConfigWizardLayout() {
	//hide real name field (auto completed with LDAP value)
	var realname = document.getElementById("realname");
	realname.value = "placeholder";
	var hb1 = realname.parentNode;
	hb1.hidden = true;
}

function redefineEmailConfigWizardInputListeners() {
  if ( EmailConfigWizard.prototype._prefillConfig ) {
    var realonInputEmail = EmailConfigWizard.prototype.onInputEmail;
    var bindEmailInput = function () {
      var emailInput = window.document.getElementById("email"),
          nameInput = window.document.getElementById("realname");
        gEmailConfigWizard._realname = emailInput.value;
        nameInput.value = emailInput.value;
        realonInputEmail.call(gEmailConfigWizard);
    };
    EmailConfigWizard.prototype.onInputEmail = bindEmailInput;
  }
};


function redefineEmailConfigWizard() {
	redefineEmailConfigWizardJS();
	redefineEmailConfigWizardLayout();
    redefineEmailConfigWizardInputListeners();
}

redefineEmailConfigWizard();

var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
					.getService(Components.interfaces.nsIMsgAccountManager);
try {
	var am = acctMgr.defaultAccount;
	if (!am) throw "no default";
} catch(e) {
	AutoconfStatus.setStatus(AutoconfStatus.INITIALCONFIG);
}



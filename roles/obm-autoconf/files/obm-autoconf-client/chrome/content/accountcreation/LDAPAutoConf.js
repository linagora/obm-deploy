Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
		  .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");
Components.utils.import("resource://modules/specificRules.jsm");
		  
		  
var logger = new obmautoconfclientLogger("Autoconfiguration.js");
		  
function defaultConfigObject(address) {
	var result = new AccountConfig();
	result.id=(new Date).getTime();
	result.source = AccountConfig.kSourceUser;
	result.displayname = address;
	result.incoming.type = "imap";
	result.incoming.hostname = "localhost";
	result.incoming.port = 143;
	result.incoming.username = address;
	result.incoming.socketType = 3;
	result.incoming.auth = Ci.nsMsgAuthMethod.passwordCleartext;
	result.incoming.deleteByAgeFromServer = false;
	result.outgoing.hostname = "localhost";
	result.outgoing.port = 25;
	result.outgoing.username = address;
	result.outgoing.socketType = 3;
	result.outgoing.auth = Ci.nsMsgAuthMethod.passwordCleartext;
	return result;
}
	
function TimeoutCallbackAbortable(setTimeoutID, func) {
	this._id = setTimeoutID;
	this._callback = func;
}

TimeoutCallbackAbortable.prototype = {
	cancel : function() {
		clearTimeout(this._id);
		this._callback(null);
	}
}

extend(TimeoutCallbackAbortable,Abortable);

function runLDAPAutoConf(mail, successCallback, errorCallback) {
	logger.log("runLDAPAutoConf()");
	return new TimeoutCallbackAbortable(runAsync(function(){
		var myConfig = new AccountConfig();
		
		var ldaptool = { 
			query: function (url) {
				logger.log("ldaptool.query()");
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
						var k = line.substr(0, splindex ).toLowerCase();
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
		specificRules.initialInformationsRetrieval(mail, ldaptool, function(err,resp) {
			logger.log("JSM : Error :" + err);
			logger.log("JSM : resp :" + JSON.stringify(resp));
			if ( err || !resp) {
				logger.log("runLDAPAutoConf: error callback");
				return errorCallback(err);
			}
			myConfig.id=(new Date).getTime();
			myConfig.source = AccountConfig.kSourceXML;
			myConfig.displayname = resp.displayname;
			for (var k in resp.incoming ) {
				myConfig.incoming[k] = resp.incoming[k];
			}
			for (var k in resp.outgoing ) {
				myConfig.outgoing[k] = resp.outgoing[k];
			}
			logger.log("runLDAPAutoConf: success callback");
			successCallback(myConfig);
		});
	}),errorCallback);
}
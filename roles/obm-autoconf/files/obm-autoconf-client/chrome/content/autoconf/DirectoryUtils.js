Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
		  .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");
Components.utils.import("resource://obm-autoconf-client/modules/XMLUtilsOBM.jsm");

function directoryUtils_setupDirectories(directories) {

  var autoCompleteDirectories = prefutils_getPreference("ldap_2.autoComplete.ldapServers", "");
  for each ( var directory in OBMXPath(directories, "obmautoconfclient:directory") ) {
  	var id = directory.getAttribute("id");
    
    if ( prefutils_getPreference("ldap_2.servers." + id + ".description") != undefined ) {
      // annuaire existe deja
      continue;
    }
	
    // important, sert a supprimer notamment la preference ".position"
    prefutils_deletePrefBranch("ldap_2.servers." + id);

    prefutils_setPreference("ldap_2.servers." + id + ".description",
                   directory.getAttribute("label"));
    prefutils_setPreference("ldap_2.servers." + id + ".uri",
                   directory.getAttribute("uri"));
    if ( directory.hasAttribute("bindDN") ) {
      prefutils_setPreference("ldap_2.servers." + id + ".auth.dn",
                     directory.getAttribute("bindDN"));
      prefutils_setPreference("ldap_2.servers." + id + ".auth.savePassword",
                     true);
    }
    if ( directory.hasAttribute("maxHits") ) {
      prefutils_setPreference("ldap_2.servers." + id + ".maxHits",
                     Number(directory.getAttribute("maxHits")).valueOf());
    }
    
    // PICASSO-76
    // si les prefs suivantes ne sont pas renseignees la completion d'addresse crashe Thunderbird
    prefutils_setPreference("ldap_2.servers." + id + ".filename",
                    id + ".mab");
    prefutils_setPreference("ldap_2.servers." + id + ".replication.lastChangeNumber"
                    , 0);                

    if ( directory.getAttribute("autocomplete") ) {
        //extension multi-ldap : activer l'annuaire pour l'auto-complétion
        prefutils_setPreference("ldap_2.servers." + id + ".multiLDAPSelected", true); 

        if ( !autoCompleteDirectories.match("ldap_2.servers." + id) ) {
            if (autoCompleteDirectories != "") {
                autoCompleteDirectories += ",";
            }
            autoCompleteDirectories += "ldap_2.servers." + id;
        }
    }

    if ( directory.getAttribute("defaultAutoComplete") ) {
        var cia = new CurrentIdAndAccount();
        cia.setDirectoryServer(id);
    }
  }

  //extension multi-ldap : activer tous les annuaires pour l'auto-completion
  prefutils_setPreference("ldap_2.autoComplete.ldapServers", autoCompleteDirectories);
  prefutils_setPreference("ldap_2.autoComplete.useDirectory", true); 
}

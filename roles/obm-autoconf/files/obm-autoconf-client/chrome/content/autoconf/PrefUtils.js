Components.utils.import("resource://obm-autoconf-client/modules/XMLUtilsOBM.jsm");

function prefutils_setupPreferences(preferences) {
  
  for each ( var preference in OBMXPath(preferences, "obmautoconfclient:preference") ) {
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

    prefutils_setPreference(preference.getAttribute("name"), typedValue, preference.getAttribute("set"));
  }
}

function prefutils_setPreference(aName, aTypedValue, aSet) {
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefService);    
  var prefBranch_User = prefService.getBranch(null);
  var prefBranch_Default = prefService.getDefaultBranch(null);

  var prefBranch = prefBranch_User;

  var prefMethod;

  if ( prefBranch_Default.prefIsLocked(aName) ) {
    prefBranch_Default.unlockPref(aName);
  }

  if ( aSet == "lock" || aSet == "default" ) {
    prefBranch = prefBranch_Default;
  }

// 	alert("setting "+aName+" to "+aTypedValue);

  if ( typeof aTypedValue == "string" ) {
    prefBranch.setCharPref(aName, aTypedValue);
  } else if ( typeof aTypedValue == "number" ) {
    prefBranch.setIntPref(aName, aTypedValue);
  } else if ( typeof aTypedValue == "boolean" ) {
    prefBranch.setBoolPref(aName, aTypedValue);
  }

//   prefMethod.call(prefBranch, aName, aTypedValue);

  if ( aSet == "lock" ) {
    prefBranch_Default.lockPref(aName);
  }
}

function prefutils_getPreference(aName, aDefaultValue) {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefBranch);
  var value;
  switch (prefBranch.getPrefType(aName)) {
    case prefBranch.PREF_BOOL:
      value = prefBranch.getBoolPref(aName);
      break;
    case prefBranch.PREF_INT:
      value = prefBranch.getIntPref(aName);
      break;
    case prefBranch.PREF_STRING:
      value = prefBranch.getCharPref(aName);
      break;
    default:
      value = aDefaultValue;
      break;
  }
  return value;
}

function prefutils_deletePrefBranch(aName) {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefBranch);
  prefBranch.deleteBranch(aName);
}

function prefutils_getPrefBranchChildren(aBranchName) {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefBranch);
  return prefBranch.getChildList(aBranchName, {});
//   return childList.length > 0;
}

function prefutils_prefBranchExists(aBranchName) {
  var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefBranch);
  var childList = prefBranch.getChildList(aBranchName, {});
  return childList.length > 0;
}

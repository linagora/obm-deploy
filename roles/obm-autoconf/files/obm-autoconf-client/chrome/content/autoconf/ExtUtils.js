Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
          .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");
var logger = new obmautoconfclientLogger("ExtUtils");

Components.utils.import("resource://obm-autoconf-client/modules/XMLUtilsOBM.jsm");



var extUtils;

var extUtilsAddons = {
  getIncompatibleExtensions: function(callback) {
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                            .getService(Components.interfaces.nsIXULAppInfo),
        appVersion = appInfo.version,
        runtime = Components.classes["@mozilla.org/xre/app-info;1"]
                            .getService(Components.interfaces.nsIXULRuntime),
        platform = runtime.OS + "_" + runtime.XPCOMABI;
    AddonManager.getAllAddons(
      function(addons) {
        var incompatibleAddons = [];
        addons.forEach(function(addon) {
          if ( addon.isCompatibleWith(appVersion, platform) ) {
            logger.log("addon "+addon.id+" is compatible");
          } else {
            logger.log("addon "+addon.id+" is not compatible");
            incompatibleAddons.push(addon);
          }
        });
        callback(incompatibleAddons);
      }
    );
  },
  
  uninstallExtensions: function(addons, listener) {
    addons.forEach(function(addon) {
      logger.log("Uninstalling ",addon.name);
      try {
        addon.uninstall();
      } catch (e) {
        logger.log("uninstall of ",addon.name,"failed: ",e);
      }
    });
    listener.onOperationDone(false);
  },
  
  
  
  
  installationListener: function (finishedCallback) {
    var listener = {
      finishedCallback: finishedCallback,
      onOperationDone: function(shouldRestart) {
        logger.log("installationListener onOperationDone()");
        listener.finishedCallback(shouldRestart);
      }
    };
    return listener;
  },
  
  
  
  extensionsUpdater: function(extensions, listener) {
    if (! listener) {
        var listener = new extUtilsAddons.installationListener();
    }
    var newListener = new extUtilsAddons.installationListener();
    for ( var i in listener ) {
        newListener[i] = listener[i];
    }
    var finishedCallbackArgument = false;
    var totalActions = 2;
    var finishedActions = 0;
    newListener.finishedCallback = function(shouldRestart) {
        if ( shouldRestart ) {
          finishedCallbackArgument=true;
        }
        finishedActions++;
        if ( totalActions <= finishedActions ) {
          listener.finishedCallback(finishedCallbackArgument);
        }
    };

    extUtilsAddons.getIncompatibleExtensions(function(incompatibleAddons) {
      extUtilsAddons.installExtensions(extensions, newListener);
      extUtilsAddons.uninstallExtensions(incompatibleAddons, newListener);
    });
  },
  
  
  
  
  installExtensions: function(extensions, listener) {
    logger.log("installExtensions");
    if (!listener) {
      var listener = new extUtilsAddons.installationListener();
    }

    if (!extensions) {
      logger.log("no extension, launching onOperationDone");
      listener.onOperationDone(false);
      return;
    }
    
    
    
    
    
    var checkExtensionsThatCanBeInstalled = function(extensions, callback) {
      var extensionsToInstall = [];
      var declaredExtentionsTotal = 0;
      var declaredExtentionsCount = 0;
      
      for each ( var extension in OBMXPath(extensions, "obmautoconfclient:extension") ) {
	  	var src = extension.getAttribute("src");
  //       logger.log("extension",extension);
        if ( !src || !src.length ) {
          continue;
        }
        logger.log("extension",src,"tested for installation");
        declaredExtentionsTotal++;
        (function(capturedExtension) {
          extUtilsAddons.extensionMustBeInstalled(capturedExtension, function(mustBeInstalled) {
		  	var capSrc = capturedExtension.getAttribute("src");
            declaredExtentionsCount++;
            if ( mustBeInstalled ) {
              logger.log("extension",capSrc,"must be installed");
              extensionsToInstall.push(capSrc);
            } else {
              logger.log("extension",capSrc,"not elligible for installation");
            }
            if ( declaredExtentionsCount == declaredExtentionsTotal ) {
              callback( extensionsToInstall );
            }
          });
        })(extension);
      }
      logger.log("extensions: ", declaredExtentionsTotal);
      if ( declaredExtentionsTotal == 0 ) {
        return listener.onOperationDone(false);
      }
    };
    
    
    
    
  //   alert("extensions count: "+ extensionsToInstall.length);
    var processInstall = function(extensionsToInstall, listener) {
      logger.log("number of extensions to install: ",extensionsToInstall.length);
      if ( extensionsToInstall.length <= 0 ) {
        return listener.onOperationDone(false);
      }
      var processedExtensions = 0;
      var whenAddonInstalledOrFailed = function() { 
        processedExtensions++; 
        if ( extensionsToInstall.length <= processedExtensions ) {
          listener.onOperationDone(true);
        }
      };
      var addonInstalls = [];
      var whenAllAddonsInstallsAvailable = function() {
        addonInstalls.forEach(function(addonInstall) {
          var installListener = getAddonInstallListener(whenAddonInstalledOrFailed,whenAddonInstalledOrFailed);
          addonInstall.addListener(installListener);
          addonInstall.install();
        });
      };
      
      var whenAddonInstallAvailable = function(addonInstall) {
        addonInstalls.push(addonInstall);
        if ( addonInstalls.length == extensionsToInstall.length ) {
          whenAllAddonsInstallsAvailable();
        }
      };
      
      extensionsToInstall.forEach(function(url) {
        logger.log("going to ask install of ",url);
        AddonManager.getInstallForURL(url, whenAddonInstallAvailable, "application/x-xpinstall");
      });
    };
    
    
    checkExtensionsThatCanBeInstalled(extensions, function(extensionsToInstall) {
      processInstall(extensionsToInstall, listener);
    });
    
  },
  
  
  
  extensionMustBeInstalled: function(aExtension, callback) {
    extUtilsAddons.extensionIsAlreadyInstalled(aExtension.getAttribute("id"), function(addon) {
      var extensionIsCompatible = extUtilsAddons.extensionIsCompatible(aExtension) ;
      logger.log("extensionIsCompatible: ",extensionIsCompatible);
      
      if ( !addon ) {
        return callback( extensionIsCompatible );
      }
      
      var canBeUpdated = extUtilsAddons.extensionCanBeUpdated(addon, aExtension.getAttribute("version"));
      var mustBeInstalled = canBeUpdated && extensionIsCompatible;
      logger.log("canBeUpdated: ",canBeUpdated);
      logger.log("mustBeInstalled: ",mustBeInstalled);
      return callback( mustBeInstalled );
      
    });
  },
  
  
  extensionIsAlreadyInstalled: function(aExtensionID, callback) {
    var installed = false;
    AddonManager.getAddonByID(aExtensionID, callback);
  },


  
  extensionCanBeUpdated: function (addon, aVersion) {
    const comparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                               .getService(Components.interfaces.nsIVersionComparator);
    var canBeUpdated = false;
    var version = addon.version;
    canBeUpdated = comparator.compare(aVersion, version) > 0;
    return canBeUpdated;
  },
  
  
  
  extensionIsCompatible: function(aExtension) {
      const runtime = Components.classes["@mozilla.org/xre/app-info;1"]
                                .getService(Components.interfaces.nsIXULRuntime);
      const appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                                .getService(Components.interfaces.nsIXULAppInfo);
      const comparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                  .getService(Components.interfaces.nsIVersionComparator);
      const platform = runtime.OS + "_" + runtime.XPCOMABI;

      var applicationCompatible = false;
      var platformCompatible = false;

      // vérifie que l'extension est compatible avec l'application Mozilla
      for each ( var targetApplication in OBMXPath(aExtension, "obmautoconfclient:targetApplication") ) {
        var minVersion = targetApplication.getAttribute("minVersion");
        var maxVersion = targetApplication.getAttribute("maxVersion");
        var tbVersion = appInfo.version;
        logger.log("Extension: ",aExtension.getAttribute("src").split("/").pop(), minVersion, maxVersion);
        logger.log("Application version: ",tbVersion);
        "10.0.2";
        logger.log("compare",targetApplication.getAttribute("minVersion"), ": (should be <=0)", comparator.compare(minVersion, tbVersion));
        logger.log("compare",targetApplication.getAttribute("maxVersion"), ": (should be >=0)", comparator.compare(maxVersion, tbVersion));
        if ( targetApplication.getAttribute("id") == appInfo.ID
          && comparator.compare(minVersion, tbVersion) <= 0
          && comparator.compare(maxVersion, tbVersion) >= 0 ) {
          logger.log("version comparator: application is compatible (id & version)");
          applicationCompatible = true;
          break;
        }
      }

      // vérifie que l'extension est compatible avec la plate-forme
	  var platforms = OBMXPath(aExtension, "obmautoconfclient:targetPlatform");
      if ( !platforms || platforms.length == 0 ) {
        // l'extension est compatible avec toutes les plates-formes
        platformCompatible = true;
      } else {
        for each ( var targetPlatform in platforms) {
          let xmlPlatform = targetPlatform.getAttribute("name");

          if ( platform.substring(0, xmlPlatform.length) == xmlPlatform ) {
            platformCompatible = true;
            break;
          }
        }
      }
      return applicationCompatible && platformCompatible;
  }
  
};
















var getAddonInstallListener = function(success,error) {
  var noop = function(){};
  return {
    onNewInstall: noop,
    onDownloadStarted: noop,
    onDownloadProgress: noop,
    onDownloadEnded: noop,
    onDownloadCancelled: error,
    onDownloadFailed: error,
    onInstallStarted: noop,
    onInstallEnded: success,
    onInstallCancelled: error,
    onInstallFailed: error,
    onExternalInstall: noop
  };
};



function extutils_getIncompatibleExtensions(){
	var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
                                   .getService(Components.interfaces.nsIExtensionManager);
   	var runtime = Components.classes["@mozilla.org/xre/app-info;1"]
                            .getService(Components.interfaces.nsIXULRuntime);
	var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                            .getService(Components.interfaces.nsIXULAppInfo);
// 	appInfo.ID;
// 	appInfo.version;
	var platform = runtime.OS + "_" + runtime.XPCOMABI;
	var foo={};
	var bar = [];

	items = extensionManager.getIncompatibleItemList (appInfo.version , platform, 2, true,foo,bar);
	return items;
};

function extutils_uninstallExtensions(items){
	var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
                                   .getService(Components.interfaces.nsIExtensionManager);	
	for each(var item in items) {
		logger.log("Uninstalling: name: "+item.name+", minappversion: "+item.minAppVersion+", maxappversion: "+item.maxAppVersion+", targetAppID: "+item.targetAppID);
		extensionManager.uninstallItem(item.id);
	}
};



function extutils_installationListener (finishedCallback, progressCallback) {

	this.finishedCallback = finishedCallback;
	if (! this.finishedCallback) {
		this.finishedCallback = function() {return;}
	}
	
	this.progressCallback = progressCallback;
	if (! this.progressCallback) {
		this.progressCallback = function() {return;}
	}

	this.numberOfExtensions = undefined;
	this.todo = undefined;
	
	var me = this;
	
	this.setExtNumber = function(n) {
		me.numberOfExtensions = n;
		me.todo = n;
	};
	
	this.nothingToDo = function() {
		me.finishedCallback(false);
	};

	this.onStateChange = function( aIndex, aState, aValue ) {
        const state = Components.interfaces.nsIXPIProgressDialog;

        switch( aState ) {
        case state.DOWNLOAD_START:
            break;

        case state.DOWNLOAD_DONE:
            break;

        case state.INSTALL_START:
            break;

        case state.INSTALL_DONE:
        	-- me.todo;
        	if (me.todo <= 0) {
        		me.finishedCallback(true);
        	}
            break;

        case state.DIALOG_CLOSE:
            break;
        }
    };

    this.onProgress = function( aIndex, aValue, aMaxValue )
    {
    	me.progressCallback(aValue/(aMaxValue*me.numberOfExtensions));
    };

    this.QueryInterface = function( iid )
    {
        if (!iid.equals(Components.interfaces.nsISupports) &&
            !iid.equals(Components.interfaces.nsIXPIProgressDialog))
            throw Components.results.NS_ERROR_NO_INTERFACE;

        return me;
    };

}











function extutils_extensionsUpdater(extensions, listener) {
	if (! listener) {
		var listener = new extUtilsExtensions.installationListener();
	}

	var newListener = new extUtilsExtensions.installationListener();
	for ( var i in listener ) {
		newListener[i] = listener[i];
	}

	var callFinishedCallback = false;
	var finishedCallbackArgument = false;
	var onFinished = false;
	newListener.finishedCallback = function(value) {
		if ( !callFinishedCallback ) {
			finishedCallbackArgument = value;
		}
		callFinishedCallback = true;
		if ( onFinished ) {
	                listener.finishedCallback(finishedCallbackArgument);
		}
	};

	var toUninstall = extUtilsExtensions.getIncompatibleExtensions();

	if (! extensions && !toUninstall.length) {
		listener.nothingToDo();
		return;
	}
	if ( extensions ) {
		extUtilsExtensions.installExtensions(extensions, newListener);
	}
	if ( toUninstall.length ) {
		extUtilsExtensions.uninstallExtensions(toUninstall);
	}
	if ( callFinishedCallback ) {
		listener.finishedCallback(finishedCallbackArgument);
	}
	onFinished = true;
}

function extutils_installExtensions(extensions, listener) {

  if (! listener) {
  	var listener = new extUtilsExtensions.installationListener();
  }

  if (! extensions) {
  	listener.nothingToDo();
  	return;
  }

  var extensionsToInstall = [];

  for each ( var extension in OBMXPath(extensions, "obmautoconfclient:extension") ) {
  	var src = extension.getAttribute("src");
// 	  alert ("check for extension: "+src);
    if ( extUtilsExtensions.extensionMustBeInstalled(extension) ) {
// 		alert("extension "+src+" must be installed");
		logger.log("extension",src,"must be installed");
		extensionsToInstall.push(src);
    }
  }
//   alert("extensions count: "+ extensionsToInstall.length);
	logger.log("number of extensions to install: ",extensionsToInstall.length);
	if ( extensionsToInstall.length > 0 ) {
		listener.setExtNumber(extensionsToInstall.length);
		var installManager = Components.classes["@mozilla.org/xpinstall/install-manager;1"]
									.getService(Components.interfaces.nsIXPInstallManager);
		installManager.initManagerFromChrome(extensionsToInstall,
											extensionsToInstall.length,
											listener);
	} else {
		listener.nothingToDo();
	}
}


// function extutils_extensionMustBeInstalled(aExtension) {
//   return ( (!extutils_extensionIsAlreadyInstalled(aExtension.getAttribute("id"))
//          || extutils_extensionCanBeUpdated(aExtension.getAttribute("id"), aExtension.getAttribute("version")))
//          && extutils_extensionIsCompatible(aExtension));
// }

function extutils_extensionMustBeInstalled(aExtension) {
  var back = ( (!extUtilsExtensions.extensionIsAlreadyInstalled(aExtension.getAttribute("id"))
         || extUtilsExtensions.extensionCanBeUpdated(aExtension.getAttribute("id"), aExtension.getAttribute("version")))
         && extUtilsExtensions.extensionIsCompatible(aExtension));
  return back;
}


function extutils_extensionIsAlreadyInstalled(aExtensionID) {
  var installed = false;
  var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
                                   .getService(Components.interfaces.nsIExtensionManager);
  return extensionManager.getInstallLocation(aExtensionID) != null;
}


function extutils_extensionCanBeUpdated(aExtensionID, aVersion) {
  const rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                               .getService(Components.interfaces.nsIRDFService);
  const comparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                               .getService(Components.interfaces.nsIVersionComparator);

  var canBeUpdated = false;

  var extensionsDS = rdfService.GetDataSourceBlocking(_getFileURLFromProfile("extensions.rdf"));

  var itemResource = rdfService.GetResource("urn:mozilla:item:" + aExtensionID);
  var versionResource = rdfService.GetResource("http://www.mozilla.org/2004/em-rdf#version");

  var target = extensionsDS.GetTarget(itemResource, versionResource, true);
  if ( target ) {
    var version = target.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
    canBeUpdated = comparator.compare(aVersion, version) > 0;
  }

  rdfService.UnregisterDataSource(extensionsDS);

  return canBeUpdated;
}

function extutils_extensionIsCompatible(aExtension) {
  const runtime = Components.classes["@mozilla.org/xre/app-info;1"]
                            .getService(Components.interfaces.nsIXULRuntime);
  const appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                            .getService(Components.interfaces.nsIXULAppInfo);
  const comparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                               .getService(Components.interfaces.nsIVersionComparator);
  const platform = runtime.OS + "_" + runtime.XPCOMABI;

  var applicationCompatible = false;
  var platformCompatible = false;

  // vérifie que l'extension est compatible avec l'application Mozilla
  for each ( var targetApplication in OBMXPath(aExtension, "obmautoconfclient:targetApplication") ) {
    if ( targetApplication.getAttribute("id") == appInfo.ID
      && comparator.compare(targetApplication.getAttribute("minVersion"), appInfo.version) <= 0
      && comparator.compare(targetApplication.getAttribute("maxVersion"), appInfo.version) >= 0 ) {
      applicationCompatible = true;
      break;
    }
  }

  // vérifie que l'extension est compatible avec la plate-forme
  	
  var platforms = OBMXPath(aExtension, "obmautoconfclient:targetPlatform");
  if ( !platforms || platforms.length == 0 ) {
    // l'extension est compatible avec toutes les plates-formes
    platformCompatible = true;
  } else {
    for each ( var targetPlatform in platforms) {
      var xmlPlatform = targetPlatform.getAttribute("name");

      if ( platform.substring(0, xmlPlatform.length) == xmlPlatform ) {
        platformCompatible = true;
        break;
      }

    }
  }

  return applicationCompatible && platformCompatible;
}

function _getFileURLFromProfile(aFilename) {
  const ioService = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces.nsIIOService);

  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                       .getService(Components.interfaces.nsIProperties)
                       .get("ProfD", Components.interfaces.nsIFile);
  var fileHandler = ioService.getProtocolHandler("file")
                             .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

  file.append(aFilename);
  return fileHandler.getURLSpecFromFile(file);
}

if ("@mozilla.org/extensions/manager;1" in Components.classes) {
  logger.log("ExtUtils using old addons manager");
  //tb3
  var extUtilsExtensions = {
    getIncompatibleExtensions: extutils_getIncompatibleExtensions,
    uninstallExtensions: extutils_uninstallExtensions,
    installationListener: extutils_installationListener,
    extensionsUpdater: extutils_extensionsUpdater,
    installExtensions: extutils_installExtensions,
    extensionMustBeInstalled: extutils_extensionMustBeInstalled,
    extensionIsAlreadyInstalled: extutils_extensionIsAlreadyInstalled,
    extensionCanBeUpdated: extutils_extensionCanBeUpdated,
    extensionIsCompatible: extutils_extensionIsCompatible
  };
  extUtils = {
    installationListener: extUtilsExtensions.installationListener,
    extensionsUpdater: extUtilsExtensions.extensionsUpdater,
    installExtensions: extUtilsExtensions.installExtensions
  };
} else {
  //tb10+
  logger.log("ExtUtils using new addons manager");
  Components.utils.import("resource://gre/modules/AddonManager.jsm");  
  extUtils = {
    installationListener: extUtilsAddons.installationListener,
    extensionsUpdater: extUtilsAddons.extensionsUpdater,
    installExtensions: extUtilsAddons.installExtensions
  };
}



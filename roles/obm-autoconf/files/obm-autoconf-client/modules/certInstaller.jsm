Components.utils.import("resource://modules/logger.jsm");
Components.utils.import("resource://modules/certs/certs.jsm");
Components.utils.import("resource://modules/utils.jsm");

var EXPORTED_SYMBOLS = [ "certInstaller" ];

var logger = new obmautoconfclientLogger("certInstaller");

var certInstaller = {
  installBundledCerts : function() {
    var certDB = Components.classes["@mozilla.org/security/x509certdb;1"]
        .getService(Components.interfaces.nsIX509CertDB2);

    logger.log("installBundledCerts(): Certificates to install: " + certs.length + ".");
    for each (var cert in certs) {
      var file = cert.file;

      try {
        logger.log("installBundledCerts(): Adding certificate " + file + " to DB.");
        certDB.addCertFromBase64(this.loadCertBase64Content(file), "C,C,C", "");
        logger.log("installBundledCerts(): Certificate " + file + " successfully added to DB.");
      } catch (e) {
        logger.log("installBundledCerts(): Failed to add certificate " + file + " to DB. " + e);
      }
    }
  },

  loadCertBase64Content: function (file) {
    return utils
             .loadFile("resource://obm-autoconf-client/modules/certs/" + file)
             .replace(/[\r\n]/g, "")
             .replace(/^-----BEGIN CERTIFICATE-----(.+)-----END CERTIFICATE-----$/, "$1");
  }
};

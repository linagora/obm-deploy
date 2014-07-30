var EXPORTED_SYMBOLS = [ "utils" ];

var utils = {
  loadFile : function(file) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
        .getService(Components.interfaces.nsIScriptableInputStream);
    var input = ioService.newChannel(file, null, null).open();

    scriptableStream.init(input);

    var str = scriptableStream.read(input.available());

    scriptableStream.close();
    input.close();

    return str;
  }
};

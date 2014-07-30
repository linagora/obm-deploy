Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .createInstance(Components.interfaces.mozIJSSubScriptLoader)
		  .loadSubScript("chrome://obm-autoconf-client/content/autoconf/loadall.js");
var logger = new obmautoconfclientLogger("HTTPQuery");
		  
		  
		  
function HTTPConfigObject() {
	this.localurl = "http://%h:8080/obm-autoconf/autoconfiguration/%u";
}

function getDataHTTP(aURL) {
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                            .getService(Components.interfaces.nsIIOService);

  var channel = ioService.newChannel(aURL, null, null);

  var inputStream = channel.open();

  var charset = "UTF-8";
  const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
  var converterInputStream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                                       .createInstance(Components.interfaces.nsIConverterInputStream);
  converterInputStream.init(inputStream, charset, 32768, replacementChar);

  var str = "";
  var buffer = {};
  while ( converterInputStream.readString(32768, buffer) != 0 ) {
    str += buffer.value;
  }
  return str;
}

function getConfig(obmUrl, cia) {
// 	logger.log("getConfig()");
// 	var hc = new HTTPConfigObject();
// 	var cia = new CurrentIdAndAccount(); 
// 	hc.localurl = hc.localurl.replace("%h",cia.hostname);
// 	hc.localurl = hc.localurl.replace("%u",cia.username);
  logger.log("Sending request to autoconf server",obmUrl);
  var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                                 .createInstance(Components.interfaces.nsIXMLHttpRequest);

  req.open("GET", obmUrl, false);
  req.send(null);

  if (req.status / 100 == 2) {
    logger.log("autoconf server response",req.responseText.length,"bytes");
    return OBMParseString(cia.fillConfig(req.responseText)).documentElement;
  } else {
    logger.log("autoconf server error",req.status,req.responseText);
    return null;
  }
}


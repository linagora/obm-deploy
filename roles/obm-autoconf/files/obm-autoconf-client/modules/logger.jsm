/* ***** BEGIN LICENSE BLOCK *****
 * 
 * Copyright (c) 1997-2011 Groupe LINAGORA
 *
 *  This program is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation; either version 2 of the
 *  License, (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  General Public License for more details.
 * 
 *  http://www.obm.org/                                              
 * 
 * ***** END LICENSE BLOCK ***** */

var EXPORTED_SYMBOLS = ["obmautoconfclientLogger"];

function filewriter () {
	if (!this._file) {
		var fileName = 'obm-autoconf-client-log.txt';
		var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		file.append(fileName);
		this._file = file;
		this._stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

		//	see: http://mxr.mozilla.org/mozilla/source/nsprpub/pr/include/prio.h
		//	PR_WRONLY		0x02
		//	PR_CREATE_FILE	0x08
		//	PR_APPEND 0x10
		this._stream.init(this._file, 0x02 | 0x08 | 0x10 , 0666, 0);
// 		var hello = "New session: " + Date() + "\n";
// 		this._stream.write(hello, hello.length);
// 		this._stream.flush();
	}
};

filewriter.prototype.write = function (msg) {
	if (this._stream) {
		this._stream.write(msg, msg.length);
		this._stream.flush();
	}
};

// static fields
const LEVEL_PREF = "extensions.obm-autoconf-client.log";


function obmautoconfclientLogger(header) {
	this._writer = new filewriter();
	this._header = "";
	
	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	try {
		this._on = prefService.getBoolPref(LEVEL_PREF);
	} catch (e) {
		this._on = true;
	}
	if ( header ) {
		this.setHeader(header);
	}
};

obmautoconfclientLogger.prototype.setHeader = function (str) {	this._header = str; };

obmautoconfclientLogger.prototype.log = function (  ) {
	if ( !arguments.length ) {
		return ;
	}
	var args = Array.prototype.slice.call(arguments,0),
	msg = args.join(" ");
	if (!this._on || null === msg || 'string' !== typeof(msg)) return;
	this._writer.write(this._formatLog(msg));
};

obmautoconfclientLogger.prototype._formatLog = function (msg) {
	var str = this._header;
	var dateString = new Date();
	str += " (" + dateString + ") :"+msg+"\n";
	return str;
};

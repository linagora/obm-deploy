var logger = new obmautoconfclientLogger("LDAPQuery");

function getLDAPValueUnsafe(str, key) {
	logger.log("getLDAPValueUnsafe()");
    if (str == null || key == null)
        return null;
    var search_key = "\n" + key + "=";    
    var start_pos = str.indexOf(search_key);
    if (start_pos == -1)
        return null;   
    start_pos += search_key.length;
    var end_pos = str.indexOf("\n", start_pos);
    if (end_pos == -1)
            end_pos = str.length;
	logger.log("key:",key,"result:",str.substring(start_pos, end_pos));
    return str.substring(start_pos, end_pos);
}
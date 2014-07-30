
EXPORTED_SYMBOLS = ["OBMXPath", "OBMXPathFirst", "OBMXMLCreateDoc", "OBMSerializeDOM", "OBMParseString"];

try {
   Components.utils.import("resource://calendar/modules/calXMLUtils.jsm");
} catch (e) {
    // If calXMLUtils.jsm is not available, then fake it. Here are the methods
    // copied from that file that we need.
    // {{{ START_COMPAT_TB_3 Please remove these methods after removing compatibility
    if(!Array.isArray) {
        Array.isArray = function (vArg) {
            return Object.prototype.toString.call(vArg) === "[object Array]";
        };
    }
    // END_COMPAT_TB_3 }}}
    cal = {};
    // {{{ START_COMPAT_TB_10 Please remove these methods and instead import
    //     calXMLUtils.jsm directly
    cal.xml = {} || cal.xml;
    cal.xml.evalXPath = function evaluateXPath(aNode, aExpr, aResolver, aType) {
        const XPR = Components.interfaces.nsIDOMXPathResult;
        let doc = (aNode.ownerDocument ? aNode.ownerDocument : aNode);
        let resolver = aResolver || doc.createNSResolver(doc.documentElement);
        let resultType = aType || XPR.ANY_TYPE;
        
        let result = doc.evaluate(aExpr, aNode, resolver, resultType, null);
        let returnResult, next;
        switch (result.resultType) {
            case XPR.NUMBER_TYPE:
                returnResult = result.numberValue;
                break;
            case XPR.STRING_TYPE:
                returnResult = result.stringValue;
                break;
            case XPR.BOOLEAN_TYPE:
                returnResult = result.booleanValue;
                break;
            case XPR.UNORDERED_NODE_ITERATOR_TYPE:
            case XPR.ORDERED_NODE_ITERATOR_TYPE:
            case XPR.ORDERED_NODE_ITERATOR_TYPE:
                returnResult = [];
                while ((next = result.iterateNext())) {
                    if (next instanceof Components.interfaces.nsIDOMText) {
                        returnResult.push(next.wholeText);
                    } else if (next instanceof Components.interfaces.nsIDOMAttr) {
                        returnResult.push(next.value);
                    } else {
                        returnResult.push(next);
                    }
                }
                break;
            case XPR.UNORDERED_NODE_SNAPSHOT_TYPE:
            case XPR.ORDERED_NODE_SNAPSHOT_TYPE:
                returnResult = [];
                for (let i = 0; i < result.snapshotLength; i++) {
                    next = result.snapshotItem(i);
                    if (next instanceof Components.interfaces.nsIDOMText) {
                        returnResult.push(next.wholeText);
                    } else if (next instanceof Components.interfaces.nsIDOMAttr) {
                        returnResult.push(next.value);
                    } else {
                        returnResult.push(next);
                    }
                }
                break;
            case XPR.ANY_UNORDERED_NODE_TYPE:
            case XPR.FIRST_ORDERED_NODE_TYPE:
                returnResult = result.singleNodeValue;
                break;
            default:
                returnResult = null;
                break;
        }

        if (Array.isArray(returnResult) && returnResult.length == 0) {
            returnResult = null;
        }

        return returnResult;
    };

    cal.xml.evalXPathFirst = function evalXPathFirst(aNode, aExpr, aResolver, aType) {
        let result = cal.xml.evalXPath(aNode, aExpr, aResolver, aType);

        if (Array.isArray(result)) {
            return result[0];
        } else {
            return result;
        }
    };

    cal.xml.serializeDOM = function(doc) {
        let serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
                                   .createInstance(Components.interfaces.nsIDOMSerializer);
        return serializer.serializeToString(doc);
    };
    cal.xml.parseString = function(str, docUri, baseUri) {
        let parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                     .createInstance(Components.interfaces.nsIDOMParser);
        // {{{ START_COMPAT_TB_3 
        if (!Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo).version.match(/^3\./)) {
        // END_COMPAT_TB_3 }}}
            parser.init(null, docUri, baseUri);
        // {{{ START_COMPAT_TB_3 
        }
        // END_COMPAT_TB_3 }}}
        return parser.parseFromString(str, "application/xml");
    };
    // END_COMPAT_TB_10 }}}
}

const OBM_NS = {
    obmautoconfclient: "http://ns.aliasource.fr/mozilla/1.0"
};

function simplifyExpression(aExpr) {
    let parts = aExpr.split("/");
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].match(/^[a-zA-Z\-_]+$/)) {
            // Simple tag, no namespace. Assume any namespace.
            parts[i] = "*[local-name()='" + parts[i] + "']";
        }
    }
    return parts.join("/");
}

function OBMResolver(prefix) {
    return OBM_NS[prefix] || null;
}

function OBMXPath(aNode, aExpr, aType) {
    return !aNode ? null : cal.xml.evalXPath(aNode, simplifyExpression(aExpr), OBMResolver, aType);
}
function OBMXPathFirst(aNode, aExpr, aType) {
    return !aNode ? null : cal.xml.evalXPathFirst(aNode, simplifyExpression(aExpr), OBMResolver, aType);
}

function OBMXMLCreateDoc(aRootNode) {
    return cal.xml.parseString("<" + aRootNode + "/>");
}

function OBMSerializeDOM(aDoc) {
    return cal.xml.serializeDOM(aDoc);
}

function OBMParseString(aString) {
    return cal.xml.parseString(aString);
}

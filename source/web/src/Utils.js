//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

// http://msdn.microsoft.com/en-us/library/cc288325(v=vs.85).aspx
function getIEVersion() {
    //    if (window.navigator.appName == "Netscape" || window.navigator.appVersion.indexOf("Edge/") > 0) {
    //        var s = window.navigator.appVersion;
    //        s = s.substr(s.indexOf("Edge/") + 5);
    //        var p = s.indexOf('.');
    //        return parseInt(s.substr(0, p));
    //    }
    if (window.navigator.appName != "Microsoft Internet Explorer" && window.navigator.appName.indexOf("MSAppHost") < 0 && !(window.navigator.appVersion.indexOf("Trident") > 0 && document.documentMode >= 11))
        return false;
    return document.documentMode == null ? (document.compatMode == "CSS1Compat" ? 7 : 6) : document.documentMode;
};

var __ieversion = getIEVersion();

var __ieAppVersion = __ieversion ? (window.postMessage ? (window.performance ? 9 : 8) : 7) : null;
if (__ieversion) {
    var silverlight = typeof (JSDraw2_disablesilverlight) == "undefined" || !JSDraw2_disablesilverlight ? "silverlight," : "";
    if (dojo.version.major <= 1 && dojo.version.minor < 7)
        dojo.config.gfxRenderer = silverlight + "vml";
    else if (__ieversion < 9)
        dojo.config.gfxRenderer = silverlight + "vml,svg";
}

dojo.require("dojo.io.script");
dojo.require("dojo.io.iframe");
dojo.require("dojox.gfx");
dojo.require("dojox.gfx.utils");
dojo.require("dojo.window");

if (typeof (__JSDraw2_TouchMol) == "undefined") {
    dojo.require("dojox.charting.Chart2D");
    dojo.require("dojox.charting.axis2d.Default");
    dojo.require("dojox.charting.plot2d.Default");
    dojo.require("dojox.charting.themes.Wetland");
}
if (!(dojo.version.major <= 1 && dojo.version.minor <= 6))
    dojo.require("dojox.storage.LocalStorageProvider");

// Canvas on Android 2.x; dojo 1.7 won't need it
if (dojo.version.major <= 1 && dojo.version.minor < 7) {
    scil.onload(function () {
        dojox.gfx.Text.prototype._renderShape = function (/* Object */ctx) {
            var s = this.shape;
            ctx.save();
            ctx.fillStyle = s.fillStyle;
            ctx.strokeStyle = s.fillStyle;
            ctx.font = s.fontStyle;
            ctx.textAlign = s.align;
            ctx.fillText(s.text, s.x, s.y);
            ctx.restore();
            ctx.stroke();
        };
    });
}

scilligence.suggestInstallSilverlight = function () {
    if (dojox.gfx.renderer == "vml") {
        if (confirm("JSDraw2.Editor runs much faster with Silverlight in IE 6,7,8.  Do you want to install Silvelight now?"))
            window.open("http://www.silverlight.net/downloads");
    }
};

function _isHtml5() {
    var ie = __ieversion;
    if (ie)
        return ie >= 9;
    else
        return document.doctype != null && document.doctype.name != null && document.doctype.name.toLowerCase() == "html"
};
function getAndroidVersion() {
    var s = window.navigator.userAgent;
    var p = s.indexOf("Android");
    if (p < 0)
        return false;
    s = s.substr(p + 8);
    p = s.indexOf(';');
    s = s.substr(0, p);
    p = s.indexOf('.');
    if (p > 0)
        s = s.substr(0, p);
    return isNaN(s) ? true : parseFloat(s);
};
function getiOSVersion() {
    var s = window.navigator.userAgent;
    var p = s.indexOf("iPad");
    if (p < 0)
        p = s.indexOf("iPhone");
    if (p < 0)
        return false;
    var p = s.indexOf('OS', p + 4);
    if (p < 0)
        return true;
    s = s.substr(p + 3);
    p = s.indexOf('_');
    s = s.substr(0, p);
    p = s.indexOf('.');
    if (p > 0)
        s = s.substr(0, p);
    return isNaN(s) ? true : parseInt(s);
};

/**
* Utils class - provides variety of tool functions
* @class scilligence.Utils
*/
scilligence.Utils = {
    __xcode: 10,
    isIE: __ieversion,
    isIE8Lower: __ieversion && __ieversion < 9,
    nativemode: window.navigator.appName.indexOf("MSAppHost") >= 0,
    isHtml5: _isHtml5(),
    isFirefox: navigator.userAgent.indexOf('Firefox') >= 0,
    isOpera: navigator.userAgent.indexOf('Opera') >= 0,
    isChrome: navigator.userAgent.indexOf('Chrome') >= 0,
    isLinux: navigator.userAgent.indexOf('Linux') >= 0,
    isUbuntu: navigator.userAgent.indexOf('Ubuntu') >= 0,
    isIpad: getiOSVersion(),
    isAndroid: getAndroidVersion(),
    isTouch: navigator.userAgent.indexOf('iPad') >= 0 || navigator.userAgent.indexOf('iPhone') >= 0 || navigator.userAgent.indexOf('Android') >= 0,
    isSilverlight: null,
    lastTouchTm: 0,
    buttonWidth: 160,

    getTopWindow: function () {
        var w = window;
        while (w.parent != null && w.parent != w)
            w = w.parent;
        return w;
    },

    isRightButton: function (e) {
        if (e == null)
            return;

        if (e.which)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            return e.which == 3;
        else if ("button" in e)  // IE, Opera 
            return e.button == 2;
        return false;
    },

    isTouchDblClick: function (e) {
        var tm = new Date().getTime();
        var d = tm - scil.Utils.lastTouchTm;
        scil.Utils.lastTouchTm = tm;
        return e.touches.length == 1 && d <= 500;
    },

    /**
    * Check if a html element has a parent
    * @function {static} hasAnsestor
    * @param {DOM} obj - to be checked child
    * @param {DOM} parent
    * @returns a number
    */
    hasAnsestor: function (obj, parent) {
        if (parent == null || obj == null)
            return false;

        while (obj != null) {
            if (obj.parentNode == parent)
                return true;
            obj = obj.parentNode;
        }
        return false;
    },

    /**
    * Round a number with specific decimal
    * @function {static} round
    * @param {number} val - a number to be rounded
    * @param {number} n - the number of decimal
    * @returns a number
    */
    round: function (val, n) {
        if (val == null || isNaN(val))
            return null;
        var d = Math.pow(10, n);
        return Math.round(val * d) / d;
    },

    /**
    * Round a number to significant digits
    * @function {static} roundToSignificantDigits
    * @param {number} d - a number to be converted
    * @param {number} digits
    * @returns a number
    */
    roundToSignificantDigits: function (d, digits) {
        if (d == 0 || isNaN(d))
            return d;

        var scale = Math.pow(10, Math.floor(this.log10(Math.abs(d))) + 1);
        return scale * this.round(d / scale, digits);
    },

    log10: function (val) {
        return Math.log(val) / Math.LN10;
    },

    /**
    * Round a number as string
    * @function {static} roundStr
    * @param {number} val - a number to be converted
    * @param {number} n - the number of decimal
    * @param {number} padding
    * @returns a string
    */
    roundStr: function (val, n, padding) {
        if (val == null || isNaN(val))
            return "";
        else if (val == 0)
            return "0";

        var d = Math.pow(10, n);
        var s = (Math.round(val * d) / d) + "";
        if (s == "0" && val != 0 || n > 0 && (Math.abs(val) < 1 / d || val < 1 && s.length < (val + "").length)) { //I#9297
            var e = Math.floor(this.log10(val));
            if (e < 1) {
                var ret = this.roundStr(val * Math.pow(10, -e), n, padding) + "e" + e;
                return parseFloat(ret) == parseFloat(s) ? s : ret;
            }
        }

        if (padding == false || n <= 0)
            return s;

        var p = s.indexOf('.');
        if (p < 0) {
            s += ".";
            p = s.length - 1;
        }

        var m = s.length - 1 - p;
        for (var i = m; i < n; ++i)
            s += "0";
        return s;
    },

    /**
    * Convert a number into a formatted string
    * @function {static} num2str
    * @param {number} val - a number to be converted
    * @param {number} n - the number of decimal
    * @param {string} unit - the unit of the number
    * @returns a string
    */
    num2str: function (val, n, unit, padding) {
        if (val == null || !isFinite(val) || isNaN(val))
            return "";

        if (unit == null)
            return this.roundStr(val, n, padding);
        else if (unit == "%")
            return this.roundStr(val * 100, n, padding) + unit;

        if (unit == "L" || unit == "l") {
            //val /= 1000;
            unit = unit.toUpperCase();
        }

        if (Math.abs(val) >= 1000)
            return this.roundStr(val / 1000, n, padding) + " " + this._convertUnit(unit, 1000);
        if (Math.abs(val) >= 1)
            return this.roundStr(val, n, padding) + " " + this._convertUnit(unit, 1);

        val *= 1000;
        if (Math.abs(val) >= 1)
            return this.roundStr(val, n, padding) + " " + this._convertUnit(unit, 0.001);

        val *= 1000;
        return this.roundStr(val, n, padding) + " " + this._convertUnit(unit, 0.000001);
    },

    _convertUnit: function (unit, scale) {
        switch (scale) {
            case 1:
                if (unit == "g/L")
                    return "mg/mL";
                else if (unit == "U/L")
                    return "mU/mL";
                else
                    return unit;
            case 1000:
                if (unit == "g/L")
                    return "g/mL";
                else if (unit == "U/L")
                    return "U/mL";
                else
                    return "k" + unit;
            case 0.001:
                if (unit == "g/L" || unit == "mg/mL")
                    return "mg/L";
                else if (unit == "U/L" || unit == "mU/mL")
                    return "mU/L";
                else
                    return "m" + unit;
            case 0.000001:
                if (unit == "g/L" || unit == "mg/mL")
                    return "ug/L";
                else if (unit == "U/L" || unit == "mU/mL")
                    return "uU/L";
                else
                    return "u" + unit;
        }
    },

    disabledcontextmenus: [],
    disableContextMenu: function (element, doc) {
        if (element != null && scil.Utils.indexOf(this.disabledcontextmenus, element) < 0)
            this.disabledcontextmenus.push(element);

        if (doc == null)
            doc = document;

        if (doc.body.__contextmenudisabled)
            return;

        doc.body.__contextmenudisabled = true;
        doc.body.oncontextmenu = function (e) {
            if (e == null)
                e = event;

            var src = e.target || e.srcElement;
            var list = scil.Utils.disabledcontextmenus;
            for (var i = 0; i < list.length; ++i) {
                if (src == list[i] || scil.Utils.isChildOf(src, list[i]))
                    return false;
            }

            if (src.parentNode != null && JSDraw2.Editor.get(src.parentNode.id) != null ||
                src.firstChild != null && src.firstChild.getAttribute != null && src.firstChild.getAttribute("jspopupmenu") == "1") {
                if (e.preventDefault != null)
                    e.preventDefault();
                return false;
            }

            if (scil.ContextMenu.isFromContextMenu(src)) {
                if (e.preventDefault != null)
                    e.preventDefault();
                return false;
            }

            // fix context menu problem on Safari
            var div = scil.Utils.getParent(src, "div");
            if (div != null && JSDraw2.Editor.get(div.id) != null) {
                if (e.preventDefault != null)
                    e.preventDefault();
                return false;
            }
        };
    },

    serviceAvailable: function () {
        return typeof JSDrawServices != "undefined" && typeof JSDrawServices.url != "undefined" && JSDrawServices.url != null;
    },

    /**
    * evaluate a javascript expression
    * @function {static} eval
    * @param {string} s - javascript expression
    * @returns javascript object
    */
    eval: function (s) {
        if (s == "" || typeof (s) != "string")
            return null;

        try {
            eval("var s=" + s);
            return s;
        }
        catch (e) {
        }

        return null;
    },

    /**
    * Evaluation if an object is true.  true, 1, on, yes will be true
    * @function {static} isFalse
    * @param {object} s - the input object
    * @returns true or false
    */
    isTrue: function (s) {
        s = (s + "").toLowerCase();
        return s == "1" || s == "true" || s == "yes" || s == "on";
    },

    /**
    * Evaluation if an object is false.  false, 0, off, no will be false
    * @function {static} isFalse
    * @param {object} s - the input object
    * @returns true or false
    */
    isFalse: function (s) {
        s = (s + "").toLowerCase();
        return s == "0" || s == "false" || s == "no" || s == "off";
    },

    isAttTrue: function (e, att) {
        var s = e.getAttribute(att) + "";
        return s == "" || this.isTrue(s);
    },

    isAttFalse: function (e, att) {
        var s = e.getAttribute(att) + "";
        return s == "0" || s.toLowerCase() == "false";
    },

    /**
    * Convert a number into a formatted string
    * @function {static} formatStr
    * @param {number} v - a number to be converted
    * @param {number} w - total width the result string
    * @param {number} d - the number of demical
    * @returns a string
    */
    formatStr: function (v, w, d) {
        var s = v == null ? "" : v.toFixed(d) + "";
        return scil.Utils.padLeft(s, w, ' ');
    },

    /**
    * Generate a GUID
    * @function {static} uuid
    * @returns a string
    */
    // http://www.broofa.com/2008/09/javascript-uuid-function/
    uuid: function () {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [];
        var i;
        var radix = chars.length;

        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }

        return uuid.join('').toLowerCase();
    },

    /**
    * Append chars to a string
    * @function {static} padLeft
    * @param {string} s - the input string
    * @param {number} n - total width of result string
    * @param {char} c - the character to be appended
    * @returns a string
    */
    padLeft: function (s, n, c) {
        var s1 = '';
        for (var i = (s + "").length; i < n; ++i)
            s1 += (c == null ? ' ' : c);
        return s1 + s;
    },

    /**
    * Insert chars at the beginning of a string
    * @function {static} padRight
    * @param {string} s - the input string
    * @param {number} n - total width of result string
    * @param {char} c - the character to be inserted
    * @returns a string
    */
    padRight: function (s, n, c) {
        var s1 = '';
        for (var i = s.length; i < n; ++i)
            s1 += (c == null ? ' ' : c);
        return s + s1;
    },

    /**
    * Evaluate if a string ends with another sub-string
    * @function {static} endswith
    * @param {string} s - the input string
    * @param {string} token - the sub-string to be tested
    * @returns true or false
    */
    endswith: function (s, token, casesensitive) {
        if (s == null || token == null || s.length < token.length)
            return false;
        var t = s.substr(s.length - token.length, token.length);
        if (casesensitive)
            return t == token;
        else
            return t.toLowerCase() == token.toLowerCase();
    },

    /**
    * Evaluate if a string starts with another sub-string
    * @function {static} endswith
    * @param {string} s - the input string
    * @param {string} token - the sub-string to be tested
    * @returns true or false
    */
    startswith: function (s, token, casesensitive) {
        if (s == null || token == null || s.length < token.length)
            return false;
        var t = s.substr(0, token.length);
        if (casesensitive)
            return t == token;
        else
            return t.toLowerCase() == token.toLowerCase();
    },

    /**
    * Trim a string
    * @function {static} ltrim
    * @param {string} s - the input string
    * @returns a string
    */
    trim: function (s) {
        return s == null ? null : s.replace(/^[\s|\t\r\n]+|[\s|\t\r\n]+$/g, "");
    },

    /**
    * Trim the left spaces of a string
    * @function {static} trim
    * @param {string} s - the input string
    * @returns a string
    */
    ltrim: function (s) {
        return s == null ? null : s.replace(/^[\s|\t\r\n]+/, "");
    },

    /**
    * Trim the right spaces of a string
    * @function {static} rtrim
    * @param {string} s - the input string
    * @returns a string
    */
    rtrim: function (s) {
        return s == null ? null : s.replace(/[\s|\t\r\n]+$/, "");
    },

    isFixedPosition: function (e) {
        while (e != null) {
            if (e.style != null && e.style.position == "fixed")
                return true;
            e = e.parentNode;
        }
        return false;
    },

    getOffset: function (e, scroll) {
        var d = scil.Utils.scrollOffset();
        var p = new JSDraw2.Point(0, 0);
        while (e != null) {
            if (e.offsetLeft > 0 || e.offsetTop > 0)
                p.offset(e.offsetLeft, e.offsetTop);

            if (this.isIE && (e.scrollLeft > 0 || e.scrollTop > 0))
                p.offset(e.scrollLeft, e.scrollTop);

            if (scil.Utils.isIE) {
                if (e.scrollTop > 0 || e.scrollLeft > 0) {
                    p.offset(-e.scrollLeft, -e.scrollTop);
                }
            }

            //            if (e.style.position == "absolute") {
            //                if (__ieversion && __ieversion < 8) {
            //                    p.offset(-d.x, -d.y);
            //                    break;
            //                }
            //                //break;
            //            }

            e = e.offsetParent;
        }

        //if (__ieversion && __ieAppVersion < 8)
        //    p.offset(d.x, d.y);

        if (scroll != false)
            p.offset(-d.x, -d.y);
        return p;
    },

    getScrollOffset: function (e) {
        var p = new JSDraw2.Point(0, 0);
        while (e != null) {
            if (e.scrollLeft > 0 || e.scrollTop > 0)
                p.offset(e.scrollLeft, e.scrollTop);
            e = e.offsetParent;
        }
        return p;
    },

    scrollOffset: function () {
        var iebody = (document.compatMode && document.compatMode != "BackCompat") ? document.documentElement : document.body;

        var x = scil.Utils.isIE ? iebody.scrollLeft : pageXOffset;
        var y = scil.Utils.isIE ? iebody.scrollTop : pageYOffset;

        return new JSDraw2.Point(x, y);
    },

    scriptUrl: function () {
        if (this._scripturl != null)
            return this._scripturl;
        if (JSDraw2.defaultoptions.imagebase != null)
            this._scripturl = JSDraw2.defaultoptions.imagebase;
        if (this._scripturl != null)
            return this._scripturl;

        var list = document.getElementsByTagName("script");
        for (var i = 0; i < list.length; i++) {
            var e = list[i];
            if (e.tagName == "SCRIPT") {
                var s = e.getAttribute('src');
                if (s == null || s.length == 0)
                    continue;

                var p = s.lastIndexOf('/');
                var path = p < 0 ? '' : scil.Utils.trim(s.substr(0, p + 1));
                var file = scil.Utils.trim(p < 0 ? s : s.substr(p + 1)).toLowerCase();
                p = file.indexOf('?');
                if (p > 0)
                    file = file.substr(0, p);

                if (this.startswith(file, "scilligence.jsdraw2.") && this.endswith(file, ".js")) {
                    if (scil.Utils.startswith(path, "http://") || scil.Utils.startswith(path, "https://") || scil.Utils.startswith(path, "//"))
                        return this._scripturl = path;

                    if (scil.Utils.startswith(path, '/'))
                        return this._scripturl = document.location.protocol + "//" + document.location.host + path;

                    var url = document.location + "";
                    p = url.indexOf('?');
                    if (p > 0)
                        url = url.substr(0, p);

                    p = url.lastIndexOf('/');
                    return this._scripturl = url.substr(0, p + 1) + path;
                }
                else if (file == "jsdraw.core.js") {
                    return this._scripturl = path + "../";
                }
            }
        }

        return null;
    },

    _imgBase: function () {
        return scil.Utils.scriptUrl();
    },

    imgSrc: function (button, wrapasinurl) {
        var s = scil.Utils._imgBase() + button;
        if (wrapasinurl)
            s = "url(" + s + ")";
        return s;
    },

    imgTag: function (b, label, extra) {
        return "<img" + (extra == null ? "" : " " + extra) + " src='" + this.imgSrc("img/" + b) + "'>" + (label == null ? "" : label);
    },

    styleRect: function (e) {
        return new JSDraw2.Rect(scil.Utils.parsePixel(e.style.left),
            scil.Utils.parsePixel(e.style.top),
            scil.Utils.parsePixel(e.style.width),
            scil.Utils.parsePixel(e.style.height));
    },

    parsePixel: function (s) {
        if (s == null || !scil.Utils.endswith(s, "px"))
            return null;

        s = s.substr(0, s.length - 2);
        return isNaN(s) ? null : parseInt(s);
    },

    /**
    * Clone an array
    * @function {static} cloneArray
    * @param {array} ar - the array to be cloned
    * @returns a new array
    */
    cloneArray: function (ar) {
        var r = [];
        this.mergeArray(r, ar);
        return r;
    },

    /**
    * Merge two arrays
    * @function {static} mergeArray
    * @param {array} dest - the destination array to be merged to
    * @param {array} src - the source arrays to be merged from
    * @returns null
    */
    mergeArray: function (dest, src) {
        for (var i = 0; i < src.length; ++i)
            dest.push(src[i]);
    },

    /**
    * Find the index of an item in an array
    * @function {static} mergeArray
    * @param {array} ar - the array to be searched
    * @param {object} i - the item to be searched
    * @returns the index if succeeded; -1 if failed
    */
    fingArrayIndex: function (ar, i) {
        for (var k = 0; k < ar.length; ++k) {
            if (ar[k] == i)
                return k;
        }
        return -1;
    },

    getFunctionName: function (f) {
        if (typeof f == "function") {
            var fName = (f + "").match(/function\s*([\w\$]*)\s*\(/);
            if (fName !== null)
                return fName[1];
        }

        return null;
    },

    splitCsvRow: function (s) {
        if (s == null || s == "\r" || s == "")
            return;

        if (s.substr(s.length - 1) == "\r")
            s = s.substr(0, s.length - 1);

        var ret = [];

        var inquote = false;
        var v = "";
        for (var i = 0; i < s.length; ++i) {
            var c = s.substr(i, 1);
            if (c == '\"') {
                if (!inquote) {
                    if (v == "")
                        inquote = true;
                    else
                        v += c;
                }
                else {
                    if (i < s.length - 1) {
                        var c1 = s.substr(i + 1, 1);
                        if (c1 == '\"') {
                            v += c;
                            ++i;
                        }
                        else if (c1 == ',') {
                            ret.push(v);
                            v = "";
                            inquote = false;
                            ++i;
                        }
                        else {
                            v += c;
                        }
                    }
                    else {
                        inquote = false;
                    }
                }
            }
            else if (c == ',') {
                if (inquote) {
                    v += c;
                }
                else {
                    ret.push(v);
                    v = "";
                }
            }
        }

        ret.push(v);

        return ret;
    },

    escCsvValue: function (v) {
        if (v == null)
            return "";
        if (typeof (v) != "string")
            v = v + "";
        if (v.indexOf(',') >= 0 || v.indexOf('\"') >= 0 || v.indexOf('\r') >= 0 || v.indexOf('\n') >= 0)
            v = '\"' + v.replace(/[\"]/g, "\"\"").replace(/\r\n/g, "") + '\"';
        return v;
    },

    /**
    * Unescape an xml value
    * @function {static} unescXmlValue
    * @param {object} v - the input string
    * @returns a string
    */
    unescXmlValue: function (v) {
        if (v == null)
            return '';
        return v.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#xA;/gi, "\n").replace(/&apos;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/gi, "&");
    },

    /**
    * Escape the object as the xml value
    * @function {static} escXmlValue
    * @param {object} v - the input object
    * @param {bool} trim - indicate if trim the spaces
    * @returns a string
    */
    escXmlValue: function (v, trim) {
        if (v == null)
            return '';

        if (typeof (v) != "string")
            v = v + "";

        if (trim)
            v = scil.Utils.trim(v);
        return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    },

    escUrlData: function (s) {
        if (s == null)
            return s;

        var ret = "";
        for (var i = 0; i < s.length; ++i) {
            var c = s.charCodeAt(i);
            var s1 = s.substr(i, 1);
            if (c > 255)
                ret += s1;
            else if (s1 == "+")
                ret += "%2b";
            else
                ret += escape(s1);
        }

        return ret;
    },

    escFileName: function (s) {
        if (s == null)
            return s;

        var ret = "";
        for (var i = 0; i < s.length; ++i) {
            var c = s.substr(i, 1);
            if (s.charCodeAt(i) > 255 || /[a-z|0-9|_| |\-|\(|\)|\{|\}|\[|\]|\.]/ig.test(c))
                ret += c;
            else
                ret += '_';
        }
        return ret;
    },

    getFirstChild: function (parent, tag) {
        if (parent == null)
            return null;
        for (var i = 0; i < parent.childNodes.length; ++i) {
            if (parent.childNodes[i].tagName == tag)
                return parent.childNodes[i];
        }
        return null;
    },

    /**
    * Parse an xml string
    * @function {static} parseXml
    * @param {string} xml - input xml string
    * @returns a XML document object
    */
    parseXml: function (xml) {
        var ret = this.parseXml2(xml);
        if (ret != null && ret.succeeded)
            return ret.doc;
        return null;
    },

    parseXml2: function (xml) {
        if (xml == null)
            return null;

        xml = this.trim(xml);
        if (xml.length < 10 || xml.substr(0, 1) != "<" || xml.substr(xml.length - 1, 1) != ">")
            return null;

        var succeeded = false;
        var error = null;
        var doc = null;
        try {
            if (window.DOMParser) {
                doc = new DOMParser().parseFromString(xml, "text/xml");
            }
            else // Internet Explorer
            {
                doc = new ActiveXObject("Microsoft.XMLDOM");
                doc.async = "false";
                doc.loadXML(xml);
            }
            succeeded = true;
        }
        catch (e) {
            error = e.message;
        }

        return { succeeded: succeeded, error: error, doc: doc };
    },

    xquery: function (e, path, returnone) {
        if (e == null || path == null || path == "")
            return null;

        var ret = null;
        var list = path.split('/');
        for (var i = 0; i < list.length; ++i) {
            var s = list[i];
            if (s == "")
                continue;

            var tag = s.replace(/[\[]@[a-z]+[0-9|a-z]{0,9}='[^\']+'[\]]$/, "");
            s = s.substr(tag.length + 2, s.length - (tag.length + 3));

            var key = null;
            var val = null;
            var p = s.indexOf('=');
            if (p > 0) {
                key = s.substr(0, p);
                p += 2;
                val = s.substr(p, s.length - p - 1);
            }

            var e2 = null;
            for (var k = 0; k < e.childNodes.length; ++k) {
                var c = e.childNodes[k];
                if (c.tagName == tag) {
                    if (key == null || c.getAttribute(key) == val)
                        e2 = c;
                }

                if (e2 != null) {
                    if (i == list.length - 1) {
                        if (returnone)
                            return e2;

                        if (ret == null)
                            ret = [e2];
                        else
                            ret.push(e2);
                    }
                    else {
                        e2 = c;
                        break;
                    }
                }
            }

            if (ret != null)
                return ret;
            if (e2 == null)
                return null;
            else
                e = e2;
        }
        return null;
    },

    /**
    * Parse an json string
    * @function {static} parseJson
    * @param {string} s - input json string
    * @returns a javascript object
    */
    parseJson: function (s) {
        return this.eval(s);
    },

    /**
    * Test if a string contains a word
    * @function {static} containsWord
    * @param {string} str - the string to be tested
    * @param {string} word - the word to be tested
    * @param {bool} ignorecase - indicate if ignoring cases or not
    * @returns true of false
    */
    containsWord: function (str, word, ignorecase) {
        if (str == null || word == null || str == "" || word == "")
            return false;
        if (ignorecase)
            word = word.toLowerCase();
        var words = str.toLowerCase().split(/\W+/);
        for (var i = 0; i < words.length; ++i) {
            if (words[i] == word)
                return true;
        }
        return false;
    },

    /**
    * Show message dialog.<br>
    * For Windows 8 metro Apps, and Office Apps, standard alert() function is not allowed.  alert2() can be an alternative.
    * @function {static} alert2
    * @param {string} message - message body
    * @param {string} caption - dialog caption
    * @param {function()} callback - callback function
    * @param {string} iconurl - image url of the dialog icon
    * @param {number} width - dialog width
    * @returns null
    */
    alert2: function (message, caption, callback, iconurl, width) {
        if (scil.Utils.alertdlg == null) {
            var tbody = scil.Utils.createTable();
            var tr = scil.Utils.createElement(tbody, "tr");
            var img = scil.Utils.createElement(scil.Utils.createElement(tr, "td", null, { verticalAlign: "top" }), "img", null, { height: "50px", width: "50px" });
            var td = scil.Utils.createElement(tr, "td", null, { textAlign: "center" });
            var msg = scil.Utils.createElement(td, "div", null, { padding: "10px", textAlign: "left", maxWidth: "800px", maxHeight: "400px", overflow: "auto", color: "#000" });
            //if (scil.Utils.isIE)
            //    msg.style.height = "expression(clientHeight>360 ? '360px' : 'auto')";
            var ok = scil.Utils.createElement(td, "button", scil.Utils.imgTag("tick.gif", this.res("OK")), { width: "80px" });

            scil.Utils.alertdlg = new JSDraw2.Dialog("Attention", tbody.parentNode);
            scil.Utils.alertdlg.msg = msg;
            scil.Utils.alertdlg.img = img;

            dojo.connect(ok, "onclick", function (e) { var d = scil.Utils.alertdlg; if (d.callback != null) d.callback(); d.hide(); e.preventDefault(); });
        }

        if (iconurl == null || iconurl == "")
            iconurl = scil.Utils.imgSrc("img/information.gif");
        else if (!scil.Utils.startswith(iconurl, "http:"))
            iconurl = scil.Utils.imgSrc("img/" + iconurl + ".gif");
        scil.Utils.alertdlg.show(caption);
        scil.Utils.alertdlg.callback = callback;
        scil.Utils.alertdlg.msg.innerHTML = message == null ? '' : "<div style='margin:0;max-width:800px;'>" + message + "</div>";
        scil.Utils.alertdlg.img.src = iconurl;

        scil.Utils.alertdlg.moveCenter();
    },

    /**
    * Show confirm dialog.<br>
    * For Windows 8 metro Apps, and Office Apps, standard confirm() function is not allowed.  confirm() can be an alternative.
    * @function {static} confirm
    * @param {string} message - message body
    * @param {function(string status)} callback - callback function. status value: true, false, 'cancel'
    * @param {bool} cancelbtn - indicate if it shows Cancel button or not
    * @param {string} caption - dialog caption
    * @returns null
    */
    confirm: function (message, callback, cancelbtn, caption, owner) {
        if (scil.Utils.confirmdlg == null) {
            var tbody = scil.Utils.createTable();
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", "<img style='width:50px;height:50px;' src='" + scil.Utils.imgSrc("img/question.gif") + "'>", { verticalAlign: "top" });
            var td = scil.Utils.createElement(tr, "td", null, { textAlign: "center" });
            var msg = scil.Utils.createElement(td, "div", null, { padding: "10px", textAlign: "left", maxHeight: "360px", color: "black" });
            //if (scil.Utils.isIE)
            //    msg.style.height = "expression(clientHeight>360 ? '360px' : 'auto')";
            var yes = scil.Utils.createElement(td, "button", this.res("Yes"), { width: "80px" });
            var no = scil.Utils.createElement(td, "button", this.res("No"), { width: "80px" });
            var cancel = scil.Utils.createElement(td, "button", this.res("Cancel"), { width: "80px" });

            scil.Utils.confirmdlg = new JSDraw2.Dialog(this.res("Attention"), tbody.parentNode);
            scil.Utils.confirmdlg.msg = msg;
            scil.Utils.confirmdlg.cancel = cancel;

            dojo.connect(yes, "onclick", function (e) { var d = scil.Utils.confirmdlg; d.hide(); e.preventDefault(); if (d.callback != null) d.callback(true); });
            dojo.connect(no, "onclick", function (e) { var d = scil.Utils.confirmdlg; d.hide(); e.preventDefault(); if (d.callback != null) d.callback(false); });
            dojo.connect(cancel, "onclick", function (e) { var d = scil.Utils.confirmdlg; d.hide(); e.preventDefault(); if (d.callback != null) d.callback('cancel'); });
        }

        scil.Utils.confirmdlg.show();
        scil.Utils.confirmdlg.callback = callback;
        scil.Utils.confirmdlg.cancel.style.display = cancelbtn ? '' : "none";
        scil.Utils.confirmdlg.msg.innerHTML = message == null ? '' : "<pre style='margin:0'>" + message + "</pre>";
        scil.Utils.confirmdlg.hide(true);
        scil.Utils.confirmdlg.show(caption, null, null, null, owner);
    },

    /**
    * A simple version confirm dialog, only showing Yes, No button
    * @function {static} confirmYes
    * @param {string} message - message body
    * @param {function()} callback - callback function.
    * @returns null
    */
    confirmYes: function (message, callback, owner) {
        scil.Utils.confirm(message, function (f) { if (f) callback(); }, null, null, owner);
    },

    /**
    * Show prompt dialog, and ask to input a string<br>
    * For Windows 8 metro Apps, and Office Apps, standard prompt() function is not allowed.  This prompt() can be an alternative.
    * @function {static} prompt2
    * @param {string} caption - dialog caption
    * @param {string} message - message body
    * @param {string} defaultvalue - default value in the input box
    * @param {string} button - the button label
    * @param {function()} callback - callback function.
    * @param {string} iconurl - the url of dialog icon
    * @param {bool} zindex - zIndex of the dialog
    * @param {bool} multiline - indicate if showing multiline input box
    * @param {number} height
    * @returns null
    */
    prompt2: function (options) {
        return this.prompt(options.caption, options.message, options.defaultvalue, options.button,
            options.callback, options.iconurl, options.zindex, options.multiline, options.autosuggesturl, options.owner,
            options.maxlength, options.height);
    },

    /**
    * Show prompt dialog, and ask to input a string<br>
    * For Windows 8 metro Apps, and Office Apps, standard prompt() function is not allowed.  This prompt() can be an alternative.
    * @function {static} prompt
    * @param {string} caption - dialog caption
    * @param {string} message - message body
    * @param {string} defaultval - default value in the input box
    * @param {string} btn - the button label
    * @param {function()} callback - callback function.
    * @param {string} iconurl - the url of dialog icon
    * @param {bool} zindex - zIndex of the dialog
    * @param {bool} multiline - indicate if showing multiline input box
    * @returns null
    */
    prompt: function (caption, message, defaultval, btn, callback, iconurl, zindex, multiline, autosuggesturl, owner, maxlength, height) {
        if (scil.Utils.promptdlg == null) {
            var tbody = scil.Utils.createTable();
            var tr = scil.Utils.createElement(tbody, "tr");
            var icon = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "div", null, { width: "50px" });
            var td = scil.Utils.createElement(tr, "td");
            var msg = scil.Utils.createElement(td, "div", null, { color: "black" });

            var div = scil.Utils.createElement(td, "div");
            var input = scil.Utils.createElement(div, "input", null, { width: "360px", display: "none" });
            input.setAttribute("x-webkit-speech", "on");
            var textarea = scil.Utils.createElement(div, "textarea", null, { width: "360px", display: "none" });

            var div = scil.Utils.createElement(td, "div", null, { textAlign: "center", paddingTop: "5px" });
            var button = scil.Utils.createElement(div, "button", btn, { width: scil.Utils.buttonWidth + "px" });

            var dlg = scil.Utils.promptdlg = new JSDraw2.Dialog(this.res("Message"), tbody.parentNode);
            dlg.icon = icon;
            dlg.msg = msg;
            dlg.input = input;
            dlg.textarea = textarea;
            dlg.button = button;

            var fn = function (e) { var d = dlg; d.hide(); if (d.callback != null) d.callback(d.input.style.display == "none" ? d.textarea.value : d.input.value, d.input.style.display == "none" ? d.textarea : d.input); if (e.preventDefault != null) e.preventDefault(); };
            dojo.connect(dlg.input, "onkeydown", function (e) { if (e.keyCode == 13) { fn(e); } });
            dojo.connect(button, "onclick", fn);

            dlg.auto = new scil.AutoComplete(input, null);
        }

        var dlg = scil.Utils.promptdlg;

        dlg.input.style.display = multiline ? "none" : "";
        dlg.textarea.style.display = multiline ? "" : "none";
        dlg.input.setAttribute("maxlength", maxlength > 0 ? maxlength : "");

        if (height > 0) {
            dlg.input.style.height = height + "px";
            dlg.textarea.style.height = height + "px";
        }
        else {
            dlg.input.style.height = "";
            dlg.textarea.style.height = "";
        }

        dlg.auto.url = autosuggesturl;
        dlg.auto.disabled = autosuggesturl == null || autosuggesturl == "";

        dlg.show(caption, zindex);
        if (iconurl == null) {
            dlg.icon.innerHTML = "&nbsp;";
        }
        else {
            dlg.icon.innerHTML = "<img style='width:50px;height:50px;' src='" + iconurl + "'>";
            dlg.icon.style.display = "";
        }

        dlg.msg.innerHTML = message == null ? '' : message;
        dlg.button.innerHTML = btn == null ? this.res("OK") : this.res(btn);
        (multiline ? dlg.textarea : dlg.input).value = defaultval == null ? '' : defaultval;
        dlg.callback = callback;

        dlg.hide(true);
        dlg.show2({ owner: owner });
        (multiline ? dlg.textarea : dlg.input).select();
        (multiline ? dlg.textarea : dlg.input).focus();
    },

    /**
    * Create a Cookie
    * @function {static} createCookie
    * @param {string} name - the cookie's name
    * @param {string} value - the value of the cookie
    * @param {number} days - total days that the cookie will expire
    * @returns null
    */
    createCookie: function (name, value, days, ignoreStore) {
        if (!ignoreStore) {
            var store = dojox.storage == null || dojox.storage.LocalStorageProvider == null ? null : new dojox.storage.LocalStorageProvider();
            if (store != null && store.isAvailable()) {
                store.initialize();
                store.put(name, value);
                return;
            }
        }

        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        document.cookie = name + "=" + escape(value) + expires + "; path=/";
    },

    /**
    * Read a Cookie
    * @function {static} readCookie
    * @param {string} name - the cookie's name
    * @returns the value of the cookie as a string
    */
    readCookie: function (name, ignoreStore) {
        if (!ignoreStore) {
            var store = dojox.storage == null || dojox.storage.LocalStorageProvider == null ? null : new dojox.storage.LocalStorageProvider();
            if (store != null && store.isAvailable()) {
                store.initialize();
                return store.get(name);
            }
        }

        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0)
                return unescape(c.substring(nameEQ.length, c.length));
        }
        return null;
    },

    /**
    * Erase a Cookie
    * @function {static} eraseCookie
    * @param {string} name - the cookie's name
    * @returns null
    */
    eraseCookie: function (name) {
        if (dojox.storage != null && dojox.storage.LocalStorageProvider != null) {
            var store = new dojox.storage.LocalStorageProvider();
            if (store.isAvailable()) {
                store.initialize();
                return store.remove(name);
            }
        }

        createCookie(name, "", -1);
    },

    /**
    * Format file size
    * @function {static} formatFilesize
    * @param {number} s - file size
    * @returns a string
    */
    formatFilesize: function (filesize) {
        if (!(filesize > 0))
            return "";

        if (filesize / 1000 < 1)
            return filesize + "Bytes";
        filesize = filesize / 1000;
        if (filesize / 1000 < 1)
            return Math.round(filesize * 10) / 10 + "KB";
        filesize = filesize / 1000;
        if (filesize / 1000 < 1)
            return Math.round(filesize * 10) / 10 + "MB";
        filesize = filesize / 1000;
        if (filesize / 1000 < 1)
            return Math.round(filesize * 10) / 10 + "GB";
        filesize = filesize / 1024;
        return Math.round(filesize * 10) / 10 + "TB";
    },

    today: function () {
        return scil.Utils.trunc2date(new Date());
    },

    trunc2date: function (d) {
        return d == null ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },

    time: function (tm) {
        if (tm == null)
            return new Date();

        var t = null;
        if (typeof (tm) == "string") {
            if (/^[0-9]+$/.test(tm)) {
                tm = parseInt(tm);
            }
            else {
                var ss = tm.split('-');
                if (ss.length == 3) {
                    var y = parseInt(ss[0]);
                    var m = parseInt(ss[1]) - 1;
                    var d = parseInt(ss[2]);
                    if (isNaN(m))
                        m = scil.Utils.indexOf(this._months, ss[1]);

                    if (y > 0 && m >= 0 && m < 12 && d > 0 && d <= 31)
                        return new Date(y, m, d);
                }
            }
        }
        if (t == null)
            t = new Date(tm);

        // If tm is a string, like 2015-04-30, the time is UTC time.  Convert it into local time.
        var offset = t.getTimezoneOffset();
        if (isNaN(offset))
            offset = 0;
        return new Date(t.getTime() + offset * 60000);
    },

    _months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    _weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    weekday: function (dt) {
        return this._weekdays[dt.getDay()];
    },

    formatTime: function (tm, format) {
        if (tm == 0)
            return "";
        if (tm == null)
            tm = new Date();
        if (typeof tm != "object")
            tm = scil.Utils.time(tm);

        if (JSDraw2.timezoneoffet > 0)
            tm.setTime(tm.getTime() + JSDraw2.timezoneoffet * 60 * 60 * 1000);

        // date part
        var s = format;
        if (scil.Utils.isNullOrEmpty(s))
            s = "yyyy-mmm-dd";

        s = s.replace("yyyy", tm.getFullYear())
                .replace("yy", (tm.getFullYear() + "").substr(2))
                .replace("mmm", scil.Utils._months[tm.getMonth()])
                .replace("mm", scil.Utils.padLeft(tm.getMonth() + 1, 2, '0'))
                .replace("dd", scil.Utils.padLeft(tm.getDate(), 2, '0'));

        // time part
        var h24 = s.indexOf("hh") >= 0;
        var h = tm.getHours();
        s = s.replace("hh", this.padLeft(h % 12, 2, '0'))
            .replace("HH", this.padLeft(h, 2, '0'))
            .replace("MM", this.padLeft(tm.getMinutes(), 2, '0'))
            .replace("SS", this.padLeft(tm.getSeconds(), 2, '0'))
            .replace("ss", this.padLeft(tm.getSeconds(), 2, '0'));
        if (h24)
            s += h >= 12 ? "PM" : "AM";

        return s;
    },

    /**
    * Convert a date number into visible date string
    * @function {static} dateStr
    * @param {number} tm - the number of time
    * @param {bool} classic - if classic is true, it won't show Today, Yesterday etc.
    * @returns a string
    */
    dateStr: function (input, classic, format) {
        if (scil.Utils.isNullOrEmpty(input) || input == 0)
            return "";
        var tp = typeof (input);
        if (!(tp == "object" || tp == "number" || tp == "string"))
            return "";
        var tm = input;
        if (tp != "object") {
            tm = scil.Utils.time(tm);
            if (tm == null)
                return "";
        }

        var days = (scil.Utils.today().getTime() - scil.Utils.trunc2date(tm).getTime()) / 1000 / 60 / 60 / 24;

        var ret = null;
        if (!classic) {
            if (days == 0)
                ret = JSDraw2.Language.res("Today");
            else if (days == 1)
                ret = JSDraw2.Language.res("Yesterday");
        }
        if (ret == null) {
            if (scil.Utils.isNullOrEmpty(format)) {
                format = JSDraw2.defaultoptions.dateformat;
                if (scil.Utils.isNullOrEmpty(format))
                    format = "yyyy-mmm-dd";
            }

            // if the input is 2014-04-08, this is to fix the timezone issue
            if (typeof (input) == "string")
                tm = new Date(tm);

            ret = scil.Utils.formatTime(tm, format);
        }

        return ret;
    },

    /**
    * Convert a time number into visible time string
    * @function {static} timeStr
    * @param {number} tm - the number of time
    * @param {bool} classic - if classic is true, it won't show Today, Yesterday etc.
    * @returns a string
    */
    timeStr: function (tm, classic, timefmt) {
        if (scil.Utils.isNullOrEmpty(tm) || tm == 0)
            return "";

        if (typeof (tm) == "string") {
            if (tm == "new")
                return "<span style='color:red'>" + JSDraw2.Language.res("New") + "</span>";
            else
                return tm;
        }

        if (tm == null)
            return "";
        if (typeof tm != "object")
            tm = scil.Utils.time(tm);

        var s = timefmt != null ? timefmt : JSDraw2.defaultoptions.timeformat;
        if (scil.Utils.isNullOrEmpty(s))
            s = "HH:MM";

        return scil.Utils.dateStr(tm, classic) + " " + scil.Utils.formatTime(tm, s);
    },

    /**
    * Create a Button
    * @function {static} createButton
    * @param {string or DOM} parent - the parent of the new element.  The parent can be set to null, so it won't have a parent
    * @param {dictionary} button - { caption: string, onclick: function }
    * @returns the new button
    */
    createButton: function (parent, button, lang) {
        if (typeof parent == "string")
            parent = dojo.byId(parent);

        if (button == null)
            return;
        if (typeof (button) == "string") {
            this.createElement(parent, "span", button);
            return;
        }

        var s = (lang == null ? scil.Lang : lang).res(button.caption || button.label);
        var title = scil.Lang.res(button.title);

        if (button.src == null && button.iconurl != null)
            button.src = button.iconurl;
        if (button.title == null && button.tooltips != null)
            button.title = button.tooltips;

        var a = null;
        if (button.type == "b") {
            var tbody = scil.Utils.createTable(parent, 0, 0, { float: button.float == null ? "left" : button.float, textAlign: "center", margin: 0, borderRadius: "2px" });
            a = tbody.parentNode;
            if (button.id != null)
                a.setAttribute("id", button.id);
            scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", "<img src='" + button.src + "'" + (button.imgheight > 0 ? " height='" + button.imgheight + "'" : "") + ">", { padding: "3px 12px 0 12px" });
            scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", s, { color: "#fff", fontSize: "60%" });
        }
        else {
            if (s == null && (button.src || button.icon) != null) {
                a = this.createElement(parent, "img", null, { width: button.width, cursor: "pointer", verticalAlign: "middle" }, { src: (button.src || button.icon), title: button.title, id: button.id });
            }
            else {
                if (button.src != null)
                    s = "<img style='vertical-align:middle' src='" + button.src + "'" + (button.imgheight > 0 ? " height='" + button.imgheight + "'" : "") + ">" + s;

                if (button.type == "a")
                    a = this.createElement(parent, button.tagname != null ? button.tagname : (s == "" || s == null ? "span" : "u"), s, { width: button.width, cursor: "pointer", background: button.background, whiteSpace: "nowrap" }, { title: title, id: button.id });
                else
                    a = this.createElement(parent, "button", s, { width: button.width, background: button.background, padding: button.padding }, { title: title, id: button.id });
            }
        }

        if (button.items != null) {
            if (a.tagName == "IMG" || a.tagName == "U") {
                var b = this.createElement(parent, "span", null);
                b.appendChild(a);
                a = b;
            }
        }

        var hc = button.highlightcolor == null ? JSDraw2.Skin.menu.highlightcolor : button.highlightcolor;
        var c = button.color == null ? (button.type == "b" ? "" : JSDraw2.Skin.menu.color) : button.color;
        a.style.color = c;
        if (button.type == "b") {
            scil.connect(a, "onmouseover", function () { a.style.background = hc; });
            scil.connect(a, "onmouseout", function () { a.style.background = c; });
        }
        else {
            scil.connect(a, "onmouseover", function () { a.style.color = hc; });
            scil.connect(a, "onmouseout", function () { a.style.color = c; });
        }

        if (button.items != null) {
            if (button.callback == null) {
                button.callback = function (cmd) {
                    if (button.onclick != null) {
                        button.onclick(cmd);
                    }
                    else {
                        for (var i = 0; i < button.items.length; ++i) {
                            if (button.items[i].label == cmd && button.items[i].url != null) {
                                if (button.items[i].target == null)
                                    window.location = button.items[i].url;
                                else
                                    window.open(button.items[i].url, button.items[i].target);
                            }
                        }
                    }
                };
            }
            new scil.DropdownButton(a, button);
        }
        else {
            if (button.onclick != null)
                dojo.connect(a, "onclick", function (e) { button.onclick(e); });
            else if (button.url)
                dojo.connect(a, "onclick", function () { if (button.target == null) window.location = button.url; else window.open(button.url, button.target); });
        }

        if (button.key != null)
            a.setAttribute("key", button.key);

        return a;
    },

    /**
    * Create a HTML element.
    * <pre>
    * <b>Example:</b>
    *    var div = scil.Utils.createElement(document.body, "div", 
    *       "&lt;" + "a href='javascript:alert(99)'&gt;test&lt;/a" + "&gt;", {textAlign:'center'}, {class: 'myclass'});
    * </pre>
    * @function {static} createElement
    * @param {DOM} parent - the parent of the new element.  The parent can be set to null, so it won't have a parent
    * @param {string} tag - the name of the new element
    * @param {string} html - the innerHTML of the new element
    * @param {dictionary} styles - styles of the new element
    * @param {dictionary} attributes - attributes of the new element, such as the name, id, class etc.
    * @param {onclick} function
    * @returns the new HTML element
    */
    createElement: function (parent, tag, html, styles, attributes, onclick) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);

        if (attributes != null && attributes.title != null)
            attributes.title = this.res(attributes.title);

        var e = null;
        tag = tag.toLowerCase();
        if (tag == "checkbox" || tag == "radio" || tag == "password" || tag == "hidden" || tag == "file" || tag == "image") {
            if (scil.Utils.isIE8Lower) {
                var att = attributes != null && attributes["name"] != null ? " name='" + attributes["name"] + "'" : "";
                e = document.createElement("<input type='" + tag + "'" + att + ">");
            }
            else {
                e = document.createElement("input");
                e.type = tag;
            }
        }
        else {
            e = document.createElement(tag);
        }

        if (parent != null)
            parent.appendChild(e);

        if (html != null) {
            if (tag == "radio" || tag == "checkbox")
                this.createElement(parent, "span", html);
            else
                e.innerHTML = html;
        }

        if (styles != null) {
            for (var k in styles) {
                var v = styles[k];
                if (v == null)
                    continue;

                if ((k == "width" || k == "height" || k == "padding" || k == "margin") && typeof (v) == "number")
                    v = v + "px";

                e.style[k] = v;
            }
        }

        if (attributes != null) {
            for (var k in attributes) {
                if (attributes[k] != null)
                    e.setAttribute(k, attributes[k]);
            }
        }

        if (onclick != null)
            dojo.connect(e, "onclick", function (event) { onclick(event, e); });

        return e;
    },

    //    /**
    //    * Download a file from the same site.  It won't work to download cross-site contents.
    //    * <pre>
    //    * <b>Example:</b>
    //    *    scil.Utils.downloadFile("data/m.mol", function(data) { alert(data); });
    //    * </pre>
    //    * @function {static} downloadFile
    //    * @param {string} url - url of the file
    //    * @param {function} callback - function(data) {}
    //    */
    //    downloadFile: function (url, callback) {
    //        var iframe = scil.Utils.createElement(document.body, "iframe", null, { width: 1, height: 1, display: "none" },
    //            { frameBorder: 0, src: url });

    //        scil.connect(iframe, "onload", function () {
    //            var doc = null;
    //            if (iframe.contentDocument != null)
    //                doc = iframe.contentDocument;
    //            else if (iframe.contentWindow != null)
    //                doc = iframe.contentWindow.document;
    //            var body = doc == null ? null : doc.body;

    //            var data;
    //            if (body == null && doc.documentElement != null)
    //                data = new XMLSerializer().serializeToString(doc);
    //            else
    //                data = scil.Utils.getInnerText(body);

    //            iframe.parentNode.removeChild(iframe);
    //            if (callback != null)
    //                callback(data, url);
    //        });
    //    },

    /**
    * Create a HTML table element
    * @function {static} createTable
    * @param {DOM} parent - the parent of the new table.  The parent can be set to null, so it won't have a parent
    * @param {number} cellspacing - the cell spacing in pixel
    * @param {number} cellpadding - the cell padding in pixel
    * @param {dictionary} styles - styles of the new element
    * @param {number} border - the border width of the table
    * @returns the new HTML element
    */
    createTable: function (parent, cellspacing, cellpadding, styles, border) {
        var table = this.createElement(parent, "table", null, styles);
        if (cellspacing != null)
            table.cellSpacing = cellspacing;
        if (cellpadding != null)
            table.cellPadding = cellpadding;
        if (border >= 0)
            table.border = border;
        return this.createElement(table, "tbody");
    },

    /**
    * Create a HTML table element
    * @function {static} createTable
    * @param {DOM} parent - the parent of the new table.  The parent can be set to null, so it won't have a parent
    * @param {dict} styles - styles of the new element
    * @param {dict} attributes - attributes
    * @returns the new HTML element
    */
    createTable2: function (parent, styles, attributes) {
        var table = this.createElement(parent, "table", null, styles, attributes);
        return this.createElement(table, "tbody");
    },

    createTR: function (parent, styles) {
        return scil.Utils.createElement(parent, "tr", styles);
    },

    createTD: function (parent, styles) {
        if (parent.tagName != "TR")
            parent = this.createTR(parent);
        return scil.Utils.createElement(parent, "td", styles);
    },

    createCenterBox: function (parent, border) {
        var t = this.createTable(parent, 0, 0, null, border);
        t.parentNode.setAttribute("align", "center");
        var tr = this.createElement(t, "tr");
        var td = this.createElement(tr, "td", null, { textAlign: "left" });
        return td;
    },

    createSelect: function (parent, items, value, sortitems, styles) {
        var sel = this.createElement(parent, "select", null, styles);
        this.listOptions(sel, items, value, false, sortitems);
        return sel;
    },

    /**
    * Specify items of a SELECT element
    * @function {static} listOptions
    * @param {DOM} select - the destination SELECT element
    * @param {array or dictionary} items - items to be added
    * @param {string} val - the value of the selected item
    * @param {bool} removeall - indicate if removing all existing items before adding new items
    * @param {bool} sortitems - indicate if sorting items before adding them
    * @returns null
    */
    listOptions: function (select, items, val, removeall, sortitems) {
        if (removeall != null)
            this.removeAll(select);
        if (items == null)
            return;

        if (items.length != null) {
            if (sortitems)
                items.sort();
            for (var i = 0; i < items.length; ++i) {
                var s = items[i];
                var opt = this.createElement(select, "option", s, null, { value: s });
                if (s == val)
                    opt.setAttribute("selected", "selected");
            }
        }
        else {
            var ss = {};
            var list = [];
            for (var k in items) {
                ss[items[k]] = k;
                list.push(items[k]);
            }
            if (sortitems)
                list.sort();

            for (var i = 0; i < list.length; ++i) {
                var v = list[i];
                var k = ss[v];
                var opt = this.createElement(select, "option", v, null, { value: k });
                if (k == val)
                    opt.setAttribute("selected", "selected");
            }
        }
    },

    /**
    * Select an item in a SELECT element based on a value
    * @function {static} selectOption
    * @param {DOM} select - the destination SELECT element
    * @param {string} val - the value of the selected item
    * @returns null
    */
    selectOption: function (select, val, ignorecase) {
        if (select == null)
            return;

        for (var i = 0; i < select.options.length; ++i) {
            var opt = select.options[i];
            if (this.isEqualStr(opt.value, val + "", ignorecase) || typeof (val) == "boolean" && (val == true && scil.Utils.isTrue(opt.value) || val == false && scil.Utils.isFalse(opt.value))) {
                select.selectedIndex = i;
                return;
            }
        }
        select.selectedIndex = -1;
    },

    isEqualStr: function (s1, s2, ignorecase) {
        if (s1 == null && s2 == null)
            return true;
        if (s1 == null || s2 == null)
            return false;

        if (ignorecase)
            return s1.toLowerCase() == s2.toLowerCase();
        return s1 == s2;
    },

    /**
    * Remove all child elements
    * @function {static} removeAll
    * @param {DOM} parent - the parent HTML element
    * @returns null
    */
    removeAll: function (parent) {
        if (parent == null || parent.childNodes == null)
            return;
        for (var i = parent.childNodes.length - 1; i >= 0; --i)
            parent.removeChild(parent.childNodes[i]);
    },

    /**
    * Get the first parent element with a given tag name
    * @function {static} getParent
    * @param {DOM} obj - the start HTML element
    * @param {string} tag - the element tag name to be searched
    * @returns the first parent element
    */
    getParent: function (obj, tag) {
        tag = tag.toUpperCase();
        while (obj != null) {
            if (obj.tagName != null && obj.tagName.toUpperCase() == tag)
                return obj;
            obj = obj.parentNode;
        }
        return obj;
    },

    /**
    * Test if an element is a child of a parent
    * @function {static} testParent
    * @param {DOM} obj - the child HTML element to be tested
    * @param {DOM} parent - the parent element to be tested
    * @returns true or false
    */
    testParent: function (obj, parent) {
        if (obj == null || parent == null)
            return false;
        while (obj != null) {
            if (obj.parentNode == parent)
                return true;
            obj = obj.parentNode;
        }
        return false;
    },

    /**
    * Find the first child of a given tag name
    * @function {static} firstElement
    * @param {DOM} parent - the parent element to be tested
    * @param {string} tag - the tag name to be searched
    * @returns the child HTML element
    */
    firstElement: function (parent, tag) {
        if (parent == null)
            return null;
        for (var i = 0; i < parent.childNodes.length; ++i) {
            var c = parent.childNodes[i];
            if (tag == null && c.nodeName != '#text' || tag != null && c.nodeName == tag)
                return c;
        }
        return null;
    },

    arrayContainsArray: function (superset, subset) {
        for (var i = 0; i < subset.length; ++i) {
            if (this.indexOf(superset, subset[i]) < 0)
                return false;
        }
        return true;
    },

    indexOf: function (list, a, ignorecase) {
        if (list == null)
            return -1;

        if (ignorecase && typeof (a) == "string")
            a = a.toLowerCase();
        else if (typeof (a) != "string")
            ignorecase = false;

        for (var i = 0; i < list.length; ++i) {
            var s = list[i];
            if (ignorecase)
                s = s.toLowerCase();
            if (s == a)
                return i;
        }
        return -1;
    },

    delFromArray: function (list, a) {
        var n = 0;
        for (var i = list.length - 1; i >= 0; --i) {
            if (list[i] == a) {
                list.splice(i, 1);
                ++n;
            }
        }
        return n;
    },

    /**
    * Post data to a url
    * @function {static} post
    * @param {string} url - the destination url to to be posted to
    * @param {dictionary} args - the data to be posted
    * @param {string} target - the target frame
    * @returns null
    */
    post: function (url, args, target) {
        if (this.form == null)
            this.form = scil.Utils.createElement(document.body, "form", null, { display: "none" });

        scil.Utils.removeAll(this.form);
        for (var k in args) {
            var f = scil.Utils.createElement(this.form, "textarea");
            f.name = k;
            f.value = args[k];
        }

        this.form.target = target;
        this.form.method = "post";
        this.form.action = url;
        this.form.submit();
    },

    postIframe: function (url, args) {
        if (this.postform == null)
            this.postform = scil.Utils.createElement(document.body, "form", null, { display: "none" });

        dojo.io.iframe.send({
            url: url,
            form: this.form,
            method: "POST",
            content: args,
            timeoutSeconds: 5,
            preventCache: true,
            handleAs: "text",
            error: function (data) { },
            handle: function (data) { }
        });
    },

    alert: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return;
        if (s.length > 1000)
            s = s.substr(0, 1000) + "...";
        if (scil.Utils.nativemode) {
            this.alert2(s, "JSDraw2.Editor Message");
        }
        else {
            alert(s);
        }
    },

    /**
    * Download data from a url
    * @function {static} download
    * @param {string} url - the destination url
    * @param {function} callback - the callback function
    * @returns null
    */
    download: function (url, callback) {
        if (url.indexOf('?') > 0)
            url += "&__tm=" + new Date().getTime();
        else
            url += "?__tm=" + new Date().getTime();
        if (scil.Utils.startswith(url, "http://")) {
            var jsonpArgs = {
                url: url,
                callbackParamName: "callback",
                load: callback,
                error: function (error) { alert(error); }
            };
            dojo.io.script.get(jsonpArgs);
        }
        else {
            var xhrArgs = {
                url: url,
                handleAs: "text",
                load: callback,
                error: function (error) { /*alert(error);*/ }
            };
            dojo.xhrGet(xhrArgs);
        }
    },

    /**
    * Perform an Ajax call
    * <pre>
    * <b>Example:</b>
    *    var callback = function(ret) {
    *        alert(ret.message);
    *    };
    *    scilligence.ajax("/path/ajax.ashx", callback, { username: "tom", password: "123" });
    * </pre>
    * @function {static} ajax
    * @param {string} url - the destination url
    * @param {function(dictionary)} callback - the callback function
    * @param {dictionary} params - data to be sent
    * @returns null
    */
    ajax: function (url, callback, params, opts) {
        if (opts == null)
            opts = {};

        var xhrArgs = {
            url: url,
            sync: opts.sync,
            handleAs: "text",
            content: scil.Utils.stupidTomcatBug(params),
            timeout: opts.timeout,
            error: function (data) {
                if (opts.showprogress)
                    scil.Progress.hide();

                if (opts.onError != null)
                    opts.onError(data);
                else
                    scil.Utils.alert(data.message);
            },
            load: function (data) {
                if (opts.showprogress)
                    scil.Progress.hide();

                scil.Utils.ajaxCallback(data, callback, opts.onError, opts.ignoresucceedcheck);
                if (scil.User != null && scil.User.onAjax != null)
                    scil.User.onAjax();
            }
        };

        if (opts.showprogress)
            scil.Progress.show((opts.caption == null ? "Loading ..." : opts.caption), false, (opts.message == null ? "Communicating with the server ..." : opts.message), false);

        if (scil.Utils.onajaxcall != null)
            scil.Utils.onajaxcall(xhrArgs, opts);

        if (opts.headers != null)
            xhrArgs.headers = opts.headers;

        switch (opts.verb) {
            case "delete":
            case "del":
                dojo.xhrDelete(xhrArgs);
                break;
            case "put":
                dojo.xhrPut(xhrArgs);
                break;
            case "get":
                dojo.xhrGet(xhrArgs);
                break;
            default:
                dojo.xhrPost(xhrArgs);
                break;
        }
    },

    stupidTomcatBug: function (params) {
        return params;
    },

    ajaxwait: function (url, params) {
        var ret = null;
        var fun = function (r) { ret = r; };
        this.ajax(url, fun, params, { sync: true });
        return ret;
    },

    /**
    * Perform an JSONP call
    * <pre>
    * <b>Example:</b>
    *    var callback = function(ret) {
    *        alert(ret.message);
    *    };
    *    scilligence.ajax("http://otherserver/path/ajax.ashx", callback, { username: "tom", password: "123" });
    *
    *    // cross domain call to post large data
    *    var url = "http://server/jsdraw/service.aspx?cmd=";
    *    var jsd = JSDraw.get("div1");
    *    scil.Utils.jsonp(url + "jsdraw2img", function (ret) {
    *        alert(ret.src);
    *    }, { jsdraw: jsd.getXml() }, { xdomainurl: url + "xdomain.postdata" });
    * </pre>
    * @function {static} jsonp
    * @param {string} url - the destination url
    * @param {function} callback - the callback function
    * @param {dictionary} params - data to be sent
    * @returns null
    */
    jsonp: function (url, callback, params, opts) {
        if (opts == null)
            opts = {};

        if (params == null)
            params = { wrapper: "jsonp" };
        else
            params.wrapper = "jsonp";

        if (scil.Utils.startswith(url, "//")) {
            var s = (window.location + "").toLowerCase();
            if (scil.Utils.startswith(s, "https:"))
                url = "https:" + url;
            else
                url = "http:" + url;
        }

        var p = url.indexOf('?');
        if (p < 0)
            url += "?";
        else
            url += "&";
        url += "__jsdraw_timestamp__=" + new Date().getTime();

        if (opts.showprogress)
            scil.Progress.show((opts.caption == null ? "Loading ..." : opts.caption), false, (opts.message == null ? "Communicating with the server ..." : opts.message), false);

        if (opts.xdomainurl != null) {
            scil.Utils.postXdomainData(opts.xdomainurl, function (xfilename) {
                scil.Utils.jsonp(url, function (ret) {
                    if (opts.showprogress)
                        scil.Progress.hide();

                    if (callback != null)
                        callback(ret);
                }, { _xfilename: xfilename });
            }, params);
        }
        else {
            var jsonpArgs = {
                url: url,
                callbackParamName: "callback",
                content: scil.Utils.stupidTomcatBug(params),
                error: function (data) {
                    if (opts.showprogress)
                        scil.Progress.hide();

                    if (opts.onError != null)
                        opts.onError(data);
                    else
                        scil.Utils.alert(data.message);
                },
                load: function (data) {
                    if (opts.showprogress)
                        scil.Progress.hide();

                    scil.Utils.ajaxCallback(data, callback, opts.onError, opts.ignoresucceedcheck);
                }
            };

            if (scil.Utils.onjsonpcall != null)
                scil.Utils.onjsonpcall(jsonpArgs);

            dojo.io.script.get(jsonpArgs);
        }
    },

    getZindex: function (e) {
        while (e != null) {
            if (e.style != null && e.style.zIndex != "" && e.style.zIndex != null)
                return parseInt(e.style.zIndex);
            e = e.parentNode;
        }
        return 1;
    },

    onAjaxCallback: null,
    ajaxCallback: function (data, callback, onError, ignoresucceedcheck) {
        var ret = null;
        switch (typeof (data)) {
            case "string":
                try {
                    eval("var o=" + data);
                    ret = o;
                }
                catch (e) {
                    scil.Utils.alert("Error when parsing Ajax results:\n" + e.message + "\n" + data);
                    return;
                }
                break;
            case "object":
                ret = data;
                break;
            default:
                scil.Utils.alert("Unknown return format");
                break;
        }

        if (scil.Utils.onAjaxCallback != null) {
            if (scil.Utils.onAjaxCallback(ret))
                return;
        }

        if (ignoresucceedcheck == true) {
            if (callback != null)
                callback(ret);
        }
        else if (ret.succeed) {
            if (callback != null)
                callback(ret.ret);
        }
        else {
            if (scil.User != null && scil.User.needLogin != null && scil.User.needLogin(ret))
                return;

            if (onError != null) {
                onError(ret);
            }
            else {
                if (ret.errcode == "None")
                    scil.Utils.alert(ret.error);
                else
                    scil.Utils.alert("[" + (ret.errcode == null ? "ERROR" : ret.errcode) + "]: " + ret.error);
            }
        }
    },

    ajaxUploadFile: function (form, url, params, callback) {
        if (params == null)
            params = {};
        if (url.toLowerCase().indexOf("wrapper=textarea") < 0) {
            var p = url.indexOf('?');
            if (p > 0)
                url += "&wrapper=textarea";
            else
                url += "?wrapper=textarea";
        }

        // I#12036
        if (scil.Utils.___ajaxUploadFile == null) {
            dojo.config.dojoBlankHtmlUrl = scil.Utils.imgSrc("blank.html");
            dojo.io.iframe.send({
                url: dojo.config.dojoBlankHtmlUrl,
                form: form,
                method: "get",
                content: params,
                timeoutSeconds: 60,
                preventCache: true,
                handleAs: "text"
            });
            scil.Utils.___ajaxUploadFile == true;
        }

        dojo.io.iframe.send({
            url: url,
            form: form,
            method: "post",
            content: params,
            timeoutSeconds: 60,
            preventCache: true,
            handleAs: "text",
            error: function (data) {
                scil.Progress.hide();
                scil.Utils.alert(data.message);
            },
            handle: function (data) {
                scil.Progress.hide();
                scil.Utils.ajaxCallback(data, callback);
            }
        });

        scil.Progress.show("Uploading", false, "Communicating with the server ...", false);
    },

    ajaxPostFile: function (form, url, params, callback) {
        if (params == null)
            params = {};
        if (url.toLowerCase().indexOf("wrapper=textarea") < 0) {
            var p = url.indexOf('?');
            if (p > 0)
                url += "&wrapper=textarea";
            else
                url += "?wrapper=textarea";
        }
        dojo.io.iframe.send({
            url: url,
            form: form,
            method: "post",
            content: params,
            timeoutSeconds: 5,
            preventCache: true,
            handleAs: "text",
            //error: function (data) { scil.Utils.alert(data.message); },
            handle: function (data) { if (callback != null) callback(data); }
        });
    },

    res: function (s) {
        return JSDraw2.Language.res(s);
    },

    UploadFileDlg: scilligence.extend(scilligence._base, {
        callback: null,
        url: null,
        params: null,
        msg: null,
        checkfiles: null,
        dlg: null,
        btn: null,
        tbody: null,
        files: [],

        constructor: function (multiple) {
            var div = JsUtils.createElement(null, "div", "<form method='post' enctype='multipart/form-data'></form>");
            this.form = div.firstChild;
            this.tbody = JsUtils.createTable(this.form, null, null, { margin: "6px", width: "350px" }, { align: "center" });
            var tr = JsUtils.createElement(this.tbody, "tr");
            this.msg = JsUtils.createElement(tr, "td");
            this.msg.colSpan = 2;

            if (multiple != null && multiple == true)
                multiple = 5;

            var n = 1;
            if (multiple && scil.Utils.isIE && scil.Utils.isIE < 10)
                var n = multiple > 1 ? multiple : 5;

            var args = { size: 26, name: "file" };
            if (multiple && n == 1)
                args.multiple = "multiple";

            for (var i = 0; i < n; ++i) {
                tr = JsUtils.createElement(this.tbody, "tr");
                JsUtils.createElement(tr, "td", scil.Utils.res("File") + ":");
                this.files[i] = JsUtils.createElement(JsUtils.createElement(tr, "td"), "file", null, null, args);
            }

            if (scil.MobileData != null) {
                var me = this;
                tr = JsUtils.createElement(this.tbody, "tr");
                JsUtils.createElement(tr, "td", "<div style='white-space:nowrap'>" + scil.Utils.res("From Mobile") + ":</div>", null, { valign: "top" });
                var td2 = JsUtils.createElement(tr, "td");
                this.mobileimages = JsUtils.createElement(td2, "hidden", null, null, { name: "mobileimages" });
                scil.Utils.createButton(td2, { label: "Show", type: "a", onclick: function () { me.showImageList(); } });
                this.imagelistdiv = JsUtils.createElement(td2, "div", null, { display: "none" });
                this.imagelist = scil.MobileData.createImageList(this.imagelistdiv, multiple);
            }

            tr = JsUtils.createElement(this.tbody, "tr", null, { display: "none" });
            JsUtils.createElement(tr, "td", "Password:");
            JsUtils.createElement(JsUtils.createElement(tr, "td"), "password", null, null, { name: "jsdraw.upload.password" });
            this.passwordRow = tr;

            JsUtils.createElement(JsUtils.createElement(this.tbody, "tr"), "td", "&nbsp;");

            tr = JsUtils.createElement(this.tbody, "tr");
            JsUtils.createElement(tr, "td");
            this.btn = JsUtils.createElement(scil.Utils.createElement(tr, "td"), "button", "<img src='" + scil.App.imgSmall("submit.png") + "' />" + scil.Utils.res("Upload"));

            this.dlg = new JSDraw2.Dialog("Upload File", div);
        },

        showImageList: function () {
            if (this.imagelistdiv.style.display == "none") {
                this.imagelistdiv.style.display = "";
                scil.MobileData.listImages(this.imagelist, this.params);
            }
            else {
                this.imagelistdiv.style.display = "none";
            }
        },

        show: function (caption, message, url, callback, params, showpassword, postonly, checkfiles) {
            this.dlg.show(caption);
            this.postonly = postonly;
            this.checkfiles = checkfiles;
            if (this.imagelistdiv != null) {
                this.imagelistdiv.style.display = "none";
                this.imagelist.clear();
            }

            var me = this;
            if (this.btn != null) {
                dojo.connect(this.btn, "onclick", function (e) { me.show2(); e.preventDefault(); });
                this.btn = null;
            }

            this.callback = function (ret) {
                if (callback != null)
                    callback(ret);
                me.dlg.hide();
            };
            this.url = url;
            this.params = params;
            this.form.reset();
            this.passwordRow.style.display = showpassword ? "" : "none";
            this.msg.innerHTML = message;
        },

        show2: function () {
            if (this.mobileimages != null)
                this.mobileimages.value = scil.MobileData.getSelectedImages(this.imagelist);

            if (this.postonly) {
                var filename = this.files[0].value;
                var p = filename.lastIndexOf('\\');
                if (p > 0)
                    filename = filename.substr(p + 1);
                var id = new Date().getTime();
                var args = this.params == null ? {} : scil.clone(this.params);
                args._xfilename = id + "_" + filename;

                var me = this;
                scil.Utils.ajaxPostFile(this.form, this.url, args, function () { me.callback(args._xfilename); });
            }
            else {
                var me = this;
                if (this.checkfiles) {
                    var list = [];
                    var files = this.files[0].files;
                    for (var i = 0; i < files.length; ++i)
                        list.push(files[i].name);
                    this.checkfiles(list, function (overwrite) {
                        var args = scil.clone(me.params);
                        args.overwrite = overwrite;
                        scil.Utils.ajaxUploadFile(me.form, me.url, args, me.callback);
                    });
                }
                else {
                    scil.Utils.ajaxUploadFile(me.form, me.url, me.params, me.callback);
                }
            }
        }
    }),

    postXdomainData: function (url, callback, data) {
        var id = new Date().getTime();
        var args = scil.clone(data);
        if (args == null)
            args = {};
        args._xfilename = id;

        if (this.xdomainform == null)
            this.xdomainform = scil.Utils.createElement(document.body, "form", null, { display: "none" });
        scil.Utils.ajaxPostFile(this.xdomainform, url, args, function () { if (callback != null) callback(args._xfilename); });
    },

    /**
    * Upload a file with Ajax
    * <pre>
    * <b>Example:</b>
    *    var callback = function(ret) { alert(ret.message); };
    *    scil.Utils.uploadFile("Uploade File", "Please upload attachments", "/uploade.aspx", callback, { project: "HIV" });
    * </pre>
    * @function {static} uploadFile
    * @param {string} caption - the caption of uploading dialog
    * @param {string} message - the message body of uploading dialog
    * @param {string} url - the destination url
    * @param {function} callback - the callback function
    * @param {dictionary} params - data to be sent
    * @param {bool} chk - reserved
    * @param {bool} multiple - data to be sent
    * @param {string} showpassword
    * @param {bool} postonly
    * @returns null
    */
    uploadfileDlg: null,
    uploadfileDlg2: null,
    uploadFile: function (caption, message, url, callback, params, chk, multiple, showpassword, postonly, checkfiles) {
        if (multiple) {
            if (this.uploadfileDlg2 == null)
                this.uploadfileDlg2 = new scil.Utils.UploadFileDlg(true);
            this.uploadfileDlg2.show(caption, message, url, callback, params, showpassword, postonly, checkfiles);
            this.uploadfileDlg2.check = chk;
        }
        else {
            if (this.uploadfileDlg == null)
                this.uploadfileDlg = new scil.Utils.UploadFileDlg();
            this.uploadfileDlg.show(caption, message, url, callback, params, showpassword, postonly, checkfiles);
            this.uploadfileDlg.check = chk;
        }
    },

    uploadFile2: function () {
        var dlg = this.uploadfileDlg;
        var params = dlg.params;
        scil.Utils.ajaxUploadFile(this.uploadfileDlg.form, dlg.url, params == null ? {} : params, dlg.callback);
    },

    ie2touches: function (e) {
        var list = e.getPointerList();
        var touches = [];
        for (var i = 0; i < list.length; ++i)
            touches.push({ pointerId: list[i].pointerId, clientX: list[i].clientX, clientY: list[i].clientY, target: e.target, button: e.button });
        touches.sort(function (a, b) { return a.pointerId - b.pointerId; });
        e.touches = touches;
        return e;
    },

    getScreenSize: function (win) {
        if (win == null)
            win = window;
        var scrollRoot = win.document.documentElement || win.document.body;
        var uiWindow = win.document.parentWindow || win.document.defaultView;
        return {
            w: uiWindow.innerWidth || scrollRoot.clientWidth,
            h: uiWindow.innerHeight || scrollRoot.clientHeight
        };
    },

    /**
    * Convert a JSON object into a string
    * @function {static} uploadFile
    * @param {dictionary} v - the input jsop object
    * @returns a string
    */
    json2str: function (v, readable, restrict) {
        var quot = restrict ? "\"" : "'";

        if (v == null)
            return "null";
        if (typeof (v) == "number")
            return v;
        if (typeof (v) == "boolean")
            return v ? "true" : "false";
        if (typeof (v) == "string") {
            var s = v.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
            if (quot == "\"")
                s = s.replace(/\"/g, "\\\"");
            else
                s = s.replace(/\'/g, "\\'");
            return quot + s + quot;
        }
        if (typeof (v) == "object") {
            if (v.length != null) { // array
                var s = (readable ? "[ " : "[");
                for (var i = 0; i < v.length; ++i)
                    s += (i > 0 ? (readable ? ", " : ",") : "") + this.json2str(v[i], readable, restrict);
                s += (readable ? " ]" : "]");
                return s;
            }
            else {
                var s = (readable ? "{ " : "{");
                var j = 0;
                for (var k in v) {
                    if (k == null || k == '' || v[k] == null || k.substr(0, 1) == '_')
                        continue;

                    if (++j > 1) {
                        if (s.substr(s.length - 1, 1) == "}")
                            s += (readable ? ",\r\n" : ",");
                        else
                            s += (readable ? ", " : ",");
                    }

                    if (!restrict && /^[a-z|_]+[0-9|a-z|_]{0,1000}$/.test(k))
                        s += k;
                    else
                        s += quot + k + quot;
                    s += (readable ? ": " : ":") + this.json2str(v[k], readable, restrict);
                }
                s += (readable ? " }" : "}");
                return s;
            }
        }
        return "null";
    },

    getMaxZindex: function () {
        var z1 = this.getMaxZindex2("div");
        var z2 = this.getMaxZindex2("iframe");
        var z3 = this.getMaxZindex2("table");
        return Math.max(Math.max(z1, z2), z3);
    },

    getMaxZindex2: function (tag) {
        // I#11869
        var zindex = document.body.className == "mce-fullscreen" ? 101 : 1;
        var list = document.getElementsByTagName(tag);
        for (var i = 0; i < list.length; ++i) {
            if (list[i].style == null || list[i].style.display == "none")
                continue;
            var z = list[i].style.zIndex;
            if (z != null && z != "") {
                var k = parseInt(z);
                if (k > zindex)
                    zindex = k;
            }
        }
        return zindex;
    },

    isAllParentVisible: function (e) {
        if (e == null)
            return false;

        while (e != null && e.style != null) {
            if (e.style.display == "none")
                return false;
            e = e.parentNode;
        }
        return true;
    },

    /**
    * Convert an XML object into JSON object
    * @function {static} xml2Json
    * @param {XMLElement} parent - the parent XML element
    * @param {string} tag - the xml tag name to be looked up
    * @returns an array of object
    */
    xml2Json: function (parent, tag) {
        if (parent == null)
            return null;
        var list = parent.getElementsByTagName(tag);
        if (list == null || list.length == 0)
            return null;

        var ret = [];
        for (var i = 0; i < list.length; ++i) {
            var e = list[i];
            var item = { _e: e };
            for (var k = 0; k < e.attributes.length; ++k) {
                var at = e.attributes[k];
                item[at.name] = at.value;
            }
            ret.push(item);
        }

        return ret;
    },

    /**
    * Convert a JSON oject array into an xml string
    * @function {static} jsonList2Xml
    * @param {array} list - the input array of objects
    * @param {string} tag - the xml tag name to be wrapped in xml
    * @returns a string
    */
    jsonList2Xml: function (list, tag) {
        if (list == null)
            return "";

        var s = "";
        for (var i = 0; i < list.length; ++i)
            s += this.json2Xml(list[i], tag);
        return s;
    },

    /**
    * Convert a JSON oject into an xml string
    * @function {static} json2Xml
    * @param {dictionary} dict - the input object
    * @param {string} tag - the xml tag name to be wrapped in xml
    * @param {string} innerXml - the inner xml to be placed in the xml element
    * @returns a string
    */
    json2Xml: function (dict, tag, innerXml) {
        if (dict == null)
            return "";

        var s = "<" + tag;
        for (var k in dict) {
            var v = dict[k];
            if (v == null || typeof (v) == "string" && v == "")
                continue;
            var type = typeof (v);
            if (type != "object" && type != "function")
                s += " " + k + "=\"" + scil.Utils.escXmlValue(dict[k]) + "\"";
        }
        if (innerXml != null && innerXml != "")
            s += ">" + innerXml + "</" + tag + ">";
        else
            s += "/>";
        return s;
    },

    /**
    * Merge two arrays
    * @function {static} joinArray
    * @param {array} list1 - the first array
    * @param {array} list2 - the second array
    * @returns a new array
    */
    joinArray: function (list1, list2) {
        if (list1 == null && list2 == null)
            return null;
        else if (list1 == null)
            return list2;
        else if (list2 == null)
            return list1;

        var ret = [];
        if (typeof list1 == "string" || list1.length == null) {
            ret.push(list1);
        }
        else {
            for (var i = 0; i < list1.length; ++i)
                ret.push(list1[i]);
        }
        if (typeof list2 == "string" || list2.length == null) {
            ret.push(list2);
        }
        else {
            for (var i = 0; i < list2.length; ++i)
                ret.push(list2[i]);
        }

        return ret;
    },

    /**
    * Get inner xml of an xml element
    * @function {static} getInnerXml
    * @param {XmlElement} element
    * @returns a string
    */
    getInnerXml: function (e) {
        if (e == null)
            return;

        if (e.documentElement != null)
            e = e.documentElement;

        if (e.innerXML)
            return e.innerXML;

        if (e.xml)
            return e.xml;

        if (typeof XMLSerializer != "undefined") {
            var s = "";
            for (var i = 0; i < e.childNodes.length; ++i)
                s += (new XMLSerializer()).serializeToString(e.childNodes[i]);
            return s;
        }

        return null;
    },

    getInnerText: function (e) {
        if (e == null)
            return;

        if (e != null && e.documentElement != null)
            e = e.documentElement;
        return scil.Utils.trim(e.innerText || e.textContent || e.text);
    },

    getChildXmlElements: function (e, tag) {
        if (e != null && e.documentElement != null)
            e = e.documentElement;
        if (e == null)
            return null;

        var ret = [];
        for (var i = 0; i < e.childNodes.length; ++i) {
            if (e.childNodes[i].tagName == tag)
                ret.push(e.childNodes[i]);
        }
        return ret;
    },

    num2letter: function (i, lowercase) {
        var s = "";
        while (i > 0) {
            var c = (i - 1) % 26;
            s = String.fromCharCode(c + (lowercase ? 97 : 65)) + s;
            i = (i - c - 1) / 26;
        }
        return s;
    },

    isImg: function (ext) {
        return ext == "gif" || ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "tif" || ext == "tiff" || ext == "bmp";
    },

    isOfficeFile: function (ext) {
        return ext == "doc" || ext == "docx" || ext == "rtf" || ext == "ppt" || ext == "pptx" || ext == "xls" || ext == "xlsx";
    },

    isPDF: function (ext) {
        return ext == "pdf";
    },

    isSpectraFile: function (ext) {
        return ext == "jdx";
    },

    isChemFile: function (ext) {
        return ext == "cdx" || ext == "cdxml" || ext == "jsd" || ext == "jsdraw" || ext == "mol" || ext == "sdf" || ext == "mol2" || ext == "cml" ||
        ext == "skc" || ext == "tgf" || ext == "mrv" || ext == "rxn" || ext == "rdf" || ext == "helm" || ext == "xhelm";
    },

    getFileExt: function (filename) {
        if (filename == null)
            return null;
        var p = filename == null ? -1 : filename.lastIndexOf('.');
        if (p <= 0)
            return null;
        return filename.substr(p + 1);
    },

    isChildOf: function (e, parent) {
        if (parent == null || e == null)
            return false;

        while (e != null) {
            if (e.parentNode == parent)
                return true;
            e = e.parentNode;
        }
        return false;
    },

    getElements: function (parent, name, ignorecase) {
        var ret = [];
        if (parent != null && parent.childNodes != null) {
            for (var i = 0; i < parent.childNodes.length; ++i) {
                var a = parent.childNodes[i];
                if (a.tagName == name || ignorecase && a.tagName != null && name != null && a.tagName.toLowerCase() == name.toLowerCase())
                    ret.push(a);
            }
        }
        return ret;
    },

    getFirstElement: function (parent, name) {
        var ret = [];
        if (parent != null && parent.childNodes != null) {
            for (var i = 0; i < parent.childNodes.length; ++i) {
                var a = parent.childNodes[i];
                if (name == null && a.tagName != null || name != null && a.tagName == name)
                    return a;
            }
        }
        return null;
    },

    parseIndex: function (s) {
        if (s == null)
            return null;
        var s2 = s.replace(/[0-9]+$/, "");
        if (s2 == s)
            return { prefix: s2, index: null };
        return { prefix: s2, index: parseInt(s.substr(s2.length)) };
    },

    removeArrayItem: function (list, item) {
        var p = scil.Utils.indexOf(list, item);
        if (p < 0)
            return false;
        list.splice(p, 1);
        return true;
    },

    removeArrayItems: function (list, items) {
        var n = 0;
        for (var i = 0; i < items.length; ++i)
            if (this.removeArrayItem(list, items[i]))
                ++n;
        return n;
    },

    moveToScreen: function (x, y, e, left) {
        var d = dojo.window.getBox();
        if (x + e.offsetWidth > d.l + d.w) {
            if (left != null)
                x = left - e.offsetWidth;
            else
                x = d.l + d.w - e.offsetWidth;
        }
        if (x < 0)
            x = 0;

        if (y + e.offsetHeight > d.t + d.h)
            y = d.t + d.h - e.offsetHeight;
        if (y < 0)
            y = 0;

        e.style.left = x + "px";
        e.style.top = y + "px";
    },

    unselectable: function (e) {
        e.onselectstart = function () { return false; };
        e.setAttribute("unselectable", "on");
        dojo.style(e, {
            webkitTouchCallout: "none",
            webkiUserDelect: "none",
            khtmlUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none"
        });
    },

    letter2num: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return 0;

        var ret = 0;
        s = s.toUpperCase();
        for (var i = 0; i < s.length; ++i) {
            var c = s.charCodeAt(i);
            if (c >= 65 && c <= 90)
                ret = ret * 26 + (c - 65 + 1);
        }

        return ret;
    },

    num2letter: function (i_1based, lowercase) {
        var s = "";
        while (i_1based > 0) {
            var c = (i_1based - 1) % 26;
            s = String.fromCharCode(c + (lowercase ? 97 : 65)) + s;
            i_1based = (i_1based - c - 1) / 26;
        }
        return s;
    },

    connect: function (element, event, fun) {
        return dojo.connect(element, event, fun);
    },

    array2str: function (list, sep) {
        if (list == null || list.length == 0)
            return "";

        var s = "";
        if (sep == null)
            sep = ',';
        for (var i = 0; i < list.length; ++i) {
            if (i > 0)
                s += sep;
            if (list[i] != null)
                s += list[i];
        }
        return s;
    },

    isDictEmpty: function (obj) {
        if (obj == null)
            return true;
        for (var k in obj)
            return false;
        return true;
    },

    getDictValues: function (dict, list) {
        if (dict == null)
            return null;

        if (list == null)
            list = [];
        else if (list == true)
            list = [""];

        for (var k in dict)
            list.push(dict[k]);
        return list;
    },

    getDictKeys: function (dict, list) {
        if (dict == null)
            return null;

        if (list == null)
            list = [];
        else if (list == true)
            list = [""];

        for (var k in dict)
            list.push(k);
        return list;
    },

    getDictKeyByValue: function (dict, v) {
        if (dict == null)
            return null;
        for (var k in dict) {
            if (dict[k] == v)
                return k;
        }
        return null;
    },

    setEnv: function (env) {
        if (env == null || env == "")
            return;
        document.body.style.backgroundImage = scil.Utils.imgSrc("img/" + env + ".gif", true);
        document.body.style.backgroundRepeat = "no-repeat";
    },

    sound: function (wav) {
        if (this.isIE && this.isIE < 9)
            return;

        if (this.__sound == null)
            this.__sound = this.createElement(document.body, "audio", null, { display: "none" });
        if (this.__sound.src != wav)
            this.__sound.src = wav;
        this.__sound.play();
    },

    escapeHtml: function (s) {
        if (s == null)
            return "";

        return s.replace(/>/g, "&gt;").replace(/</g, "&lt;");
    },

    textWidth: function (s) {
        if (s == null || s.length == null)
            return 0;

        var sum = 0;
        for (var i = 0; i < s.length; ++i) {
            if (s.charCodeAt(i) > 255)
                sum += 2;
            else
                ++sum;
        }
        return sum;
    },

    areListEq: function (x, y) {
        if (x == y)
            return true;
        if (x == null && y != null || x != null && y == null || x.length != y.length)
            return false;
        for (var i = 0; i < x.length; ++i) {
            if (x[i] != y[i])
                return false;
        }
        return true;
    },

    areDictEq: function (main, to) {
        if (main == to)
            return true;
        if (main == null || to == null)
            return false;
        for (var k in main) {
            var x = main[k];
            var y = to[k];
            if (!(x == y || x == null && y == "" || x == "" && y == null))
                return false;
        }
        return true;
    },

    splitStr: function (s, separator) {
        if (s == null)
            return null;

        var ret = [];
        var ss = s.split(separator);
        for (var i = 0; i < ss.length; ++i)
            ret.push(this.trim(ss[i]));
        return ret;
    },

    isEmptyStr: function (s) {
        return this.isNullOrEmpty(s);
    },

    regFindAllMatches: function (s, pattern, start) {
        var ret = [];
        if (s == null)
            return ret;

        if (start > 0)
            s = s.substr(start);
        else
            start = 0;

        var m;
        var st = 0;
        while ((m = pattern.exec(s)) != null) {
            var p = m.index;
            var w = m + "";
            ret.push({ start: st + p + start, str: w });

            st += p + w.length;
            s = s.substr(p + w.length);
        }

        return ret;
    },

    isNumber: function (s, allowoperator) {
        if (typeof (s) == "number")
            return true;
        if (scil.Utils.isNullOrEmpty(s))
            return false;

        var p = s.indexOf('.');
        if (p > 0) {
            var i = s.indexOf(',');
            if (i > 0 && i < p)
                s = s.replace(/[,]/g, '');
        }

        // I#11086
        if (allowoperator)
            return new RegExp("^[>|<|≥|≤]?[ ]{0,50}[-]?[0-9]+([\.][0-9]{0,50})?([e|E][-|+][0-9]+)?([ ]{0,50}[±][0-9]{0,50}([\.][0-9]{0,50})?)?$").test(s + "");
        else
            return !isNaN(s);
    },

    htmlDecode: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return s;
        var e = document.createElement('div');
        e.innerHTML = s;
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    },

    html2Text: function (html) {
        if (this.isNullOrEmpty(html))
            return html;
        var e = document.createElement('div');
        e.innerHTML = html;
        return e.childNodes.length === 0 ? "" : this.getInnerText(e);
    },

    parseNumber: function (s) {
        var n = s == null ? NaN : parseFloat(s);
        return isNaN(n) ? null : n;
    },

    /**
    * Test if it is null or empty string
    * @function {static} isNullOrEmpty
    * @param {var} s - var to be tested
    * @returns bool
    */
    isNullOrEmpty: function (s) {
        return s == null || typeof (s) == "string" && s == "";
    },

    /**
    * Test if it is not a number
    * @function {static} isNaN
    * @param {var} n - var to be tested
    * @returns bool
    */
    isNaN: function (n) {
        return n == null || isNaN(n);
    },

    /**
    * Get outer xml of an XML element
    * @function {static} getOuterXml
    * @param {XMLElement} e
    * @returns a string
    */
    getOuterXml: function (e) {
        if (e == null)
            return null;
        return e.xml != null ? e.xml : (new XMLSerializer()).serializeToString(e);
    },

    /**
    * Add css script in a page
    * @function {static} addCss
    * @param {string} code - css script
    */
    addCss: function (code) {
        var style = document.createElement('style');
        style.type = 'text/css';

        if (style.styleSheet) {
            // IE
            style.styleSheet.cssText = code;
        } else {
            // Other browsers
            style.innerHTML = code;
        }

        document.getElementsByTagName("head")[0].appendChild(style);
    },

    /**
    * Insert all items of a dirctionary in another dictionary
    * @function {static} insertAfterDict
    * @param {dict} dict - destination
    * @param {dict} items - items to be inserted
    * @param {string} key - reference item
    */
    insertAfterDict: function (dict, items, key) {
        var found = false;

        var temp = {};
        for (var k in dict) {
            if (k == key) {
                found = true;
            }
            else if (found) {
                temp[k] = dict[k];
                delete dict[k];
            }
        }

        for (var k in items)
            dict[k] = items[k];

        for (var k in temp)
            dict[k] = temp[k];
    },

    /**
    * Insert all items of a dirctionary in another dictionary
    * @function {static} insertBeforeDict
    * @param {dict} dict - destination
    * @param {dict} items - items to be inserted
    * @param {string} key - reference item
    */
    insertBeforeDict: function (dict, items, key) {
        var found = false;

        var temp = {};
        for (var k in dict) {
            if (k == key || found) {
                found = true;
                temp[k] = dict[k];
                delete dict[k];
            }
        }

        for (var k in items)
            dict[k] = items[k];

        for (var k in temp)
            dict[k] = temp[k];
    },

    disableSelection: function (d) {
        if (d == null)
            return;

        scil.apply(d.style, {
            webkitTouchCallout: "none", /* iOS Safari */
            webkitUserSelect: "none", /* Chrome */
            mozUserSelect: "none", /* Firefox */
            msUserSelect: "none", /* IE/Edge */
            userSelect: "none"
        });
    },

    getLastBarcode: function (callback, category, email, url) {
        scil.Utils.jsonp(url != null ? url : "JSDraw/Service.aspx?cmd=mobile.getlast", function (ret) {
            callback(ret);
        }, { category: category, useremail: email });
    },

    beep: function (doublebeep) {
        if (typeof (Audio) == "undefined")
            return;

        if (this._beepobj == null)
        //this._beepobj = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
            this._beepobj = new Audio("data:audio/wav;base64,UklGRtoEAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YbUEAAB9dXFpa3F4fYSLkZiUjoeCe3RuaWtze36GjJOZkYyGgHpybGhvc3uBiI2UmZCKhX93cWxob3Z9g4mQlZaPioN8dm9qanF4f4OLkZeUjoiBe3RvaWxzeICGi5OYlIuFgXlybWltdHuBiI6Ul5CLhn14cmlqcHV8g4mOl5ePiYR8dnBoa3F3foWKkZaVjoiBenVwZ2xyeoCFjZKXlIyGgHpza2lvdHmCh4+Tl5KKhX54cWtpb3Z9gYmPlpePiYN9dnBoa3F4foOLkZeWjYmAfHRvZ25yeX+FjZKXlIyFgXlza2lvc3uAh46Vl5CLhX93cWtqb3V9g4iQlZePioJ9dnFoa3F4foSKkZaUj4eBfHVuaWtzeX+GjJKYk4yGgHl0bWdudXt/iI2VmJCMhX53cWtqb3Z8g4iQlZaPioN8dnFoa3B4foSKkZeVjoiCe3RuaWxzeX+Gi5OXk42Gf3tzbGhtdXuBh4yVl5GMhH54cmtpcHV8g4mOlpaRiYN9dm9raXF4fYSLkJaWjoeCenZuaGxzeICFjJOXk4yHf3pzbWltdHqBiI2Ul5GNhH54cmtpbnd7gomQlZePi4J9dnBqanF3fYOLkJiUj4eBfHVuaWtzeX+FjJKYk4yHgHpzbGltc3uBh42Vl5GLhX92c2ppcXV8gomPlZiOioJ+dnFpaXF5fYOKkZeWjYiDenVuaWtzeIGFjJKXk42GgHl1bWhtdHt/h42Vl5KLhH93c2tob3V9g4iPlZePi4N8d3Bpa3F3foSJkZaWj4eCfHNvaGtyen+FjJGYlIuIgHl0bGhuc3uBh42Ul5KMg4B4cmtocXR8g4mPlZWRioJ9d29ram93foSJkZeUjomCe3VvaG1yd3+Hi5KYlI2GgHpzbmdtdHqBiIyVlpKLhH95cmppb3V8g4iOlpeQiYN+dnFqaXJ2fYSLj5iUj4iCfHRuaWxzeH+FjJGYk42Hf3tzbWhudHqAho6TmZGLhX94c2ppbnZ8gomOlpePi4J+dnBqanB3foOKkJeWjoiBfHRwaGxyeH+Gi5KYk46GgXpzbWdudHqAh46TmJGMhX54cmtpb3V8g4ePlZiPioR9dnFpa3B2foOKkZaVj4iBfHZuaWxyeX6EjZGYlI2GgXlzbmhuc3qBho2Ul5KLhX95cWtpcHV8gYiPlZePi4R8d3FpanB3foOKkJiVjomBe3ZuamtyeICFipOWlI6FgXp1a2psc3uAh46SmJKLhX94c2tocHR9goiOlZeRioN9d3BqaXF3foKLkJWVj4mBfHVvaWtyeH+Gi5KXloyHgHl0bmhuc3qAh42Tl5KMhX55cmtocHZ7goiOlZePioR8eHBqanF2fYSJkJiVj4iCfHZuaGxzeH2Hi5KXlY2FgHtzbWltc3qAh42UlpKMhX94c2tqbnZ6gomOlpaRi4N9d3FpanF2fYSKkJWWjomCe3ZvaWtxeX6Fi5KYk42HgXp0bmhtc3uAhoyUmJKLhYB4c2tocHR9gYiOlpeQioN9d3JqanB3fISJkJeVj4iBfnRwaWpyeX6FjJGXlI6GgHp1bGlucnqBhoyUmJKMhH94c21nb3V8gYmOlZeQi4N+d3FqaXB3fQA=");
        this._beepobj.play();

        if (doublebeep) {
            var me = this;
            setTimeout(function () { me._beepobj.play(); }, 300);
        }
    },

    textareaSelect: function (ta, startPos, endPos) {
        // do selection
        // Chrome / Firefox
        if (typeof (ta.selectionStart) != "undefined") {
            ta.focus();
            ta.selectionStart = startPos;
            ta.selectionEnd = endPos;
        }

        // IE
        if (document.selection && document.selection.createRange) {
            ta.focus();
            ta.select();
            var range = document.selection.createRange();
            range.collapse(true);
            range.moveEnd("character", endPos);
            range.moveStart("character", startPos);
            range.select();
        }
    },

    /**
    * Fire an event
    * @function {static} fireEvent
    * @param {DOM} element
    * @param {string} eventname
    */
    fireEvent: function (element, eventname, bubbles, cancelable, args) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventname, bubbles == null ? true : bubbles, cancelable == null ? true : cancelable);
        } else {
            event = document.createEventObject();
            event.eventType = eventname;
        }

        if (args != null)
            scil.apply(event, args);

        event.eventName = eventname;

        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + event.eventType, event);
        }
    },

    sum: function (list) {
        return scil.Math.sum(list);
    },

    avg: function (list) {
        return scil.Math.avg(list);
    },

    stdev: function (list) {
        return scil.Math.stdev(list);
    }
};

scil.form = {};
JsUtils = scil.Utils;
scil.Utils.padleft = scil.Utils.padLeft;
scil.Utils.padright = scil.Utils.padRight;


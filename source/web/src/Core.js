//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

DEBUG = {
    enable: false,
    clear: function () {
        if (DEBUG.enable)
            document.getElementById("DEBUG").value = '';
    },
    print: function (s) {
        if (DEBUG.enable) {
            var console = document.getElementById("DEBUG");
            console.value += s + "\n";
        }
    }
};


/**
* scilligence namespace (scil is an alias name)
* @namespace scilligence
*/
scilligence = { _base: function () { } };
oln = scilligence;
scil = scilligence;

/**
* scilligence.apply is a tool function to append new properties to a dictionary object
* <pre>
* <b>Example:</b>
*    var person = { firstname: "Tony", lastname: "Yuan" };
*    scilligence.apply(person, { company: "Scilligence" });
* </pre>
* @function {function} scilligence.apply
*/
scilligence.overwrite = scilligence.apply = function (dest, atts, defaults) {
    if (defaults)
        scilligence.apply(dest, defaults);

    if (dest && atts && typeof atts == 'object') {
        for (var k in atts)
            dest[k] = atts[k];
    }
    return dest;
};

scilligence.apply(scilligence, {
    /**
    * scilligence.extend is a tool function to do OO programming in Javascript
    * <pre>
    * <b>Example:</b>
    *    // parent class, here scilligence._base is empty class
    *    Person = scilligence.extend(scilligence._base, {
    *        constructor: function(firstname, lastname) {
    *            this.firstname = firstname;
    *            this.lastname = lastname;
    *        },
    *
    *        getFullname: function() {
    *            return this.lastname + ", " + this.firstname;
    *        }
    *    });
    *
    *    // sub class
    *    Employee = scilligence.extend(Person, {
    *        constructor: function (firstname, lastname, employeeid) {
    *            this.superclass().constructor(firstname, lastname);
    *            this.employeeid = employeeid;
    *        },
    *
    *        getEmployeeID: function () {
    *            return this.employeeid;
    *        }
    *    });
    *    
    *    // define static method
    *    scilligence.apply(Employee, {
    *        kCompany: "Scilligence", // static property
    *
    *        getEmployNo: function (id) { // static method
    *            return "SCI-" + id;
    *        }
    *    }
    *
    *    // create an Employee object
    *    var e = new Employee("Tony", "Yuan", 192);
    *    var s = e.getFullname();
    * </pre>
    * @function {function} scilligence.extend
    */
    extend: function () {
        var io = function (atts) { for (var k in atts) this[k] = atts[k]; };
        var oc = Object.prototype.constructor;
        return function (sb, sp, overrides) {
            if (typeof sp == 'object') {
                overrides = sp;
                sp = sb;
                sb = overrides.constructor != oc ? overrides.constructor : function () { sp.apply(this, arguments); };
            }
            var F = function () { };
            var spp = sp.prototype;
            F.prototype = spp;
            var sbp = sb.prototype = new F();
            sbp.constructor = sb;
            sb.superclass = spp;
            if (spp.constructor == oc)
                spp.constructor = sp;
            sb.override = function (atts) { scilligence.override(sb, atts); };
            sbp.superclass = sbp.supr = (function () { return spp; });
            sbp.override = io;
            scilligence.override(sb, overrides);
            sb.extend = function (atts) { return scilligence.extend(sb, atts); };
            return sb;
        };
    } (),

    override: function (origclass, overrides) {
        if (overrides) {
            var p = origclass.prototype;
            scilligence.apply(p, overrides);
            if (document.all != null && overrides.hasOwnProperty('toString'))
                p.toString = overrides.toString;
        }
    },

    clone: function (src) {
        if (src == null)
            return null;

        if (src.length != null)
            return src.concat([]);

        var dest = {};
        scil.apply(dest, src);
        return dest;
    },

    cloneArray: function (src) {
        if (src == null)
            return null;

        if (src.length != null) {
            var ret = [];
            for (var i = 0; i < src.length; ++i) {
                if (typeof src[i] == "object")
                    ret[i] = scil.clone(src[i]);
                else
                    ret[i] = src[i];
            }
            return ret;
        }

        var dest = {};
        scil.apply(dest, src);
        return dest;
    },

    byId: function (id) {
        return document.getElementById(id);
    },

    connect: function (element, event, callback) {
        if (element == null || event == null || event == "" || callback == null)
            return;

        if (element.addEventListener != null)
            element.addEventListener(event.substr(2), function (e) { callback(e, element); });
        else if (element.attachEvent != null)
            element.attachEvent(event, function (e) { callback(e, element); });
        else
            dojo.connect(element, event, function (e) { callback(e, element); });
    }
});

scilligence.ready = dojo.ready;
scilligence.onload = dojo.addOnLoad;

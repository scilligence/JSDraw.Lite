//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.Table = {
    splitUnit: function (s) {
        if (s == null || s == "&nbsp;")
            return null;
        s = scil.Utils.trim(s);
        if (s.length == 0)
            return null;

        var unit2 = null;
        var unit = null;
        var num = s.replace(/[a-z|\/|%|°]+$/i, "");
        if (num != s) {
            unit2 = s.substr(num.length);
            unit = unit2.toLowerCase();
            num = scil.Utils.trim(num);
        }

        if ((unit == "w/w" || unit == "w/v") && scil.Utils.endswith(num, "%")) {
            num = num.substr(0, num.length - 1);
            unit2 = unit = "% " + unit;
        }

        if (unit == "%w/w")
            unit2 = unit = "% w/w";
        else if (unit == "%w/v")
            unit2 = unit = "% w/v";

        return { value: scil.Utils.trim(num), unit: unit, unit2: unit2 };
    },

    readSdfRecord: function (sdfmol, readattributes) {
        if (sdfmol.substr(0, 1) == "\n")
            sdfmol = sdfmol.substr(1);
        else if (sdfmol.substr(0, 2) == "\r\n")
            sdfmol = sdfmol.substr(2);

        var p = sdfmol.indexOf("\nM  END");
        if (p < 0)
            p = sdfmol.indexOf("\nM END");
        if (p < 0)
            return null;

        var p1 = sdfmol.indexOf("\n", p + 1);
        var molfile = p1 < 0 ? sdfmol : sdfmol.substr(0, p1);
        var s = p1 < 0 ? null : sdfmol.substr(p1 + 1);
        var props = readattributes ? JSDraw2.Table.readProps(s) : null;

        return { molfile: molfile, props: props };
    },

    readProps: function (s) {
        var ret = {};
        if (s == null)
            return ret;

        var ss = s.split('\n');
        for (var i = 0; i < ss.length; ++i) {
            s = ss[i];
            var n = null;
            var v = null;

            if (s.substr(0, 1) == ">") {
                var p = s.indexOf('<', 1);
                if (p > 0) {
                    ++p;
                    var p1 = s.indexOf('>', p);
                    if (p1 > 0)
                        n = s.substr(p, p1 - p);
                }

                for (++i; i < ss.length; ++i) {
                    s = ss[i];
                    if (scil.Utils.trim(s).length == 0)
                        break;
                    if (v == null)
                        v = s;
                    else
                        v += s;
                }
            }

            if (n != null)
                ret[scil.Utils.trim(n)] = scil.Utils.trim(v);
        }

        return ret;
    }
};
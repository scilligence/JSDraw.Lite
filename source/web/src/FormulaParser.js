//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.FormulaParser = {
    parse: function (s, orphan, bonds) {
        if (scil.Utils.isNullOrEmpty(s))
            return null;

        var salt = null;
        var p = s.indexOf('.');
        if (p > 0) {
            // e.g. --COOH.2HCl
            salt = s.substr(p + 1);
            s = s.substr(0, p);
        }

        var m = this._parse(s, orphan, bonds);
        if (m == null && orphan)
            m = this.pareFormulaAsSalt(s);

        if (m == null || m.atoms.length == 0)
            return null;

        if (!scil.Utils.isNullOrEmpty(salt)) {
            var m2 = this.pareFormulaAsSalt(salt);
            if (m2 == null || m2.atoms.length == 0)
                return null;

            var a1 = m.atoms[m.atoms.length - 1];
            var a2 = m2.atoms[0];
            m.mergeMol(m2);
            var b = new JSDraw2.Bond(a1, a2);
            b.type = JSDraw2.BONDTYPES.DUMMY;
            m.addBond(b);
        }

        JSDraw2.SuperAtoms.normalize(m);
        return m;
    },

    pareFormulaAsSalt: function (salt) {
        if (scil.Utils.isNullOrEmpty(salt))
            return null;

        var coef = 1;
        var s2 = salt.replace(/^[0-9]+/, "");
        if (s2.length < salt.length) {
            coef = parseInt(salt.substr(0, salt.length - s2.length));
            salt = s2;
        }
        if (coef < 1)
            return null;

        // --COOH.NH4+
        var m = null;
        var salt2 = salt.replace(/[+|-][1-9]?$/, "");
        var charge = this.parseCharge(salt.substr(salt2.length));
        salt = salt2;

        // strip H's
        var elem = salt.replace(/[H][0-9]{0,10}/g, "");
        m = this.molFromAtom(elem, false, charge);
        if (m == null) {
            var s2 = salt.replace(/^[A-Z][a-z]?/, "");
            if (s2.length < salt.length) {
                elem = salt.substr(0, salt.length - s2.length);
                m = this._parse(s2);
                if (m == null)
                    return null;
                var atts = JSDraw2.SuperAtoms._getAttachAtoms(m);
                if (atts == null || atts.length != 1)
                    return null;
                var a1 = atts[0].a;
                a1.attachpoints = [];
                if (elem != "H") {
                    var a2 = new JSDraw2.Atom(atts[0].a.p.clone(), elem);
                    var b = new JSDraw2.Bond(a1, a2);
                    m.addAtom(a2);
                    m.addBond(b);
                }
            }
        }

        if (m == null || m.atoms.length == 0)
            return null;

        var m0 = m.clone();
        for (var i = 1; i < coef; ++i) {
            var a1 = m.atoms[m.atoms.length - 1];
            var m3 = m0.clone();
            var a2 = m3.atoms[0];
            m.mergeMol(m3);
            var b = new JSDraw2.Bond(a1, a2);
            b.type = JSDraw2.BONDTYPES.DUMMY;
            m.addBond(b);
        }

        return m;
    },

    parseSalt: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return null;

        var caps = s; // s.toUpperCase();
        var salts = JSDraw2.defaultoptions.salts || JSDraw2.salts;
        if (salts != null && salts[caps] != null) {
            if (salts[caps] == "")
                return { coef: 1, mf: null, mw: 0, s: s };
        }

        var s2 = "";
        if (!JSDraw2.FormulaParser.ignoresaltcoef) {
            var patt = /^[0-9]{0,10}[\.]?[0-9]{0,9}[ ]?/;
            var s2 = patt.exec(s) + "";
            if (s2.length == s.length)
                return null;
        }

        var coef = 1.0;
        if (s2 != "") {
            coef = parseFloat(s2);
            if (isNaN(coef))
                coef = 1.0;
        }
        s = s.substr(s2.length);
        caps = s; // s.toUpperCase();

        var mf = null;
        var mw = null;
        var salts = JSDraw2.defaultoptions.salts || JSDraw2.salts;
        if (salts != null && salts[caps] != null) {
            mf = salts[caps];
            mw = this.mf2mw(mf, true);
        }
        else {
            mf = s;
            mw = this.mf2mw(mf, true);
        }
        if (mw == null || mw == 0)
            return null;

        return { coef: coef, mf: coef == 1 ? mf : coef + "(" + mf + ")", mw: Math.round(mw * (coef > 0 ? coef : 1) * 1000) / 1000, s: coef == 1 ? s : coef + s, stats: this.mf2Stats(mf, true) };
    },

    parseCharge: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return 0;
        if (s == "+" || s == "++" || s == "+++")
            return s.length;
        else if (s == "-" || s == "--" || s == "---")
            return -s.length;

        if (s.length > 1 && (s.substr(s.length - 1) == '+' || s.substr(s.length - 1) == '-'))
            s = s.substr(s.length - 1) + s.substr(0, s.length - 1);
        return parseInt(s);
    },

    stripHs: function (s) {
        if (s == null || s.length <= 1)
            return s;
        var s2 = s.replace(/[+|-][1-9]?$/, "");
        var charge = s.substr(s2.length);
        if (/^[A-Z][a-z]?[H][0-9]{0,2}$/.test(s2)) {
            var elem = /^[A-z][a-z]?/.exec(s);
            var e = JSDraw2.PT[elem];
            if (e != null && e.m != null)
                return elem + charge;
        }
        else if (/^[H][0-9]{0,2}[A-Z][a-z]?$/.test(s2)) {
            var elem = /[A-z][a-z]?$/.exec(s);
            var e = JSDraw2.PT[elem];
            if (e != null && e.m != null)
                return elem + charge;
        }
        return s;
    },

    mergeStats: function (dest, from, coef) {
        if (dest == null)
            dest = { elements: {}, charges: 0, isotopes: {} };

        if (from != null) {
            if (coef == null)
                coef = 1;
            for (var e in from.elements) {
                if (dest.elements[e] == null)
                    dest.elements[e] = from.elements[e] * coef;
                else
                    dest.elements[e] += from.elements[e] * coef;
            }
            for (var e in from.isotopes) {
                if (dest.isotopes[e] == null)
                    dest.isotopes[e] = {};
                var iso = dest.isotopes[e];
                var iso2 = from.isotopes[e];
                for (var i in iso2) {
                    if (iso[i] == null)
                        iso[i] = iso2[i] * coef;
                    else
                        iso[i] += iso2[i] * coef;
                }
            }

            if (from.charges != null)
                dest.charges += from.charges * coef;
        }

        return dest;
    },

    getAtomStats: function (mol) {
        if (mol == null)
            return null;

        var ret = { elements: {}, charges: 0, isotopes: {}, bios: [] };

        var hs = 0;
        var multicenterHs = 0;
        for (var i = 0; i < mol.atoms.length; ++i) {
            var a = mol.atoms[i];
            if (a.elem == "5'") {
                if (ret.elements["H"] == null)
                    ret.elements["H"] = 1;
                else
                    ++ret.elements["H"];
            }
            else if (a.elem == "3'") {
                if (ret.elements["H"] == null)
                    ret.elements["H"] = 1;
                else
                    ++ret.elements["H"];
                if (ret.elements["O"] == null)
                    ret.elements["O"] = 1;
                else
                    ++ret.elements["O"];
            }
            else if (a.bio != null) {
                switch (a.bio.type) {
                    case JSDraw2.BIO.ANTIBODY:
                    case JSDraw2.BIO.PROTEIN:
                    case JSDraw2.BIO.GENE:
                    case JSDraw2.BIO.DNA:
                    case JSDraw2.BIO.RNA:
                        var se = new JSDraw2.SequenceEditor();
                        se.setXml(a.bio.sequences);
                        ret.bios.push({ mw: se.getMolWeight() });
                        break;
                }
            }
            else if (a.elem == "@") {
                var list = mol.getAllBonds(a);
                var dummy = 0;
                var sum = 0;
                for (var k = 0; k < list.length; ++k) {
                    if (list[k].type == JSDraw2.BONDTYPES.DUMMY) {
                        ++dummy;
                    }
                    else {
                        var val = list[k].valence();
                        if (val > 0)
                            sum += Math.floor(val);
                    }
                }
                if (dummy > 0)
                    multicenterHs += sum;
            }
            else if (a.elem == "#") {
                var salt = this.parseSalt(a.alias);
                if (salt != null)
                    this.mergeStats(ret, salt.stats, salt.coef);
            }
            else {
                var e = a.elem;
                if (a.isotope > 0) {
                    var n = ret.isotopes[e];
                    if (n == null)
                        ret.isotopes[e] = {};
                    var iso = ret.isotopes[e];
                    if (iso[a.isotope] == null)
                        iso[a.isotope] = 1;
                    else
                        iso[a.isotope] = iso[a.isotope] + 1;
                }
                else {
                    var n = ret.elements[e];
                    if (n == null)
                        ret.elements[e] = 1;
                    else
                        ret.elements[e] = n + 1;
                }
                hs += a.hcount;
            }
            ret.charges += a.charge;
        }

        hs -= multicenterHs;
        if (hs > 0) {
            if (ret.elements["H"] != null)
                ret.elements["H"] = hs + ret.elements["H"];
            else
                ret.elements["H"] = hs;
        }

        return ret;
    },

    stats2mw: function (stats) {
        if (stats == null)
            return null;

        var sum = 0;
        for (var k in stats.elements) {
            if (k == "D")
                sum += JSDraw2.PT["H"].iso[2] * stats.elements[k];
            else if (k == "T")
                sum += JSDraw2.PT["H"].iso[3] * stats.elements[k];
            else {
                var e = JSDraw2.PT[k];
                if (e == null || e.m == null)
                //continue;
                    return null;
                sum += e.m * stats.elements[k];
            }
        }

        if (stats.bios != null) {
            for (var i = 0; i < stats.bios.length; ++i)
                sum += stats.bios[i].mw;
        }

        sum += this._isotopemass(stats.isotopes);
        if (sum > 0)
            sum = scil.Utils.round(sum, 4);
        return sum;
    },

    stats2em: function (stats) {
        if (stats == null)
            return null;

        var sum = 0;
        for (var k in stats.elements) {
            var e = JSDraw2.PT[k];
            if (e == null || e.em == null)
            //continue;
                return null;
            sum += e.em * stats.elements[k];
        }

        sum += this._isotopemass(stats.isotopes);
        return sum;
    },

    _isotopemass: function (isotopes2) {
        if (isotopes2 == null)
            return 0;

        var sum = 0;
        for (var k in isotopes2) {
            var e = JSDraw2.PT[k];
            if (e == null || e.m == null)
                continue;

            var isotopes = isotopes2[k];
            for (var i in isotopes) {
                var m = e.iso[i];
                sum += (m == null ? e.m : m) * isotopes[i];
            }
        }
        return sum;
    },

    stats2mf: function (stats, html) {
        if (stats == null)
            return;

        var s = "";
        if (stats.elements["C"] != null) {
            s += "C";
            if (stats.elements["C"] > 1)
                s += (html ? "<sub>" + stats.elements["C"] + "</sub>" : stats.elements["C"]);
        }
        if (stats.elements["H"] != null) {
            s += "H";
            if (stats.elements["H"] > 1)
                s += (html ? "<sub>" + stats.elements["H"] + "</sub>" : stats.elements["H"]);
        }

        for (var e in stats.elements) {
            if (e != "C" && e != 'H' && e != 'R') {
                s += e;
                if (stats.elements[e] > 1)
                    s += (html ? "<sub>" + stats.elements[e] + "</sub>" : stats.elements[e]);
            }
        }

        for (var e in stats.isotopes) {
            var isotopes = stats.isotopes[e];
            for (var iso in isotopes) {
                if (html)
                    s += "<sup>" + iso + "</sup>" + e;
                else
                    s += "{" + iso + "}" + e;
                if (isotopes[iso] > 1)
                    s += (html ? "<sub>" + isotopes[iso] + "</sub>" : isotopes[iso]);
            }
        }

        var r = stats.elements['R'];
        if (r > 0) {
            s += 'R';
            if (r > 1)
                s += (html ? "<sub>" + r + "</sub>" : r);
        }

        if (stats.charges != 0) {
            var c = Math.abs(stats.charges);
            var t = (stats.charges > 0 ? "+" : "-") + (c > 1 ? c : '');
            if (html)
                s += "<sup>" + t + "</sup>";
            else
                s += t;
        }
        return s;
    },

    mf2mw: function (mf, issalt) {
        var stats = this.mf2Stats(mf, issalt);
        return this.stats2mw(stats);
    },

    normMF: function (mf) {
        var stats = this.mf2Stats(mf);
        return this.stats2mf(stats);
    },

    mf2Stats: function (mf, issalt) {
        if (mf == null || mf == "")
            return null;

        var charges = 0;
        var mf2 = mf.replace(/(([+|-][0-9]{0,2})|([ ][0-9]{0,2}[+|-]))$/, "");
        if (mf2.length < mf.length) {
            charges = this.parseCharge(mf.substr(mf2.length));
        }

        var ret = this.mf2Stats2(mf2);
        if (ret != null && charges != 0) {
            // I#10049
            if (issalt)
                charges = this.calcSaltCharges(ret, charges);

            ret.charges += charges;
        }

        return ret;
    },

    calcSaltCharges: function (ret, charges) {
        if (JSDraw2.defaultoptions.calcsaltcharges != true)
            return charges;

        if (charges >= 1) {
            if (charges > 1) {
                for (var k in ret.elements)
                    ret.elements[k] /= charges * 1.0;
            }

            if (ret.elements["H"] == null)
                ret.elements["H"] = 0;
            --ret.elements["H"];
            charges = 0;
        }

        return charges;
    },

    mf2Stats2: function (s) {
        var m = JSDraw2.SuperAtoms.get(s);
        if (m != null)
            return this.getAtomStats(m);

        var ret = { elements: {}, charges: 0 };

        var numpat = /^[0-9]+/;
        var sum = 0;
        var p;
        while ((p = s.indexOf('(')) >= 0) {
            if (p > 0) {
                var stats = this._mf2Stats(s.substr(0, p));
                if (stats == null)
                    return null;
                ret = this.mergeStats(ret, stats);
            }

            s = s.substr(p);

            var f = false;
            var n = 0;
            for (var i = 1; i < s.length; ++i) {
                var c = s.charCodeAt(i);
                if (c == 40) { // (
                    ++n;
                }
                else if (c == 41) { // )
                    if (n == 0) {
                        var bracket = s.substr(1, i - 1);
                        s = s.substr(i + 1);
                        var sub = s.match(numpat);
                        var k = 1;
                        if (sub != null && sub.length == 1) {
                            s = s.substr(sub[0].length);
                            k = parseInt(sub[0]);
                        }

                        var stats = this.mf2Stats2(bracket);
                        if (stats == null)
                            return null;
                        ret = this.mergeStats(ret, stats, k);

                        f = true;
                        break;
                    }
                    else {
                        --n;
                    }
                }
            }

            if (!f)
                return null;
        }

        var stats = this._mf2Stats(s);
        if (stats == null)
            return null;
        ret = this.mergeStats(ret, stats);
        return ret;
    },

    _mf2Stats: function (s) {
        var patt = /^[A-Z][a-z]?[0-9]{0,9}/;
        var patt2 = /^[A-Z][a-z]?/;

        var ret = { elements: {}, charges: 0 };
        while (s != "") {
            var c = patt.exec(s);
            if (c == null)
                return null;

            var s2 = c[0];
            if (s2 == "")
                return null;

            var symb = patt2.exec(s2)[0];
            var e = JSDraw2.PT[symb == "D" || symb == "T" ? "H" : symb];
            var n = symb.length == s2.length ? 1 : parseInt(s2.substr(symb.length));

            var stats = { elements: {}, charges: 0 };
            if (e == null) {
                var m = JSDraw2.SuperAtoms.get(symb);
                if (m == null || !(m.mw > 0))
                    return null;
                stats = this.getAtomStats(m);
            }
            else {
                if (!(e.m > null))
                    return null;
                else
                    stats.elements[symb] = 1;
            }
            ret = this.mergeStats(ret, stats, n);
            s = s.substr(s2.length);
        }
        return ret;
    },

    molFromAtom: function (elem, addAttachPoint, charge) {
        var s2 = elem.replace(/[+|-][1-9]?$/, "");
        if (s2.length < elem.length) {
            charge = this.parseCharge(elem.substr(s2.length));
            elem = s2;
        }

        var e = JSDraw2.PT[elem];
        if (e != null && e.a > 0) {
            m = new JSDraw2.Mol();
            var a = new JSDraw2.Atom(new JSDraw2.Point(0, 0), elem);
            if (charge != null)
                a.charge = charge;
            m.addAtom(a);
            if (addAttachPoint)
                a.attachpoints = [1];
            return m;
        }

        return null;
    },

    _parse: function (s, orphan, bonds) {
        if (scil.Utils.isNullOrEmpty(s))
            return null;

        if (new RegExp("^[\(][^\(\)]+[\)]$").test(s))
            s = s.substr(1, s.length - 2);

        var s2 = this.stripHs(s);
        var m = this.molFromAtom(s2, true);
        if (m != null)
            return m;

        var tokens = { O: ["O"], S: ["S"], Se: ["Se"], Te: ["Te"], Y: ["Y"], NH: ["N"], PH: ["P"], CO: ["C", "^=O"], CO2: ["C", "^=O", "O"], CH2: ["C"], C2H4: ["C", "C"], C3H6: ["C", "C", "C"], C4H8: ["C", "C", "C", "C"], C5H10: ["C", "C", "C", "C", "C"] };
        if (orphan)
            tokens.H = [];

        if (scil.Utils.startswith(s, '(')) {
            var p = s.indexOf(')');
            if (p > 0) {
                var s1 = s.substr(1, p - 1);
                var t = s.substr(p + 1);
                var s2 = t.replace(/^[0-9]+/, "");
                var repeat = 1;
                if (s2.length < t.length)
                    repeat = parseInt(t.substr(0, t.length - s2.length));
                var ret = this._parseConnectors(s1, orphan);
                if (ret != null && ret.remained == "") {
                    var atoms = [];
                    for (var i = 0; i < repeat; ++i)
                        atoms = atoms.concat(ret.atoms);
                    m = this._connect(atoms, s2);
                    if (m != null)
                        return m;
                }
            }
        }

        m = JSDraw2.SuperAtoms.get(s);
        if (m != null)
            return m;

        m = this.molFromAtom(s, true);
        if (m != null)
            return m;

        for (var k in tokens) {
            var m = this._tryFormula(k, tokens[k], s);
            if (m != null)
                return m;
        }

        if (s.length >= 3) {
            var elem = s.substr(0, 2);
            var e = JSDraw2.PT[elem];
            if (e != null && JSDraw2.PT.isMetal(e.a) &&
                (e != JSDraw2.PT.K && e != JSDraw2.PT.Na && e != JSDraw2.PT.Rb && e != JSDraw2.PT.Cs &&
                    e != JSDraw2.PT.Fr && e != JSDraw2.PT.Sb))
                return this._tryFormula(elem, [elem], s);
        }

        // Common Formula: --CnH[n*2]--, --CnH[n*2+1], --CnH[n*2-1], and --CnH[n*2-3]
        if (bonds == 1 || bonds == 2) {
            var reg = /^C[0-9]+H[0-9]+$/;
            if (reg.test(s)) {
                var p = s.indexOf('H');
                var cs = parseInt(s.substr(1, p - 1));
                var hs = parseInt(s.substr(p + 1));
                if (cs > 0 && (bonds == 2 && cs * 2 == hs /* --CnH[n*2]-- */ || bonds == 1 && (cs * 2 + 1 == hs /* --CnH[n*2+1]-- */ || cs * 2 - 1 == hs /* --CnH[n*2-1]-- */ || cs * 2 - 3 == hs /* --CnH[n*2-3]-- */))) {
                    var m = new JSDraw2.Mol();
                    var a1 = new JSDraw2.Atom(new JSDraw2.Point(0, 0), 'C');
                    var a2 = null;
                    a1.attachpoints = [1];
                    m.addAtom(a1);
                    for (var i = 1; i < cs; ++i) {
                        var y = i % 2 == 1 ? 0.5 : 0;
                        a2 = new JSDraw2.Atom(new JSDraw2.Point(a1.p.x + 1, y), 'C');
                        m.addAtom(a2);

                        var b = new JSDraw2.Bond(a1, a2);
                        if (i == cs - 1) {
                            if (cs * 2 - 1 == hs) /* --CnH[n*2-1]-- */
                                b.type = JSDraw2.BONDTYPES.DOUBLE;
                            else if (cs * 2 - 3 == hs) /* --CnH[n*2-3]-- */
                                b.type = JSDraw2.BONDTYPES.TRIPLE;
                        }
                        m.addBond(b);

                        a1 = a2;
                    }

                    if (bonds == 2)
                        (a2 == null ? a1 : a2).attachpoints = [2];

                    return m;
                }
            }
        }

        return null;
    },

    _parseConnectors: function (s, orphan) {
        var tokens = { O: ["O"], S: ["S"], Se: ["Se"], Te: ["Te"], Y: ["Y"], NH: ["N"], PH: ["P"], CO: ["C", "=O"], CO2: ["C", "=O", "O"], CH2: ["C"], C2H4: ["C", "C"], C3H6: ["C", "C", "C"], C4H8: ["C", "C", "C", "C"], C5H10: ["C", "C", "C", "C", "C"] };
        if (orphan)
            tokens.H = [];

        var atoms = [];
        while (s.length > 0) {
            var findone = false;
            for (var k in tokens) {
                if (scil.Utils.startswith(s, k)) {
                    atoms = atoms.concat(tokens[k]);
                    s = s.substr(k.length);
                    findone = true;
                    break;
                }
            }

            if (!findone)
                break;
        }

        return atoms.length == 0 ? null : { atoms: atoms, remained: s };
    },

    _tryFormula: function (prefix, atoms, s) {
        if (!scil.Utils.startswith(s, prefix, true))
            return null;

        return this._connect(atoms, s.substr(prefix.length));
    },

    _connect: function (atoms, name) {
        var m = JSDraw2.SuperAtoms.get(name);
        if (m == null) {
            m = this._parse(name, null, 1);
            if (m == null)
                m = this.molFromAtom(name, false);
        }

        if (m == null)
            return;
        m = m.clone();

        var atts = JSDraw2.SuperAtoms._getAttachAtoms(m);
        if (atts == null || atts.length != 1)
            return null;

        var a1 = atts[0].a;
        var a2 = null;
        var branch = null;
        a1.attachpoints = [];
        for (var i = atoms.length - 1; i >= 0; --i) {
            var c = atoms[i];

            if (c.substr(0, 1) == "^") {
                branch = c.substr(1);
                continue;
            }

            // I#12074
            a1 = this._connectAtom(a1, c, m);
            if (branch != null) {
                this._connectAtom(a1, branch, m);
                branch = null;
            }
        }

        a1.attachpoints = [1];
        return m;
    },

    _connectAtom: function (a1, c, m) {
        var doublebond = false;
        if (c.substr(0, 1) == "=") {
            c = c.substr(1);
            doublebond = true;
        }

        var p = a1.p.clone();
        p.offset(1, 0);
        var a2 = new JSDraw2.Atom(p, c);
        var b = new JSDraw2.Bond(a1, a2);
        if (doublebond)
            b.type = JSDraw2.BONDTYPES.DOUBLE;
        m.addAtom(a2);
        m.addBond(b);
        return a2;
    }
};

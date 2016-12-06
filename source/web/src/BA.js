//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.BA = scilligence.extend(scilligence._base, {
    constructor: function (b, a, ri) {
        this.b = b;
        this.a = a;
        this.ringclosure = ri;
        this.next = [];
        this.f = null;
        this.parent = null;
        this.depth = null;
    },

    find: function (a) {
        var stack = new JSDraw2.Stack();
        stack.push(this);
        while (stack.length() > 0) {
            var ba = stack.pop();
            if (ba.a == a)
                return ba;

            for (var k = 0; k < ba.next.length; ++k)
                stack.push(ba.next[k]);
        }

        return null;
    },

    list: function (list, mode) {
        var stack = new JSDraw2.Stack();
        stack.push(this);
        var depthfirst = mode == "depthfirst";
        while (stack.length() > 0) {
            var ba = depthfirst ? stack.pop() : stack.popHead();
            list.push(ba);
            for (var k = 0; k < ba.next.length; ++k)
                stack.push(ba.next[k]);
        }
    },

    startAtom: function () {
        return this.b == null ? null : this.b.otherAtom(this.a);
    },

    addNext: function (ba) {
        this.next.push(ba);
        ba.parent = this;
        ba.depth = this.depth + 1;
    },

    stereo: function () {
        var bs = this.a.bonds;
        if (this.b == null || !this.a.isMarkedStereo())
            return null;


        // find out 2D layout
        var angles = [];
        var bonds = [];
        var a0 = this.a;
        var angle0 = this.b.otherAtom(a0).p.angleTo(a0.p);
        DEBUG.print(a0.elem);
        DEBUG.print(angle0);
        for (var i = 0; i < bs.length; ++i) {
            if (bs[i] == this.b)
                continue;

            var a1 = bs[i].otherAtom(a0);
            var ang = a1.p.angleTo(a0.p);
            var angle = ang - angle0;
            DEBUG.print(a1.elem + ", " + ang + ", " + angle);
            if (angle < 0)
                angle += 360;
            var p = angles.length;
            for (var k = 0; k < angles.length; ++k) {
                if (angle < angles[k]) {
                    p = k;
                    break;
                }
            }

            var next = null;
            for (var k = 0; k < this.next.length; ++k) {
                if (this.next[k].b == bs[i]) {
                    next = this.next[k];
                    break;
                }
            }
            if (next == null && this.a.ringclosures != null) {
                for (var k = 0; k < this.a.ringclosures.length; ++k) {
                    if (this.a.ringclosures[k].next.b == bs[i]) {
                        next = this.a.ringclosures[k].next;
                        this.a.ringclosures.splice(k, 1);
                        break;
                    }
                }
            }
            if (next == null)
                return null;

            angles.splice(p, 0, angle);
            bonds.splice(p, 0, next);
        }
        this.next = bonds;

        for (var i = 0; i < bonds.length; ++i)
            DEBUG.print(bonds[i].a.elem + ", " + angles[i]);

        var pattern = "";
        if (this.b.type == JSDraw2.BONDTYPES.WEDGE && this.b.a1 == this.a)
            pattern += "U";
        else if (this.b.type == JSDraw2.BONDTYPES.HASH && this.b.a1 == this.a)
            pattern += "D";
        else
            pattern += "-";

        for (var i = 0; i < bonds.length; ++i) {
            if (bonds[i].b.type == JSDraw2.BONDTYPES.WEDGE && bonds[i].b.a1 == this.a)
                pattern += "U";
            else if (bonds[i].b.type == JSDraw2.BONDTYPES.HASH && bonds[i].b.a1 == this.a)
                pattern += "D";
            else
                pattern += "-";
        }

        DEBUG.print(pattern);
        switch (pattern) {
            case "D--":
            case "DD-":
            case "DDD":
            case "--D":
            case "-D-":
            case "-DD":
            case "D---":
            case "-U--":
            case "--D-":
            case "---U":
            case "DU--":
            case "-DU-":
            case "--DU":
            case "U--D":
                return "@";
            case "U--":
            case "UU-":
            case "UUU":
            case "--U":
            case "-U-":
            case "-UU":
            case "U---":
            case "-D--":
            case "--U-":
            case "---D":
            case "UD--":
            case "-UD-":
            case "--UD":
            case "D--U":
                return "@@";
        }

        return null;
    },

    renderSmiles: function () {
        var s = "";
        if (this.b != null) {
            var ring = "";
            if (this.b.ring != null)
                ring = this.b.ring ? "@" : "!@";
            switch (this.b.type) {
                case JSDraw2.BONDTYPES.DOUBLE:
                    s += ring + "=";
                    break;
                case JSDraw2.BONDTYPES.TRIPLE:
                    s += ring + "#";
                    break;
                case JSDraw2.BONDTYPES.SINGLEORDOUBLE:
                    s += ring + "-," + ring + "=";
                    break;
                case JSDraw2.BONDTYPES.SINGLEORAROMATIC:
                    s += ring + "-," + ring + ":";
                    break;
                case JSDraw2.BONDTYPES.DOUBLEORAROMATIC:
                    s += ring + "=," + ring + ":";
                    break;
                case JSDraw2.BONDTYPES.UNKNOWN:
                    s += ring + "~";
                    break;
                case JSDraw2.BONDTYPES.DUMMY:
                    s += ring + "..";
                    break;
                default:
                    if (this.b.ring != null)
                        s += ring + "-";
                    break;
            }
        }

        if (this.ringclosure == null) {
            var stereo = this.stereo();
            // B, C, N, O, P, S, F, Cl, Br, and I
            var ar = JSDraw2.PT.isArAtom(this.a.elem);
            if (this.a.elem == "5'" || this.a.elem == "3'") {
                // do nothing
            }
            else if (this.a.bio) {
                s += "[[" + this.a.elem + "]]";
            }
            else if ((ar || this.a.elem == 'Cl' || this.a.elem == 'F' || this.a.elem == 'Br' || this.a.elem == 'I' || this.a.elem == 'B') &&
                this.a.charge == 0 && this.a.isotope == null && stereo == null && this.a.query == null && !this.a.locked) {
                if (this.a.aromatic && ar)
                    s += this.a.elem.toLowerCase();
                else
                    s += this.a.elem;
            }
            else {
                s += "[";
                if (this.a.query != null && this.a.query.als != null) {
                    for (var k = 0; k < this.a.query.als.length; ++k) {
                        if (k > 0)
                            s += ",";
                        if (this.a.query.t == false)
                            s += "!";
                        s += this.a.query.als[k];
                    }
                }
                else {
                    if (this.a.isotope != null)
                        s += this.a.isotope;
                    s += this.a.elem;
                }

                if (this.a.charge != 0) {
                    if (this.a.hcount > 1)
                        s += "H" + this.a.hcount;

                    if (this.a.charge == 1)
                        s += '+';
                    else if (this.a.charge == -1)
                        s += '-';
                    else
                        s += (this.a.charge > 0 ? "+" : "-") + Math.abs(this.a.charge);
                }

                if (stereo != null)
                    s += stereo + (this.a.hcount == 1 ? "H" : "");

                if (this.a.query != null && this.a.query.rbc != null)
                    s += ";R" + this.a.query.rbc;
                if (this.a.query != null && this.a.query.sub != null)
                    s += ";X" + this.a.query.sub;
                if (this.a.locked)
                    s += ";0";
                s += "]";
            }

            if (this.a.ringclosures != null) {
                var list = this.a.ringclosures;
                for (var k = 0; k < list.length; ++k)
                    s += (list[k].ri < 10 ? "" : "%") + list[k].ri;
            }
        }
        else {
            s += (this.ringclosure < 10 ? "" : "%") + this.ringclosure;
        }

        if (this.next.length > 0) {
            for (var i = 0; i < this.next.length - 1; ++i) {
                var child = this.next[i].renderSmiles();
                if (child == null || child.length == 0)
                    continue;
                if (/^[0-9|\=|\#]+$/.test(child))
                    s += child;
                else
                    s += "(" + child + ")";
            }
            s += this.next[this.next.length - 1].renderSmiles();
        }

        return s;
    }
});

//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Bond class
* @class scilligence.JSDraw2.Bond
*/
JSDraw2.Bond = scilligence.extend(scilligence._base, {
    /**
    @property {Atom} a1 The First Atom
    */
    /**
    @property {Atom} a2 The Second Atom
    */
    /**
    @property {BONDTYPES} type Bond Type
    */
    /**
    @property {string} color Display Color
    */
    /**
    @property {bool} selected Selecting Flag
    */

    /**
    * @constructor Bond
    * @param {Atom} a1 - the first atom
    * @param {Atom} a2 - the second atom
    * @param {BONDTYPES} type - bond type
    */
    constructor: function (a1, a2, type) {
        this.T = "BOND";
        this.a1 = a1;
        this.a2 = a2;
        this.apo1 = null;
        this.apo2 = null;
        this.color = null;
        this.ring = null;
        this.order = null;
        this.rcenter = null;
        this.selected = false;
        this.tag = null;
        this.f = null;
        this.r1 = null;
        this.r2 = null;
        this.type = type == null ? JSDraw2.BONDTYPES.SINGLE : type;
    },

    clone: function () {
        var b = new JSDraw2.Bond(this.a1, this.a2, this.type);
        b.id = this.id;
        b.color = this.color;
        b.order = this.order;
        b.apo1 = this.apo1;
        b.apo2 = this.apo2;
        b.ring = this.ring;
        b.rcenter = this.rcenter;
        b._parent = this.parent;
        b.r1 = this.r1;
        b.r2 = this.r2;
        b.tag = this.tag;
        return b;
    },

    replaceAtom: function (old, na) {
        if (this.a1 == old)
            this.a1 = na;
        else if (this.a2 == old)
            this.a2 = na;
        else
            return false;
        return true;
    },

    isBio: function () {
        return this.type == JSDraw2.BONDTYPES.PEPTIDE || this.type == JSDraw2.BONDTYPES.NUCLEOTIDE;
    },

    bondLength: function () {
        return this.a1.p.distTo(this.a2.p);
    },

    center: function () {
        return new JSDraw2.Point((this.a1.p.x + this.a2.p.x) / 2, (this.a1.p.y + this.a2.p.y) / 2);
    },

    angle: function () {
        return this.vector().angle();
    },

    vector: function () {
        return new JSDraw2.Point(this.a2.p.x - this.a1.p.x, this.a2.p.y - this.a1.p.y);
    },

    /**
    * Get the other Atom of the Bond
    * @function otherAtom
    * @param {Atom} a - one atom on the bond
    * @returns the other Atom
    */
    otherAtom: function (a) {
        if (this.a1 == a)
            return this.a2;
        else if (this.a2 == a)
            return this.a1;
        return null;
    },

    /**
    * Switch the atoms' order
    * @function reverse
    * @returns null
    */
    reverse: function () {
        var a = this.a1;
        this.a1 = this.a2;
        this.a2 = a;

        var apo = this.apo1;
        this.apo1 = this.apo2;
        this.apo2 = apo;
    },

    valence: function () {
        switch (this.type) {
            case JSDraw2.BONDTYPES.SINGLE:
            case JSDraw2.BONDTYPES.WEDGE:
            case JSDraw2.BONDTYPES.HASH:
            case JSDraw2.BONDTYPES.WIGGLY:
            case JSDraw2.BONDTYPES.PEPTIDE:
            case JSDraw2.BONDTYPES.NUCLEOTIDE:
            case JSDraw2.BONDTYPES.DISULFIDE:
            case JSDraw2.BONDTYPES.AMIDE:
            case JSDraw2.BONDTYPES.BOLD:
            case JSDraw2.BONDTYPES.BOLDHASH:
                return 1;
            case JSDraw2.BONDTYPES.DELOCALIZED:
                return 1.5;
            case JSDraw2.BONDTYPES.DOUBLE:
            case JSDraw2.BONDTYPES.EITHER:
                return 2;
            case JSDraw2.BONDTYPES.TRIPLE:
                return 3;
            case JSDraw2.BONDTYPES.UNKNOWN:
            case JSDraw2.BONDTYPES.DUMMY:
                return 0;
            default:
                return null;
        }
    },

    _centerDoubleBond: function (m, b) {
        var atoms1 = m.getNeighborAtoms(b.a1, b.a2);
        var atoms2 = m.getNeighborAtoms(b.a2, b.a1);
        return atoms1.length == 0 && atoms2.length == 2 || atoms2.length == 0 && atoms1.length == 2;
    },

    _shirftDirection: function (m, b) {
        var a1 = null;
        var a2 = null;
        var atoms1 = m.getNeighborAtoms(b.a1, b.a2, true);
        if (atoms1.length == 1)
            a1 = atoms1[0];

        if (a1 == null) {
            var atoms2 = m.getNeighborAtoms(b.a2, b.a1, true);
            if (atoms2.length == 1)
                a2 = atoms2[0];

            if (a2 == null) {
                if (atoms1.length >= 2 && atoms2.length >= 2) {
                    if (m._hasDoubleBonds(atoms1[0]))
                        a1 = atoms1[0];
                    else if (m._hasDoubleBonds(atoms1[1]))
                        a1 = atoms1[1];

                    if (m._hasDoubleBonds(atoms2[0]))
                        a2 = atoms2[0];
                    else if (m._hasDoubleBonds(atoms2[1]))
                        a2 = atoms2[1];
                }
            }
        }

        if (a1 != null) {
            var ang = b.p1.angleAsOrigin(b.p2, a1.p);
            return ang <= 180;
        }

        if (a2 != null) {
            var ang = b.p2.angleAsOrigin(a2.p, b.p1);
            return ang <= 180;
        }
    },

    html: function () {
        var s = "<b i='" + this.id + "' a1='" + this.a1.id + "' a2='" + this.a2.id + "' t='" + this.type + "'";
        if (this.ring != null)
            s += " ring='" + (this.ring ? 1 : 0) + "'";
        if (this.rcenter != null)
            s += " rcenter='" + this.rcenter + "'";
        if (this.color != null)
            s += " clr='" + this.color + "'";
        if (!scil.Utils.isNullOrEmpty(this.r1))
            s += " r1='" + this.r1 + "'";
        if (!scil.Utils.isNullOrEmpty(this.r2))
            s += " r2='" + this.r2 + "'";
        if (this.apo1 > 0 && this.a1.superatom != null)
            s += " apo1='" + this.apo1 + "'";
        if (this.apo2 > 0 && this.a2.superatom != null)
            s += " apo2='" + this.apo2 + "'";
        if (this.tag != null)
            s += " tag='" + scil.Utils.escXmlValue(this.tag) + "'";
        s += "/>";
        return s;
    },

    readHtml: function (e) {
        var r = e.getAttribute("clr");
        if (r != null)
            this.color = r;

        var tag = e.getAttribute("tag");
        if (tag != null && tag != "")
            this.tag = tag;
    },

    toggle: function (p, tor) {
        return p.onLine(this.a1.p, this.a2.p, tor / 2);
    },

    drawCur: function (surface, r, color) {
        var p = this.center();
        surface.createCircle({ cx: p.x, cy: p.y, r: r }).setFill(color);
    },

    _drawBond: function (surface, b, color, linewidth, shrink, shift, dotline, gap, cap) {
        if (shrink == null || shrink == 0) {
            JSDraw2.Drawer.drawLine(surface, b.p1, b.p2, color, linewidth, dotline, cap);
        }
        else {
            var d = shift == 0 ? new JSDraw2.Point(0, 0) : b.vector().scale(1.0 / Math.abs(shift));
            var v = b.vector().rotate(shrink > 0 ? 90 : -90).setLength(gap == null ? linewidth * 2 : gap);
            JSDraw2.Drawer.drawLine(surface, b.p1.clone().offset(d.x + v.x, d.y + v.y), b.p2.clone().offset(-d.x + v.x, -d.y + v.y), color, linewidth, dotline, cap);
        }
    },

    getRColor: function(c, r){
        if (!scil.Utils.isNullOrEmpty(this.color))
            return c;
        switch (r) {
            case 1:
                return "#641E16";
            case 2:
                return "#0000ff";
            case 3:
                return "#aaaaaa";
        }
        return "black";
    },

    draw: function (surface, linewidth, m, fontsize, simpledraw) {
        if (this.type == JSDraw2.BONDTYPES.DUMMY) {
            if ((this.a1.elem == "@" || this.a2.elem == "@") && !this.a1.p.equalsTo(this.a2.p))
                JSDraw2.Drawer.drawLine(surface, this.a1.p, this.a2.p, "#eee", linewidth / 2);
            return;
        }

        if (this.a1.p.equalsTo(this.a2.p))
            return;

        var b = new JSDraw2.Bond.B(this);
        if (!simpledraw) {
            if (b.a1._haslabel)
                b.p1.shrink(b.p2, fontsize * 0.6);
            if (b.a2._haslabel)
                b.p2.shrink(b.p1, fontsize * 0.6);
        }

        var color = scil.Utils.isNullOrEmpty(this.color) ? "black" : this.color;
        if (simpledraw || b.type == JSDraw2.BONDTYPES.PEPTIDE || b.type == JSDraw2.BONDTYPES.AMIDE) {
            JSDraw2.Drawer.drawLine(surface, b.p1, b.p2, color, linewidth);
            return;
        }
        else if (b.type == JSDraw2.BONDTYPES.DISULFIDE) {
            JSDraw2.Drawer.drawLine(surface, b.p1, b.p2, color, linewidth);
            return;
        }
        else if (b.type == JSDraw2.BONDTYPES.NUCLEOTIDE) {
            JSDraw2.Drawer.drawLine(surface, b.p1, b.p2, color, linewidth);
            return;
        }

        if (this.r1 > 0 || this.r2 > 0) {
            var c = new JSDraw2.Point((b.p1.x + b.p2.x) / 2, (b.p1.y + b.p2.y) / 2);
            var color1 = this.getRColor(this.color, this.r1);
            var color2 = this.getRColor(this.color, this.r2);
            JSDraw2.Drawer.drawLine(surface, b.p1, c, color1, linewidth, null, "butt");
            JSDraw2.Drawer.drawLine(surface, c, b.p2, color2, linewidth, null, "butt");
            if (this.r1 == 1 && this.r2 == 2 || this.r1 == 2 && this.r2 == 1) {
                JSDraw2.Bond.showHelmAnnotation(this.a1, this.a2, this.r1);
                JSDraw2.Bond.showHelmAnnotation(this.a2, this.a1, this.r2);
            }
            return;
        }

        var dir = 8;
        if (b.type == JSDraw2.BONDTYPES.DOUBLE || b.type == JSDraw2.BONDTYPES.DELOCALIZED || b.type == JSDraw2.BONDTYPES.EITHER || b.type == JSDraw2.BONDTYPES.DOUBLEORAROMATIC)
            dir = this._shirftDirection(m, b) ? 8 : -8;

        if (b.type == JSDraw2.BONDTYPES.DOUBLE && this._centerDoubleBond(m, b)) {
            this._drawBond(surface, b, color, linewidth, -dir, 0, null, linewidth);
            this._drawBond(surface, b, color, linewidth, dir, 0, null, linewidth);
        }
        else if (b.type == JSDraw2.BONDTYPES.SINGLE || b.type == JSDraw2.BONDTYPES.BOLD || b.type == JSDraw2.BONDTYPES.DOUBLE || b.type == JSDraw2.BONDTYPES.TRIPLE || b.type == JSDraw2.BONDTYPES.DELOCALIZED) {
            this._drawBond(surface, b, color, b.type == JSDraw2.BONDTYPES.BOLD ? 3 * linewidth : linewidth, null, null, null, null, b.type == JSDraw2.BONDTYPES.BOLD ? "butt" : "round");

            if (b.type == JSDraw2.BONDTYPES.DOUBLE || b.type == JSDraw2.BONDTYPES.TRIPLE)
                this._drawBond(surface, b, color, linewidth, dir, dir);

            if (b.type == JSDraw2.BONDTYPES.TRIPLE)
                this._drawBond(surface, b, color, linewidth, -dir, -dir);

            if (b.type == JSDraw2.BONDTYPES.DELOCALIZED)
                this._drawBond(surface, b, color, linewidth, dir, dir, 4);
        }

        if (b.type == JSDraw2.BONDTYPES.WEDGE) {
            var v = b.vector().rotate(90).setLength(linewidth * 2);
            surface.createPolyline([
                    b.p1.x, b.p1.y,
                    b.p2.x + v.x, b.p2.y + v.y,
                    b.p2.x - v.x, b.p2.y - v.y
                ])
                .setStroke({ width: 2 })
                .setFill(color);
        }

        if (b.type == JSDraw2.BONDTYPES.HASH || b.type == JSDraw2.BONDTYPES.BOLDHASH) {
            var len = b.bondLength();
            var n = Math.floor(len / (linewidth * 2));
            var d = b.vector().scale(1.0 / n);
            var v = b.vector().rotate(90);
            for (var k = 1; k <= n; ++k) {
                var p = b.p1.clone().offset(d.x * k, d.y * k);
                var vlen = linewidth * 2;
                if (b.type == JSDraw2.BONDTYPES.HASH)
                    vlen *= k / n;
                else
                    vlen *= 0.6;
                var vi = v.clone().setLength(vlen);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(vi.x, vi.y), p.clone().offset(-vi.x, -vi.y), color, linewidth);
            }
        }

        if (b.type == JSDraw2.BONDTYPES.WIGGLY)
            JSDraw2.Drawer.drawCurves(surface, b.p1, b.p2, color, linewidth);

        if (b.type == JSDraw2.BONDTYPES.EITHER) {
            var d = b.vector().scale(1.0 / Math.abs(dir));
            var v = b.vector().rotate(dir > 0 ? 90 : -90).setLength(linewidth * 2);
            var p1 = b.p1.clone().offset(d.x + v.x, d.y + v.y);
            var p2 = b.p2.clone().offset(-d.x + v.x, -d.y + v.y);
            JSDraw2.Drawer.drawLine(surface, b.p1, p2, color, linewidth);
            JSDraw2.Drawer.drawLine(surface, b.p2, p1, color, linewidth);
        }

        if (b.type == JSDraw2.BONDTYPES.DOUBLEORAROMATIC) {
            this._drawBond(surface, b, color, linewidth);
            this._drawBond(surface, b, color, linewidth, dir, dir, 2);
        }

        if (b.type == JSDraw2.BONDTYPES.SINGLEORDOUBLE || b.type == JSDraw2.BONDTYPES.SINGLEORAROMATIC) {
            this._drawBond(surface, b, color, linewidth, 0, 0, 2);

            this._drawBond(surface, b, color, linewidth, dir / 2, dir / 2, null, linewidth * 1.5);
            this._drawBond(surface, b, color, linewidth, -dir / 2, -dir / 2, b.type == JSDraw2.BONDTYPES.SINGLEORAROMATIC ? 2 : null, linewidth * 1.5);
        }

        if (b.type == JSDraw2.BONDTYPES.UNKNOWN)
            this._drawBond(surface, b, color, linewidth, null, null, linewidth * 1.2);

        if (b.b.ring != null) {
            var p = this.center();
            surface.createCircle({ cx: p.x, cy: p.y, r: linewidth * 3 })
                .setStroke({ color: color, width: linewidth / 2, style: b.b.ring ? "Solid" : "Dash" });
        }

        if (b.b.rcenter != null) {
            var p = this.center();
            var d = b.vector().rotate(90).setLength(linewidth * 3);
            var v = b.vector().setLength(linewidth * (b.b.rcenter == JSDraw2.RXNCENTER.BREAKANDCHANGE ? 1.5 : 1));
            if (b.b.rcenter == JSDraw2.RXNCENTER.CENTER) {
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x + v.x, d.y + v.y), p.clone().offset(-d.x + v.x, -d.y + v.y), color, linewidth / 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x - v.x, d.y - v.y), p.clone().offset(-d.x - v.x, -d.y - v.y), color, linewidth / 2);
                d = b.vector().rotate(90).setLength(linewidth * 1.6);
                v = b.vector().setLength(linewidth * 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x + v.x, d.y + v.y), p.clone().offset(d.x - v.x, d.y - v.y), color, linewidth / 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(-d.x + v.x, -d.y + v.y), p.clone().offset(-d.x - v.x, -d.y - v.y), color, linewidth / 2);
            }
            else if (b.b.rcenter == JSDraw2.RXNCENTER.NOTCENTER) {
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x + v.x, d.y + v.y), p.clone().offset(-d.x - v.x, -d.y - v.y), color, linewidth / 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x - v.x, d.y - v.y), p.clone().offset(-d.x + v.x, -d.y + v.y), color, linewidth / 2);
            }
            else if (b.b.rcenter == JSDraw2.RXNCENTER.BREAK) {
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x + v.x, d.y + v.y), p.clone().offset(-d.x + v.x, -d.y + v.y), color, linewidth / 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x - v.x, d.y - v.y), p.clone().offset(-d.x - v.x, -d.y - v.y), color, linewidth / 2);
            }
            else if (b.b.rcenter == JSDraw2.RXNCENTER.CHANGE) {
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x, d.y), p.clone().offset(-d.x, -d.y), color, linewidth / 2);
            }
            else if (b.b.rcenter == JSDraw2.RXNCENTER.BREAKANDCHANGE) {
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x, d.y), p.clone().offset(-d.x, -d.y), color, linewidth / 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x + v.x, d.y + v.y), p.clone().offset(-d.x + v.x, -d.y + v.y), color, linewidth / 2);
                JSDraw2.Drawer.drawLine(surface, p.clone().offset(d.x - v.x, d.y - v.y), p.clone().offset(-d.x - v.x, -d.y - v.y), color, linewidth / 2);
            }
        }
    },

    drawSelect: function (lasso) {
        lasso.draw(this, this.center());
    }
});


scil.apply(JSDraw2.Bond, {
    cast: function (a) {
        return a != null && a.T == 'BOND' ? a : null;
    },

    B: scilligence.extend(scilligence._base, {
        constructor: function (b) {
            this.b = b;
            this.a1 = b.a1;
            this.a2 = b.a2;
            this.type = b.type;
            this.p1 = b.a1.p.clone();
            this.p2 = b.a2.p.clone()
        },

        vector: function () {
            return new JSDraw2.Point(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        },

        bondLength: function () {
            return this.p1.distTo(this.p2);
        }
    }),

    showHelmAnnotation: function (a1, a2, r1) {
        if (a1.bio == null || scil.Utils.isNullOrEmpty(a1.bio.annotation))
            return;

        if (r1 == 2 && a1.p.x > a2.p.x || r1 == 1 && a1.p.x < a2.p.x)
            a1.bio.annotationshowright = true;
        else
            a1.bio.annotationshowright = null;
    }
});
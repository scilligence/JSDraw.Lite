//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Mol class - define a Molecule object
*<pre>
* <b>Example:</b>
*    var molfile = "\n";
*    molfile += "MolEngine02021312372D\n";
*    molfile += "\n";
*    molfile += "  2  1  0  0  0  0  0  0  0  0999 V2000\n";
*    molfile += "    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n";
*    molfile += "    1.3510    0.7800    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n";
*    molfile += "  1  2  1  0  0  0  0\n";
*    molfile += "M  END\n";
*
*    var m = new JSDraw3.Mol();
*    m.setMolfile(molfile);
*
*    var smiles = m.getSmiles();
* </pre>
* @class scilligence.JSDraw2.Mol
*/
JSDraw2.Mol = scil.extend(scil._base, {
    /**
    @property {array} atoms Array of Atom Objects
    */
    /**
    @property {array} bonds Array of Bond Objects
    */
    /**
    @property {array} graphics Array of Graphics (not Atom and Bond) Objects
    */

    /**
    * @constructor Mol
    */
    constructor: function (showimplicithydrogens) {
        this.T = "MOL";
        this.name = null;
        this.atoms = [];
        this.bonds = [];
        this.graphics = [];
        this.stats = null;
        this.showimplicithydrogens = showimplicithydrogens != false;
        this.props = null;
    },

    _addAtom: function (a, parent) { this.atoms.push(a); a._parent = parent != null ? parent : this; },
    _addBond: function (a, parent) { this.bonds.push(a); a._parent = parent != null ? parent : this; },
    _addGraphics: function (a, parent) { this.graphics.push(a); a._parent = parent != null ? parent : this; },

    /**
    * Reset object IDs including atoms, bonds, and other graphics
    * @function resetIds
    * @returns null
    */
    resetIds: function (keepoldid) {
        var idg = new JSDraw2.IDGenerator(keepoldid ? this._getMaxID() : 0);

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            a.id = idg.next(a.id);
            a.atomid = i + 1;
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var a = this.bonds[i];
            a.id = idg.next(a.id);
            a.bondid = i + 1;
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var a = this.graphics[i];
            a.id = idg.next(a.id);
            a.graphicsid = i + 1;
        }

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.rgroup != null)
                a.rgroup.id = idg.next(a.rgroup.id);
        }
    },

    _getMaxID: function () {
        var max = 0;
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.id > max)
                max = a.id;
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var a = this.bonds[i];
            if (a.id > max)
                max = a.id;
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var a = this.graphics[i];
            if (a.id > max)
                max = a.id;
        }

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.rgroup != null) {
                if (a.rgroup.id > max)
                    max = a.rgroup.id;
            }
        }

        return max;
    },

    getObjectById: function (id) {
        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i].id == id)
                return this.atoms[i];
        }
        for (var i = 0; i < this.bonds.length; ++i) {
            if (this.bonds[i].id == id)
                return this.bonds[i];
        }
        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i].id == id)
                return this.graphics[i];
        }
    },

    /**
    * Clone the Mol object
    * @function clone
    * @param {bool} selectedOnly - indicate if cloning only selected objects
    * @returns a new Mol object
    */
    clone: function (selectedOnly) {
        var m = new JSDraw2.Mol();
        m.bondlength = this.bondlength;
        m.name = this.name;
        m.chiral = this.chiral;
        m.props = scil.clone(this.props);
        m.showimplicithydrogens = this.showimplicithydrogens;
        m.mw = this.mw;
        m.attachpoints = this.attachpoints;

        var map = [];
        this.resetIds(true);
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (selectedOnly && !a.selected)
                continue;

            var a1 = a.clone(selectedOnly);
            if (selectedOnly)
                a1.atommapid = null;
            m._addAtom(a1);
            map[a.id] = a1;
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (selectedOnly && !(b.selected && b.a1.selected && b.a2.selected))
                continue;

            var b1 = b.clone();
            m._addBond(b1);
            map[b.id] = b1;
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            if (selectedOnly && !g.selected)
                continue;

            var g1 = g.clone(map);
            m._addGraphics(g1);
            map[g.id] = g1;
        }

        // fix references
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            var b1 = map[b.id];
            if (b1 == null)
                continue;
            b1.a1 = map[b.a1.id];
            b1.a2 = map[b.a2.id];
            if (b1.a1 == null || b.a2 == null)
                i = i;
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            var g1 = map[g.id];
            if (g1 == null)
                continue;

            if (JSDraw2.Group.cast(g) != null) {
                for (var j = 0; j < this.atoms.length; ++j) {
                    var a = this.atoms[j];
                    if (a.group == g)
                        map[a.id].group = g1;
                }
                if (g.a != null)
                    g1.a = map[g.a.id];

                if (g.group != null)
                    g1.group = map[g.group.id];
            }
            else if (JSDraw2.Bracket.cast(g) != null) {
                g1.atoms = this._getMappedArray(g.atoms, map);
            }
            else if (JSDraw2.Text.cast(g) != null) {
                g1.anchors = this._getMappedArray(g.anchors, map);
            }
            else if (JSDraw2.Shape.cast(g) != null) {
                g1.froms = this._getMappedArray(g.froms, map);
                if (g1.reject != null)
                    g1.reject = map[g1.reject.id];
            }
        }

        m._setParent(m);
        return m;
    },

    _getMappedArray: function (list, map) {
        var ret = [];
        for (var i = 0; i < list.length; ++i) {
            var d = list[i];
            if (d != null && map[d.id] != null)
                ret.push(map[d.id]);
        }
        return ret;
    },

    guessBond: function (a, len, extra) {
        var p = a.p.clone();
        var bonds = this.getAllBonds(a);
        switch (bonds.length + (extra > 0 ? extra : 0)) {
            case 0:
                p.offset(1, 0);
                break;
            case 1:
                p = bonds[0].otherAtom(a).p.clone().rotateAround(a.p, 120);
                break;
            case 2:
                var p1 = bonds[0].otherAtom(a).p;
                var p2 = bonds[1].otherAtom(a).p;
                var angle = a.p.angleAsOrigin(p1, p2);
                if (Math.abs(angle - 180) <= 1) {
                    p = p1.clone();
                    p.rotateAround(a.p, 90);
                }
                else {
                    p.x = (p1.x + p2.x) / 2;
                    p.y = (p1.y + p2.y) / 2;
                    p.rotateAround(a.p, 180);
                }
                break;
            case 3:
                var p1 = bonds[0].otherAtom(a).p;
                var p2 = bonds[1].otherAtom(a).p;
                var p3 = bonds[2].otherAtom(a).p;
                var a1 = p.angleAsOrigin(p1, p2);
                var a2 = p.angleAsOrigin(p2, p3);
                var a3 = p.angleAsOrigin(p3, p1);
                if (a1 > 180)
                    a1 = 360 - a1;
                if (a2 > 180)
                    a2 = 360 - a2;
                if (a3 > 180)
                    a3 = 360 - a3;
                if (a1 > a2 && a1 > a3)
                    p = p3.clone();
                else if (a2 > a1 && a2 > a3)
                    p = p1.clone();
                else
                    p = p2.clone();
                p.rotateAround(a.p, 180);
                break;
            default:
                return null;
        }
        p.setLength(len, a.p);
        return p;
    },

    getMaxRIndex: function (index) {
        if (index == null)
            index = 0;

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.elem != "R")
                continue;
            var r = scil.Utils.parseIndex(a.alias);
            if (r == null || r.index == null)
                continue;

            if (r.index > index)
                index = r.index;
            if (a.rgroup != null) {
                for (var j = 0; j < a.rgroup.mols.length; ++j) {
                    var r = a.rgroup.mols[j].getMaxRIndex(index);
                    if (r > index)
                        index = r;
                }
            }
        }
        return index;
    },

    /**
    * Set color to all objects
    * @function setColor
    * @param {string} color - a color, such as red, blue, #ffe, #f0f0f0
    * @param {bool} selectedOnly - indicate if only set the color to selected objects
    * @returns null
    */
    setColor: function (color, selectedOnly) {
        var n = 0;
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.color != color && (!selectedOnly || a.selected)) {
                a.color = color;
                ++n;
            }

            if (a.rgroup != null) {
                if (a.rgroup.color != color && (!selectedOnly || a.rgroup.selected)) {
                    a.rgroup.color = color;
                    ++n;
                }
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    n += a.rgroup.mols[j].setColor(color, selectedOnly);
            }
        }
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.color != color && (!selectedOnly || b.selected)) {
                b.color = color;
                ++n;
            }
        }
        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            if (g.color != color && (!selectedOnly || g.selected)) {
                g.color = color;
                ++n;
            }
        }

        return n;
    },

    /**
    * Remove all object
    * @function clear
    * @returns null
    */
    clear: function () {
        this.name = null;
        this.chiral = null;
        this.atoms = [];
        this.bonds = [];
        this.graphics = [];
    },

    /**
    * Test if the Mol object is empty - without any atom, bond, or graphics
    * @function isEmpty
    * @returns true or false
    */
    isEmpty: function () {
        return this.atoms.length == 0 && this.bonds.length == 0 && this.graphics.length == 0;
    },

    /**
    * Set selecting flags to all objects
    * @function setSelected
    * @param {bool} f - true or false
    * @returns null
    */
    setSelected: function (f) {
        if (f == null)
            f = false;

        var n = 0;
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.selected != f) {
                a.selected = f;
                ++n;
            }
            if (a.rgroup != null) {
                if (a.rgroup.selected != f) {
                    a.rgroup.selected = f;
                    ++n;
                }
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    n += a.rgroup.mols[j].setSelected(f);
            }
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.selected != f) {
                b.selected = f;
                ++n;
            }
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            if (g.selected != f) {
                g.selected = f;
                ++n;
            }
        }

        return n;
    },

    lassoSelect: function (extra, start, end, last, linewidth, tor) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.p.inTriangle(start, end, last))
                extra.lasso.hit(a);

            if (a.rgroup != null) {
                var g = a.rgroup;
                var r2 = g.rect();
                if (r2.center().inTriangle(start, end, last))
                    extra.lasso.hit(g);
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].lassoSelect(extra, start, end, last, linewidth, tor);
            }
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.center().inTriangle(start, end, last))
                extra.lasso.hit(b);
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            var r2 = g.rect();
            if (r2.center().inTriangle(start, end, last))
                extra.lasso.hit(g);
        }

        extra.lasso.endHits(start, end);
    },

    getSelectedAtomInMol: function () {
        var list = [];
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.selected) {
                list.push(a);
            }
            else if (a.rgroup != null) {
                for (var j = 0; j < a.rgroup.mols.length; ++j) {
                    var r = a.rgroup.mols[j].getSelectedAtomInMol();
                    if (r.length > 0)
                        return r;
                }
            }
        }
        return list;
    },

    bracketSelect: function (r) {
        var ret = [];
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (r.contains(a.p))
                ret.push(a);
        }

        // find open connected bonds
        var xbonds = [];
        var bonds = scil.clone(this.bonds);
        for (var i = this.bonds.length - 1; i >= 0; --i) {
            var b = this.bonds[i];
            var f1 = scil.Utils.indexOf(ret, b.a1) >= 0;
            var f2 = scil.Utils.indexOf(ret, b.a2) >= 0;
            if (f1 != f2) {
                if (JSDraw2.Point.intersect(b.a1.p, b.a2.p, r.topleft(), r.bottomleft()) ||
                    JSDraw2.Point.intersect(b.a1.p, b.a2.p, r.topright(), r.bottomright())) {
                    xbonds.push({ b: b, a: f2 ? b.a1 : b.a2 });
                    bonds.splice(i, 1);
                }
            }
        }

        // only handle one or two open connected bonds
        if (xbonds.length == 2 || xbonds.length == 1) {
            var oldbonds = this.bonds;
            this.bonds = bonds;
            var frags = this.splitFragments();
            this.bonds = oldbonds;

            if (frags.length > 1) {
                for (var i = 0; i < frags.length; ++i) {
                    if (scil.Utils.arrayContainsArray(frags[i].atoms, ret)) {
                        // avoid circle
                        if (xbonds.length == 1 && scil.Utils.indexOf(frags[i].atoms, xbonds[0].a) < 0 ||
                            xbonds.length == 2 && scil.Utils.indexOf(frags[i].atoms, xbonds[0].a) < 0 && scil.Utils.indexOf(frags[i].atoms, xbonds[1].a) < 0) {
                            ret = frags[i].atoms;
                            break;
                        }
                    }
                }
            }
        }

        for (var i = 0; i < ret.length; ++i)
            ret[i].selected = true;
        return ret;
    },

    selectInRect: function (r) {
        var n = 0;
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (r.contains(a.p)) {
                a.selected = true;
                ++n;
            }

            if (a.rgroup != null) {
                var g = a.rgroup;
                var r2 = g.rect();
                if (r2 != null && r.contains(r2.center())) {
                    g.selected = true;
                    ++n;
                }

                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    n += a.rgroup.mols[j].selectInRect(r);
            }
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (r.contains(b.center())) {
                b.selected = true;
                ++n;
            }
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            var r2 = g.rect();
            if (r2 != null && r.contains(r2.center())) {
                g.selected = true;
                ++n;
            }
        }
        return n;
    },

    hasAtom: function (a) {
        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i] == a)
                return true;
        }
        return false;
    },

    hasGraphics: function (g) {
        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i] == g)
                return true;
        }
        return false;
    },

    hasBond: function (b) {
        for (var i = 0; i < this.bonds.length; ++i) {
            if (this.bonds[i] == b)
                return true;
        }
        return false;
    },

    calcHCount: function (recalc) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (recalc || a.hcount == null)
                this.setHCount(a);

            if (a.rgroup != null) {
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].calcHCount(recalc);
            }
        }
    },

    setHCount: function (a) {
        a.hcount = null;
        if (this.showimplicithydrogens == false || a.bio)
            return;

        var error = false;
        var v = null;

        if (a.elem != "R" && a.alias != null && a.alias != "") {
            if (a.superatom == null) {
                if (a.elem != "#")
                    error = true;
            }
            else if (a.superatom != null) {
                var bonds = this.getNeighborBonds(a, true);
                if (bonds.length > a.superatom.attachpoints) {
                    if (a.superatom.atoms.length > 0)
                        error = true;
                }
                else {
                    for (var i = 0; i < bonds.length; ++i) {
                        if (bonds[i].valence() != 1) {
                            error = true;
                            break;
                        }
                    }
                }
            }
        }
        else if (a.hs > 0) {
            v = a.hs - 1;
        }
        else {
            var e = JSDraw2.PT[a.elem];
            if (e != null && e.v != null && e.e != null) {
                var bonds = this.getNeighborBonds(a);
                var sum = 0;
                var naromatic = 0;
                for (var i = 0; i < bonds.length; ++i) {
                    var val = bonds[i].valence();
                    if (val == null)
                        return;
                    if (val == 1.5) {
                        ++naromatic;
                        if (naromatic > 2) // two benzene-rings
                            sum += 1;
                        else
                            sum += 1.5;
                    }
                    else {
                        sum += bonds[i].valence();
                    }
                }

                // the two bonds connect to O and S on c1cocc1 should be single bond
                // TODO: Nitrogen on c1ncnc1: one N should be NH, and one should N
                if (bonds.length == 2 && (a.elem == "O" || a.elem == "S") &&
                    bonds[0].type == JSDraw2.BONDTYPES.DELOCALIZED && bonds[1].type == JSDraw2.BONDTYPES.DELOCALIZED) {
                    --sum;
                }

                // charges
                var extra = 0;
                var pair_e = e.e <= 4 ? 0 : e.e % 4;
                var single_e = e.e <= 4 ? e.e : 4 - (e.e % 4);
                if (a.charge > 0) {
                    if (pair_e > 0) {
                        if (pair_e >= a.charge)
                            extra = a.charge;
                        else
                            return;
                    }
                    else if (single_e > 0) {
                        if (single_e >= a.charge)
                            extra -= a.charge;
                        else
                            return;
                    }
                }
                else if (a.charge < 0) {
                    if (single_e > 0) {
                        if (single_e > -a.charge)
                            extra = a.elem == "B" || a.elem == "P" || a.elem == "Si" ? -a.charge : a.charge; // I#8702
                        else
                            return;
                    }
                }

                // radical
                if (a.radical == 1 || a.radical == 3)
                    sum += 2;
                else if (a.radical == 2)
                    ++sum;

                // attach points
                if (a.attachpoints != null) {
                    for (var i = 0; i < a.attachpoints.length; ++i) {
                        if (a.attachpoints[i] != 99)
                            ++sum;
                    }
                }

                sum = Math.ceil(sum);
                error = true;
                for (var i = 0; i < e.v.length; ++i) {
                    if (sum <= e.v[i] + extra) {
                        v = e.v[i] + extra - sum;
                        error = false;
                        break;
                    }
                }
            }
        }

        a.hasError = error;
        return a.hcount = v;
    },

    hasError: function () {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.hasError)
                return true;
        }
        return false;
    },

    hasGenericAtom: function () {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.elem == "R" && a.bio == null || a.superatom != null && a.superatom.atoms.length == 0)
                return true;
        }
        return false;
    },

    /**
    * Find a bond
    * @function findBond
    * @param {Atom} a1 - the first atom
    * @param {Atom} a2 - the second atom
    * @returns the bond
    */
    findBond: function (a1, a2) {
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.a1 == a1 && b.a2 == a2 || b.a1 == a2 && b.a2 == a1)
                return b;
        }
        return null;
    },

    /**
    * Move all objects to the center
    * @function moveCenter
    * @param {number} width - the width of the view
    * @param {number} height - the height of the view
    * @returns null
    */
    moveCenter: function (width, height) {
        if (this.isEmpty())
            return;

        var center = this.center();
        this.offset(width > 0 ? (width / 2 - center.x) : 0,
            height > 0 ? (height / 2 - center.y) : 0);
    },

    /**
    * Clean up the reaction, and make it looks nicer
    * @function cleanupRxn
    * @returns null
    */
    cleanupRxn: function (defaultbondlength) {
        var rxn = this.parseRxn(true);
        if (rxn == null || rxn.reactants.length == 1 && rxn.products.length == 0 && rxn.arrow == null)
            return false;

        var bondlength = this.medBondLength();
        if (!(bondlength > 0))
            bondlength = defaultbondlength > 0 ? defaultbondlength : JSDraw2.Editor.BONDLENGTH;
        return this._layoutRxn(rxn, bondlength);
    },

    _layoutRxn: function (rxn, bondlength) {
        var pluses = [];
        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i].T == "PLUS")
                pluses.push(this.graphics[i]);
        }

        var x = null;
        var y = null;
        for (var i = 0; i < rxn.reactants.length; ++i) {
            var r = rxn.reactants[i].rect();
            if (r.width == 0)
                r.inflate(bondlength, 0);
            if (r.height == 0)
                r.inflate(0, bondlength);

            if (x == null) {
                x = r.right();
                y = r.center().y;
            }
            else {
                x += bondlength;
                if (pluses.length > 0) {
                    var plus = pluses.pop();
                    plus.p = new JSDraw2.Point(x, y);
                }
                else {
                    var plus = new JSDraw2.Plus(new JSDraw2.Point(x, y));
                    this._addGraphics(plus);
                }

                x += bondlength;
                rxn.reactants[i].offset(x - r.left, y - r.center().y);
                x += r.width;
            }
        }

        var arrow = rxn.arrow;
        if (arrow != null) {
            var ang = arrow.p2.angleTo(arrow.p1);
            arrow.p2.rotateAround(arrow.p1, -ang);
            var r = arrow.rect();
            if (x == null) {
                x = r.right();
                y = r.center().y;
            }
            else {
                x += bondlength;
                arrow.offset(x - r.left, y - r.center().y);
                x += r.width;
            }

            // adjust arrow width
            var width = 0;
            if (rxn.above != null) {
                for (var i = 0; i < rxn.above.length; ++i) {
                    var w = rxn.above[i]._rect.width;
                    if (w > width)
                        width = w;
                }
            }
            if (rxn.below != null) {
                for (var i = 0; i < rxn.below.length; ++i) {
                    var w = rxn.below[i]._rect.width;
                    if (w > width)
                        width = w;
                }
            }
            if (width > 0 && width + bondlength > r.width) {
                var d = width + bondlength - r.width;
                arrow.p2.offset(d, 0);
                x += d;
            }

            // layout reaction conditions above/below arrow
            var d = bondlength / 10;
            var center = arrow.rect().center();

            if (rxn.above != null) {
                var y1 = center.y - d * 2;
                for (var i = rxn.above.length - 1; i >= 0; --i) {
                    var t = rxn.above[i];
                    t.offset(center.x - t._rect.center().x, y1 - t._rect.bottom());
                    y1 = t._rect.top - d;
                }
            }

            if (rxn.below != null) {
                var y2 = center.y + d * 2;
                for (var i = 0; i < rxn.below.length; ++i) {
                    var t = rxn.below[i];
                    t.offset(center.x - t._rect.center().x, y2 - t._rect.top);
                    y2 = t._rect.bottom() + d;
                }
            }
        }

        for (var i = 0; i < rxn.products.length; ++i) {
            var r = rxn.products[i].rect();
            if (r.width == 0)
                r.inflate(bondlength, 0);
            if (r.height == 0)
                r.inflate(0, bondlength);

            if (x == null) {
                x = r.right();
                y = r.center().y;
            }
            else {
                if (i > 0) {
                    x += bondlength;
                    if (pluses.length > 0) {
                        var plus = pluses.pop();
                        plus.p = new JSDraw2.Point(x, y);
                    }
                    else {
                        var plus = new JSDraw2.Plus(new JSDraw2.Point(x, y));
                        this._addGraphics(plus);
                    }
                }

                x += bondlength;
                rxn.products[i].offset(x - r.left, y - r.center().y);
                x += r.width;
            }
        }

        for (var i = 0; i < pluses.length; ++i)
            this.delObject(pluses[i]);

        return true;
    },

    /**
    * Return the center coorindate of all objects
    * @function center
    * @returns the center as a Point object
    */
    center: function () {
        return this.rect().center();
    },

    /**
    * Return the Rect of a Group
    * @function getGroupRect
    * @param {Group} g - the input group
    * @returns a Rect object
    */
    getGroupRect: function (g, bondlength) {
        var r = null;
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.group != g || a.hidden)
                continue;

            var p = a.p;
            if (r == null)
                r = new JSDraw2.Rect(p.x, p.y, 0, 0);
            else
                r.unionPoint(p);
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g2 = this.graphics[i];
            if (g2.group != g)
                continue;

            var rect = JSDraw2.Group.cast(g2) != null ? this.getGroupRect(g2, bondlength) : g2.rect();
            if (r == null)
                r = rect.clone();
            else
                r.union(rect);
        }

        if (r != null && g.gap > 0)
            r.inflate(g.gap * bondlength / 15.0, g.gap * bondlength / 15.0);
        return r;
    },

    /**
    * Get the Rect of selected atoms
    * @function getSelectedRect
    * @returns a Rect object
    */
    getSelectedRect: function () {
        var r = null;
        for (var i = 0; i < this.atoms.length; ++i) {
            if (!this.atoms[i].selected)
                continue;

            var p = this.atoms[i].p;
            if (r == null)
                r = new JSDraw2.Rect(p.x, p.y, 0, 0);
            else
                r.unionPoint(p);
        }
        return r;
    },

    /**
    * Return the Rect of all object
    * @function rect
    * @returns a Rect object
    */
    rect: function (withoutRgroups) {
        if (this.atoms.length == 0) {
            if (this.graphics.length == 0)
                return null;
            var r = this.graphics[0].rect();
            for (var i = 1; i < this.graphics.length; ++i)
                r.union(this.graphics[i].rect());
            return r;
        }

        var x1 = null;
        var y1 = null;
        var x2 = null;
        var y2 = null;

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.hidden)
                continue;

            var p = a.p;
            if (x1 == null) {
                x1 = x2 = p.x;
                y1 = y2 = p.y;
                continue;
            }

            if (p.x < x1)
                x1 = p.x;
            else if (p.x > x2)
                x2 = p.x;

            if (p.y < y1)
                y1 = p.y;
            else if (p.y > y2)
                y2 = p.y;
        }

        var r = new JSDraw2.Rect(x1, y1, x2 - x1, y2 - y1);
        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            if (JSDraw2.Group.cast(g) != null)
                continue;
            r.union(g.rect());
        }

        if (!withoutRgroups) {
            for (var i = 0; i < this.atoms.length; ++i) {
                var a = this.atoms[i];
                if (a.rgroup == null)
                    continue;
                r.union(a.rgroup.rect());
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    r.union(a.rgroup.mols[j].rect());
            }
        }

        return r;
    },

    /**
    * Move all objects
    * @function offset
    * @param {number} dx - x offset
    * @param {number} dy - y offset
    * @param {bool} selectedOnly - indicated if moving only selected objects
    * @returns null
    */
    offset: function (dx, dy, selectedOnly) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (selectedOnly != true || a.selected)
                a.p.offset(dx, dy);
            if (a.rgroup != null) {
                if (selectedOnly != true || a.rgroup.selected)
                    a.rgroup.offset(dx, dy);
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].offset(dx, dy, selectedOnly);
            }
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            if (selectedOnly != true || g.selected) {
                this.graphics[i].offset(dx, dy);
            }
            else {
                if (selectedOnly && !g.selected) {
                    var t = JSDraw2.Text.cast(g);
                    if (t != null && t.anchors.length > 0) {
                        var all = true;
                        for (var j = 0; j < t.anchors.length; ++j) {
                            if (!t.anchors[j].selected) {
                                all = false;
                                break;
                            }
                        }
                        if (all) {
                            t.selected = true;
                            t.offset(dx, dy);
                        }
                    }
                }
            }
        }
    },

    /**
    * Rotate all objects around a point
    * @function rotate
    * @param {Point} origin - the position to be rotated around
    * @param {number} deg - degrees to be rotated
    * @returns null
    */
    rotate: function (origin, deg) {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].p.rotateAround(origin, deg);
    },

    /**
    * Delete an object
    * @function delObject
    * @param {object} obj - Atom, bond, or graphics to be removed
    * @returns null
    */
    delObject: function (obj) {
        if (obj == null)
            return;

        var a = JSDraw2.Atom.cast(obj);
        if (a != null)
            return this.delAtom(a);

        var b = JSDraw2.Bond.cast(obj);
        if (b != null)
            return this.delBond(b);

        return this.delGraphics(obj);
    },

    delGraphics: function (obj) {
        var group = JSDraw2.Group.cast(obj);
        if (group != null) {
            for (var i = 0; i < this.atoms.length; ++i) {
                if (this.atoms[i].group == group)
                    this.atoms[i].group = null;
            }

            for (var i = 0; i < this.graphics.length; ++i) {
                if (this.graphics[i].group == group)
                    this.graphics[i].group = null;
            }
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i] == obj) {
                this.graphics.splice(i, 1);
                this.objectRemoved(obj);
                return true;
            }
        }
        return false;
    },

    delAtom: function (a, checkBonds) {
        var atoms = [];
        atoms.push(a);

        if (checkBonds != false) {
            for (var i = this.bonds.length - 1; i >= 0; --i) {
                var b = this.bonds[i];
                if (b.a1 == a || b.a2 == a) {
                    this.bonds.splice(i, 1);
                    this.objectRemoved(b);
                    atoms.push(b.otherAtom(a));
                    if (a.atommapid != null)
                        this.clearAtomMap(a.atommapid);
                }
            }
        }

        var n = 0;
        for (var i = 0; i < atoms.length; ++i) {
            var a1 = atoms[i];
            if (a == a1 || !a1.bio) {
                if (this.delLoneAtom(atoms[i]))
                    ++n;
            }
        }
        return n > 0;
    },

    delBond: function (b, delLoneAtom) {
        for (var i = 0; i < this.bonds.length; ++i) {
            if (this.bonds[i] == b) {
                this.bonds.splice(i, 1);
                if (delLoneAtom != false) {
                    if (!b.a1.bio)
                        this.delLoneAtom(b.a1);
                    if (!b.a2.bio)
                        this.delLoneAtom(b.a2);
                }
                this.objectRemoved(b);
                return true;
            }
        }

        return false;
    },

    delLoneAtom: function (a) {
        if (!this.isLoneAtom(a)) {
            this.setHCount(a);
            return false;
        }

        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i] == a) {
                this.atoms.splice(i, 1);
                if (a.atommapid != null)
                    this.clearAtomMap(a.atommapid);
                this.objectRemoved(a);
                return true;
            }
        }

        return false;
    },

    objectRemoved: function (obj) {
        for (var i = 0; i < this.graphics.length; ++i) {
            var g = this.graphics[i];
            if (g.removeObject != null)
                g.removeObject(obj);
        }
    },

    hasSelected: function () {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (this.atoms[i].selected)
                return true;
            if (a.rgroup != null) {
                if (a.rgroup.selected) {
                    return true;
                }
                else {
                    for (var j = 0; j < a.rgroup.mols.length; ++j) {
                        if (a.rgroup.mols[j].hasSelected())
                            return true;
                    }
                }
            }
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            if (this.bonds[i].selected)
                return true;
        }

        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i].selected)
                return true;
        }

        return false;
    },

    delSelected: function () {
        var n = 0;

        var atoms = scil.clone(this.atoms);
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            if (a.selected) {
                this.delAtom(atoms[i]);
                ++n;
            }

            if (a.rgroup != null) {
                if (a.rgroup.selected) {
                    a.rgroup = null;
                    ++n;
                }
                else {
                    for (var j = 0; j < a.rgroup.mols.length; ++j)
                        n += a.rgroup.mols[j].delSelected();
                }
            }
        }

        var bonds = scil.clone(this.bonds);
        for (var i = 0; i < bonds.length; ++i) {
            if (bonds[i].selected) {
                this.delBond(bonds[i]);
                ++n;
            }
        }

        var graphics = scil.clone(this.graphics);
        for (var i = 0; i < graphics.length; ++i) {
            if (graphics[i].selected) {
                this.delObject(graphics[i]);
                ++n;
            }
        }

        return n;
    },

    setBondLength: function (d) {
        var s = d / this.medBondLength();
        if (isNaN(s))
            return false;
        this.scale(s);
    },

    getSketchType: function () {
        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i].bio != null)
                return "biologics";
        }
        return this.isRxn() ? "reaction" : "molecule";
    },

    /**
    * Merge another Molecule
    * @function mergeMol
    * @param {Mol} m - the Molecule to be merged
    */
    mergeMol: function (m, _parent, group) {
        for (var i = 0; i < m.atoms.length; ++i) {
            this.addAtom(m.atoms[i]);
            if (group != null)
                m.atoms[i].group = group;
        }

        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (this.findBond(b.a1, b.a2) == null)
                this.addBond(b, false);
        }

        for (var i = 0; i < m.graphics.length; ++i)
            this.addGraphics(m.graphics[i]);

        this._setParent(this);
    },

    replaceAtom: function (old, newa) {
        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i] == old) {
                this.atoms[i] = newa;
                break;
            }
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.a1 == old)
                b.a1 = newa;
            if (b.a2 == old)
                b.a2 = newa;
        }

        this.setHCount(newa);
    },

    replaceBond: function (old, newb) {
        for (var i = 0; i < this.bonds.length; ++i) {
            if (this.bonds[i] == old) {
                this.bonds[i] = newb;
                break;
            }
        }

        this.replaceAtom(old.a1, newb.a1);
        this.replaceAtom(old.a2, newb.a2);
    },

    /**
    * Add a graphics
    * @function addGraphics
    * @param {Graphics} g - the graphics to be added
    * @returns the Graphics added
    */
    addGraphics: function (g) {
        if (this.hasGraphics(g))
            return null;

        this._addGraphics(g);
        return g;
    },

    /**
    * Add an Atom
    * @function addAtom
    * @param {Atom} a - the atom to be added
    * @returns the Atom added
    */
    addAtom: function (a) {
        if (this.hasAtom(a))
            return null;

        this._addAtom(a);
        return a;
    },

    /**
    * Add a Bond
    * @function addBond
    * @param {Bond} b - the bond to be added
    * @param {bool} resetcharge - indicate if reset atoms' charges of bonded atoms
    * @returns the Bond added
    */
    addBond: function (b, resetcharge, add2rgroup) {
        if (this.hasBond(b))
            return null;

        if (b.a1.mol != b.a2.mol) {
            if (add2rgroup) {
                this._addBond2RGroupMol(b);
            }
            else {
                scil.Utils.alert("Cannot create this bond");
                return null;
            }
        }

        this._addBond(b);
        if (resetcharge != false && b.type != JSDraw2.BONDTYPES.DUMMY)
            b.a1.charge = b.a2.charge = 0;

        if (b.a1.alias == "Me")
            b.a1.alias = null;
        if (b.a2.alias == "Me")
            b.a2.alias = null;

        this.setHCount(b.a1);
        this.setHCount(b.a2);
        return b;
    },

    _addBond2RGroupMol: function (b) {
        var m = b.a1._parent || b.a2._parent;
        if (m == null || b.a1._parent == b._parent && b.a2._parent == b.a1._parent)
            return;

        if (b.a1._parent == null) {
            m.addAtom(b.a1);
            b.a1._parent = m;
        }

        if (b.a2._parent == null) {
            m.addAtom(b.a2);
            b.a2._parent = m;
        }

        m.addBond(b);
        b._parent = m;
    },

    /**
    * Set atom alias
    * @function setAtomAlias
    * @param {Atom} a - the target atom
    * @param {string} alias - alias name
    * @returns true of false
    */
    setAtomAlias: function (a, alias, len) {
        if (alias == null || alias == "")
            return this.setAtomType(a, alias);

        if (a.alias == alias)
            return false;

        var elem = "*";
        var m = JSDraw2.SuperAtoms.get(alias);
        if (m == null) {
            var alias2 = alias.replace(/^[\+|\-]/, "").replace(/[\+|\-]$/, "");
            if (JSDraw2.PT[alias2] != null || (/^R[0-9]+$/).test(alias))
                return this.setAtomType(a, alias);

            var s = JSDraw2.SuperAtoms.guessOne(alias);
            if (s != null) {
                alias = s;
                m = JSDraw2.SuperAtoms.get(alias);
            }
            else {
                // leading O or S
                var list = this.getNeighborBonds(a);
                var orphan = list == null || list.length == 0 || list.length == 1 && list[0].type == JSDraw2.BONDTYPES.DUMMY;
                m = JSDraw2.FormulaParser.parse(alias, orphan, list.length);
                if (m != null && m.atoms.length == 0)
                    return this.setAtomType(a, m.atoms[0].elem);

                if (orphan) {
                    var salt = JSDraw2.FormulaParser.parseSalt(alias);
                    if (salt != null)
                        elem = "#";
                }
            }
        }

        a.isotope = null;
        a.query = null;
        a.hcount = null;
        a.radical = null;
        a.charge = 0;
        a.alias = alias;
        if (m != null) {
            var attach = JSDraw2.SuperAtoms._getFirstAttachAtom(m);
            if (attach != null)
                JSDraw2.SuperAtoms._alignMol(a._parent, a, m, attach, len != null ? len : this.medBondLength(1.56));
            a.superatom = m;
            a.rgroup = null;
            a.elem = elem;
        }
        else {
            if (!scil.Utils.isNullOrEmpty(alias))
                a.elem = elem;

            if (a.elem == "R")
                a.updateRGroup();
            else
                a.rgroup == null;
            a.superatom = null;
        }
        this.setHCount(a);
        return true;
    },

    setAttachPoint: function (a, apo) {
        if (apo > 0 && !(a.attachpoints.length == 1 && a.attachpoints[0] == apo)) {
            a.attachpoints = [apo];
            a._parent.setHCount(a);
            return true;
        }
        return false;
    },

    /**
    * Set atom type
    * @function setAtomType
    * @param {Atom} a - the target atom
    * @param {string} elem - element symbol of atom
    * @returns true of false
    */
    setAtomType: function (a, elem, setCharge) {
        if (elem == "antibody" || elem == "protein" || elem == "gene" || elem == "dna" || elem == "rna") {
            if (a.biotype() == JSDraw2.BIO.ANTIBODY || a.biotype() == JSDraw2.BIO.PROTEIN || a.biotype() == JSDraw2.BIO.GENE || a.biotype() == JSDraw2.BIO.DNA || a.biotype() == JSDraw2.BIO.RNA)
                return false;
            switch (elem) {
                case "antibody":
                    a.bio = { type: JSDraw2.BIO.ANTIBODY };
                    break;
                case "protein":
                    a.bio = { type: JSDraw2.BIO.PROTEIN };
                    break;
                case "gene":
                    a.bio = { type: JSDraw2.BIO.GENE };
                    break;
                case "dna":
                    a.bio = { type: JSDraw2.BIO.DNA };
                    break;
                case "rna":
                    a.bio = { type: JSDraw2.BIO.RNA };
                    break;
            }
            a.elem = "X";
            a.isotope = null;
            a.query = null;
            a.hcount = null;
            a.radical = null;
            a.charge = 0;
            return true;
        }

        var charge = null;
        if (elem.length > 1 && /[\+|\-][0-9]?$/.test(elem)) {
            var s = elem.replace(/[\+|\-][0-9]?$/, "");
            var cs = elem.substr(s.length);
            elem = s;
            if (cs == "+")
                charge = 1;
            else if (cs == "-")
                charge = -1;
            else
                charge = parseInt(cs);
        }

        if (a.elem == elem && (elem == 'H' && a.isotope == null) || a.bio)
            return false;
        var alias = null;
        var e = elem == "D" || elem == "T" ? "H" : elem;
        if ((/^R[0-9]+$/).test(elem)) {
            e = "R";
            alias = elem;
        }
        if (JSDraw2.PT[e] == null)
            return false;

        var oldelem = a.elem;
        a.elem = e;
        if (e != "R")
            a.rgroup = null;
        a.alias = alias;
        a.superatom = null;
        if (elem == "D")
            a.isotope = 2;
        else if (elem == "T")
            a.isotope = 3;
        else
            a.isotope = null;
        a.query = null;

        if (charge > 0 || charge < 0)
            a.charge = charge;
        else if (setCharge)
            a.charge = 0;

        if (oldelem == "@") {
            a.alias = null;
            a.bio = null;
            var list = this.getAllBonds(a);
            for (var i = 0; i < list.length; ++i) {
                var b = list[i];
                if (b.type == JSDraw2.BONDTYPES.DUMMY)
                    scil.Utils.removeArrayItem(this.bonds, b);
            }
        }

        a._parent.setHCount(a);
        if (e == "R")
            a.updateRGroup();
        return true;
    },

    /**
    * Set atom charges
    * @function setAtomCharge
    * @param {Atom} a - the target atom
    * @param {number} charge - charges
    * @returns true of false
    */
    setAtomCharge: function (a, charge) {
        if (charge == null || isNaN(charge) || a.bio)
            return false;
        charge = Math.round(charge);
        if (a.charge == charge)
            return false;
        a.charge = charge;
        a._parent.setHCount(a);
        return true;
    },

    /**
    * Set bond type
    * @function setBondType
    * @param {Bond} b - the target bond
    * @param {BONDTYPES} type - predefined bond type
    * @returns true of false
    */
    setBondType: function (b, type) {
        if (b.a1.biotype() == JSDraw2.BIO.AA && b.a2.biotype() == JSDraw2.BIO.AA) {
            if (b.type == JSDraw2.BONDTYPES.DISULFIDE && type == JSDraw2.BONDTYPES.PEPTIDE || b.type == JSDraw2.BONDTYPES.PEPTIDE && type == JSDraw2.BONDTYPES.DISULFIDE) {
                b.type = type;
                return true;
            }
        }
        else {
            if (type < JSDraw2.BONDTYPES.UNKNOWN && type > JSDraw2.BONDTYPES.DOUBLEORAROMATIC || b.a1.bio || b.a2.bio)
                return false;
            b.type = type;
            b._parent.setHCount(b.a1);
            b._parent.setHCount(b.a2);
            return true;
        }
    },

    isLoneAtom: function (a) {
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.a1 == a || b.a2 == a)
                return false;
        }

        return true;
    },

    medBondLength: function (defaultValue) {
        if (this.bonds.length == 0)
            return defaultValue;

        var step = Math.floor(this.bonds.length / 10);
        if (step == 0)
            step = 1;

        var list = [];
        for (var i = 0; i < this.bonds.length; i += step) {
            var b = this.bonds[i];
            list.push(b.a1.p.distTo(b.a2.p));
        }
        if (list.length == 0)
            return 1.5;
        if (list.length == 1)
            return list[0] <= 0 ? 1.5 : list[0];

        list.sort();
        var d = list[Math.round(list.length / 2)];
        return d <= 0 ? 1.5 : d;
    },

    _hasDoubleBonds: function (a) {
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.type == JSDraw2.BONDTYPES.DOUBLE && (b.a1 == a || b.a2 == a))
                return true;
        }
        return false;
    },

    getNeighborAtoms: function (a, oa, excludeDummyBond) {
        var list = [];
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (excludeDummyBond && b.type == JSDraw2.BONDTYPES.DUMMY)
                continue;

            if (b.a1 == a) {
                if (b.a2 != oa)
                    list.push(b.a2);
            }
            else if (b.a2 == a) {
                if (b.a1 != oa)
                    list.push(b.a1);
            }
        }
        return list;
    },

    getNeighborBonds: function (a, excludeDummyBonds) {
        var list = [];
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if ((b.a1 == a || b.a2 == a) &&
                (!excludeDummyBonds || b.type != JSDraw2.BONDTYPES.DUMMY && b.type != JSDraw2.BONDTYPES.UNKNOWN))
                list.push(b);
        }
        return list;
    },

    /**
    * Remove all hydrogen atoms
    * @function removeHydrogens
    * @returns the count of removed atoms
    */
    removeHydrogens: function () {
        var hs = [];
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.elem == "H" && a.isotope == null)
                hs.push(i);
        }

        for (var k = hs.length - 1; k >= 0; --k) {
            var a = this.atoms[hs[k]];
            for (var i = this.bonds.length - 1; i >= 0; --i) {
                var b = this.bonds[i];
                if (b.a1 == a || b.a2 == a)
                    this.bonds.splice(i, 1);
            }

            this.atoms.splice(hs[k], 1);
        }

        return hs.length;
    },

    draw: function (surface, linewidth, fontsize, textonly, dimension, highlighterrors, showcarbon, simpledraw) {
        if (linewidth == null)
            linewidth = 2;
        if (fontsize == null)
            fontsize = 14;

        if (textonly) {
            for (var i = 0; i < this.graphics.length; ++i) {
                if (this.graphics[i].T == "TEXT")
                    this.graphics[i].draw(surface, linewidth, this, fontsize);
            }
        }
        else {
            for (var i = 0; i < this.atoms.length; ++i) {
                var a = this.atoms[i];
                a._outside = a.p.x < -JSDraw2.speedup.gap || a.p.x > dimension.x + JSDraw2.speedup.gap || a.p.y < -JSDraw2.speedup.gap || a.p.y > dimension.y + JSDraw2.speedup.gap;
                a._haslabel = a.hasLabel(this, showcarbon);
            }

            // draw bonds connect to hidden group atom
            var bonds = [];
            for (var i = 0; i < this.bonds.length; ++i) {
                var b = this.bonds[i];
                if (b.a1._outside && b.a2._outside && !b.a1.hidden && !b.a2.hidden)
                    continue;

                if (!simpledraw || !b.selected) {
                    if (this.moveHiddenAtomToGroupBorder(b.a1, b.a2) || this.moveHiddenAtomToGroupBorder(b.a2, b.a1))
                        b.draw(surface, linewidth, this, fontsize, simpledraw);
                    else
                        bonds.push(b);
                }
            }

            for (var i = 0; i < this.graphics.length; ++i)
                this.graphics[i].draw(surface, linewidth, this, fontsize);

            for (var i = 0; i < bonds.length; ++i)
                bonds[i].draw(surface, linewidth, this, fontsize, simpledraw);

            var tor = linewidth * 2;
            if (simpledraw) {
                // I#9069
                for (var i = 0; i < this.atoms.length; ++i) {
                    var a = this.atoms[i];
                    if (a._outside || !a.hasErr())
                        continue;

                    var w = 8;
                    var r = new JSDraw2.Rect(a.p.x - w / 2, a.p.y - w / 2, w, w);
                    JSDraw2.Drawer.drawRect(surface, r, "red", linewidth).setFill("red");
                }
            }
            else {
                for (var i = 0; i < this.atoms.length; ++i) {
                    var a = this.atoms[i];
                    if (a._outside)
                        continue;

                    // check overlapping
                    for (var k = i + 1; k < this.atoms.length; ++k) {
                        var a1 = this.atoms[k];
                        if (Math.abs(a.p.x - a1.p.x) < tor && Math.abs(a.p.y - a1.p.y) < tor) {
                            var r = new JSDraw2.Rect(a.p.x - fontsize / 2, a.p.y - fontsize / 2, fontsize, fontsize);
                            JSDraw2.Drawer.drawRect(surface, r, "red", linewidth);
                            break;
                        }
                    }

                    a.draw(surface, linewidth, this, fontsize, highlighterrors);
                    if (a.rgroup != null) {
                        if (a.rgroup.text != null)
                            a.rgroup.draw(surface, linewidth, this, fontsize);
                        for (var j = 0; j < a.rgroup.mols.length; ++j)
                            a.rgroup.mols[j].draw(surface, linewidth, fontsize, textonly, dimension, highlighterrors);
                    }
                }
            }

            this.drawSelect(new JSDraw2.Lasso(surface, linewidth * (simpledraw ? 5 : 1), false), simpledraw);

            var s = null;
            if (this.chiral == "and")
                s = "[AND Enantiomer]";
            else if (this.chiral == "or")
                s = "[OR Enantiomer]";
            else if (this.chiral == true)
                s = "Chiral";

            if (s != null)
                JSDraw2.Drawer.drawText(surface, new JSDraw2.Point(dimension.x - fontsize * 4, fontsize * 1), s, "gray", fontsize, "right");
        }
    },

    moveHiddenAtomToGroupBorder: function (a, a2) {
        if (!a.hidden)
            return false;

        var g = this._findGroup(a);
        if (g == null)
            return false;

        var r = g.rect();
        if (!a2.hidden) {
            // group to atom: use the closest border
            var p = a2.p;
            if (p.x < r.left)
                a.p.x = r.left;
            else if (p.x > r.right())
                a.p.x = r.right();
            else
                a.p.x = p.x;

            if (p.y < r.top)
                a.p.y = r.top;
            else if (p.y > r.bottom())
                a.p.y = r.bottom();
            else
                a.p.y = p.y;

            a._outside = false;
        }
        else {
            // group to group
            var g2 = this._findGroup(a2);
            if (g2 == null)
                return false;

            var r2 = g2.rect();
            if (r.left >= r2.left && r.left <= r2.right() || r.right() >= r2.left && r.right() <= r2.right() || r2.left >= r.left && r2.left <= r.right() || r2.right() >= r.left && r2.right() <= r.right()) {
                // vertically overlapped: vertical center
                var x = (Math.max(r.left, r2.left) + Math.min(r.right(), r2.right())) / 2;
                a.p.x = a2.p.x = x;
                a.p.y = r.bottom() < r2.top ? r.bottom() : r.top;
                a2.p.y = r2.top > r.bottom() ? r2.top : r2.bottom();
            }
            else if (r.top >= r2.top && r.top <= r2.bottom() || r.bottom() >= r2.top && r.bottom() <= r2.bottom() || r2.top >= r.top && r2.top <= r.bottom() || r2.bottom() >= r.top && r2.bottom() <= r.bottom()) {
                // horizontally overlapped: horizontal center
                var y = (Math.max(r.top, r2.top) + Math.min(r.bottom(), r2.bottom())) / 2;
                a.p.y = a2.p.y = y;
                a.p.x = r.right() < r2.left ? r.right() : r.left;
                a2.p.x = r2.left > r.right() ? r2.left : r2.right();
            }
            else {
                // then corner to corner
                if (r.right() < r2.left) {
                    if (r.bottom() < r2.top) {
                        a.p = r.bottomright();
                        a2.p = r2.topleft();
                    }
                    else {
                        a.p = r.topright();
                        a2.p = r2.bottomleft();
                    }
                }
                else {
                    if (r.bottom() < r2.top) {
                        a.p = r.bottomleft();
                        a2.p = r2.topright();
                    }
                    else {
                        a.p = r.topleft();
                        a2.p = r2.bottomright();
                    }
                }
            }

            a._outside = false;
            a2._outside = false;
        }

        return true;
    },

    _findGroup: function (a) {
        for (var i = 0; i < this.graphics.length; ++i) {
            var g = JSDraw2.Group.cast(this.graphics[i]);
            if (g != null && g.a == a)
                return g;
        }

        return null;
    },

    drawSelect: function (lasso, simpledraw) {
        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i].selected)
                this.graphics[i].drawSelect(lasso);
        }

        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].__drawselect = false;

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.selected) {
                b.drawSelect(lasso);
                if (simpledraw) {
                    b.a1.__drawselect = true;
                    b.a2.__drawselect = true;
                }
            }
        }

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.selected && !a.__drawselect)
                a.drawSelect(lasso);

            if (a.rgroup != null) {
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].drawSelect(lasso, simpledraw);
            }
        }
    },

    setZOrder: function (g, z) {
        var i = scil.Utils.indexOf(this.graphics, g);
        if (i < 0 || this.graphics.length == 1)
            return false;

        if (z == 0) {
            if (z != i) {
                this.graphics.splice(i, 1);
                this.graphics.splice(0, 0, g);
            }
        }
        else if (z == -1) {
            if (i != this.graphics.length - 1) {
                this.graphics.splice(i, 1);
                this.graphics.push(g);
            }
        }

        return true;
    },

    calcHDir: function (a, tor, drawalias) {
        var atoms = this.getNeighborAtoms(a);
        if (atoms.length == 0 && a.charge == 0)
            return drawalias ? JSDraw2.ALIGN.RIGHT : JSDraw2.ALIGN.LEFT;

        var r = false, b = false, l = false, t = false;
        for (var i = 0; i < atoms.length; ++i) {
            var oa = atoms[i];
            var dx = oa.p.x - a.p.x;
            var dy = oa.p.y - a.p.y;
            if (dx > tor)
                r = true;
            else if (dx < -tor)
                l = true;
            if (dy > tor)
                b = true;
            else if (dy < -tor)
                t = true;
        }

        if (!r)
            return JSDraw2.ALIGN.RIGHT;
        else if (!l)
            return JSDraw2.ALIGN.LEFT;
        else if (!b)
            return JSDraw2.ALIGN.BOTTOM;
        else if (!t)
            return JSDraw2.ALIGN.TOP;
        return JSDraw2.ALIGN.RIGHT;
    },

    /**
    * Set molfile
    * @function setMolfile
    * @param {string} molfile - the input molfile
    * @returns the Mol object
    */
    setMolfile: function (molfile, rxn) {
        var m = this.setMolfile2(molfile, rxn);
        if (m != null)
            this.guessSuperAtoms();
        return m;
    },

    guessSuperAtoms: function () {
        return 0;
    },

    setMolfile2: function (molfile, rxn) {
        if (molfile != null && molfile.length > 4) {
            if (molfile.substr(0, 4) == "$RXN")
                return this.setRxnfile(molfile);
            if (molfile.substr(0, 4) == "$MDL")
                return this.setRgfile(molfile);
        }

        this.clear();
        if (molfile == null || molfile.length == 0)
            return null;

        var lines = null;
        if (molfile.indexOf('\n') >= 0)
            lines = molfile.split("\n");
        else
            lines = molfile.split('|');

        for (var i = 0; i <= Math.min(3, lines.length - 1); ++i) {
            if (lines[i].toUpperCase().indexOf(" V2000") > 0) {
                this.setMolV2000(lines, i, rxn);
                if (i == 3)
                    this.name = scil.Utils.trim(lines[0]);
                return this;
            }
            else if (lines[i].toUpperCase().indexOf(" V3000") > 0) {
                this.setMolV3000(lines, i + 1, rxn);
                if (i + 1 == 3)
                    this.name = scil.Utils.trim(lines[0]);
                return this;
            }
        }
        return null;
    },

    setMolV2000: function (lines, start, rxn, rAtoms) {
        var natoms = parseFloat(lines[start].substr(0, 3));
        var nbonds = parseFloat(lines[start].substr(3, 3));
        var chiral = lines[start].substr(12, 3);
        if (!JSDraw2.defaultoptions.and_enantiomer)
            this.chiral = chiral == "  1";
        if (isNaN(natoms) || isNaN(nbonds))
            return null;
        ++start;

        for (var i = start; i < natoms + start; i++) {
            var s = lines[i];
            var x = parseFloat(s.substr(0, 10));
            var y = -parseFloat(s.substr(10, 10));
            var e = scil.Utils.trim(s.substr(31, 3));
            var c = s.length >= 39 ? parseInt(s.substr(36, 3)) : 0;
            var ami = rxn && s.length >= 63 ? parseInt(s.substr(60, 3)) : 0;
            var hs = s.length >= 45 ? parseInt(s.substr(42, 3)) : 0;
            var val = s.length >= 51 ? parseInt(s.substr(48, 3)) : 0;

            if (isNaN(x) || isNaN(y) || isNaN(c))
                return null;

            var alias = null;
            if ((/^R[0-9]+$/).test(e)) {
                alias = e;
                e = "R";
            }
            var a = new JSDraw2.Atom(new JSDraw2.Point(x, y), e == "R#" ? "R" : e);
            a.alias = alias;
            if (ami > 0)
                a.atommapid = ami;
            if (hs > 0 && hs <= 5)
                a.hs = hs;
            if (val > 0 && val <= 15)
                a.val = val;
            this._addAtom(a);
            switch (c) {
                case 1:
                    a.charge = 3;
                    break;
                case 2:
                    a.charge = 2;
                    break;
                case 3:
                    a.charge = 1;
                    break;
                case 5:
                    a.charge = -1;
                    break;
                case 6:
                    a.charge = -2;
                    break;
                case 7:
                    a.charge = -3;
                    break;
            }
        }

        start += natoms;
        for (i = start; i < (nbonds + start); i++) {
            var line = lines[i];
            var s = parseFloat(line.substr(0, 3)) - 1;
            var e = parseFloat(line.substr(3, 3)) - 1;
            var order = parseInt(line.substr(6, 3));
            var stereo = parseInt(line.substr(9, 3));
            var ring = line.length >= 18 ? parseInt(line.substr(15, 3)) : null;
            var rcenter = line.length >= 21 ? line.substr(18, 3) : null;
            if (isNaN(s) || isNaN(e) || isNaN(order))
                return null;

            var a1 = this.atoms[s];
            var a2 = this.atoms[e];
            var b;
            switch (order) {
                case 0:
                    b = JSDraw2.BONDTYPES.UNKNOWN;
                    break;
                case 1:
                    switch (stereo) {
                        case 1:
                            b = JSDraw2.BONDTYPES.WEDGE;
                            break;
                        case 4:
                            b = JSDraw2.BONDTYPES.WIGGLY;
                            break;
                        case 6:
                            b = JSDraw2.BONDTYPES.HASH;
                            break;
                        default:
                            b = JSDraw2.BONDTYPES.SINGLE;
                            break;
                    }
                    break;
                case 2:
                    b = stereo == 3 ? JSDraw2.BONDTYPES.EITHER : JSDraw2.BONDTYPES.DOUBLE;
                    break;
                case 3:
                    b = JSDraw2.BONDTYPES.TRIPLE;
                    break;
                case 4:
                    b = JSDraw2.BONDTYPES.DELOCALIZED;
                    break;
                case 5:
                    b = JSDraw2.BONDTYPES.SINGLEORDOUBLE;
                    break;
                case 6:
                    b = JSDraw2.BONDTYPES.SINGLEORAROMATIC;
                    break;
                case 7:
                    b = JSDraw2.BONDTYPES.DOUBLEORAROMATIC;
                    break;
                case 8:
                    b = JSDraw2.BONDTYPES.UNKNOWN;
                    break;
                case 9:
                    b = JSDraw2.BONDTYPES.DUMMY;
                    break;
            }
            var bond = new JSDraw2.Bond(a1, a2, b);
            if (ring == 1)
                bond.ring = true;
            else if (ring == 2)
                bond.ring = false;
            if (rxn)
                this.readRxnCenter(bond, rcenter);
            this._addBond(bond);
        }

        var sgroups = [];
        start += nbonds;
        for (var i = start; i < lines.length; ++i) {
            var s = scil.Utils.rtrim(lines[i]);
            var token = s.length >= 6 ? s.substr(0, 6) : null;
            var token3 = s.length >= 6 ? s.substr(0, 3) : null;
            if (token == "M  ISO") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = parseInt(s.substr(10 + k * 8, 3));
                    var v = parseInt(s.substr(14 + k * 8, 3));
                    if (isNaN(ai) || isNaN(v))
                        return null;
                    this.atoms[ai - 1].isotope = v;
                }
            }
            else if (token == "M  RAD") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = parseInt(s.substr(10 + k * 8, 3));
                    var v = parseInt(s.substr(14 + k * 8, 3));
                    if (isNaN(ai) || isNaN(v))
                        return null;
                    if (v >= 1 && v <= 3)
                        this.atoms[ai - 1].radical = v;
                }
            }
            else if (token == "M  CHG") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = parseInt(s.substr(10 + k * 8, 3));
                    var v = parseInt(s.substr(14 + k * 8, 3));
                    if (isNaN(ai) || isNaN(v))
                        return null;
                    this.atoms[ai - 1].charge = v;
                }
            }
            else if (token == "M  ALS") {
                //M  ALS   7  4 F C   N   S   O 
                var ai = parseInt(s.substr(7, 3));
                var n = parseInt(s.substr(10, 3));
                var f = s.substr(14, 1) == "F";
                var list = [];
                for (var k = 0; k < n; ++k) {
                    var el = scil.Utils.trim(s.substr(16 + k * 4, 4));
                    if (JSDraw2.PT.isValidAtomList(el))
                        list.push(el);
                }
                var a = this.atoms[ai - 1];
                if (a.query == null)
                    a.query = {};
                a.query.t = f;
                a.query.als = list;
            }
            else if (token == "M  SUB") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = s.substr(9 + 8 * k + 1, 3);
                    var v = parseInt(s.substr(9 + 8 * k + 5, 3));
                    var a = this.atoms[ai - 1];
                    if (a.query == null)
                        a.query = {};
                    if (v == -1)
                        a.query.sub = 0;
                    else if (v == -2)
                        a.query.sub = "*";
                    else
                        a.query.v = v;
                }
            }
            else if (token == "M  UNS") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = s.substr(9 + 8 * k + 1, 3);
                    var v = parseInt(s.substr(9 + 8 * k + 5, 3));
                    var a = this.atoms[ai - 1];
                    if (a.query == null)
                        a.query = {};
                    a.query.uns = v == 1;
                }
            }
            else if (token == "M  RBC") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = s.substr(9 + 8 * k + 1, 3);
                    var v = parseInt(s.substr(9 + 8 * k + 5, 3));
                    var a = this.atoms[ai - 1];
                    if (v == -1 || v > 0) {
                        if (a.query == null)
                            a.query = {};
                        a.query.rbc = v == -1 ? 0 : v;
                    }
                }
            }
            else if (token == "M  RGP") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = parseInt(s.substr(10 + k * 8, 3));
                    var rr = parseInt(s.substr(14 + k * 8, 3));
                    if (isNaN(ai) || isNaN(rr))
                        return null;
                    if (this.atoms[ai - 1].elem == "R") {
                        var a = this.atoms[ai - 1];
                        if (a.alias == null || a.alias == "")
                            a.alias = "R" + rr;
                        if (rAtoms != null)
                            rAtoms[rr] = a;
                    }
                }
            }
            else if (token == "M  APO") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ai = parseInt(s.substr(10 + k * 8, 3));
                    var rr = parseInt(s.substr(14 + k * 8, 3));
                    if (!isNaN(ai) && !isNaN(rr) && this.atoms[ai - 1] != null)
                        this.atoms[ai - 1].attachpoints.push(rr);
                }
            }
            else if (token == "M  STY") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var si = parseInt(s.substr(10 + k * 8, 3));
                    var sn = s.substr(14 + k * 8, 3);
                    var br = null;
                    if (sn == "DAT") {
                        br = new JSDraw2.Text();
                    }
                    else if (sn == "SUP") {
                        br = { type: "SUPERATOM", atoms: [] };
                    }
                    else {
                        for (var ty in JSDraw2.SGroup.stys) {
                            if (JSDraw2.SGroup.stys[ty] == sn) {
                                br = new JSDraw2.Bracket(ty == "" ? null : ty, null);
                                break;
                            }
                        }
                        if (br == null)
                            br = new JSDraw2.Bracket(null, null);
                    }
                    if (br != null)
                        sgroups[si] = br;
                }
            }
            else if (token == "M  SMT") {
                var si = parseInt(s.substr(7, 3));
                var sa = s.substr(11);
                if (sa.length > 0 && sa.substr(0, 1) == "^")
                    sa = sa.substr(1);
                sgroups[si].subscript = sa;
            }
            else if (token == "M  SCL") {
                var si = parseInt(s.substr(7, 3));
                sgroups[si].cls = s.substr(11);
            }
            else if (token == "M  SPL") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var ci = parseInt(s.substr(10 + k * 8, 3));
                    var pi = parseInt(s.substr(14 + k * 8, 3));
                    if (JSDraw2.Text.cast(sgroups[ci]) != null && JSDraw2.Bracket.cast(sgroups[pi]) != null)
                        sgroups[ci].anchors = [sgroups[pi]]; // text attached to bracket
                }
            }
            else if (token == "M  SCN") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var si = parseInt(s.substr(10 + k * 8, 3));
                    var conn = s.substr(14 + k * 8, 2);
                    if (JSDraw2.Bracket.cast(sgroups[si]) != null)
                        sgroups[si].conn = conn;
                }
            }
            else if (token == "M  SNC") {
                var n = parseInt(s.substr(6, 3));
                for (var k = 0; k < n; ++k) {
                    var si = parseInt(s.substr(10 + k * 8, 3));
                    var num = scil.Utils.trim(s.substr(14 + k * 8, 2));
                    if (JSDraw2.Bracket.cast(sgroups[si]) != null) {
                        if (sgroups[si].type == "c")
                            sgroups[si].type = "c" + num;
                        else if (sgroups[si].type == "mul")
                            sgroups[si].type = num + "";
                    }
                }
            }
            else if (token == "M  SAL") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                if (sg != null) {
                    var n = parseInt(s.substr(10, 3));
                    for (var k = 0; k < n; ++k) {
                        var ai = parseInt(s.substr(14 + k * 4, 3));
                        var a = this.atoms[ai - 1];
                        if (a != null) {
                            if (sg.type == "SUPERATOM")
                                sg.atoms.push(a);
                            else if (JSDraw2.Bracket.cast(sg) != null)
                                sg.atoms.push(a);
                            else if (JSDraw2.Text.cast(sg) != null)
                                sg.anchors.push(a);
                        }
                    }
                }
            }
            else if (token == "M  SPA") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                if (JSDraw2.Bracket.cast(sg) != null && sg.type == "mul") {
                    var n = parseInt(s.substr(10, 3));
                    for (var k = 0; k < n; ++k) {
                        var ai = parseInt(s.substr(14 + k * 4, 3));
                        var a = this.atoms[ai - 1];
                        if (a != null) {
                            if (sg.spa == null)
                                sg.spa = [];
                            sg.spa.push(a);
                        }
                    }
                }
            }
            else if (token == "M  SBL") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                var n = parseInt(s.substr(10, 3));
                for (var k = 0; k < n; ++k) {
                    var bi = parseInt(s.substr(14 + k * 4, 3));
                    var b = this.bonds[bi - 1];
                    if (b != null && JSDraw2.Text.cast(sg) != null)
                        sg.anchors.push(b);
                }
            }
            else if (token == "M  SDI") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                var n = parseInt(s.substr(10, 3));
                if (sg != null && n == 4) {
                    var p1 = new JSDraw2.Point(parseFloat(s.substr(13, 10)), -parseFloat(s.substr(23, 10)));
                    var p2 = new JSDraw2.Point(parseFloat(s.substr(33, 10)), -parseFloat(s.substr(43, 10)));
                    if (p1.isValid() && p2.isValid()) {
                        if (sg._rect == null)
                            sg._rect = new JSDraw2.Rect().set(p1, p2);
                        else
                            sg._rect.unionPoint(p1).unionPoint(p2);
                    }
                }
            }
            else if (token == "M  SDT") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                if (JSDraw2.Text.cast(sg) != null)
                    sg.fieldtype = scil.Utils.trim(s.substr(11, 30));
            }
            else if (token == "M  SDD") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                if (JSDraw2.Text.cast(sg) != null) {
                    var p = new JSDraw2.Point(parseFloat(s.substr(11, 10)), -parseFloat(s.substr(21, 10)));
                    if (p.isValid())
                        sg._rect = new JSDraw2.Rect(p.x, p.y, 0, 0);
                }
            }
            else if (token == "M  SED") {
                var si = parseInt(s.substr(7, 3));
                var sg = sgroups[si];
                if (JSDraw2.Text.cast(sg) != null)
                    sg.text = scil.Utils.trim(s.substr(11));
            }
            else if (token3 == "A  ") {
                var ai = parseInt(s.substr(3, 3));
                ++i;
                this.atoms[ai - 1].alias = scil.Utils.trim(lines[i]);
            }
            else if (token3 == "V  ") {
                var ai = parseInt(s.substr(3, 3));
                var v = scil.Utils.trim(s.substr(7));
                this.atoms[ai - 1].tag = v;
            }
            else if (token == "M  END") {
                break;
            }
        }

        var superatoms = [];
        var brackets = [];
        var gap = this.medBondLength(1.56) / 2;
        for (var i = 0; i < sgroups.length; ++i) {
            // post-process sgroups
            var sg = sgroups[i];
            if (sg == null)
                continue;
            var br = JSDraw2.Bracket.cast(sg);
            if (sg._rect != null && (br != null || sg.text != null && sg.text != "")) {
                this.addGraphics(sg);
                if (br != null) {
                    if (br.getType() != "")
                    //this.setSgroup(br, "BRACKET_TYPE", br.getType(), br._rect.right() + gap / 4, br._rect.bottom() - gap);
                        this.setSgroup(br, "BRACKET_TYPE", br.subscript || br.getType(), br._rect.right() + gap / 4, br._rect.bottom() - gap);
                    else
                        brackets.push(br);
                    if (br.conn != null && br.conn != "")
                        this.setSgroup(br, "BRACKET_CONN", br.conn.toLowerCase(), br._rect.right() + gap / 4, br._rect.top - gap / 4);
                    JSDraw2.SuperAtoms.collapseRepeat(this, br);
                }
                else {
                    if (scil.Utils.endswith(sg.fieldtype, "_TYPE") && sg.fieldtype != "BRACKET_TYPE")
                        sg.fieldtype = "BRACKET_SUBTYPE";
                    else if (scil.Utils.endswith(sg.fieldtype, "_MOD"))
                        sg.fieldtype = "BRACKET_MOD";
                }
            }
            else if (sg.type == "SUPERATOM") {
                var na = new JSDraw2.Atom(null, "C");
                var m = new JSDraw2.Mol();
                superatoms.push({ a: na, m: m });
                m.atoms = sg.atoms;
                for (var k = 0; k < m.atoms.length; ++k)
                    scil.Utils.removeArrayItem(this.atoms, m.atoms[k]);

                var p = null;
                var apo = 0;
                for (var j = this.bonds.length - 1; j >= 0; --j) {
                    var b = this.bonds[j];
                    var f1 = scil.Utils.indexOf(m.atoms, b.a1);
                    var f2 = scil.Utils.indexOf(m.atoms, b.a2);
                    if (f1 >= 0 && f2 >= 0) {
                        m.bonds.splice(0, 0, b);
                        this.bonds.splice(j, 1);
                    }
                    else if (f1 >= 0) {
                        if (p == null)
                            p = b.a1.p.clone();
                        b.a1.attachpoints.push(++apo);
                        b.apo1 = apo;
                        b.a1 = na;
                    }
                    else if (f2 >= 0) {
                        if (p == null)
                            p = b.a2.p.clone();
                        b.a2.attachpoints.push(++apo);
                        b.apo2 = apo;
                        b.a2 = na;
                    }
                }

                na.p = p != null ? p : m.atoms[0].p.clone();
                na.superatom = m;
                na.alias = sg.subscript;
                switch (sg.cls) {
                    case "AminoAcid":
                    case "AA":
                        na.bio = { type: JSDraw2.BIO.AA };
                        na.elem = na.alias;
                        na.alias = null;
                        break;
                    case "BASE":
                    case "DNA":
                        na.bio = { type: JSDraw2.BIO.BASE_DNA };
                        na.elem = na.alias;
                        na.alias = null;
                        break;
                    case "RNA":
                        na.bio = { type: JSDraw2.BIO.BASE_RNA };
                        na.elem = na.alias;
                        na.alias = null;
                        break;
                }
                this._addAtom(na);
            }
        }

        for (var i = 0; i < brackets.length; ++i) {
            var br = brackets[i];
            var t = this.getSgroupText(br, "BRACKET_TYPE");
            if (t != null)
                brackets[i].type = t.text;

            if (br.atoms != null) {
                for (var k = 0; k < superatoms.length; ++k) {
                    var a = superatoms[k].a;
                    var m = superatoms[k].m;
                    if (scil.Utils.removeArrayItems(br.atoms, m.atoms) > 0)
                        br.atoms.push(a);
                }
            }
        }

        // set R groups: some R groups are only marked using alias
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.elem == "C" && a.alias != null && (/^R[0-9]+$/).test(a.alias)) {
                var alias = a.alias;
                a.alias = null;
                this.setAtomAlias(a, alias);
            }
        }

        if (JSDraw2.defaultoptions.and_enantiomer) {
            if (this.hasStereoCenter() && chiral == "  0")
                this.chiral = "and";
        }
        return this;
    },

    hasRGroup: function () {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.elem == "R")
                return true;
        }
        return false;
    },

    /**
    * Get molfile
    * @function getMolfile
    * @param {bool} rxn - get it as a Rxn file
    * @param {bool} v3000 - render it in Molfile V3000 format
    * @returns a string
    */
    getMolfile: function (rxn, v3000, excludeDummyBonds) {
        if (v3000 == null) {
            if (this.needV3000())
                v3000 = true;
        }

        if (v3000)
            return this.getMolV3000(rxn);
        else
            return this.getMolV2000(rxn, excludeDummyBonds);
    },

    needV3000: function () {
        return this.atoms.length > 999 || this.bonds.length > 999 || this.hasEnhancedStereochemistry();
    },

    getRgfile: function (rxn, rgroups, superatoms) {
        return null;
    },
	
    _getRgroups: function (rgroups) {
        if (rgroups == null)
            rgroups = { n: 0, list: [] };

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            a.iR = null;
            if (a.elem == "R") {
                if (a.alias != null && a.alias.length > 0 && a.alias[0] === 'R') {
                    a.iR = parseInt(a.alias.split('R')[1]);
                    rgroups.n = Math.max(a.iR, rgroups.n);
                } else {
                    a.iR = ++rgroups.n;
                }
                if (a.rgroup != null && a.rgroup.mols.length > 0)
                    rgroups.list.push(a);
            }
        }
        return rgroups;
    },

    getSubMol: function (atoms) {
        var m = this;
        var set = { atoms: scil.clone(atoms), bonds: [], openbonds: [] };
        for (var j = 0; j < m.bonds.length; ++j) {
            var b = m.bonds[j];
            var f1 = scil.Utils.indexOf(atoms, b.a1) >= 0;
            var f2 = scil.Utils.indexOf(atoms, b.a2) >= 0;
            if (f1 && f2) {
                //if (scil.Utils.indexOf(set.atoms, b.a1) < 0)
                //    set.atoms.push(b.a1);
                //if (scil.Utils.indexOf(set.atoms, b.a2) < 0)
                //    set.atoms.push(b.a2);
                set.bonds.push(b);
            }
            else if (f1) {
                //if (scil.Utils.indexOf(set.atoms, b.a1) < 0)
                //    set.atoms.push(b.a1);
                set.openbonds.push({ b: b, oa: b.a2 });
            }
            else if (f2) {
                //if (scil.Utils.indexOf(set.atoms, b.a2) < 0)
                //    set.atoms.push(b.a2);
                set.openbonds.push({ b: b, oa: b.a1 });
            }
        }

        return set;
    },

    expandSuperAtoms: function (superatoms2) {
        superatoms = [];

        var m = this.clone(null);
        var list = scil.clone(m.atoms);
        for (var i = 0; i < list.length; ++i) {
            var a = list[i];
            if (a.superatom != null) {
                var m2 = JSDraw2.SuperAtoms.addToMol(m, a, a.superatom);
                superatoms.push({ a: a, m: m2 });
                if (superatoms2 != null)
                    superatoms2.push({ a: a, m: m2 });
            }
            else if (a.elem == "5'") {
                m.setAtomType(a, "H");
            }
            else if (a.elem == "3'") {
                m.setAtomType(a, "O");
            }
        }

        for (var i = 0; i < m.graphics.length; ++i) {
            var br = JSDraw2.Bracket.cast(m.graphics[i]);
            if (br == null)
                continue;

            if (br.atoms != null && superatoms != null) {
                var atoms = [];
                var m2 = null;
                for (var k = 0; k < br.atoms.length; ++k) {
                    for (var j = 0; j < superatoms.length; ++j) {
                        if (br.atoms[k] == superatoms[j].a) {
                            m2 = superatoms[j].m;
                            break;
                        }
                    }
                    if (m2 == null) {
                        atoms.push(br.atoms[k]);
                    }
                    else {
                        for (var j = 0; j < m2.atoms.length; ++j)
                            atoms.push(m2.atoms[j]);
                    }
                }
                br.atoms = atoms;
            }

            JSDraw2.SuperAtoms.expandRepeat(m, br);
        }

        m.calcHCount(true);
        return m;
    },

    getMolV2000: function (rxn, excludeDummyBonds) {
        var superatoms = [];
        var m = this.expandSuperAtoms(superatoms);
        m.chiral = this.chiral;

        if (excludeDummyBonds) {
            for (var i = m.bonds.length - 1; i >= 0; --i) {
                var b = m.bonds[i];
                if (b.type == JSDraw2.BONDTYPES.DUMMY)
                    m.bonds.splice(i, 1);
            }
        }

        var hasRgroup = false;
        var rgroups = m._getRgroups();
        if (rgroups.list.length > 0)
            return m.getRgfile(rxn, rgroups, superatoms);

        var s = (m.name == null ? "" : m.name) + '\n';
        s += m._getMolHeader();
        s += "\n";
        s += m._getMolV2000(rxn, null, superatoms);
        return s;
    },

    allAtoms: function (list) {
        if (list == null)
            list = [];
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            list.push(a);
            if (a.rgroup != null) {
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].allAtoms(list);
            }
        }
        return list;
    },

    allBonds: function (list) {
        if (list == null)
            list = [];
        for (var i = 0; i < this.bonds.length; ++i)
            list.push(this.bonds[i]);

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.rgroup != null) {
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].allBonds(list);
            }
        }
        return list;
    },

    _getMolTime: function () {
        var dt = new Date();
        var yr = dt.getFullYear() + "";
        return scil.Utils.formatStr(dt.getMonth() + 1, 2, 0).replace(' ', '0') +
            scil.Utils.formatStr(dt.getDate(), 2, 0).replace(' ', '0') +
            yr.substr(2) +
            scil.Utils.formatStr(dt.getHours(), 2, 0).replace(' ', '0') +
            scil.Utils.formatStr(dt.getMinutes(), 2, 0).replace(' ', '0');
    },

    _getMolHeader: function () {
        var dt = new Date();
        var yr = dt.getFullYear() + "";
        return "   JSDraw2" + this._getMolTime() + "2D\n";
    },

    _getMolV2000: function (rxn, rgroups, superatoms) {
        if (rgroups != null)
            this._getRgroups(rgroups);

        var len = this.bondlength > 0 ? this.bondlength : this.medBondLength();
        var scale = len > 0 ? (1.56 / len) : 1.0;

        var s = "";
        s += scil.Utils.formatStr(this.atoms.length, 3, 0);
        s += scil.Utils.formatStr(this.bonds.length, 3, 0);
        s += "  0  0";
        if (this.hasStereoCenter() && this.chiral != "and")
            s += "  1";
        else
            s += "  0";
        s += "  0              0 V2000\n";

        var isotopes = "";
        var radicals = "";
        var tags = "";
        var query = "";
        var rgp = "";
        var apo = "";
        var astr = "";
        this.resetIds();
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.isotope != null)
                isotopes += "M  ISO" + "  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(a.isotope, 4, 0) + "\n";
            if (a.radical >= 1 && a.radical <= 3)
                radicals += "M  RAD  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(a.radical, 4, 0) + "\n";
            if (a.tag != null && a.tag != "")
                tags += "V  " + scil.Utils.formatStr(i + 1, 3, 0) + " " + a.tag + "\n";
            if (a.alias != null && a.alias != "")
                astr += "A  " + scil.Utils.formatStr(i + 1, 3, 0) + "\n" + a.alias + "\n";
            for (var k = 0; k < a.attachpoints.length; ++k)
                apo += "M  APO  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(a.attachpoints[k], 4, 0) + "\n";
            if (a.query != null) {
                if (a.query.als != null && a.query.als.length > 0) {
                    query += "M  ALS " + scil.Utils.formatStr(i + 1, 3, 0) + scil.Utils.formatStr(a.query.als.length, 3, 0) + (a.query.t == false ? " T " : " F ");
                    for (var k = 0; k < a.query.als.length; ++k)
                        query += scil.Utils.padright(a.query.als[k], 4, ' ');
                    query += "\n";
                }
                if (a.query.rbc != null)
                    query += "M  RBC  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(a.query.rbc == 0 ? -1 : a.query.rbc, 4, 0) + "\n";
                if (a.query.uns != null)
                    query += "M  UNS  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(a.query.uns ? 1 : 0, 4, 0) + "\n";
                if (a.query.sub != null)
                    query += "M  SUB  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(a.query.sub == 0 ? -1 : (a.query.sub == '*' ? -2 : a.query.sub), 4, 0) + "\n";
            }

            var elem = a.elem;
            if (a.elem == "R") {
                if (a.iR > 0) {
                    elem = "R#";
                    rgp += "M  RGP  1" + scil.Utils.formatStr(i + 1, 4, 0) + scil.Utils.formatStr(parseInt(a.iR), 4, 0) + "\n";
                }
                else {
                    elem = "R";
                }
            }
            else if (elem == "H") {
                if (a.isotope == 2)
                    elem = "D";
                else if (a.isotope == 3)
                    element = "T";
            }

            s += scil.Utils.formatStr(a.p.x * scale, 10, 4);
            s += scil.Utils.formatStr(-a.p.y * scale, 10, 4);
            s += scil.Utils.formatStr(0, 10, 4);
            s += ' ';
            s += scil.Utils.padright(elem, 2, ' ');
            s += '  0';
            var c = 0;
            switch (a.charge) {
                case 1:
                    c = 3;
                    break;
                case 2:
                    c = 2;
                    break;
                case 3:
                    c = 1;
                    break;
                case -1:
                    c = 5;
                    break;
                case -2:
                    c = 6;
                    break;
                case -3:
                    c = 7;
                    break;
            }
            s += scil.Utils.formatStr(c, 3, 0);

            s += "  0";
            if (a.hs > 0)
                s += scil.Utils.formatStr(a.hs, 3, 0);
            else
                s += "  0";

            s += "  0  0";
            if (a.val > 0)
                s += scil.Utils.formatStr(a.val, 3, 0);
            else
                s += "  0";

            s += "  0  0";
            if (rxn && a.atommapid > 0)
                s += scil.Utils.formatStr(a.atommapid, 3, 0);
            else
                s += "  0";
            s += '  0  0\n';
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];

            s += scil.Utils.formatStr(b.a1.id, 3, 0);
            s += scil.Utils.formatStr(b.a2.id, 3, 0);

            var order = 0;
            var stereo = 0;
            switch (b.type) {
                case JSDraw2.BONDTYPES.UNKNOWN:
                    order = 8;
                    break;
                case JSDraw2.BONDTYPES.DUMMY:
                    order = 9;
                    break;
                case JSDraw2.BONDTYPES.DOUBLEORAROMATIC:
                    order = 7;
                    break;
                case JSDraw2.BONDTYPES.SINGLEORAROMATIC:
                    order = 6;
                    break;
                case JSDraw2.BONDTYPES.SINGLEORDOUBLE:
                    order = 5;
                    break;
                case JSDraw2.BONDTYPES.SINGLE:
                case JSDraw2.BONDTYPES.DOUBLE:
                case JSDraw2.BONDTYPES.TRIPLE:
                case JSDraw2.BONDTYPES.DELOCALIZED:
                    order = b.type;
                    stereo = 0;
                    break;
                case JSDraw2.BONDTYPES.PEPTIDE:
                case JSDraw2.BONDTYPES.NUCLEOTIDE:
                case JSDraw2.BONDTYPES.DISULFIDE:
                case JSDraw2.BONDTYPES.AMIDE:
                    order = 1;
                    stereo = 0;
                    break;
                case JSDraw2.BONDTYPES.WEDGE:
                case JSDraw2.BONDTYPES.BOLD:
                    order = 1;
                    stereo = 1;
                    break;
                case JSDraw2.BONDTYPES.HASH:
                case JSDraw2.BONDTYPES.BOLDHASH:
                    order = 1;
                    stereo = 6;
                    break;
                case JSDraw2.BONDTYPES.WIGGLY:
                    order = 1;
                    stereo = 4;
                    break;
                case JSDraw2.BONDTYPES.EITHER:
                    order = 2;
                    stereo = 3;
                    break;
            }
            s += scil.Utils.formatStr(order, 3, 0);
            s += scil.Utils.formatStr(stereo, 3, 0);
            s += scil.Utils.formatStr(0, 3, 0);
            if (b.ring != null)
                s += scil.Utils.formatStr(b.ring ? 1 : 2, 3, 0);
            else
                s += scil.Utils.formatStr(0, 3, 0);
            s += scil.Utils.formatStr(b.rcenter == null ? 0 : b.rcenter, 3, 0);
            s += "\n";
        }

        s += isotopes;
        s += radicals;
        s += tags;
        s += astr;
        s += query;
        s += rgp;
        s += apo;

        var nSTY = 0;
        if (superatoms != null) {
            for (var i = 0; i < superatoms.length; ++i) {
                var a = superatoms[i].a;
                var m = superatoms[i].m;
                if (m == null)
                    continue;

                ++nSTY;
                var sty = scil.Utils.formatStr(nSTY, 3, 0);
                s += "M  STY  1 " + sty + " SUP\n";
                s += this.writeList("M  SAL " + sty, m.atoms, "id", 4, 8);
                s += this.writeList("M  SBL " + sty, m.bonds, "bondid", 4, 8);

                s += "M  SMT " + sty + " " + (a.alias == null ? a.elem : a.alias) + "\n";
                if (a.bio != null)
                    s += "M  SCL " + sty + " " + a.biotype() + "\n";
            }
        }

        var texts = [];
        for (var i = 0; i < this.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t != null)
                texts.push(t);
        }

        // SGroup
        var sgroupdata = "";
        var id = { k: nSTY };
        var brackets = [];
        for (var i = 0; i < this.graphics.length; ++i) {
            var br = JSDraw2.Bracket.cast(this.graphics[i]);
            if (br == null)
                continue;
            brackets.push(br);
            var r = br._rect;

            var bracketatoms = null;
            var bracketbonds = null;
            if (br.atoms.length > 0) {
                bracketatoms = this.getExpandedAtoms(br.expandedatoms == null ? br.atoms : br.expandedatoms);
                bracketbonds = br.getXbonds(this);
            }

            var k = ++id.k;
            var connectivity = null;
            var sgroup = { sty: "", spl: "", data: "", id: id };
            var tp = br.getType();
            var snc = br.getTypeNum();
            sgroup.subscript = tp;

            var type = JSDraw2.SGroup.stys[tp];
            if (type == null) {
                if (bracketbonds != null && bracketbonds.length == 2)
                    type = "SRU";
                else
                    type = "GEN";
            }
            sgroup.sty += " " + scil.Utils.formatStr(k, 3, 0) + " " + type;
            var fieldtype = JSDraw2.SGroup.fieldtypes[tp];
            if (fieldtype == null)
                fieldtype = "BRACKET";
            var custom = type == null;

            var subscript = null;
            for (var j = 0; j < texts.length; ++j) {
                var t = texts[j];
                if (t != null && t.anchors.length == 1 && t.anchors[0] == br) {
                    if (t.fieldtype == "BRACKET_CONN") {
                        connectivity = t.text;
                    }
                    else if (t.fieldtype != "BRACKET_TYPE" || t.text != tp && tp != "mul" || custom) {
                        var ft = t.fieldtype;
                        if (fieldtype != null && ft != null && ft.length > 8 && ft.substr(0, 8) == "BRACKET_") {
                            if (ft == "BRACKET_SUBTYPE")
                                ft = fieldtype + "_TYPE";
                            else
                                ft = fieldtype + ft.substr(7);
                        }

                        if (type == "SRU")
                            sgroup.subscript = t.text;
                        else
                            this.getDataGroup(t.text, ft, t._rect.left * scale, -t._rect.top * scale, k, sgroup);
                    }
                    else if (t.fieldtype == "BRACKET_TYPE" && tp == "mul") {
                        subscript = t.text;
                    }
                    texts[j] = null;
                }
            }

            sgroupdata += "M  STY" + scil.Utils.formatStr(sgroup.sty.length / 8, 3, 0) + sgroup.sty + "\n";
            //sgroupdata += "M  SLB  1   1   1\n";

            if (connectivity == "ht" || connectivity == "hh" || connectivity == "eu")
                sgroupdata += "M  SCN" + scil.Utils.formatStr(1, 3, 0) + " " + scil.Utils.formatStr(k, 3, 0) + " " + connectivity.toUpperCase() + " \n";
            if (snc != null)
                sgroupdata += "M  SNC" + scil.Utils.formatStr(1, 3, 0) + " " + scil.Utils.formatStr(k, 3, 0) + " " + scil.Utils.padLeft(snc, 3, ' ') + " \n";
            if (sgroup.spl != "")
                sgroupdata += "M  SPL" + scil.Utils.formatStr(sgroup.spl.length / 8, 3, 0) + sgroup.spl + "\n";
            if (br.atoms.length > 0) {
                sgroupdata += this.writeList("M  SAL " + scil.Utils.formatStr(k, 3, 0), bracketatoms, "id", 4, 8);
                sgroupdata += this.writeList("M  SBL " + scil.Utils.formatStr(k, 3, 0), bracketbonds, "id", 4, 8);

                if (!scil.Utils.isNullOrEmpty(sgroup.subscript) && /* I#10773 */!(type == "MUL" && sgroup.subscript == "mul"))
                    sgroupdata += "M  SMT   1 " + sgroup.subscript + "\n";

                atoms = br.atoms;
                if (br.type != "n" || type == "SRU")
                    sgroupdata += this.writeList("M  SPA " + scil.Utils.formatStr(k, 3, 0), atoms, "id", 4, 8);
            }

            sgroupdata += "M  SDI " + scil.Utils.formatStr(k, 3, 0) + "  4";
            sgroupdata += scil.Utils.formatStr(br._rect.left * scale, 10, 4);
            sgroupdata += scil.Utils.formatStr(-br._rect.bottom() * scale, 10, 4);
            sgroupdata += scil.Utils.formatStr(br._rect.left * scale, 10, 4);
            sgroupdata += scil.Utils.formatStr(-br._rect.top * scale, 10, 4);
            sgroupdata += "\n";

            sgroupdata += "M  SDI " + scil.Utils.formatStr(k, 3, 0) + "  4";
            sgroupdata += scil.Utils.formatStr(br._rect.right() * scale, 10, 4);
            sgroupdata += scil.Utils.formatStr(-br._rect.top * scale, 10, 4);
            sgroupdata += scil.Utils.formatStr(br._rect.right() * scale, 10, 4);
            sgroupdata += scil.Utils.formatStr(-br._rect.bottom() * scale, 10, 4);
            sgroupdata += "\n";

            if (subscript != null && subscript != "") {
                sgroupdata += "M  SMT " + scil.Utils.formatStr(k, 3, 0) + " " + subscript;
                sgroupdata += "\n";
            }

            sgroupdata += sgroup.data;
        }

        for (var i = 0; i < texts.length; ++i) {
            var t = texts[i];
            if (t == null)
                continue;

            var k = id.k;
            var sgroup = { sty: "", spl: "", data: "", id: id };
            this.getDataGroup(t.text, t.fieldtype, t._rect.left * scale, -t._rect.top * scale, null, sgroup);
            sgroupdata += "M  STY" + scil.Utils.formatStr(sgroup.sty.length / 8, 3, 0) + sgroup.sty + "\n";

            // I#11604
            if (id.k == k)
                ++id.k;
            k = id.k;

            var sal = "";
            var sbl = "";
            for (var j = 0; j < t.anchors.length; ++j) {
                var a = t.anchors[j];
                if (JSDraw2.Atom.cast(a) != null)
                    sal += " " + scil.Utils.formatStr(a.atomid, 3, 0);
                else if (JSDraw2.Bond.cast(a) != null)
                    sbl += " " + scil.Utils.formatStr(a.bondid, 3, 0);
            }
            if (sal != "")
                sgroupdata += "M  SAL " + scil.Utils.formatStr(k, 3, 0) + scil.Utils.formatStr(sal.length / 4, 3, 0) + sal + "\n";
            if (sbl != "")
                sgroupdata += "M  SBL " + scil.Utils.formatStr(k, 3, 0) + scil.Utils.formatStr(sbl.length / 4, 3, 0) + sbl + "\n";

            sgroupdata += sgroup.data;
        }

        s += sgroupdata;
        s += "M  END\n";
        return s;
    },

    getExpandedAtoms: function (atoms) {
        var ret = [];
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            if (a.superatom == null) {
                ret.push(a);
            }
            else {
                for (var k = 0; k < a.superatom.atoms.length; ++k)
                    ret.push(a.superatom.atoms[i]);
            }
        }
        return ret;
    },

    writeList: function (prefix, list, key, chars, countperline) {
        if (list == null || list.Length == 0)
            return "";

        var s = "";
        countlastline = list.length % countperline;
        if (countlastline == 0)
            countlastline = countperline;
        lines = (list.length - countlastline) / countperline + 1;

        for (var i = 0; i < lines; ++i) {
            var countthisline = i + 1 == lines ? countlastline : countperline;
            s += prefix;
            s += scil.Utils.formatStr(countthisline, 3);
            for (var j = 0; j < countthisline; ++j)
                s += scil.Utils.formatStr(list[i * countperline + j][key], chars);
            s += "\n";
        }

        return s;
    },

    getMolV3000: function (rxn) {
        var superatoms = [];
        var m = this.expandSuperAtoms(superatoms);
        m.chiral = this.chiral;
        return m._getMolV3000();
    },

    _getMolV3000: function (rxn) {
        var len = this.bondlength > 0 ? this.bondlength : this.medBondLength();
        var scale = len > 0 ? (1.56 / len) : 1.0;

        this.resetIds();

        var dt = new Date();
        var yr = dt.getFullYear() + "";

        var s = '';
        if (!rxn) {
            s += (this.name == null ? "" : this.name) + '\n';
            s += "   JSDraw " + scil.Utils.formatStr(dt.getMonth() + 1, 2, 0).replace(' ', '0') +
            scil.Utils.formatStr(dt.getDate(), 2, 0).replace(' ', '0') +
            yr.substr(2) +
            scil.Utils.formatStr(dt.getHours(), 2, 0).replace(' ', '0') +
            scil.Utils.formatStr(dt.getMinutes(), 2, 0).replace(' ', '0') + "2D\n";
            s += "\n";
            s += "  0  0        0               999 V3000\n";
        }

        var enhancedstereochemistry = this.getEnhancedStereochemistry();
        var chiral = this.hasStereoCenter() || !scil.Utils.isNullOrEmpty(enhancedstereochemistry);

        s += "M  V30 BEGIN CTAB\n";
        s += "M  V30 COUNTS " + this.atoms.length + " " + this.bonds.length + " 0 0 " + (chiral ? 1 : 0) + "\n";

        s += "M  V30 BEGIN ATOM\n";
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            var elem = a.elem;
            if (elem == "R") {
                if (a.iR > 0)
                    elem = "R#";
                else
                    elem = "R";
            }
            else if (elem == "H") {
                if (a.isotope == 2)
                    elem = "D";
                else if (a.isotope == 3)
                    element = "T";
            }

            s += "M  V30 " + a.id + ' ' + elem;
            s += ' ' + scil.Utils.formatStr(a.p.x * scale, 0, 4);
            s += ' ' + scil.Utils.formatStr(-a.p.y * scale, 0, 4);
            s += " 0 " + (rxn && a.atommapid > 0 ? a.atommapid : 0);
            if (a.charge != null && a.charge != 0)
                s += " CHG=" + a.charge;
            if (a.radical >= 1 && a.radical <= 3)
                s += " RAD=" + a.radical;

            //if (chiralatoms[a.id] != null)
            //    s += " CFG=" + chiralatoms[a.id];

            s += "\n";
        }
        s += "M  V30 END ATOM\n";
        s += "M  V30 BEGIN BOND\n";
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            var order = 0;
            var stereo = 0;
            switch (b.type) {
                case JSDraw2.BONDTYPES.UNKNOWN:
                    order = 8;
                    break;
                case JSDraw2.BONDTYPES.DUMMY:
                    order = 9;
                    break;
                case JSDraw2.BONDTYPES.DOUBLEORAROMATIC:
                    order = 7;
                    break;
                case JSDraw2.BONDTYPES.SINGLEORAROMATIC:
                    order = 6;
                    break;
                case JSDraw2.BONDTYPES.SINGLEORDOUBLE:
                    order = 5;
                    break;
                case JSDraw2.BONDTYPES.SINGLE:
                case JSDraw2.BONDTYPES.DOUBLE:
                case JSDraw2.BONDTYPES.TRIPLE:
                case JSDraw2.BONDTYPES.DELOCALIZED:
                    order = b.type;
                    stereo = 0;
                    break;
                case JSDraw2.BONDTYPES.WEDGE:
                    order = 1;
                    stereo = 1;
                    break;
                case JSDraw2.BONDTYPES.HASH:
                    order = 1;
                    stereo = 3;
                    break;
                case JSDraw2.BONDTYPES.WIGGLY:
                    order = 1;
                    stereo = 2;
                    break;
                case JSDraw2.BONDTYPES.EITHER:
                    order = 2;
                    stereo = 2;
                    break;
            }
            s += "M  V30 " + (i + 1) + ' ' + order + ' ' + b.a1.id + ' ' + b.a2.id;
            if (stereo > 0)
                s += " CFG=" + stereo;
            if (b.ring != null)
                s += " TOPO=" + (b.ring ? 1 : 2);
            if (rxn && b.rcenter > 0)
                s += " RXCTR=" + b.rcenter;
            s += "\n";
        }

        s += "M  V30 END BOND\n";
        s += enhancedstereochemistry;
        s += "M  V30 END CTAB\n";
        s += "M  END\n";
        return s;
    },

    hasStereoCenter: function () {
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.type == JSDraw2.BONDTYPES.WEDGE || b.type == JSDraw2.BONDTYPES.HASH)
                return true;
        }

        return false;
    },

    hasEnhancedStereochemistry: function () {
        return false;
    },

    getEnhancedStereochemistry: function () {
        return "";
    },

    setMolV3000: function (lines, start, rxn, pos, endtoken) {
        return this;
    },

    readV30Collections: function (lines, i, atommap) {
    },

    readV30Bonds: function (lines, i, atommap, rxn) {
    },

    getChiralAtom: function (t) {
        if (t == null || t.anchors == null || t.anchors.length != 1 || t.fieldtype != "CHIRAL")
            return null;
        var a = JSDraw2.Atom.cast(t.anchors[0]);
        if (a == null)
            return null;
        return JSDraw2.Atom.isValidChiral(t.text) ? a : null;
    },

    markChirality: function (a, c, bondlength) {
        return false;
    },

    findBestPostion: function (a, bondlength) {
        var atoms = a._parent.getNeighborAtoms(a);
        var p = a.p.clone();
        if (atoms != null && atoms.length > 0) {
            var deg = atoms[0].p.angleTo(a.p);
            p.offset(bondlength * 0.37, 0);
            p.rotateAround(a.p, deg - 60);

            p.x -= bondlength * 0.25;
            p.y -= bondlength * 0.25;
        }
        else {
            p.x -= bondlength * 0.25;
            p.y -= bondlength * 0.75;
        }
        return p;
    },

    readRxnCenter: function (bond, s) {
        var rcenter = s == null ? null : parseInt(s);
        switch (rcenter) {
            case -1:
                bond.rcenter = JSDraw2.RXNCENTER.NOTCENTER;
                break;
            case 1:
                bond.rcenter = JSDraw2.RXNCENTER.CENTER;
                break;
            case 12:
            case 13:
                bond.rcenter = JSDraw2.RXNCENTER.BREAKANDCHANGE;
                break;
            case 4:
            case 5:
                bond.rcenter = JSDraw2.RXNCENTER.BREAK;
                break;
            case 8:
            case 9:
                bond.rcenter = JSDraw2.RXNCENTER.CHANGE;
                break;
        }
    },

    readV30Atoms: function (lines, i, atommap, rxn) {

    },

    readV30Counts: function (lines, i, counts) {

    },

    parseV30Attributes: function (ss, start) {
        return null;
    },

    getDataGroup: function (data, key, x, y, k2, sgroup) {

    },

    containsWord: function (word) {
        word = word.toLowerCase();
        for (var i = 0; i < this.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t != null && scil.Utils.containsWord(t.text, word, true))
                return true;
        }
        return false;
    },

    containsText: function (s) {
        s = s.toLowerCase();
        for (var i = 0; i < this.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t != null && t.text != null && t.text.toLowerCase().indexOf(s) >= 0)
                return true;
        }
        return false;
    },

    /**
    * Get Mol property
    * @function getProp
    * @param {string} k - the property name
    * @returns the property
    */
    getProp: function (k) {
        return this.props == null ? null : this.props[k];
    },

    /**
    * Set Mol property
    * @function setProp
    * @param {string} k - the property name
    * @param {object} v - the property value
    * @returns null
    */
    setProp: function (k, v) {
        if (v == null) {
            if (this.props != null)
                delete this.props[k];
        }
        else {
            if (this.props == null)
                this.props = {};
            this.props[k] = v + "";
        }
    },

    /**
    * Set RGfile
    * @function setRgfile
    * @param {string} rgfile - the input rgfile
    * @returns the Mol object
    */
    setRgfile: function (rgfile) {
        return null;
    },

    _setParent: function (m) {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i]._parent = m;
        for (var i = 0; i < this.bonds.length; ++i)
            this.bonds[i]._parent = m;
        for (var i = 0; i < this.graphics.length; ++i)
            this.graphics[i]._parent = m;
    },

    _setGroup: function (g) {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].group = g;
        for (var i = 0; i < this.bonds.length; ++i)
            this.bonds[i].group = g;
    },

    toggleAtom: function (p, tor) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.toggle(p, tor))
                return a;

            if (a.rgroup != null) {
                var list = a.rgroup.mols;
                for (var j = 0; j < list.length; ++j) {
                    var r = list[j].toggleAtom(p, tor);
                    if (r != null)
                        return r;
                }
            }
        }
        return null;
    },

    toggle: function (p, tor) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            if (a.toggle(p, tor))
                return a;

            if (a.rgroup == null)
                continue;

            if (a.rgroup.toggle(p, tor))
                return a.rgroup;

            var list = a.rgroup.mols;
            for (var j = 0; j < list.length; ++j) {
                var r = list[j].toggle(p, tor);
                if (r != null)
                    return r;
            }
        }

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.toggle(p, tor))
                return this.bonds[i];
        }

        for (var i = this.graphics.length - 1; i >= 0; --i) {
            var g = this.graphics[i];
            if (g.toggle(p, tor))
                return this.graphics[i];
        }
        return null;
    },

    /**
    * Set Rxnfile
    * @function setRxnfile
    * @param {string} rxnfile - the input rxnfile
    * @returns the Mol object
    */
    setRxnfile: function (rxnfile) {
        return this;
    },

    setRxnV3000: function (lines) {
        return this;
    },

    readCtabs: function (lines, i, n, list, endtoken) {
        for (var k = 0; k < n; ++k) {
            var m = new JSDraw2.Mol();
            var pos = {};
            m.setMolV3000(lines, i, true, pos, endtoken);
            i = pos.i;
            if (!m.isEmpty())
                list.push(m);
        }
        return i;
    },

    setRxnV2000: function (lines) {
        return this;
    },

    setRxn: function (rxn, bondlength) {
        return this;
    },

    /**
    * Get Rxnfile
    * @function getRxnfile
    * @param {bool} groupbyplus - indicate if grouping reactants/products by explicit plus signs
    * @param {bool} v3000 - indicate if rendering the rxnfile in V3000 format
    * @returns a string
    */
    getRxnfile: function (groupbyplus, v3000) {
        var rxn = this.parseRxn(true, groupbyplus);
        if (rxn == null)
            return null;

        if (v3000)
            return this.getRxnV3000(rxn);
        else
            return this.getRxnV2000(rxn);
    },

    getAllBrackets: function () {
        var list = [];
        for (var j = 0; j < this.graphics.length; ++j) {
            var b = this.graphics[j];
            if (JSDraw2.Bracket.cast(b) != null)
                list.push(b);
        }
        return list;
    },

    getAllTexts: function () {
        var list = [];
        for (var j = 0; j < this.graphics.length; ++j) {
            var b = this.graphics[j];
            if (JSDraw2.Text.cast(b) != null)
                list.push(b);
        }
        return list;
    },

    getRxnV2000: function (rxn) {
        return null;
    },

    getRxnV3000: function (rxn, groupbyplus) {
        return null;
    },

    /**
    * Get JSDraw xml file format
    * @function getXml
    * @param {number} width - the width of the view
    * @param {number} height - the height of the view
    * @param {bool} viewonly - in viewonly mode
    * @returns a string
    */
    getXml: function (width, height, viewonly, svg, len) {
        return this._getXml(width, height, viewonly, svg, len);
    },

    getHtml: function (width, height, viewonly, svg, len) {
        return this.getXml(width, height, viewonly, svg, len);
    },

    _getXml: function (width, height, viewonly, svg, len, inside) {
        return null;
    },

    /**
    * Set Secptrum JDX data
    * @function setJdx
    * @param {string} data - JDX string
    * @returns a Mol object
    */
    setJdx: function (data, bondlength) {
        return this;
    },

    /**
    * Set JSDraw xml file format
    * @function setXml
    * @param {string} xml - the input JSDraw html/xml string
    * @returns a Mol object
    */
    setXml: function (xml) {
        return this;
    },

    setHtml: function (xml) {
        return this.setXml(xml);
    },

    toScreen: function (screenBondLength) {
        var len = this.medBondLength();
        if (!(len > 0))
            len = 1.56;

        var scale = screenBondLength / len;
        this.scale(scale);
        return scale;
    },

    /**
    * Scale the molecule
    * @function scale
    * @param {number} scale - the scaling factor
    * @param {Point} origin - the origin of scaling
    * @returns null
    */
    scale: function (scale, origin) {
        if (!(scale > 0))
            return;

        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            a.p.scale(scale, origin);
            if (a.rgroup != null) {
                if (a.rgroup != null)
                    a.rgroup.scale(scale, origin);
                for (var j = 0; j < a.rgroup.mols.length; ++j)
                    a.rgroup.mols[j].scale(scale, origin);
            }
        }

        for (var i = 0; i < this.graphics.length; ++i)
            this.graphics[i].scale(scale, origin);
    },

    /**
    * Flip the molecule around an X axis
    * @function flipX
    * @param {number} x - the x axis
    * @returns null
    */
    flipX: function (x) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var p = this.atoms[i].p;
            p.x = x - (p.x - x);
        }
        for (var i = 0; i < this.graphics.length; ++i)
            this.graphics[i].flipX(x);
    },

    /**
    * Flip the molecule around a Y axis
    * @function flipY
    * @param {number} y - the y axis
    * @returns null
    */
    flipY: function (y) {
        for (var i = 0; i < this.atoms.length; ++i) {
            var p = this.atoms[i].p;
            p.y = y - (p.y - y);
        }
        for (var i = 0; i < this.graphics.length; ++i)
            this.graphics[i].flipY(y);
    },

    clearFlag: function () {
        for (var i = 0; i < this.atoms.length; ++i) {
            this.atoms[i].f = null;
            this.atoms[i].ringclosures = null;
        }
        for (var i = 0; i < this.bonds.length; ++i)
            this.bonds[i].f = null;
    },

    _connectFragsByPlus: function (frags, bondlen) {
        return null;
    },

    _splitFrags: function (frags) {
        for (var i = 0; i < frags.length; ++i) {
            var ss = frags[i].splitFragments();
            if (ss.length > 0) {
                frags.splice(i, 1);
                for (var k = 0; k < ss.length; ++k)
                    frags.splice(i, 0, ss[k]);
                i += ss.length - 1;
            }
        }
    },

    _connectNextLine: function (frags, rect, above, arrow, bondlen) {
        return null;
    },

    detectRxn: function (arrow) {
        return null;
    },

    _findCloseTexts: function (t, texts, dy, ret) {
        for (var k = 0; k < texts.length; ++k) {
            var x = texts[k];
            if (x == null)
                continue;

            var r1 = t.rect();
            var r2 = x.rect();
            if (Math.abs(r1.top - r2.top) < dy || Math.abs(r1.top - r2.bottom()) < dy ||
                        Math.abs(r1.bottom() - r2.top) < dy || Math.abs(r1.bottom() - r2.bottom()) < dy) {
                var overlap = Math.min(r1.right(), r2.right()) - Math.max(r1.left, r2.left);
                if (overlap >= Math.min(r1.width, r2.width) / 2) {
                    ret.push(x);
                    texts[k] = null;
                }
            }
        }
    },

    parseRxn2: function () {
        return null;
    },

    /**
    * Test if the molecule is a reaction
    * @function isRxn
    * @returns true or false
    */
    isRxn: function () {
        return null;
    },

    _groupByPlus: function (rxn) {
        if (rxn == null)
            return rxn;

        var pluses = [];
        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i].T == 'PLUS')
                pluses.push(this.graphics[i]);
        }

        if (pluses.length == 0) {
            if (rxn.reactants.length > 1) {
                for (var i = 1; i < rxn.reactants.length; ++i)
                    rxn.reactants[0].mergeMol(rxn.reactants[i]);
                rxn.reactants = [rxn.reactants[0]];
            }
            if (rxn.products.length > 1) {
                for (var i = 1; i < rxn.products.length; ++i)
                    rxn.products[0].mergeMol(rxn.products[i]);
                rxn.products = [rxn.products[0]];
            }
        }
        else {
            // order by x
            var xx = [];
            for (var i = 0; i < pluses.length; ++i) {
                var x = pluses[i].p.x;
                var p = xx.length;
                for (var k = 0; k < xx.length; ++k) {
                    if (x < xx[k]) {
                        p = k;
                        break;
                    }
                }

                xx.splice(p, 0, x);
            }

            rxn.reactants = this._groupByPlus2(xx, rxn.reactants);
            rxn.products = this._groupByPlus2(xx, rxn.products);
        }
        return rxn;
    },

    _groupByPlus2: function (pluses, mols) {
        var list = [];
        var n = pluses.length;
        for (var i = 0; i < mols.length; ++i) {
            var m = mols[i];
            var cx = mols[i].center().x;
            var f = false;
            for (var k = 0; k < n; ++k) {
                if (cx < pluses[k]) {
                    if (list[k] == null)
                        list[k] = m;
                    else
                        list[k].mergeMol(m);
                    f = true;
                    break;
                }
            }

            if (!f) {
                if (list[n] == null)
                    list[n] = m;
                else
                    list[n].mergeMol(m);
            }
        }

        var ret = [];
        for (var i = 0; i < list.length; ++i) {
            if (list[i] != null)
                ret.push(list[i]);
        }
        return ret;
    },

    /**
    * Parse the molecule as a reaction
    * @function parseRxn
    * @returns a Reaction object: { reactants, products, arrow, above, below }
    */
    parseRxn: function (copygraphics, groupbyplus) {
        var rxn = this._parseRxn();
        if (groupbyplus)
            rxn = this._groupByPlus(rxn);

        //        if (rxn != null && copygraphics) {
        //            var brackets = this.getAllBrackets();
        //            var texts = this.getAllTexts();
        //            this._addGraphicsRxnMol(rxn.reactants, brackets, texts);
        //            this._addGraphicsRxnMol(rxn.products, brackets, texts);
        //        }

        return rxn;
    },

    _addGraphicsRxnMol: function (mols, brackets, texts) {
        for (var i = 0; i < mols.length; ++i) {
            var m = mols[i];
            for (var k = 0; k < brackets.length; ++k) {
                var b = brackets[k];
                if (b != null && b.allAtomsIn(m)) {
                    m.graphics.push(b);
                    brackets[k] = null;
                }
            }
            for (var k = 0; k < texts.length; ++k) {
                var b = texts[k];
                if (b != null && b.allAnchorsIn(m)) {
                    m.graphics.push(b);
                    brackets[k] = null;
                }
            }
        }
    },

    _parseRxn: function () {
        return null;
    },

    _hasOverlap: function (left, right, rect) {
        var l = rect.left;
        var r = rect.right();
        return l < right && r > left;
    },

    _sortTextByTop: function (texts) {
        if (texts == null || texts.length == 0)
            return texts;

        var yy = [];
        var sorted = [];
        for (var i = 0; i < texts.length; ++i) {
            var y = texts[i]._rect.top;
            var p = yy.length;
            for (var k = 0; k < yy.length; ++k) {
                if (y < yy[k]) {
                    p = k;
                    break;
                }
            }

            yy.splice(p, 0, y);
            sorted.splice(p, 0, texts[i]);
        }

        return sorted;
    },

    /**
    * Get the whole fragment containing an input atom
    * @function getFragment
    * @param {Atom} a - the input atom
    * @returns a Mol object
    */
    getFragment: function (a, parent) {
        this.setAtomBonds();
        this.clearFlag();

        var tree = this._getTree(a).tree;
        var path = [];
        tree.list(path, "breadthfirst");

        var m = new JSDraw2.Mol();
        for (var k = 0; k < path.length; ++k) {
            var b = path[k];
            if (b.a != null && b.ringclosure == null)
                m._addAtom(b.a, parent);
            if (b.b != null)
                m._addBond(b.b, parent);
        }
        return m;
    },

    /**
    * Split it into fragments
    * @function splitFragments
    * @returns an array of Mol
    */
    splitFragments: function (skipHiddenAtoms) {
        this.clearFlag();

        var fragid = -1;
        var bonds = scil.Utils.cloneArray(this.bonds);
        while (bonds.length > 0) {
            var b = bonds[0];
            if (skipHiddenAtoms) {
                if (b.a1.hidden || b.a2.hidden) {
                    bonds.splice(0, 1);
                    continue;
                }
            }
            b.f = b.a1.f = b.a2.f = ++fragid;
            bonds.splice(0, 1);

            while (true) {
                var n = 0;
                for (var i = bonds.length - 1; i >= 0; --i) {
                    var b = bonds[i];
                    if (b.a1.hidden || b.a2.hidden) {
                        bonds.splice(i, 1);
                        continue;
                    }

                    if (b.f == null && (b.a1.f == fragid || b.a2.f == fragid)) {
                        b.f = b.a1.f = b.a2.f = fragid;
                        bonds.splice(i, 1);
                        ++n;
                    }
                }

                if (n == 0)
                    break;
            }
        }

        var frags = [];
        for (var k = 0; k <= fragid; ++k) {
            var m = new JSDraw2.Mol();
            frags.push(m);

            for (var i = 0; i < this.atoms.length; ++i) {
                if (this.atoms[i].f == k)
                    m._addAtom(this.atoms[i], this);
            }

            for (var i = 0; i < this.bonds.length; ++i) {
                if (this.bonds[i].f == k)
                    m._addBond(this.bonds[i], this);
            }
        }

        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i].f == null) {
                if (skipHiddenAtoms && this.atoms[i].hidden)
                    continue;

                var m = new JSDraw2.Mol();
                frags.push(m);
                m._addAtom(this.atoms[i], this);
            }
        }

        // brackets
        for (var i = 0; i < this.graphics.length; ++i) {
            var br = JSDraw2.Bracket.cast(this.graphics[i]);
            if (br == null)
                continue;

            for (var k = 0; k < frags.length; ++k) {
                if (br.atoms == null || br.atoms.length == 0)
                    continue;
                if (frags[k].containsAllAtoms(br.atoms)) {
                    frags[k].graphics.push(br);
                    for (var j = 0; j < this.graphics.length; ++j) {
                        var t = JSDraw2.Text.cast(this.graphics[j]);
                        if (t != null && t.anchors != null && t.anchors.length == 1 && t.anchors[0] == br)
                            frags[k].graphics.push(t);
                    }
                }
            }
        }

        // attached texts
        for (var i = 0; i < this.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t == null || t.anchors == null || t.anchors.length == 0)
                continue;

            for (var k = 0; k < frags.length; ++k) {
                if (frags[k].containsAllAtoms(t.anchors))
                    frags[k].graphics.push(t);
            }
        }


        // set chiral flags
        for (var i = 0; i < frags.length; ++i) {
            var frag = frags[i];
            for (var j = 0; j < frag.atoms.length; ++j) {
                var g = frag.atoms[j].group;
                if (g != null && g.type == "chiral") {
                    frag.chiral = true;
                    break;
                }
            }
        }

        for (var i = 0; i < frags.length; ++i)
            frags[i].bondlength = this.bondlength;

        return frags;
    },

    containsAllAtoms: function (atoms) {
        if (atoms == null || atoms.length == 0)
            return false;
        for (var i = 0; i < atoms.length; ++i) {
            if (scil.Utils.indexOf(this.atoms, atoms[i]) < 0)
                return false;
        }

        return true;
    },

    /**
    * Check if the Mol contains an atom
    * @function containsAtom
    * @param {Atom} a - the input atom
    * @returns true or false
    */
    containsAtom: function (a) {
        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i] == a)
                return true;
        }
        return false;
    },

    setAtomBonds: function (clear) {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].bonds = null;

        if (clear)
            return;

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];

            if (b.a1.bonds == null)
                b.a1.bonds = [];
            b.a1.bonds.push(b);

            if (b.a2.bonds == null)
                b.a2.bonds = [];
            b.a2.bonds.push(b);
        }
    },

    setBondOrders: function () {
        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            b.order = b.valence();
        }

        if (DEBUG.enable) {
            for (var i = 0; i < this.bonds.length; ++i) {
                var b = this.bonds[i];
                DEBUG.print(b.a1.id + "-" + b.a2.id + " " + b.order);
            }
        }

        var rings = this._getRings();
        var ars = [];
        while (rings.length > 0) {
            var n = 0;
            for (var i = rings.length - 1; i >= 0; --i) {
                var r = rings[i];
                if (this.isAromaticRing(r)) {
                    ++n;
                    ars.push(r);
                    rings.splice(i, 1);
                    for (var k = 0; k < r.length; ++k)
                        r[k].order = 1.5;
                }
            }

            if (n == 0)
                break;
        }

        return { arrings: ars, rings: rings };
    },

    isAromaticRing: function (r) {
        if (r.length == 6) {
            var b1 = r[0];
            for (var k = 1; k <= r.length; ++k) {
                var b2 = r[k == r.length ? 0 : k];
                if (!(b1.order == 1 && b2.order == 2 ||
                    b1.order == 2 && b2.order == 1 ||
                    b1.order == 1.5 && b2.order >= 1 && b2.order <= 2 ||
                    b2.order == 1.5 && b1.order >= 1 && b1.order <= 2)) {
                    return false;
                }
                b1 = b2;
            }

            return true;
        }

        if (r.length == 5) {
            var b1 = r[0];
            for (var k = 1; k <= r.length; ++k) {
                var b2 = r[k == r.length ? 0 : k];
                if (b1.order == 1 && b2.order == 1) {
                    if (b1.a1 == b2.a1 || b1.a1 == b2.a2)
                        v = b1.a1;
                    else if (b1.a2 == b2.a1 || b1.a2 == b2.a2)
                        v = b1.a2;

                    if (v != null &&
                        (r[(k + 1) % 5].order == 2 || r[(k + 1) % 5].order == 1.5) &&
                            r[(k + 2) % 5].order == 1 &&
                            (r[(k + 3) % 5].order == 2 || r[(k + 3) % 5].order == 1.5)) {
                        if (v.elem == "N" || v.elem == "O" || v.elem == "S" || v.elem == "P") {
                            return true;
                        }
                        else if (v.elem == "C") {
                            for (var i = 0; i < v.bonds.length; ++i) {
                                var order = v.bonds[i].order;
                                if (order == 1.5 || order == 2)
                                    return true;
                            }
                        }
                    }

                    return false;
                }
                b1 = b2;
            }

            return false;
        }

        return false;
    },

    prepareScreen: function () {
        var atoms = JSDraw2.FormulaParser.getAtomStats(this).elements;
        var allrings = this.setBondOrders();

        var bonds = { 0: 0, 1: 0, 1.5: 0, 2: 0, 3: 0 };
        for (var i = 0; i < this.bonds.length; ++i)
            ++bonds[this.bonds[i].order];

        var rings = { n5: 0, a5: 0, n6: 0, a6: 0 };
        for (var i = 0; i < allrings.arrings.length; ++i) {
            if (allrings.arrings[i].length == 5)
                ++rings.a5;
            else if (allrings.arrings[i].length == 6)
                ++rings.a6;
        }
        for (var i = 0; i < allrings.rings.length; ++i) {
            if (allrings.rings[i].length == 5)
                ++rings.n5;
            else if (allrings.rings[i].length == 6)
                ++rings.n6;
        }

        return { atoms: atoms, bonds: bonds, rings: rings };
    },

    clearAtomMap: function (ai) {
        var n = 0;
        if (ai == null) {
            for (var i = 0; i < this.atoms.length; ++i) {
                if (this.atoms[i].atommapid != null) {
                    ++n;
                    this.atoms[i].atommapid = null;
                }
            }
        }
        else {
            for (var i = 0; i < this.atoms.length; ++i) {
                if (ai == this.atoms[i].atommapid) {
                    ++n;
                    this.atoms[i].atommapid = null;
                }
            }
        }
        return n;
    },

    getMaxMapId: function () {
        var maxid = 0;
        var list = this.atoms;
        for (var i = 0; i < list.length; ++i) {
            if (list[i].atommapid != null && list[i].atommapid >= maxid)
                maxid = list[i].atommapid;
        }
        return maxid + 1;
    },

    screen: function (target, fullstructure) {
        if (this.stats == null)
            this.stats = this.prepareScreen();
        if (target.stats == null)
            target.stats = target.prepareScreen();

        var atomsq = this.stats.atoms;
        var atomst = target.stats.atoms;
        var at = atomst["*"] == null ? 0 : atomst["*"];
        at += atomst["A"] == null ? 0 : atomst["A"];
        at += atomst["X"] == null ? 0 : atomst["X"];
        at += atomst["Q"] == null ? 0 : atomst["Q"];
        at += atomst["L"] == null ? 0 : atomst["L"];
        for (var e in atomsq) {
            if (e == "H" || e == "*" || e == "A" || e == "X" || e == "Q" || e == "L")
                continue;

            if (fullstructure && !(atomsq[e] == atomst[e]) || !fullstructure && !(atomsq[e] <= atomst[e] + at))
                return false;
        }

        var bondsq = this.stats.bonds;
        var bondst = target.stats.bonds;
        for (var e in bondsq) {
            if (fullstructure && !(bondsq[e] == bondst[e]) || !fullstructure && !(bondsq[e] <= bondst[e]))
                return false;
        }

        return fullstructure &&
            this.stats.rings.a5 == target.stats.rings.a5 &&
            this.stats.rings.n5 == target.stats.rings.n5 &&
            this.stats.rings.a6 == target.stats.rings.a6 &&
            this.stats.rings.n6 == target.stats.rings.n6 ||
            !fullstructure &&
            this.stats.rings.a5 <= target.stats.rings.a5 &&
            this.stats.rings.n5 <= target.stats.rings.n5 &&
            this.stats.rings.a6 <= target.stats.rings.a6 &&
            this.stats.rings.n6 <= target.stats.rings.n6;
    },

    /**
    * Perform a full-structure search
    * @function fullstructureMatch
    * @param {Mol} target - the target mol
    * @returns true or false
    */
    fullstructureMatch: function (target, matchstereobonds) {
        if (target == null || this.atoms.length != target.atoms.length || this.bonds.length != target.bonds.length || this.getMolWeight() != target.getMolWeight())
            return false;
        return this.aamap(target, true, null, matchstereobonds) != null;
    },

    getBrackets: function () {
        var list = [];
        for (var i = 0; i < this.graphics.length; ++i) {
            var b = JSDraw2.Bracket.cast(this.graphics[i]);
            if (b != null) {
                list.push(b);
                b.sgrouptexts = this.getSgroupTexts(b);
            }
        }
        return list;
    },

    // todo: match included atoms as well
    matchBrackets: function (target) {
        var list1 = this.getBrackets();
        var list2 = target == null ? [] : target.getBrackets();
        if (list1.length != list2.length)
            return false;

        for (var i = 0; i < list1.length; ++i) {
            var f = false;
            for (var k = 0; k < list2.length; ++k) {
                if (list1[i].sgrouptexts == list2[k].sgrouptexts) {
                    f = true;
                    break;
                }
            }
            if (f != null)
                return false;
        }

        return true;
    },

    /**
    * Perform a sub-structure search using the Mol as a query
    * @function substructureMatch
    * @param {Mol} target - the target mol
    * @returns true or false
    */
    substructureMatch: function (target) {
        return this.aamap(target, false) != null;
    },

    /**
    * Perform atom-by-atom mapping using the Mol as a query
    * @function aamap
    * @param {Mol} target - the target mol
    * @param {bool} fullstructure - indicate if performing a full-structure search
    * @param {bool} highlighting - indicate if highlighting mapped atoms and bonds
    * @returns the map result as a dictionary
    */
    aamap: function (target, fullstructure, highlighting, matchsterebonds) {
        var map = this.aamap2(target, fullstructure, matchsterebonds);

        if (highlighting) {
            target.setColor(map == null ? null : "black");
            if (map != null) {
                for (var i = 0; i < map.atoms.length; ++i)
                    map.atoms[i].t.color = "red";
                for (var i = 0; i < map.bonds.length; ++i)
                    map.bonds[i].t.color = "red";
            }
        }

        return map;
    },

    aamap2: function (target, fullstructure, matchsterebonds) {
        if (DEBUG.enable) {
            DEBUG.clear();
        }

        if (!this.screen(target, fullstructure)) {
            if (DEBUG.enable)
                DEBUG.print("screen failed");
            return null;
        }

        var path = this._bfPath();
        target.setAtomBonds();
        target.clearFlag();
        this.clearFlag();

        var i = 0;
        while (i < path.length) {
            var f = false;
            var n = path[i];

            if (n.b == null) { // start of new fragment
                for (var j = (n.f == null ? 0 : (n.f + 1)); j < target.atoms.length; ++j) {
                    var t = target.atoms[j];
                    n.f = j;
                    if (t.f == null && JSDraw2.Atom.match(t, n.a)) {
                        f = true;
                        n.a.f = t;
                        t.f = n.a;
                        break;
                    }
                }
            }
            else if (n.ringclosure != null) { // ring closure
                var b = target.findBond(n.b.a1.f, n.b.a2.f);
                if (b != null && n.b.order == b.order && (!matchsterebonds || n.b.type == b.type)) {
                    f = true;
                    b.f = n.b;
                    n.b.f = b;
                }
            }
            else {
                var st = n.f == null ? 0 : n.f + 1;
                var t = n.startAtom().f;
                for (var k = st; k < t.bonds.length; ++k) {
                    n.f = k;
                    var b = t.bonds[k];
                    var oa = b.otherAtom(t);
                    if (b.f == null && oa.f == null && n.b.order == b.order && (!matchsterebonds || n.b.type == b.type) && JSDraw2.Atom.match(n.a, oa)) {
                        f = true;
                        n.a.f = oa;
                        oa.f = n.a;
                        n.b.f = b;
                        b.f = n.b;
                        break;
                    }
                }
            }

            if (f) {
                // step next
                ++i;
                if (DEBUG.enable) {
                    var s = '';
                    if (n.a != null)
                        s += n.a.id + " -> " + n.a.f.id + " ";
                    if (n.b != null)
                        s += n.b.a1.id + "-" + n.b.a2.id + " -> " + n.b.f.a1.id + "-" + n.b.f.a2.id;
                    DEBUG.print(s);
                }
            }
            else {
                // then back-trace
                if (n.b != null && n.b.f != null) {
                    n.b.f.f = null;
                    n.b.f = null;
                }
                if (n.a != null && n.a.f != null) {
                    n.a.f.f = null;
                    n.a.f = null;
                }
                n.f = null;

                if (--i < 0) {
                    if (DEBUG.enable)
                        DEBUG.print("failed");
                    return null;
                }
                n = path[i];
                if (n.b != null && n.b.f != null) {
                    n.b.f.f = null;
                    n.b.f = null;
                }
                if (n.a != null && n.a.f != null) {
                    n.a.f.f = null;
                    n.a.f = null;
                }

                if (DEBUG.enable)
                    DEBUG.print("trace back");
            }
        }

        if (DEBUG.enable)
            DEBUG.print("succeed");

        var atommap = [];
        for (var i = 0; i < this.atoms.length; ++i)
            atommap.push({ q: this.atoms[i], t: this.atoms[i].f });

        var bondmap = [];
        for (var i = 0; i < this.bonds.length; ++i)
            bondmap.push({ q: this.bonds[i], t: this.bonds[i].f });

        return { atoms: atommap, bonds: bondmap };
    },

    _setAromaticFlag: function () {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].aromatic = false;

        for (var i = 0; i < this.bonds.length; ++i) {
            var b = this.bonds[i];
            if (b.type == JSDraw2.BONDTYPES.DELOCALIZED)
                b.a1.aromatic = b.a2.aromatic = true;
        }
    },

    /**
    * Get SMILES
    * @function getSmiles
    * @returns a string
    */
    getSmiles: function () {
        return null;
    },

    _getSmiles: function () {
        return null;
    },

    _getRings: function () {
        //        if (DEBUG.enable) {
        //            DEBUG.clear();
        //        }

        var rings = [];

        this.setAtomBonds();
        this.clearFlag();
        for (var i = 0; i < this.atoms.length; ++i) {
            this.clearFlag();
            for (var j = 0; j < i; ++j)
                this.atoms[j].f = "ex";
            var start = this.atoms[i];
            var ret = this._getTree(start);
            if (ret.ri == 0)
                continue;

            var path = [];
            ret.tree.list(path, "breadthfirst");

            for (var k = 0; k < path.length; ++k) {
                var b = path[k];
                if (b.depth > 3)
                    break;

                if (b.ringclosure != null) {
                    var ring = [b.b];
                    rings.push(ring);

                    var a = b.startAtom();
                    var n = k;
                    while (a != start) {
                        for (var j = n - 1; j > 0; --j) {
                            var t = path[j];
                            if (t.a == a) {
                                ring.push(t.b);
                                a = t.startAtom();
                                n = j;
                                break;
                            }
                        }
                    }

                    a = b.a;
                    n = k;
                    while (a != start) {
                        for (var j = n - 1; j > 0; --j) {
                            var t = path[j];
                            if (t.a == a) {
                                ring.splice(0, 0, t.b);
                                a = t.startAtom();
                                n = j;
                                break;
                            }
                        }
                    }
                }
            }
        }

        //        if (DEBUG.enable) {
        //            for (var i = 0; i < rings.length; ++i) {
        //                DEBUG.print("ring:" + i);
        //                var r = rings[i];
        //                for (var j = 0; j < r.length; ++j) {
        //                    var s = " " + r[j].a1.id + "-" + r[j].a2.id;
        //                    DEBUG.print(s);
        //                }
        //            }
        //        }
        return rings;
    },

    _bfPath: function () {
        var ss = [];
        var trees = this._getTrees();
        for (var i = 0; i < trees.length; ++i)
            trees[i].list(ss, "breadthfirst");
        return ss;
    },

    _getTrees: function () {
        this.setAtomBonds();
        this.clearFlag();

        var starts = [];
        var ri = 0;
        while (true) {
            var start = null;
            for (var i = 0; i < this.atoms.length; ++i) {
                var a = this.atoms[i];
                if (a.f == null && !a.isMarkedStereo()) {
                    start = a;
                    break;
                }
            }

            if (start == null) {
                for (var i = 0; i < this.atoms.length; ++i) {
                    var a = this.atoms[i];
                    if (a.f == null/* && !a.isMarkedStereo() */) {
                        start = a;
                        break;
                    }
                }
            }

            if (start == null)
                break;

            var ret = this._getTree(start, ri);
            starts.push(ret.tree);
            ri = ret.ri;
        }

        return starts;
    },

    // breadthfirst
    _getTree: function (a, ri) {
        if (ri == null)
            ri = 0;

        var start = new JSDraw2.BA(null, a, null);
        start.depth = 0;

        start.a.f = true;
        var stack = new JSDraw2.Stack();
        stack.push(start);

        var ba;
        while ((ba = stack.popHead()) != null) {
            var bonds = ba.a.bonds;
            if (bonds == null)
                continue;

            for (var i = 0; i < bonds.length; ++i) {
                var b = bonds[i];
                if (b.f)
                    continue;
                b.f = true;

                var next = null;
                var oa = b.otherAtom(ba.a);
                if (oa.f == "ex")
                    continue;

                if (oa.f == null) {
                    oa.f = true;
                    next = new JSDraw2.BA(b, oa, null);
                    stack.push(next);
                }
                else {
                    ++ri;
                    if (oa.f == true && oa.ringclosures == null)
                        oa.ringclosures = [];
                    oa.ringclosures.push({ ri: ri, next: new JSDraw2.BA(b, ba.a, ri) });
                    next = new JSDraw2.BA(b, oa, ri);
                }
                ba.addNext(next);
            }
        }

        return { tree: start, ri: ri };
    },

    // depth-first
    _getPath: function (b) {
        var stack = new JSDraw2.Stack();
        stack.push({ b: b, a: b.a1.bonds.length > b.a2.bonds.length ? b.a1 : b.a2 });

        b.a1.f = true;
        var path = [];
        while ((b = stack.pop()) != null) {
            if (b.b.f)
                continue;

            path.push(b);
            if (b.a.f)
                b.ringclosure = true;
            b.b.f = b.a.f = true;

            var bonds = b.a.bonds;
            for (var i = bonds.length - 1; i >= 0; --i) {
                if (!bonds[i].f)
                    stack.push({ b: bonds[i], a: bonds[i].otherAtom(b.a) });
            }
        }

        return path;
    },

    /**
    * Get molecular formula
    * @function getFormula
    * @param {bool} html - indicate if rendering the formula in HTML format
    * @returns a string
    */
    getFormula: function (html) {
        var rxn = this.parseRxn();
        if (rxn == null)
            return this._getFormula(html);

        var s = "";
        if (rxn.arrow != null) {
            for (var i = 0; i < rxn.reactants.length; ++i)
                s += (i > 0 ? " + " : "") + rxn.reactants[i]._getFormula(html);
            s += html ? " &rarr; " : " ---> ";
            for (var i = 0; i < rxn.products.length; ++i)
                s += (i > 0 ? " + " : "") + rxn.products[i]._getFormula(html);
            return s;
        }
        else {
            for (var i = 0; i < rxn.reactants.length; ++i)
                s += (i > 0 ? " + " : "") + rxn.reactants[i]._getFormula(html);
        }
        return s;
    },

    _getFormula: function (html) {
        var m = this.expandSuperAtoms();
        var stats = JSDraw2.FormulaParser.getAtomStats(m);
        return JSDraw2.FormulaParser.stats2mf(stats, html);
    },

    /**
    * Get molecular weight
    * @function getMolWeight
    * @returns a number
    */
    getMolWeight: function () {
        var mw = this.getMixtureMW();
        if (mw > 0)
            return mw;

        if (this.hasGenericAtom())
            return null;

        var m = this.expandSuperAtoms();
        var stats = JSDraw2.FormulaParser.getAtomStats(m);
        var sum = JSDraw2.FormulaParser.stats2mw(stats);
        return sum == null ? null : Math.round(sum * 10000) / 10000;
    },

    getMixtureMW: function () {
        for (var i = 0; i < this.graphics.length; ++i) {
            var br = JSDraw2.Bracket.cast(this.graphics[i]);
            if (br == null || !(br.type == "" || br.type == null))
                continue;

            var t = this.getSgroupText(br, "POLYMER_MW");
            if (t == null)
                continue;

            var s = scil.Utils.trim(t.text);
            if (s != null && scil.Utils.startswith(s, "mw=")) {
                var n = s.substr(3);
                return parseFloat(n);
            }
        }
        return null;
    },

    /**
    * Get exact mass
    * @function getExactMass
    * @returns a number
    */
    getExactMass: function () {
        if (this.hasGenericAtom())
            return null;

        var m = this.expandSuperAtoms();
        var stats = JSDraw2.FormulaParser.getAtomStats(m);
        var sum = JSDraw2.FormulaParser.stats2em(stats);
        return sum == null ? null : Math.round(sum * 10000) / 10000;
    },

    getAllBonds: function (a) {
        var ret = [];
        var bonds = this.bonds;
        for (var i = 0; i < bonds.length; ++i) {
            if (bonds[i].a1 == a || bonds[i].a2 == a)
                ret.push(bonds[i]);
        }
        return ret;
    },

    getAllBondAtoms: function (a) {
        var ret = [];
        var bonds = this.bonds;
        for (var i = 0; i < bonds.length; ++i) {
            if (bonds[i].a1 == a)
                ret.push(bonds[i].a2);
            else if (bonds[i].a2 == a)
                ret.push(bonds[i].a1);
        }
        return ret;
    },

    countSelected: function () {
        var n = 0;
        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i].selected)
                ++n;
        }
        for (var i = 0; i < this.bonds.length; ++i) {
            if (this.bonds[i].selected)
                ++n;
        }
        for (var i = 0; i < this.graphics.length; ++i) {
            if (this.graphics[i].selected)
                ++n;
        }
        return n;
    },

    setSgroup: function (br, fieldtype, v, x, y) {
        if (v == "")
            v = null;

        if (fieldtype == "BRACKET_TYPE" && v == "mul" && br.subscript != null && br.subscript != "") {
            v = br.subscript;
            br.subscript = null;
        }

        var t = this.getSgroupText(br, fieldtype);
        if (v == null) {
            if (t != null) {
                this.delGraphics(t);
                return t;
            }
        }
        else {
            if (t != null) {
                if (t.text != v) {
                    t.text = v;
                    return t;
                }
            }
            else {
                var r = new JSDraw2.Rect(x, y, 0, 0);
                t = new JSDraw2.Text(r, v);
                t.fieldtype = fieldtype;
                t.anchors.push(br);
                br._parent.addGraphics(t);
                return t;
            }
        }

        return null;
    },

    getSgroupText: function (br, fieldtype) {
        for (var i = 0; i < this.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t != null && t.fieldtype == fieldtype && t.anchors.length == 1 && t.anchors[0] == br)
                return t;
        }
        return null;
    },

    getSgroupTexts: function (br) {
        var ss = [];
        for (var i = 0; i < this.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t != null && t.anchors.length == 1 && t.anchors[0] == br)
                ss.push(t.text);
        }

        if (ss.length == 0)
            return null;

        ss.sort();
        return scil.Utils.array2str(ss, "; ");
    },

    removeTags: function (br, fieldtypes) {
        var n = 0;
        for (var i = this.graphics.length - 1; i >= 0; --i) {
            var t = JSDraw2.Text.cast(this.graphics[i]);
            if (t != null && t.anchors.length == 1 && t.anchors[0] == br && fieldtypes.indexOf(t.fieldtype + ",") >= 0) {
                this.delGraphics(t);
                ++n;
            }
        }
        return n;
    }
});

JsMol = JSDraw2.Mol;

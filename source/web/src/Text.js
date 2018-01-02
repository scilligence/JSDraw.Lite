//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////



/**
* Text class
* @class scilligence.JSDraw2.Text
*/
JSDraw2.Text = scilligence.extend(scilligence._base, {
    /**
    @property {Rect} _rect Position
    */
    /**
    @property {string} text Text value
    */
    /**
    @property {string} color Display Color
    */
    /**
    @property {bool} selected Selecting Flag
    */

    /**
    * @constructor Text
    * @param {Rect} r - the position
    * @param {string} text - text value
    */
    constructor: function (r, text) {
        this.T = "TEXT";
        this._rect = r;
        this.text = text;
        this.color = null;
        this.fontsize = 1.0;
        this.selected = false;
        this.fieldtype = null;
        this.readonly = false;
        this.anchors = [];
        this.italic = null;
    },

    clone: function () {
        var a = new JSDraw2.Text(this._rect.clone(), this.text);
        a.id = this.id;
        a.color = this.color;
        a.fieldtype = this.fieldtype;
        a.readonly = this.readonly;
        a.fontsize = this.fontsize;
        a.italic = this.italic;
        return a;
    },

    allAnchorsIn: function (m) {
        if (this.anchors.length == 0)
            return false;
        for (var i = 0; i < this.anchors.length; ++i) {
            var a = this.anchors[i];
            if (JSDraw2.Atom.cast(a) != null && m.atoms.indexOf(a) < 0 ||
                JSDraw2.Bond.cast(a) != null && m.bonds.indexOf(a) < 0 ||
                JSDraw2.Bracket.cast(a) != null && m.graphics.indexOf(a) < 0)
                return false;
        }
        return true;
    },

    attach: function (obj) {
        // anchors can contain one bracket, or any number of atoms and/or bonds
        if (JSDraw2.Bracket.cast(obj) != null) {
            this.anchors = [obj];
            return true;
        }

        if (JSDraw2.Atom.cast(obj) == null && JSDraw2.Bond.cast(obj) == null)
            return false;

        if (this.anchors.length == 1 && JSDraw2.Bracket.cast(this.anchors[0]) != null)
            this.objects = [];

        for (var i = 0; i < this.anchors.length; ++i) {
            if (this.anchors[i] == obj) {
                this.anchors.splice(i, 1);
                return true;
            }
        }
        this.anchors.push(obj);
        return true;
    },

    html: function (scale) {
        var ss = "";
        for (var i = 0; i < this.anchors.length; ++i)
            ss += (ss == "" ? "" : ",") + this.anchors[i].id;
        var s = "<i i='" + this.id + "' x='" + this.T + "' p='" + this._rect.toString(scale) + "'";
        if (this.color != null && this.color != "")
            s += " clr='" + this.color + "'";
        if (this.fontsize > 0)
            s += " fontsize='" + this.fontsize.toFixed(2) + "'";
        if (this.readonly)
            s += " v='1'";
        if (this.italic)
            s += " italic='1'";
        if (this.fieldtype != null && this.fieldtype != "")
            s += " fieldtype='" + scil.Utils.escXmlValue(this.fieldtype) + "'";
        if (ss != "")
            s += " anchors='" + ss + "'";
        s += ">" + scilligence.Utils.escXmlValue(this.text) + "</i>";
        return s;
    },

    readHtml: function (e, map) {
        var r = JSDraw2.Rect.fromString(e.getAttribute("p"));
        var s = e.getAttribute("s");
        if (s == null)
            s = e.text || e.textContent;
        if (r == null || scil.Utils.isNullOrEmpty(s))
            return false;

        // I#6220: p="27.495 -5.105 570.397 0.901"
        if (r.width > r.height * 100)
            r.width = r.height * 5.0;
        if (r.height > r.height * 100)
            r.height = r.width / 5.0;

        this._rect = r;
        this.text = s;
        this.readonly = scil.Utils.isTrue(e.getAttribute("v"));
        this.italic = scil.Utils.isTrue(e.getAttribute("italic"));
        this.dummy = scil.Utils.isTrue(e.getAttribute("dum"));
        this.fieldtype = e.getAttribute("fieldtype");

        var fontsize = parseFloat(e.getAttribute("fontsize"));
        if (fontsize > 0)
            this.fontsize = fontsize;

        var s2 = e.getAttribute("anchors");
        if (s2 != null && s2 != "") {
            var anchors = [];
            var ss = s2.split(',');
            for (var j = 0; j < ss.length; ++j) {
                var a = map[parseInt(ss[j])];
                if (a != null && (JSDraw2.Atom.cast(a) != null || JSDraw2.Bond.cast(a) != null || JSDraw2.Bracket.cast(a) != null))
                    anchors.push(a);
            }
            this.anchors = anchors;
        }
        return true;
    },

    flipY: function (y) {
    },

    flipX: function (x) {
    },

    scale: function (s, origin) {
        if (this._rect != null)
            this._rect.scale(s, origin);
    },

    offset: function (dx, dy) {
        if (this._rect != null)
            this._rect.offset(dx, dy);
    },

    rect: function () {
        return this._rect == null ? null : this._rect.clone();
    },

    toggle: function (p, tor) {
        return this._rect != null && this._rect.contains(p);
    },

    removeObject: function (obj) {
        for (var i = 0; i < this.anchors.length; ++i) {
            if (this.anchors[i] == obj) {
                this.anchors.splice(i, 1);
                break;
            }
        }
    },

    drawCur: function (surface, r, color, m) {
        var p = this._rect.center();
        surface.createCircle({ cx: p.x, cy: p.y, r: r }).setFill(color);

        if (m != null) {
            for (var i = 0; i < this.anchors.length; ++i)
                this.anchors[i].drawCur(surface, r * 0.75, color);
        }
    },

    draw: function (surface, linewidth, m, fontsize) {
        var s = this.text;
        if (s == null)
            return;

        var r = this._rect;
        var fs = fontsize * (this.fontsize > 0 ? this.fontsize : 1.0);
        var color = this.color == null || this.color.length == 0 ? "black" : this.color;
        var t = JSDraw2.Drawer.drawText(surface, new JSDraw2.Point(r.left, r.top), s, color, fs, null, this.italic);
        r.width = t == null ? 0 : t.getTextWidth();
        r.height = fs + 4;

        //var ss = s.match(/[ ]{0,}[a-z|0-9|*|$|@|?|!][ ]{0,}[=]/gi);
        //if (ss != null) {
        //    var c = ss[0].substr(0, ss[0].indexOf('='));
        //    c = scilligence.Utils.trim(c);
        //    for (var i = 0; i < this.anchors.length; ++i) {
        //        var b = JSDraw2.Bond.cast(this.anchors[i]);
        //        if (b != null)
        //            JSDraw2.Drawer.drawLabel(surface, b.center(), c, color, fontsize * 0.85);
        //    }
        //}
    },

    drawSelect: function (lasso) {
        lasso.draw(this, this._rect.fourPoints());
    }
});

JSDraw2.Text.cast = function (a) {
    return a != null && a.T == 'TEXT' ? a : null;
};
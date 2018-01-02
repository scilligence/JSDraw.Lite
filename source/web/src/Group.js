//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////



/**
* Group class - defines Object groups
* @class scilligence.JSDraw2.Group
*/
JSDraw2.Group = scil.extend(scil._base, {
    /**
    * @constructor Group
    * @param {string} name - group name
    * @param {string} type - group type
    */
    constructor: function (name, type) {
        this.T = "GROUP";
        this.type = type;
        this.name = name;
        this.id = null;
        this._rect = null;
        this.p = null;
        this.gap = 6.0;
        this.group = null; // a group can belong to another group
        this.color = null;
        this.a = null;
        this.ratio = null;
        this.tag = null;
    },

    clone: function () {
        var g = new JSDraw2.Group(this.name, this.type);
        g.id = this.id;
        g._rect = this._rect == null ? null : this._rect.clone();
        g.p = this.p == null ? null : this.p.clone();
        g.color = this.color;
        g.gap = this.gap;
        g.ratio = this.ratio;
        g.tag = this.tag;
        return g;
    },

    html: function (scale) {
        var s = "<i i='" + this.id + "' x='" + this.T + "' t='" + scilligence.Utils.escXmlValue(this.type) + "' n='" + this.name + "'";
        if (this.color != null)
            s += " clr='" + this.color + "'";
        if (this.gap > 0)
            s += " gap='" + this.gap + "'";
        s += "></i>";
        return s;
    },

    readHtml: function (e) {
        //this.p = JSDraw2.Point.fromString(e.getAttribute("p"));
        var gap = parseFloat(e.getAttribute("gap"));
        if (gap > 0)
            this.gap = gap;
    },

    flipY: function (y) {
    },

    flipX: function (x) {
    },

    scale: function (s, origin) {
    },

    offset: function (dx, dy) {
    },

    rect: function () {
        return this._rect;
    },

    toggle: function (p, tor) {
        var r = this._rect;
        if (r == null)
            return;
        return p.y >= r.top && p.y <= r.bottom() && (Math.abs(p.x - r.left) < tor / 2 || Math.abs(p.x - r.right()) < tor / 2) ||
            p.x >= r.left && p.x <= r.right() && (Math.abs(p.y - r.top) < tor / 2 || Math.abs(p.y - r.bottom()) < tor / 2);
    },

    drawCur: function (surface, r, color, m) {
        var r2 = this._rect;
        if (r2 == null)
            return;
        var c = r2.center();
        surface.createCircle({ cx: r2.left, cy: c.y, r: r }).setFill(color);
        surface.createCircle({ cx: r2.right(), cy: c.y, r: r }).setFill(color);
        surface.createCircle({ cx: c.x, cy: r2.top, r: r }).setFill(color);
        surface.createCircle({ cx: c.x, cy: r2.bottom(), r: r }).setFill(color);

        if (m != null) {
            for (var i = 0; i < m.atoms.length; ++i) {
                if (m.atoms[i].group != this)
                    continue;
                m.atoms[i].drawCur(surface, r * 0.75, color);
            }
            for (var i = 0; i < m.graphics.length; ++i) {
                if (m.graphics[i].group != this)
                    continue;
                m.graphics[i].drawCur(surface, r * 0.75, color);
            }
        }
    },

    _updateRect: function (m, bondlength) {
        var r = m.getGroupRect(this, bondlength);
        this._rect = r;
        return r;
    },

    draw: function (surface, linewidth, m, fontsize) {
        var r = this._rect;
        if (r == null)
            return;

        var color = this.color == null ? "gray" : this.color;
        //r.inflate(this.gap * linewidth, this.gap * linewidth);
        if (this.type == "chiral") {
            JSDraw2.Drawer.drawLabel(surface, new JSDraw2.Point(r.left + r.width / 2, r.top - fontsize), this.name, color, fontsize, false);
        }
        else {
            JSDraw2.Drawer.drawRect(surface, r, color, linewidth / 4, linewidth * 3); //.setFill("#ffffff");
            JSDraw2.Drawer.drawLabel(surface, new JSDraw2.Point(r.left + r.width / 2, r.bottom() + fontsize / 2), this.name, color, fontsize, false);
        }

        if (!scil.Utils.isNullOrEmpty(this.tag))
            JSDraw2.Drawer.drawLabel(surface, new JSDraw2.Point(r.left, r.top - fontsize), this.tag, "black", fontsize, false, "start");
        if (!scil.Utils.isNullOrEmpty(this.ratio))
            JSDraw2.Drawer.drawLabel(surface, new JSDraw2.Point(r.right(), r.bottom() + fontsize / 2), "ratio: " + this.ratio, "black", fontsize, false, "end");
    },

    drawSelect: function (lasso) {
        lasso.draw(this, this._rect.fourPoints());
    }
});

JSDraw2.Group.cast = function (a) {
    return a != null && a.T == 'GROUP' ? a : null;
};
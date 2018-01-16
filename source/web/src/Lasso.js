//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.Lasso = scilligence.extend(scilligence._base, {
    constructor: function (extra, linewidth, selecting) {
        this.surface = extra;
        this.linewidth = linewidth;
        this.list = selecting ? [] : null;

        this.lasthits = [];
        this.curhits = [];
        this.line = null;
    },

    hit: function (a) {
        if (scil.Utils.indexOf(this.lasthits, a) >= 0)
            return;

        a.selected = !a.selected;
        if (a.selected)
            a.drawSelect(this);
        else
            this.remove(a);
        this.curhits.push(a);
    },

    endHits: function(start, end) {
        this.lasthits = this.curhits;
        this.curhits = [];

        if (this.line != null)
            this.surface.remove(this.line);
        this.line = JSDraw2.Drawer.drawLine(this.surface, start, end, "#aaf", this.linewidth / 2);
    },

    draw: function (a, points) {
        if (points.x != null)
            points = [points];

        var nodes = [];
        for (var i = 0; i < points.length; ++i) {
            var p = points[i];
            var c = this.surface.createCircle({ cx: p.x, cy: p.y, r: this.linewidth * 2 }).setFill(JSDraw2.Editor.COLORSELECTED);
            nodes.push(c);
        }

        if (this.list != null)
            this.list.push({ a: a, nodes: nodes })
    },

    remove: function (a) {
        var nodes = null;
        for (var i = 0; i < this.list.length; ++i) {
            if (this.list[i].a == a) {
                nodes = this.list[i].nodes;
                this.list.splice(i, 1);
                break;
            }
        }

        if (nodes == null)
            return;

        for (var i = 0; i < nodes.length; ++i)
            this.surface.remove(nodes[i]);
    }
});
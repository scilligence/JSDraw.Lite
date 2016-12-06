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
* Rect class - define a Rectangle on the screen
* @class scilligence.JSDraw2.Rect
*/
JSDraw2.Rect = scilligence.extend(scilligence._base, {
    /**
    @property {number} left
    */
    /**
    @property {number} top
    */
    /**
    @property {number} width
    */
    /**
    @property {number} height
    */

    /**
    * @constructor Rect
    * @param {number} left
    * @param {number} top
    * @param {number} width
    * @param {number} height
    */
    constructor: function (left, top, width, height) {
        this.left = isNaN(left) ? 0 : left;
        this.top = isNaN(top) ? 0 : top;
        this.width = isNaN(width) ? 0 : width;
        this.height = isNaN(height) ? 0 : height;
    },

    /**
    * Set Rect based on two points
    * @function set
    * @param {Point} p1 - the first point
    * @param {Point} p2 - the second point
    * @returns the Rect itelf
    */
    set: function (p1, p2) {
        this.left = Math.min(p1.x, p2.x);
        this.top = Math.min(p1.y, p2.y);
        this.width = Math.abs(p1.x - p2.x);
        this.height = Math.abs(p1.y - p2.y);
        return this;
    },

    /**
    * Get the top-left corner of the Rect
    * @function topleft
    * @returns a Point object
    */
    topleft: function () {
        return new JSDraw2.Point(this.left, this.top);
    },

    /**
    * Get the top-right corner of the Rect
    * @function topright
    * @returns a Point object
    */
    topright: function () {
        return new JSDraw2.Point(this.right(), this.top);
    },

    /**
    * Get the bottom-left corner of the Rect
    * @function bottomleft
    * @returns a Point object
    */
    bottomleft: function () {
        return new JSDraw2.Point(this.left, this.bottom());
    },

    /**
    * Get the bottom-right corner of the Rect
    * @function bottomright
    * @returns a Point object
    */
    bottomright: function () {
        return new JSDraw2.Point(this.right(), this.bottom());
    },

    fourPoints: function() {
        return [this.topleft(), this.topright(), this.bottomleft(), this.bottomright()];
    },

    /**
    * Clone this Rect
    * @function clone
    * @returns a new Rect object
    */
    clone: function () {
        return new JSDraw2.Rect(this.left, this.top, this.width, this.height);
    },

    /**
    * Check if the Rect is empty
    * @function isEmpty
    * @returns true or false
    */
    isEmpty: function () {
        return !(this.width > 0 && this.height > 0);
    },

    /**
    * Test if the Rect area contains a Point
    * @function contains
    * @param {Point} p - the point to be tested
    * @returns true or false
    */
    contains: function (p) {
        return p.x >= this.left && p.x <= this.right() && p.y >= this.top && p.y <= this.bottom();
    },

    /**
    * Get the right coordinate
    * @function right
    * @returns a number
    */
    right: function () {
        return this.left + this.width;
    },

    /**
    * Get the bottom coordinate
    * @function bottom
    * @returns a number
    */
    bottom: function () {
        return this.top + this.height;
    },

    /**
    * Get the center of the Rect
    * @function center
    * @returns the center as a Point object
    */
    center: function () {
        return new JSDraw2.Point(this.left + this.width / 2, this.top + this.height / 2);
    },

    centerLeft: function () {
        return new JSDraw2.Point(this.left, this.top + this.height / 2);
    },

    centerRight: function () {
        return new JSDraw2.Point(this.right(), this.top + this.height / 2);
    },

    centerTop: function () {
        return new JSDraw2.Point(this.left + this.width / 2, this.top);
    },

    centerBottom: function () {
        return new JSDraw2.Point(this.left + this.width / 2, this.bottom());
    },

    /**
    * Offset the rect
    * @function offset
    * @param {number} dx - the x offset
    * @param {number} dy - the y offset
    * @returns the rect itself
    */
    offset: function (dx, dy) {
        this.left += dx;
        this.top += dy;
        return this;
    },

    /**
    * Scale the rect
    * @function scale
    * @param {number} s - the scaling factor
    * @param {Point} origin - the base Point
    * @returns the rect itself
    */
    scale: function (s, origin) {
        if (origin != null) {
            this.left = (this.left - origin.x) * s + origin.x;
            this.top = (this.top - origin.y) * s + origin.y;
        }
        else {
            this.left *= s;
            this.top *= s;
        }
        this.width *= s;
        this.height *= s;
        return this;
    },

    /**
    * Union another Point
    * @function unionPoint
    * @param {Point} p - the Point to be unioned
    * @returns the rect itself
    */
    unionPoint: function (p) {
        if (p.x < this.left) {
            this.width += this.left - p.x;
            this.left = p.x;
        }
        else if (p.x > this.right()) {
            this.width += p.x - this.right();
        }

        if (p.y < this.top) {
            this.height += this.top - p.y;
            this.top = p.y;
        }
        else if (p.y > this.bottom()) {
            this.height += p.y - this.bottom();
        }
        return this;
    },

    /**
    * Union another Rect
    * @function union
    * @param {Rect} r - the Rect to be unioned
    * @returns the rect itself
    */
    union: function (r) {
        if (r == null)
            return;
        var right = this.right();
        var bottom = this.bottom();

        if (r.left < this.left)
            this.left = r.left;
        if (r.top < this.top)
            this.top = r.top;

        this.width = Math.max(right, r.right()) - this.left;
        this.height = Math.max(bottom, r.bottom()) - this.top;
        return this;
    },

    /**
    * Inflate the Rect
    * @function inflate
    * @param {number} dx - the delta in x direction
    * @param {number} dy - the delta in y direction
    * @returns the rect itself
    */
    inflate: function (dx, dy) {
        if (dy == null)
            dx = dy;
        if (this.width + 2 * dx < 0)
            dx = -this.width / 2;
        if (this.height + 2 * dy < 0)
            dy = -this.height / 2;

        this.offset(-dx, -dy);
        this.width += 2 * dx;
        this.height += 2 * dy;

        return this;
    },

    distance2Point: function (p) {
        var r = this.right();
        var b = this.bottom();
        var d = new JSDraw2.Point(this.left, this.top).distTo(p);
        d = this._minDist(d, p, this.left + this.width / 2, this.top);
        d = this._minDist(d, p, r, this.top);
        d = this._minDist(d, p, r, this.top + this.height / 2);
        d = this._minDist(d, p, r, b);
        d = this._minDist(d, p, this.left + this.width / 2, b);
        d = this._minDist(d, p, this.left, b);
        d = this._minDist(d, p, this.left, this.height / 2);
        return d;
    },

    _minDist: function (d, p, x, y) {
        return Math.min(d, new JSDraw2.Point(x, y).distTo(p));
    },

    cross: function (p1, p2) {
        var c1 = this.contains(p1);
        var c2 = this.contains(p2);
        if (c1 && c2)
            return 0;
        else if (c1 && !c2)
            return -2;
        else if (!c1 && c2)
            return 2;

        var a = p2.angleTo(p1);
        var aa = [];
        aa[0] = new JSDraw2.Point(this.left, this.top).angleTo(p1) - a;
        aa[1] = new JSDraw2.Point(this.right(), this.top).angleTo(p1) - a;
        aa[2] = new JSDraw2.Point(this.right(), this.bottom()).angleTo(p1) - a;
        aa[3] = new JSDraw2.Point(this.left, this.bottom()).angleTo(p1) - a;
        for (var i = 0; i < aa.length; ++i) {
            if (aa[i] < 0)
                aa[i] += 360;
        }
        aa.sort(function (a, b) { return a - b; });

        if (aa[0] < 90 && aa[3] > 270)
            return 1;
        if (aa[0] > 90 && aa[0] < 180 && aa[3] > 180 && aa[3] < 270)
            return -1;
        return 0;
    },

    /**
    * Convert the Rect into a string
    * @function toString
    * @param {number} scale - the scale factor
    * @returns a string
    */
    toString: function (scale) {
        if (!(scale > 0))
            scale = 1.0;
        return (this.left * scale).toFixed(3) + " " +
            (-this.bottom() * scale).toFixed(3) + " " +
            (this.width * scale).toFixed(3) + " " +
            (this.height * scale).toFixed(3);
    },

    cornerTest: function (p, tor) {
        if (Math.abs(p.x - this.left) < tor && Math.abs(p.y - this.top) < tor)
            return "topleft";
        if (Math.abs(p.x - this.right()) < tor && Math.abs(p.y - this.top) < tor)
            return "topright";
        if (Math.abs(p.x - this.left) < tor && Math.abs(p.y - this.bottom()) < tor)
            return "bottomleft";
        if (Math.abs(p.x - this.right()) < tor && Math.abs(p.y - this.bottom()) < tor)
            return "bottomright";
        return null;
    },

    moveCorner: function (corner, d) {
        switch (corner) {
            case "topleft":
                this.set(this.topleft().offset(d.x, d.y), this.bottomright());
                break;
            case "topright":
                this.set(this.topright().offset(d.x, d.y), this.bottomleft());
                break;
            case "bottomleft":
                this.set(this.bottomleft().offset(d.x, d.y), this.topright());
                break;
            case "bottomright":
                this.set(this.bottomright().offset(d.x, d.y), this.topleft());
                break;
        }
    }
});

JSDraw2.Rect.fromString = function (s) {
    if (s == null)
        return null;
    var ss = s.split(' ');
    if (ss.length != 4)
        return null;
    var left = parseFloat(ss[0]);
    var top = parseFloat(ss[1]);
    var wd = parseFloat(ss[2]);
    var ht = parseFloat(ss[3]);
    if (isNaN(left) || isNaN(top) || isNaN(wd) || isNaN(ht))
        return null;
    return new JSDraw2.Rect(left, -top - ht, wd, ht);
};
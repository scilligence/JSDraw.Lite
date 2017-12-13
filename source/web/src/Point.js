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
* Point class - define a position on the screen
* @class scilligence.JSDraw2.Point
*/
JSDraw2.Point = scilligence.extend(scilligence._base, {
    /**
    @property {number} x
    */
    /**
    @property {number} y
    */

    /**
    * @constructor Point
    * @param {number} x
    * @param {number} y
    */
    constructor: function (x, y) {
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(y) ? 0 : y;
    },

    /**
    * Check if the x, y values are valid number
    * @function isValid
    * @returns true or false
    */
    isValid: function () {
        return !isNaN(this.x) && !isNaN(this.y);
    },

    /**
    * Get the length from the Point to the origin (0, 0)
    * @function length
    * @returns a number
    */
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
    * Get the distance from this Point to another Point (p)
    * @function distTo
    * @param {Point} p - the other point
    * @returns a number
    */
    distTo: function (p) {
        var dx = this.x - p.x;
        var dy = this.y - p.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
    * Test if this point is on the line composing of p1-p2
    * @function onLine
    * @param {Point} p1 - the first point of the line
    * @param {Point} p2 - the second point of the line
    * @param {number} tor - the tolerance
    * @returns true or false
    */
    onLine: function (p1, p2, tor) {
        var d2 = p1.distTo(p2);
        var d = p1.distTo(this) + p2.distTo(this) - d2;
        return Math.abs(d) <= tor * (50 / d2);
    },

    inTriangle: function (v1, v2, v3) {
        var b1 = JSDraw2.Point.sign(this, v1, v2) < 0.0;
        var b2 = JSDraw2.Point.sign(this, v2, v3) < 0.0;
        var b3 = JSDraw2.Point.sign(this, v3, v1) < 0.0;
        return b1 == b2 && b2 == b3;
    },

    flip: function (p1, p2) {
        var a0 = p2.angleTo(p1);
        var a = this.angleTo(p1) - a0;
        return this.rotateAround(p1, -2 * a);
    },

    /**
    * Move the Point
    * @function offset
    * @param {number} dx - offset x
    * @param {number} dy - offset y
    * @returns the Point itself
    */
    offset: function (dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    },

    offset2: function (d) {
        this.x += d.x;
        this.y += d.y;
        return this;
    },

    /**
    * Scale the point around an origin
    * @function offset
    * @param {number} scale - the scale factor
    * @param {Point} origin - the origin
    * @returns the Point itself
    */
    scale: function (s, origin) {
        if (origin != null) {
            this.x = (this.x - origin.x) * s + origin.x;
            this.y = (this.y - origin.y) * s + origin.y;
        }
        else {
            this.x *= s;
            this.y *= s;
        }
        return this;
    },

    /**
    * Reverse the point
    * @function reverse
    * @returns the Point itself
    */
    reverse: function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },

    /**
    * Clone the point
    * @function clone
    * @returns a new Point object
    */
    clone: function () {
        return new JSDraw2.Point(this.x, this.y);
    },

    /**
    * Test if this Point equals to the other one
    * @function equalsTo
    * @param {Point} p - the other Point
    * @returns true or false
    */
    equalsTo: function (p) {
        return p != null && this.x == p.x && this.y == p.y;
    },

    /**
    * Get the angle of the point from X axis
    * @function angle
    * @returns a number in degree
    */
    angle: function () {
        var a = Math.atan2(this.y, this.x) * 180 / Math.PI;
        return a < 0 ? (a + 360) : a;
    },

    /**
    * Get the angle with a Point as the origin
    * @function angleTo
    * @param {Point} origin - the origin
    * @returns a number in degree
    */
    angleTo: function (origin) {
        var a = Math.atan2(this.y - origin.y, this.x - origin.x) * 180 / Math.PI;
        return a < 0 ? (a + 360) : a;
    },

    /**
    * Get the angle of p1-(this)-p2
    * @function angleAsOrigin
    * @param {Point} p1 - the first point
    * @param {Point} p2 - the second point
    * @returns a number in degree
    */
    angleAsOrigin: function (p1, p2) {
        var v1 = p1.clone().offset(-this.x, -this.y);
        var v2 = p2.clone().offset(-this.x, -this.y);
        var a = v2.angle() - v1.angle();
        return a < 0 ? (a + 360) : a;
    },

    middleAngle: function (p1, p2) {
        var a1 = p1.angleTo(this);
        var a2 = p2.angleTo(this);
        var mid = (a1 + a2) / 2;
        if (Math.abs(a1 - a2) > 180) {
            mid += 180;
            if (mid >= 360)
                mid -= 360;
        }
        return mid;
    },

    /**
    * Rotate the point around the origin
    * @function rotate
    * @param {number} deg - the degree to be rotated
    * @returns the Point itself
    */
    rotate: function (deg) {
        var d = this.length();
        if (d == 0)
            return this;
        var a = this.angle();
        this.x = d * Math.cos((a + deg) * Math.PI / 180);
        this.y = d * Math.sin((a + deg) * Math.PI / 180);
        return this;
    },

    /**
    * Rotate the point around a point
    * @function rotateAround
    * @param {Point} origin - the origin
    * @param {number} deg - the degree to be rotated
    * @returns the Point itself
    */
    rotateAround: function (origin, deg, len) {
        this.offset(-origin.x, -origin.y)
            .rotate(deg)
            .offset(origin.x, origin.y);
        if (len > 0)
            this.setLength(len, origin);
        return this;
    },

    setLength: function (len, origin) {
        if (origin == null)
            return this.scale(len / this.length());

        this.offset(-origin.x, -origin.y);
        this.scale(len / this.length());
        return this.offset(origin.x, origin.y);
    },

    toString: function (scale) {
        if (!(scale > 0))
            scale = 1.0;
        return (this.x * scale).toFixed(3) + " " + (-this.y * scale).toFixed(3);
    },

    shrink: function (origin, delta) {
        var d = this.distTo(origin);
        var s = (d - delta) / d;
        this.x = (this.x - origin.x) * s + origin.x;
        this.y = (this.y - origin.y) * s + origin.y;
        return this;
    },

    equalMove: function (start) {
        var d = Math.abs(this.x - start.x);
        if (this.y > start.y)
            this.y = start.y + d;
        else
            this.y = start.y - d;
    }
});

scil.apply(JSDraw2.Point, {
    fromString: function (s) {
        var ss = s.split(' ');
        if (ss.length != 2)
            return null;
        var x = parseFloat(ss[0]);
        var y = -parseFloat(ss[1]);
        if (isNaN(x) || isNaN(y))
            return null;

        return new JSDraw2.Point(x, y);
    },

    centerOf: function (p1, p2) {
        return new JSDraw2.Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    },

    sign: function (p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    },

    _onSegment: function (p, q, r) {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true;

        return false;
    },

    _orientation: function (p, q, r) {
        // See 10th slides from following link for derivation of the formula
        // http://www.dcs.gla.ac.uk/~pat/52233/slides/Geometry1x1.pdf
        var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

        if (val == 0)
            return 0;  // colinear

        return (val > 0) ? 1 : 2; // clock or counterclock wise
    },

    intersect: function (p1, q1, p2, q2) {
        // Find the four orientations needed for general and
        // special cases
        var o1 = this._orientation(p1, q1, p2);
        var o2 = this._orientation(p1, q1, q2);
        var o3 = this._orientation(p2, q2, p1);
        var o4 = this._orientation(p2, q2, q1);

        // General case
        if (o1 != o2 && o3 != o4)
            return true;

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        if (o1 == 0 && this._onSegment(p1, p2, q1))
            return true;

        // p1, q1 and p2 are colinear and q2 lies on segment p1q1
        if (o2 == 0 && this._onSegment(p1, q2, q1))
            return true;

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        if (o3 == 0 && this._onSegment(p2, p1, q2))
            return true;

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        if (o4 == 0 && this._onSegment(p2, q1, q2))
            return true;

        return false; // Doesn't fall in any of the above cases
    }
});
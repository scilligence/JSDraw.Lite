//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.Drawer = {
    kMinFontSize: 4,

    drawFormula: function (surface, p, reversed, s, color, fontsize) {
        //I#11940
        if (reversed) {
            var c = s.charAt(0);
            if (c >= '0' && c <= '9')
                reversed = false;
        }

        var rect = new JSDraw2.Rect();
        var ss = this.splitFormula(s);
        for (var i = 0; i < ss.length; ++i) {
            if (reversed) {
                if (ss[i].num != null) {
                    var r = this.drawWord(surface, rect, p, color, fontsize, ss[i].num, reversed, true);
                    if (rect.isEmpty())
                        rect = r;
                    else
                        rect.union(r);
                }
            }

            var r = this.drawWord(surface, rect, p, color, fontsize, ss[i].str, reversed, false);
            if (rect.isEmpty())
                rect = r;
            else
                rect.union(r);

            if (!reversed) {
                if (ss[i].num != null) {
                    r = this.drawWord(surface, rect, p, color, fontsize, ss[i].num, reversed, true);
                    if (rect.isEmpty())
                        rect = r;
                    else
                        rect.union(r);
                }
            }
        }

        return rect;
    },

    drawWord: function (surface, rect, p, color, fontsize, w, reversed, isnumber) {
        if (isnumber)
            fontsize /= 1.4;
        var n = this.drawLabel(surface, p, w, color, fontsize, false, reversed ? "end-anchor" : "start-anchor");
        var r = n._rect.clone();
        var nw = r.width / 2;

        var dx = 0;
        var dy = isnumber ? fontsize / 4 : 0;
        if (rect.isEmpty()) {
            // dx = -nw;
        }
        else if (reversed) {
            dx = -(p.x - rect.left) - nw;
            if (w == "I" || w == "i" || w == "l" || w == "r" || w == "f" || w == ".") {
                dx -= fontsize / 6.0;
                // r.width -= 4;
            }

            if (scil.Utils.isChrome)
                dx -= fontsize / 10.0;
        }
        else {
            dx = (rect.right() - p.x) + nw;
            if (w == "I" || w == "i" || w == "l" || w == "r" || w == "f" || w == ".") {
                dx += fontsize / 6.0;
                // r.width -= 4;
            }

            if (scil.Utils.isChrome)
                dx += fontsize / 10.0;
        }

        n.setTransform([dojox.gfx.matrix.translate(dx, dy)]);
        r.left += dx;
        r.top += dy;
        return r;
    },

    splitFormula: function (s) {
        if (/^[A-Z]+$/.test(s) || /^[\(][^\(\)]+[\)]$/.test(s) || /^[\[][^\[\]]+[\]]$/.test(s))
            return [{ str: s}];

        var ret = [];

        var bracket = 0;
        var number = false;
        var w = "";
        for (var i = 0; i < s.length; ++i) {
            var c = s.charAt(i);
            if (bracket > 0 || c == '(') {
                if (c == '(') {
                    if (bracket == 0) {
                        if (w != "") {
                            if (number && ret.length > 0)
                                ret[ret.length - 1].num = w;
                            else
                                ret.push({ str: w });
                        }
                        number = false;
                        w = "";
                    }

                    ++bracket;
                }
                else if (c == ')') {
                    --bracket;
                }

                w += c;
                if (bracket == 0) {
                    ret.push({ str: w });
                    w = "";
                }
            }
            else {
                if (c >= 'A' && c <= 'Z') {
                    if (w != "") {
                        if (number && ret.length > 0)
                            ret[ret.length - 1].num = w;
                        else
                            ret.push({ str: w });
                    }
                    number = false;
                    w = "";
                }
                else if (c >= '0' && c <= '9' && !number) {
                    if (w != "")
                        ret.push({ str: w });
                    number = true;
                    w = "";
                }
                w += c;
            }
        }

        if (w != "") {
            if (number && ret.length > 0)
                ret[ret.length - 1].num = w;
            else
                ret.push({ str: w });
        }
        return ret;
    },

    drawCurveArrow: function (surface, p1, p2, p1a, p2a, color, linewidth) {
        if (p1a == null || p2a == null) {
            var anchors = JSDraw2.Curve.calcAnchors(p1, p2);
            p1a = anchors.p1a;
            p2a = anchors.p2a;
        }

        surface.createPath("").moveTo(p1.x, p1.y)
            .curveTo(p1a.x, p1a.y, p2a.x, p2a.y, p2.x, p2.y)
            .setStroke({ color: color, width: linewidth, cap: "round" });
        JSDraw2.Drawer.drawArrowhead(surface, p2a, p2, color, linewidth);
    },

    drawCurve: function (surface, p1, p2, deg, r, color, linewidth) {
        var anchors = JSDraw2.Curve.calcAnchors(p1, p2, deg, r);
        var p1a = anchors.p1a;
        var p2a = anchors.p2a;

        surface.createPath("").moveTo(p1.x, p1.y)
            .curveTo(p1a.x, p1a.y, p2a.x, p2a.y, p2.x, p2.y)
            .setStroke({ color: color, width: linewidth, cap: "round" });
    },

    drawArrow: function (surface, p1, p2, color, linewidth, dottedline, arrowstyle) {
        if (arrowstyle == "dual") {
            var d = new JSDraw2.Point(p2.x - p1.x, p2.y - p1.y);
            var v = d.clone().rotate(90).setLength(linewidth);
            var tp1 = p1.clone().offset(d.x + v.x, d.y + v.y);
            var tp2 = p2.clone().offset(-d.x + v.x, -d.y + v.y);
            JSDraw2.Drawer.drawLine(surface, tp1, tp2, color, linewidth, dottedline);
            JSDraw2.Drawer.drawArrowhead2(surface, tp1, tp2, color, linewidth, "top");

            v = d.clone().rotate(-90).setLength(linewidth);
            tp1 = p1.clone().offset(d.x + v.x, d.y + v.y);
            tp2 = p2.clone().offset(-d.x + v.x, -d.y + v.y);
            JSDraw2.Drawer.drawLine(surface, tp1, tp2, color, linewidth, dottedline);
            JSDraw2.Drawer.drawArrowhead2(surface, tp2, tp1, color, linewidth, "top");
        }
        else if (arrowstyle == "reversible") {
            var d = new JSDraw2.Point(p2.x - p1.x, p2.y - p1.y);
            var v = d.clone().rotate(90).setLength(linewidth);
            var tp1 = p1.clone().offset(d.x * 0.6 + v.x, d.y * 0.6 + v.y);
            var tp2 = p2.clone().offset(-d.x + v.x, -d.y + v.y);
            JSDraw2.Drawer.drawLine(surface, tp1, tp2, color, linewidth, dottedline);
            JSDraw2.Drawer.drawArrowhead2(surface, tp1, tp2, color, linewidth, "top");

            v = d.clone().rotate(-90).setLength(linewidth);
            tp1 = p1.clone().offset(d.x + v.x, d.y + v.y);
            tp2 = p2.clone().offset(-d.x + v.x, -d.y + v.y);
            JSDraw2.Drawer.drawLine(surface, tp1, tp2, color, linewidth, dottedline);
            JSDraw2.Drawer.drawArrowhead2(surface, tp2, tp1, color, linewidth, "top");
        }
        else {
            if (arrowstyle == "solid") {
                var v = new JSDraw2.Point(p2.x - p1.x, p2.y - p1.y).setLength(linewidth * 4);
                JSDraw2.Drawer.drawLine(surface, p1, p2.clone().offset(-v.x, -v.y), color, linewidth, dottedline);
            }
            else {
                JSDraw2.Drawer.drawLine(surface, p1, p2, color, linewidth, dottedline);
            }
            JSDraw2.Drawer.drawArrowhead(surface, p1, p2, color, linewidth, arrowstyle);
        }
    },

    drawArrowhead: function (surface, p1, p2, color, linewidth, arrowstyle) {
        if (arrowstyle == "solid") {
            this.drawArrowhead2(surface, p1, p2, color, linewidth, arrowstyle);
        }
        else if (arrowstyle == "double") {
            this.drawArrowhead2(surface, p1, p2, color, linewidth);
            this.drawArrowhead2(surface, p2, p1, color, linewidth);
        }
        else if (arrowstyle == "none") {
        }
        else {
            this.drawArrowhead2(surface, p1, p2, color, linewidth);
        }
    },

    drawArrowhead2: function (surface, p1, p2, color, linewidth, as) {
        var v = p1.clone().offset(-p2.x, -p2.y).setLength(linewidth * 7);
        var deg = v.angle();
        var v1 = v.clone().rotate(25);
        var v2 = v.clone().rotate(-25);
        var a1 = p2.clone().offset(v1.x, v1.y);
        var a2 = p2.clone().offset(v2.x, v2.y);

        if (as == "solid") {
            JSDraw2.Drawer.drawTriangle(surface, a1, p2, a2, color);
        }
        else if (as == "top") {
            JSDraw2.Drawer.drawLine(surface, a1, p2, color, linewidth);
        }
        else if (as == "bottom") {
            JSDraw2.Drawer.drawLine(surface, a2, p2, color, linewidth);
        }
        else {
            JSDraw2.Drawer.drawLine(surface, a1, p2, color, linewidth);
            JSDraw2.Drawer.drawLine(surface, a2, p2, color, linewidth);
        }
    },

    drawTriangle: function (surface, p1, p2, p3, color) {
        var t = surface.createPath("").moveTo(p1.x, p1.y).lineTo(p2.x, p2.y).lineTo(p3.x, p3.y).lineTo(p1.x, p1.y);
        t.setFill(color);
        return t;
    },

    drawBracket: function (surface, r, color, linewidth, shape) {
        var m = linewidth * 3;
        var w = linewidth;

        switch (shape) {
            case "round":
                this.drawCurve(surface, r.topleft(), r.bottomleft(), -30, 0.3, color, linewidth);
                this.drawCurve(surface, r.topright(), r.bottomright(), 30, 0.3, color, linewidth);
                break;
            case "curly":
                break;
            default:
                JSDraw2.Drawer.drawLine(surface, r.topleft(), r.topleft().offset(m, 0), color, w);
                JSDraw2.Drawer.drawLine(surface, r.topleft(), r.bottomleft(), color, w);
                JSDraw2.Drawer.drawLine(surface, r.bottomleft(), r.bottomleft().offset(m, 0), color, w);

                JSDraw2.Drawer.drawLine(surface, r.topright(), r.topright().offset(-m, 0), color, w);
                JSDraw2.Drawer.drawLine(surface, r.topright(), r.bottomright(), color, w);
                JSDraw2.Drawer.drawLine(surface, r.bottomright(), r.bottomright().offset(-m, 0), color, w);
                break;
        }
    },

    drawDoubleArrow: function (surface, r, color, linewidth) {
        var m = linewidth * 3;
        var w = linewidth;

        this.drawLine(surface, r.topleft(), r.topright(), color, w);
        this.drawArrow(surface, r.topleft(), r.bottomleft(), color, w);
        this.drawArrow(surface, r.topright(), r.bottomright(), color, w);
    },

    drawLabel: function (surface, p, s, fontcolor, fontsize, opaque, align, offsetx, stroke) {
        var w = fontsize + 2;
        if (opaque) {
            var r = new JSDraw2.Rect(p.x - w / 2, p.y - w / 2, w, w);
            surface.createRect({ x: r.left, y: r.top, width: r.width, height: r.height })
                .setFill(opaque == true ? "#fff" : opaque);
        }

        var x = p.x + (offsetx == null ? 0 : offsetx);
        var y = p.y + w / 2 - 2;
        if (align == "start-anchor") {
            align = "start";
            x -= fontsize * 0.4;
        }
        if (align == "end-anchor") {
            align = "end";
            x += fontsize * 0.4;
            // s = JSDraw2.SuperAtoms.reverseLabel(s);
        }
        var args = { x: x, y: y, text: s, align: align == null ? "middle" : align };
        var t = null;
        if (dojox.gfx.renderer == "canvas") {
            t = surface.createText(args);
            t.shape.fontStyle = "bold " + (fontsize < this.kMinFontSize ? this.kMinFontSize : fontsize) /*Mac,Linux bug*/ + "px Arial";
            t.shape.fillStyle = fontcolor;
            t.shape.align = "center";

            t.mwidth = this.getTextWidth(surface, t);
            t.getTextWidth = function () { return t.mwidth; };
        }
        else {
            t = surface.createText(args)
                .setFont({ family: "Arial", size: (fontsize < this.kMinFontSize ? this.kMinFontSize : fontsize) /*Mac,Linux bug*/ + "px", weight: "normal" })
                .setFill(fontcolor);
            if (stroke != false)
                t.setStroke(fontcolor);
        }

        // space char causes hang-up issue
        if (/^[ ]+$/.test(s))
            t._rect = new JSDraw2.Rect(x, y, s.length * fontsize / 2, fontsize + 4);
        else
            t._rect = new JSDraw2.Rect(x, y, t.getTextWidth(), fontsize + 4);

        t._rect.top -= t._rect.height * 0.8;
        if (align == "end")
            t._rect.left -= t._rect.width;
        return t;
    },

    drawText2: function (surface, p, s, fontcolor, fontsize, rotatedeg) {
        var w = fontsize + 2;
        var t = null;
        if (dojox.gfx.renderer == "canvas") {
            t = surface.createText({ x: p.x, y: p.y + w / 2 - 2, text: s });
            t.shape.fontStyle = "bold " + (fontsize < this.kMinFontSize ? this.kMinFontSize : fontsize) /*Mac,Linux bug*/ + "px Arial";
            t.shape.fillStyle = fontcolor;
            t.shape.align = "center";

            t.mwidth = this.getTextWidth(surface, t);
            t.getTextWidth = function () { return t.mwidth; };
        }
        else {
            t = surface.createText({ x: p.x, y: p.y + w / 2 - 2, text: s, align: "middle" })
                .setFont({ family: "Arial", size: (fontsize < this.kMinFontSize ? this.kMinFontSize : fontsize) /*Mac,Linux bug*/ + "px", weight: "normal" })
                .setFill(fontcolor);
        }
        if (rotatedeg != null)
            t.setTransform([dojox.gfx.matrix.rotateAt(rotatedeg, p.x, p.y)]);
        return t;
    },

    drawText: function (surface, p, s, fontcolor, fontsize, align, italic) {
        if (align == null)
            align = "left";

        var t = null;
        if (dojox.gfx.renderer == "canvas") {
            t = surface.createText({ x: p.x, y: p.y + fontsize + 2, text: s });
            t.shape.fontStyle = (fontsize < this.kMinFontSize ? this.kMinFontSize : fontsize) /*Mac,Linux bug*/ + "px Arial";
            t.shape.fillStyle = fontcolor;
            t.shape.align = align;

            t.mwidth = this.getTextWidth(surface, t);
            t.getTextWidth = function () { return t.mwidth; };
        }
        else {
            var font = { family: "Arial", size: (fontsize < this.kMinFontSize ? this.kMinFontSize : fontsize) /*Mac,Linux bug*/ + "px", weight: "normal" };
            if (italic)
                font.style = "italic";
            t = surface.createText({ x: p.x, y: p.y + fontsize + 2, text: s, align: align })
                .setFont(font)
                .setFill(fontcolor);
        }

        if (align == "right") {
            var w = t.getTextWidth();
            t.setTransform([dojox.gfx.matrix.translate(-w, 0)]);
        }
        return t;
    },

    getTextWidth: function (surface, s) {
        var ctx = surface.surface.rawNode.getContext('2d');
        ctx.save();
        ctx.fillStyle = s.fillStyle;
        ctx.strokeStyle = s.fillStyle;
        ctx.font = s.fontStyle;
        ctx.textAlign = "center";
        //ctx.textBaseline = "bottom";
        var width = ctx.measureText(s.text).width / 6;
        ctx.restore();
        return width;
    },

    drawBasis: function (surface, p1, p2, color, linewidth) {
        this.drawLine(surface, p1, p2, color, linewidth);

        var d = new JSDraw2.Point(p2.x - p1.x, p2.y - p1.y).scale(1.0 / 6.0);
        var p = p1.clone().offset(-d.x * 0.5, -d.y * 0.5);
        for (var i = 0; i < 5; ++i) {
            p.offset(d.x, d.y);
            var t = p.clone().offset(d.x * 1.25, d.y * 1.25);
            t.rotateAround(p, -45);

            this.drawLine(surface, p, t, color, linewidth);
        }
    },

    drawCurves: function (surface, p1, p2, color, linewidth) {
        var path = surface.createPath();
        path.moveTo(p1.x, p1.y);

        var len = p1.distTo(p2);
        var n = Math.floor(len / linewidth);
        var d = new JSDraw2.Point(p2.x - p1.x, p2.y - p1.y).scale(1.0 / n);
        var v = new JSDraw2.Point(p2.x - p1.x, p2.y - p1.y).rotate(90).setLength(linewidth * 2);
        for (var k = 1; k <= n; k += 2) {
            var p = p1.clone().offset(d.x * k, d.y * k);
            var t1 = p.clone().offset(d.x, d.y);
            if (((k - 1) / 2) % 2 == 1)
                p.offset(v.x, v.y);
            else
                p.offset(-v.x, -v.y);
            path.qCurveTo(p.x, p.y, t1.x, t1.y);
        }
        path.setStroke({ color: color, width: linewidth });
    },

    drawLine: function (surface, p1, p2, color, linewidth, dotline, cap) {
        if (linewidth == null)
            linewidth = 1;

        if (dotline == null || dotline <= 1) {
            return surface.createLine({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
                .setStroke({ color: color, width: linewidth, cap: cap == null ? "round" : cap });
        }
        else {
            var len = p1.distTo(p2);
            var n = Math.floor(len / dotline);
            if (n % 2 == 0)
                --n;

            var d = p2.clone().offset(-p1.x, -p1.y).scale(1.0 / n);
            var d2 = d.clone().scale(0.3);
            var st = new JSDraw2.Point(((p2.x - p1.x) - d.x * n) / 2, ((p2.y - p1.y) - d.y * n) / 2);

            for (var k = 0; k < n; k += 2) {
                var t1 = p1.clone().offset(st.x + d.x * k + d2.x, st.y + d.y * k + d2.y);
                var t2 = t1.clone().offset(d.x - d2.x, d.y - d2.y);
                surface.createLine({ x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y })
                    .setStroke({ color: color, width: linewidth, cap: cap == null ? "round" : cap });
            }
        }
    },

    drawRect: function (surface, r, color, linewidth, radius, style) {
        if (r == null || r.isEmpty())
            return;
        var opts = { x: r.left, y: r.top, width: r.width, height: r.height };
        if (radius != null)
            opts.r = radius;
        if (style != null)
            opts.style = style;
        return surface.createRect(opts).setStroke({ color: color, width: linewidth });
    },

    drawDShape: function (surface, r, color, linewidth, reverse) {
        var rad = r.height / 2;
        var x = r.right() - rad;
        var y = r.center().y;
        var path = surface.createPath()
           .moveTo({ x: x, y: r.top })
           .arcTo(rad, rad, 0, false, true, this._calcPoint(x, y, rad, 180 / 2))
           .arcTo(rad, rad, 0, false, true, this._calcPoint(x, y, rad, 180))
            .lineTo({ x: r.left, y: r.bottom() })
            .lineTo({ x: r.left, y: r.top })
            .lineTo({ x: x, y: r.top })
           .closePath()
           .setStroke({ color: color, width: linewidth });

        if (reverse)
            path.setTransform([dojox.gfx.matrix.rotateAt(Math.PI, r.center().x, y)]);
        return path;
    },

    _calcPoint: function (x, y, rad, deg) {
        deg = (Math.PI / 180) * (360 - deg);
        return {
            x: Math.round((rad * -Math.sin(deg)) + x), y: Math.round(y - (rad * Math.cos(deg)))
        };
    },

    drawEllipse: function (surface, r, color, linewidth) {
        var c = r.center();
        return surface.createEllipse({ cx: c.x, cy: c.y, rx: r.width / 2, ry: r.height / 2 }).setStroke({ color: color, width: linewidth });
    },

    drawPie: function (surface, x, y, r, deg1, deg2) {
        var calcPoint = function (deg, rad) {
            deg = (Math.PI / 180) * (360 - deg);
            return { x: Math.round((r * -Math.sin(deg)) + x), y: Math.round(y - (r * Math.cos(deg)))
            };
        };
        return surface.createPath()
           .moveTo({ x: x, y: y })
           .lineTo(calcPoint(deg1))
           .arcTo(r, r, 0, false, true, calcPoint(deg2 / 2))
           .arcTo(r, r, 0, false, true, calcPoint(deg2))
           .lineTo({ x: x, y: y })
           .closePath()
           .setFill("#535353");
    },

    drawDiamond: function (surface, r, color, linewidth) {
        var c = r.center();
        var points = [
            { x: c.x, y: r.top },
            { x: r.right(), y: c.y },
            { x: c.x, y: r.bottom() },
            { x: r.left, y: c.y },
            { x: c.x, y: r.top }
        ];
        return surface.createPolyline(points).setStroke({ color: color, width: linewidth });
    },

    drawHexgon: function (surface, r, color, linewidth) {
        var c = r.center();
        var d = new JSDraw2.Point(0, r.width / 2);
        d.rotate(-30);
        var points = [
            { x: r.right(), y: c.y },
            { x: c.x + d.x, y: c.y - d.y },
            { x: c.x - d.x, y: c.y - d.y },
            { x: r.left, y: c.y },
            { x: c.x - d.x, y: c.y + d.y },
            { x: c.x + d.x, y: c.y + d.y },
            { x: r.right(), y: c.y }
        ];
        return surface.createPolyline(points).setStroke({ color: color, width: linewidth });
    }
};
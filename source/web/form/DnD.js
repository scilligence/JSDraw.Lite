//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

scil.DnD = scil.extend(scil._base, {
    constructor: function (parent, options) {
        this.src = null;
        this.copy = null;
        this.dragging = false;

        this.options = options;
        if (typeof (parent) == "string")
            parent = scil.byId(parent);

        var me = this;
        dojo.connect(parent, "onmousedown", function (e) { me.mousedown(e); });

        dojo.connect(document.body, "onmousemove", function (e) { me.mousemove(e); });
        dojo.connect(document.body, "onmouseup", function (e) { me.mouseup(e); });
    },

    isDragging: function() {
        return this.dragging;
    },

    cancel: function () {
        if (this.src != null) {
            if (this.options.oncancel != null)
                this.options.oncancel(this);
        }

        this.src = null;
        this.copy = null;
        this.dragging = false;
    },

    mousedown: function (e, src) {
        if (this.options.onstartdrag != null)
            this.src = this.options.onstartdrag(e, this);
    },

    mousemove: function (e) {
        if (this.src == null)
            return;

        if (this.copy == null) {
            if (this.options.oncreatecopy != null)
                this.copy = this.options.oncreatecopy(e, this);
        }

        if (this.copy != null) {
            var scroll = scil.Utils.scrollOffset();
            this.copy.style.left = (e.clientX + scroll.x) + "px";
            this.copy.style.top = (e.clientY + scroll.y) + "px";

            this.dragging = true;
        }
    },

    mouseup: function (e) {
        if (this.src != null) {
            if (this.options.ondrop != null)
                this.options.ondrop(e, this);
        }

        this.src = null;
        this.copy = null;
        this.dragging = false;
    }
});
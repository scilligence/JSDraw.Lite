//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

scil.Resizable = scil.extend(scil._base, {
    constructor: function (handle, options) {
        if (typeof (handle) == "string")
            handle = scil.byId(handle);
        this.options = options == null ? {} : options;
        this.resizing = null;
        this.handle = handle;
        this.bgcolor = this.handle.style.backgroundColor;

        if (this.options.direction == "y")
            handle.style.cursor = "ns-resize";
        else if (this.options.direction == "x")
            handle.style.cursor = "ew-resize";

        var me = this;
        dojo.connect(handle, "onmousedown", function (e) { me.start(e); });
        scil.connect(document.body, "onmousemove", function (e) { if (me.resize(e)) e.preventDefault(); });
        scil.connect(document.body, "onmouseup", function (e) { me.resizing = null; });

        if (this.options.mouseovercolor != null) {
            scil.connect(handle, "onmouseover", function () { me.handle.style.backgroundColor = me.options.mouseovercolor; });
            scil.connect(handle, "onmouseout", function () { me.handle.style.backgroundColor = me.bgcolor; });
        }
    },

    resize: function (e) {
        if (this.resizing == null)
            return false;

        var delta = this.options.direction == "y" ? (e.clientY - this.resizing.y) : (e.clientX - this.resizing.x);
        if (delta == 0)
            return true;

        var f = false;
        if (this.options.onresize != null)
            f = this.options.onresize(delta, this);

        if (f) {
            if (this.options.direction == "y")
                this.resizing.y = e.clientY;
            else
                this.resizing.x = e.clientX;
        }

        return true;
    },

    start: function (e) {
        if (this.options.direction == "y")
            this.resizing = { y: e.clientY };
        else if (this.options.direction == "x")
            this.resizing = { x: e.clientX };
    }
});
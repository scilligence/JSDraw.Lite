//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////


scil.Page.Explorer = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);

        this.options = options;

        this.resizing = null;
        if (options.resizable == null)
            options.resizable = true;

        var tbody = scil.Utils.createTable(parent, 0, 0, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr");

        if (options.left == false) {
            this.left = null;
            this.middle = null;
        }
        else {
            var w = options.leftwidth > 0 ? options.leftwidth : 200;
            var td = scil.Utils.createElement(tr, "td", null, { width: "1%", paddingRight: "1px" }, { vAlign: "top" });
            var tbody2 = scil.Utils.createTable(td, 0, 0, options.resizable ? null : { width: w });
            var tr2 = scil.Utils.createElement(tbody2, "tr");
            var td2 = scil.Utils.createElement(tr2, "td");
            this.left = scil.Utils.createElement(td2, "div", null, options.resizable ? { width: w, overflow: "hidden"} : null);

            if (options.middle != false) {
                this.middle = scil.Utils.createElement(tr, "td");
                var div = scil.Utils.createElement(this.middle, "div", null, { width: scil.Page.kHandleWidth });
                scil.Utils.unselectable(this.middle);
                scil.Utils.unselectable(div);
            }

            if (options.resizable) {
                var me = this;
                new scil.Resizable(this.middle, { direction: "x", mouseovercolor: scil.Page.kHandleColor, onresize: function (delta) { return me.onresize(delta); } });
            }
        }

        this.right = options.right == false ? null : scil.Utils.createElement(tr, "td", null, { width: "99%", paddingLeft: options.left == false ? null : "1px" }, { vAlign: "top" });
    },

    onresize: function (delta) {
        var w = scil.Utils.parsePixel(this.left.style.width) + delta;
        if (w > 20) {
            this.left.style.width = w + "px";
            if (this.options.onresize != null)
                this.options.onresize(w, this);
            return true;
        }
        return false;
    }
});


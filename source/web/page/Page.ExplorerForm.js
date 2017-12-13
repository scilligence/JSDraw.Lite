//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////


scil.Page.ExplorerForm = scil.extend(scil._base, {
    constructor: function (parent, options) {
        this.options = options == null ? {} : options;

        if (typeof (parent) == "string")
            parent = scil.byId(parent);

        var tbody = scil.Utils.createTable(parent, 0, 0, { width: "100%", background: "#fff" });
        this.dom = this.root = tbody.parentNode;
        if (this.options.visible == false)
            this.root.style.display = "none";

        if (options.caption == null) {
            tbody.parentNode.style.borderTop = "solid 1px " + scil.Page.ExplorerForm.kHeaderStyle.background;
            this.title = null;
        }
        else {
            this.title = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", scil.Lang.res(options.caption), scil.Page.ExplorerForm.kHeaderStyle);
        }
        this.toolbar = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, scil.Page.ExplorerForm.kToolbarStyle);
        if (options.toolbarvisible == false)
            this.toolbar.style.display = "none";
        this.toolbar.style.whiteSpace = "nowrap"; //I#11762

        this.main = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, scil.Page.ExplorerForm.kAreaStyle);
        this.div = scil.Utils.createElement(this.main, "div");
        this.table = tbody.parentNode;

        scil.Form.createToolbarButtons(this.toolbar, options.buttons, options.padding);

        if (this.title != null && options.expandable != false) {
            var me = this;
            dojo.connect(this.title, "onclick", function () {
                var f = !me.isExpanded();
                me.expand(f);
                if (me.options.onexpand != null)
                    me.options.onexpand(f);
            });

            if (options.expanded == false)
                this.expand(false);
        }

        if (this.options.marginTop != null)
            this.table.style.marginTop = this.options.marginTop;
        this.table.style.marginBottom = this.options.marginBottom == null ? "25px" : this.options.marginBottom;
    },

    isVisible: function () {
        return scil.Utils.isAllParentVisible(this.root);
    },

    show: function () {
        if (this.isVisible())
            return;
        this.root.style.display = "";

        if (this.host != null && this.host.refresh != null && this.host.refreshneeded)
            this.host.refresh();
    },

    hide: function () {
        this.root.style.display = "none";
    },

    collapse: function () {
        this.expand(false);
    },

    expand: function (f) {
        if (f == null)
            f = true;
        this.toolbar.style.display = f ? "" : "none";
        this.main.style.display = f ? "" : "none";
        this.title.style.backgroundImage = scil.App.imgSmall(f ? "expand.png" : "collapse.png", true);
        this.title.style.backgroundRepeat = "no-repeat";
        this.title.style.backgroundPosition = "left center";

        if (this.host != null && this.host.refresh != null && this.host.refreshneeded)
            this.host.refresh();
    },

    isExpanded: function () {
        return this.main.style.display == "";
    }
});


scil.apply(scil.Page.ExplorerForm, {
    kHeaderStyle: { background: "#88f", color: "white", padding: "3px 10px 3px 16px", whiteSpace: "nowrap", borderTopLeftRadius: "5px", borderTopRightRadius: "5px" },
    kToolbarStyle: { background: "#f5f5f5", border: "solid 1px #f5f5f5", padding: "0 5px 0 5px" },
    kAreaStyle: { border: "solid 1px #f5f5f5", padding: "5px" }
});
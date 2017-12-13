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
* Tabs class - Tabs Control
* @class scilligence.Tabs
* <pre>
* <b>Example:</b>
        &lt;div id="div1"&gt;&lt;/div&gt;
        &lt;script type="text/javascript"&gt;
            scil.ready(function () {
                var options = {
                    tabs: {
                        a: { caption: "Tab A" },
                        b: { caption: "Tab B", closable: true }
                    },
                    onRemoveTab: function (td, tabs) { alert("remove tab"); },
                    onBeforeShowTab: function (td, old, tabs) { },
                    onShowTab: function (td, old, tabs) { },
                    onCreateTab: function(td, clientarea, tabs) { },
                    border: true
                };

                var tabs = new scil.Tabs("div1", options);
            });
        &lt;/script&gt;
* </pre>
*/
scil.Tabs = scil.extend(scil._base, {
    constructor: function (parent, options) {
        var me = this;
        this.options = options == null ? {} : options;
        this.currenttab = null;
        this.area = null;

        if (typeof (parent) == "string")
            parent = dojo.byId(parent);

        var tabarea;
        var tbody = scil.Utils.createTable(parent, 0, 0, { width: "100%", marginBottom: this.options.marginBottom == null ? "20px" : this.options.marginBottom });
        this.dom = this.table = tbody.parentNode;
        this.vertical = true;
        var tabborder = this.options.border ? null : scil.Tabs.kBorderStyle;
        var areapadding = this.options.border ? "5px" : 0;
        var areaborder = this.options.border ? scil.Tabs.kBorderStyle : null;
        var taggap = this.options.tabgap == null ? "4px" : this.options.tabgap;
        switch (this.options.tablocation) {
            case "left":
                var tr = scil.Utils.createElement(tbody, "tr");
                tabarea = scil.Utils.createElement(tr, "td", null, { borderRight: tabborder, width: "1%", verticalAlign: "top", borderRightWidth: taggap });
                this.area = scil.Utils.createElement(tr, "td", null, { padding: areapadding, border: areaborder, width: "99%", verticalAlign: "top" });
                this.vertical = false;
                break;
            case "right":
                var tr = scil.Utils.createElement(tbody, "tr");
                this.area = scil.Utils.createElement(tr, "td", null, { padding: areapadding, border: areaborder, width: "1%", verticalAlign: "top" });
                tabarea = scil.Utils.createElement(tr, "td", null, { borderLeft: tabborder, width: "99%", verticalAlign: "top", borderLeftWidth: taggap });
                this.vertical = false;
                break;
            case "bottom":
                this.area = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, { padding: areapadding, border: areaborder });
                tabarea = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, { borderTop: tabborder, borderTopWidth: taggap });
                break;
            default: // top
                tabarea = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, { borderBottom: tabborder, borderBottomWidth: taggap });
                this.area = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, { padding: areapadding, border: areaborder });
                break;
        }

        this.tabcontainer = scil.Utils.createTable(tabarea, 0, 0);
        if (this.vertical)
            this.tr = scil.Utils.createElement(this.tabcontainer, "tr");

        if (this.options.showtabs == false)
            this.tr.style.display = "none";

        var tabs = this.options.tabs;
        if (tabs != null) {
            if (tabs.length > 0) {
                for (var i = 0; i < tabs.length; ++i)
                    this.addTab(tabs[i]);
            }
            else {
                for (var k in tabs)
                    this.addTab(tabs[k], k);
            }
        }
    },

    resizeClientarea: function (width, height) {
        var list = this.vertical ? this.tr.childNodes : this.tabcontainer.childNodes;
        for (var i = 0; i < list.length; ++i) {
            var td;
            if (this.vertical)
                td = list[i];
            else
                td = list[i].childNodes[0];

            if (td.clientarea == null)
                continue;

            if (width > 0) {
                td.clientarea.style.width = width + "px";
                this.options.clientareawidth = width;
            }
            if (height > 0) {
                td.clientarea.style.height = height + "px";
                this.options.clientareaheight = height;
            }
        }

        if (this.options.onresizeclientarea != null)
            this.options.onresizeclientarea(width, height, this);
    },

    addTab: function (options, key) {
        if (this.vertical) {
            if (this.tr.childNodes.length > 0)
                scil.Utils.createElement(this.tr, "td", "&nbsp;");
        }
        else {
            if (this.tabcontainer.childNodes.length > 0)
                scil.Utils.createElement(scil.Utils.createElement(scil.Utils.createElement(this.tabcontainer, "tr"), "td"), "div", null, { height: 5 });
        }

        var me = this;
        var caption = options.caption;
        var icon = options.icon;
        var padding = this.options.tabpadding == null ? "5px 10px 1px 10px" : this.options.tabpadding;
        var tr = this.vertical ? this.tr : scil.Utils.createElement(this.tabcontainer, "tr");
        var style = { border: "solid 1px #ddd", padding: padding, backgroundColor: "#eee" };

        switch (this.options.tablocation) {
            case "left":
                style.borderRight = "none";
                style.borderTopLeftRadius = "5px";
                style.borderBottomLeftRadius = "5px";
                break;
            case "right":
                style.borderLeft = "none";
                style.borderTopRightRadius = "5px";
                style.borderBottomRightRadius = "5px";
                break;
            case "bottom":
                style.borderTop = "none";
                style.borderBottomLeftRadius = "5px";
                style.borderBottomRightRadius = "5px";
                break;
            default: // top
                style.borderBottom = "none";
                style.borderTopLeftRadius = "5px";
                style.borderTopRightRadius = "5px";
                break;
        }

        var td = scil.Utils.createElement(tr, "td", null, style, { key: key || options.tabkey, sciltab: "1" });
        var tbody2 = scil.Utils.createTable2(td, null, { cellSpacing: 0, cellPadding: 0 });
        var s = (icon != null ? "<img src='" + icon + "'>" : "") + (caption == null ? "Tab" : scil.Lang.res(caption));

        var td2 = null;
        switch (this.options.tablocation) {
            case "left":
            case "right":
                td._label = scil.Utils.createElement(scil.Utils.createElement(tbody2, "tr"), "td", s, null, null, function (e) { me.showTab(td); });
                td2 = scil.Utils.createElement(scil.Utils.createElement(tbody2, "tr"), "td");
                break;
            case "bottom":
            default: // top
                var tr2 = scil.Utils.createElement(tbody2, "tr");
                td._label = scil.Utils.createElement(tr2, "td", s, null, null, function (e) { me.showTab(td); });
                td2 = scil.Utils.createElement(tr2, "td");
                break;
        }

        if (options.closable) {
            var img = scil.Utils.createButton(td2, { src: scil.Utils.imgSrc("img/del2.gif"), title: "Close", style: {}, onclick: function (e) { me.closeTab(td); } });
            img.style.marginLeft = "10px";
            td.style.paddingRight = "2px";

            scil.connect(td2, "onmouseover", function () { img.style.background = "#fff"; });
            scil.connect(td2, "onmouseout", function () { img.style.background = ""; });
        }

        if (options.onmenu != null) {
            scil.connect(td, "onmouseup",
                function (e) {
                    if (scil.Utils.isRightButton(e))
                        options.onmenu(e);
                    e.preventDefault();
                });
            scil.Utils.disableContextMenu(td);
        }

        options.caption = null;
        options.visible = this.currenttab == null;
        options.marginBottom = 0;
        options.caption = caption;

        td.clientarea = scil.Utils.createElement(this.area, "div", null, { display: "none", width: this.options.clientareawidth, height: this.options.clientareaheight, overflowY: this.options.clientareaheight > 0 ? "scroll" : null });
        if (options.style != null)
            dojo.style(td.clientarea, options.style);

        if (this.currenttab == null)
            this.showTab(td);

        if (options.html != null)
            td.clientarea.innerHTML = options.html;

        if (this.options.onCreateTab != null)
            this.options.onCreateTab(td, td.clientarea, this);

        return td;
    },

    updateTabLabel: function (key, s) {
        var td = typeof (key) == "string" ? this.findTab(key) : key;
        if (td != null && td._label != null)
            td._label.innerHTML = s;
    },

    closeTab: function (td) {
        var me = this;
        scil.Utils.confirmYes("Close this tab?", function () { me.removeTab(td); });
    },

    currentTabKey: function () {
        return this.currenttab == null ? null : this.currenttab.getAttribute("key");
    },

    findTab: function (key) {
        var list = this.vertical ? this.tr.childNodes : this.tabcontainer.childNodes;
        for (var i = 0; i < list.length; ++i) {
            var td;
            if (this.vertical)
                td = list[i];
            else
                td = list[i].childNodes[0];

            if (td.getAttribute("key") == key)
                return td;
        }
        return null;
    },

    removeTab: function (key) {
        var td = typeof (key) == "string" ? this.findTab(key) : key;
        if (td == null)
            return null;

        if (this.options.onRemoveTab != null)
            this.options.onRemoveTab(td, this);

        var list = this.allTabsAsArray();
        var i = scil.Utils.indexOf(list, td);

        if (i > 0)
            this.showTab(list[i - 1]);
        else
            this.showTab(list[i + 1]);

        td.clientarea.parentNode.removeChild(td.clientarea);
        delete td.clientarea;

        if (this.vertical) {
            var td0 = td.previousSibling;
            if (td0 != null && td0.clientarea == null)
                td0.parentNode.removeChild(td0);
            td.parentNode.removeChild(td);
        }
        else {
            var tr = td.parentNode;
            var tr0 = tr.previousSibling;
            if (tr0 != null)
                tr0.parentNode.removeChild(tr0);
            tr.parentNode.removeChild(tr);
        }
    },

    allTabsAsArray: function () {
        var ret = [];
        var list = this.vertical ? this.tr.childNodes : this.tabcontainer.childNodes;
        for (var i = 0; i < list.length; ++i) {
            var td;
            if (this.vertical)
                td = list[i];
            else
                td = list[i].childNodes[0];

            if (td.getAttribute("sciltab") == "1")
                ret.push(td);
        }
        return ret;
    },

    allTabs: function () {
        var ret = {};
        var list = this.vertical ? this.tr.childNodes : this.tabcontainer.childNodes;
        for (var i = 0; i < list.length; ++i) {
            var td;
            if (this.vertical)
                td = list[i];
            else
                td = list[i].childNodes[0];

            if (td.getAttribute("sciltab") == "1") {
                var k = td.getAttribute("key");
                if (k != null && k != "")
                    ret[k] = td;
            }
        }
        return ret;
    },

    showTab: function (td) {
        if (typeof (td) == "string") {
            td = this.findTab(td);
        }
        else if (typeof (td) == "number") {
            var list = this.allTabsAsArray();
            td = list[td];
        }

        if (td != null && td.tagName != "TD")
            td = scil.Utils.getParent(td, "td");

        if (td == null)
            return;

        var old = this.currenttab;
        if (this.options.onBeforeShowTab != null) {
            if (this.options.onBeforeShowTab(td, old) == false)
                return;
        }

        if (this.currenttab != null) {
            this.currenttab.style.backgroundColor = "#eee";
            this.currenttab.style.color = "";
        }

        if (old != null && old.clientarea != null)
            old.clientarea.style.display = "none";

        td.style.backgroundColor = scil.Tabs.kHighlightColor;
        td.style.color = "#fff";
        this.currenttab = td;
        if (td.clientarea != null)
            td.clientarea.style.display = "";

        if (this.options.onShowTab != null)
            this.options.onShowTab(td, old, this);
    },

    show: function () {
        this.table.style.display = "";
    },

    hide: function () {
        this.table.style.display = "none";
    }
});


scil.apply(scil.Tabs, {
    kHighlightColor: "#88f",
    kBorderStyle: "solid 1px #88f"
});
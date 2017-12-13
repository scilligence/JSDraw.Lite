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
* Tree class - Tree Control
* @class scilligence.Tree
* <pre>
* <b>Example:</b>
*    var parent = scil.Utils.createElement(document.body, "div");
*    var ac = scil.Tree(parent, { url: "/path/ajax.ashx?cmd=loadtree" });
* </pre>
*/
scil.Tree = scil.extend(scil._base, {
    /**
    * @constructor Tree
    * @param {string or DOM} parent - the parent element
    * @param {dictionary} options
    * @param {bool} solo
    */
    constructor: function (parent, options, solo, dropdown) {
        this.container = parent;
        this.options = options == null ? {} : options;
        this.solo = solo != null ? solo : this.options.solo;
        this.dropdown = dropdown != null ? dropdown : this.options.dropdown;

        this.onAddItem = null;
        this.onSelectItem = null;
        this.onExpandItem = null;
        this.cur = null;
        this.margin = 28;
        this.idname = "id";

        var me = this;
        scil.Utils.removeAll(parent);
        //dojo.connect(parent, "onclick", function (e) { me.onSelect(e.srcElement || e.target); });
    },

    clear: function () {
        scil.Utils.removeAll(this.container);
    },

    reloadCur: function () {
        if (this.cur == null)
            return;

        this.reload(this.cur);
    },

    reload: function (node) {
        if (node == null)
            return false;

        node.removeAttribute("loaded");
        if (node.firstChild.nextSibling != null)
            node.removeChild(node.firstChild.nextSibling);

        var img = this._expand(node);
        this.onExpand(img);
        return true;
    },

    getCurRoot: function () {
        return this.getRoot(this.cur);
    },

    getRoot: function (node) {
        if (node == null)
            return null;

        var n = this.getParent(node);
        var p = node;
        while (n != null) {
            p = n;
            n = this.getParent(p);
        }
        return p;
    },

    getParent: function (node) {
        return node.parentNode == null || node.parentNode == this.container ? null : node.parentNode.parentNode;
    },

    add: function (parent, item) {
        if (item == null)
            return null;

        if (item.length != null) {
            for (var i = 0; i < item.length; ++i)
                this.add(parent, item[i]);
            return null;
        }

        if (item._more)
            item.leaf = true;
        if (this.options.onAddItem != null)
            item = this.options.onAddItem(item);
        else if (this.onAddItem != null)
            item = this.onAddItem(item);

        var n = null;
        if (parent == null) {
            n = scilligence.Utils.createElement(this.container, "div");
        }
        else {
            var container = parent.firstChild.nextSibling;
            if (container == null)
                container = scil.Utils.createElement(parent, "div", null, { marginLeft: this.margin + "px" });
            n = scil.Utils.createElement(container, "div");
        }

        n.item = item;

        var m = scilligence.Utils.createElement(n, "div", null, { padding: "3px 0 3px 0", whiteSpace: "nowrap" });
        var img = scilligence.Utils.createElement(m, "img", null, { width: "16px" }, item.leaf || item.disabled ? { src: scil.Utils.imgSrc("img/blank.gif")} : { src: scil.Utils.imgSrc("img/plus.gif"), title: "Expand" });
        var me = this;
        dojo.connect(img, "onclick", function (e) { me.onExpand(e.srcElement || e.target); });
        if (this.dropdown)
            scilligence.Utils.createElement(m, "img", null, null, { src: item.shortcut ? "img/status_shortcut.gif" : "img/status_" + (item.status == null || item.status == "" ? "open" : item.status) + ".gif" });
        if (item.icon != null) {
            if (item.icon.indexOf('/') < 0)
                item.icon = "img/icons/" + item.icon + ".gif";
            scilligence.Utils.createElement(m, "img", null, { paddingRight: this.options.icongap }, { src: item.icon });
        }

        scil.Utils.createElement(m, "span", item._more ? "<u style='color:blue;cursor:pointer'>more...</u>" : item.name);
        m.className = "tbar";
        if (item.disabled) {
            m.style.color = "gray";
            m.setAttribute("disabled", "on");
        }
        else {
            m.style.cursor = "pointer";
            dojo.connect(m, "onclick", function (e) { if ((e.target || e.srcElement) != m.firstChild) me.select(m.parentNode); });
        }

        this.add(n, item.children);
        if (parent != null)
            this.expand(parent, true);
        if (item.expand == false)
            this.expand(n, false);

        if (item.selected)
            this.select(n);
        return n;
    },

    expand: function (node, f) {
        var bar = node.firstChild;
        var img = bar.firstChild;
        if (bar.nextSibling == null) {
            img.src = "img/blank.gif";
            img.removeAttribute("title");
        }
        else {
            bar.nextSibling.style.display = f ? "" : "none";
            this._expand(node, f);
        }
    },

    _expand: function (node, f) {
        var img = node.firstChild.firstChild;
        img.src = scil.Utils.imgSrc(f ? "img/minus.gif" : "img/plus.gif");
        img.setAttribute("title", f ? "Shrink" : "Expand");
        return img;
    },

    shrinkSiblings: function (node) {
        var list = node.parentNode.childNodes;
        for (var i = 0; i < list.length; ++i) {
            if (list[i] != node)
                this.expand(list[i], false);
        }
    },

    onExpand: function (img) {
        var bar = img.parentNode;
        if (bar.tagName != "DIV" || bar.className != "tbar")
            return;

        var f = null;
        var n = bar.parentNode;
        if (n != null && n.item != null && n.item.leaf)
            return;

        if (this.options.url == null || n.getAttribute("loaded") == "1" || bar.nextSibling != null) {
            f = bar.nextSibling == null || bar.nextSibling.style.display == "none";
            this.expand(n, f);
            if (f && this.solo)
                this.shrinkSiblings(n);
            return;
        }

        if (this.onExpandItem != null) {
            if (this.onExpandItem(n, f))
                return;
        }

        this.loadNodes(n);
    },

    loadNodes: function (n) {
        var me = this;
        var fn = function (ret) {
            if (n.item._more) {
                var parent = n.parentNode;
                parent.removeChild(n);
                n = parent.parentNode;
            }
            else {
                if (n.getAttribute("loaded") == "1")
                    return;
                n.setAttribute("loaded", "1");
            }

            if (ret.rows != null && ret.rows.length > 0)
                me.add(n, ret.rows);
            else if (ret.length > 0)
                me.add(n, ret);
            me.expand(n, true);
        };

        if (n.item.children != null) {
            fn(n.item.children);
            return;
        }

        var beforeload = function () { n.firstChild.firstChild.src = scil.Utils.imgSrc("img/animatorsmall.gif") };
        var afterload = function () { n.firstChild.firstChild.src = scil.Utils.imgSrc("img/plus.gif") };
        var args = n.item;
        if (this.onAjaxData != null)
            args = this.onAjaxData(n);
        if (this.options.url != null && this.options.url != "")
            scil.Utils.ajax(this.options.url, fn, args, { popup: false, beforeload: beforeload, afterload: afterload });
    },

    select: function (node) {
        if (typeof node == "string")
            node = this.find(null, node);

        if (node == null || node.item != null && node.item.selectable == false)
            return;

        if (node.item != null && node.item._more) {
            this.loadNodes(node);
            return;
        }

        if (this.cur != null)
            this.cur.firstChild.style.background = "";
        this.cur = node;
        if (this.dropdown && this.cur != null)
            this.cur.firstChild.style.background = "#f6f4b9";
        this.cur.firstChild.style.background = "#ddf";
        if (this.onSelectItem != null) {
            var isleaf = null;
            if (this.cur != null)
                isleaf = this.cur.firstChild.nextSibling == null;
            this.onSelectItem(this.cur, isleaf);
        }
    },

    getIconText: function (node) {
        if (node == null)
            return null;
        var img = node.firstChild.childNodes[2];
        if (img.tagName == "SPAN")
            return img.innerHTML;
        return "<img src='" + img.src + "'>" + img.nextSibling.innerHTML;
    },

    setCurrent: function (value, key) {
        var n = this.find(null, value, key);
        if (n != null)
            this.select(n);

        return n;
    },

    find: function (parent, value, key) {
        var container = parent == null ? this.container : parent.firstChild.nextSibling;
        if (container == null)
            return null;

        if (key == null)
            key = "id";

        var children = container.childNodes;
        for (var i = 0; i < children.length; ++i) {
            var n = children[i];
            if (n.item != null && n.item[key] == value)
                return n;

            var c = this.find(n, value, key);
            if (c != null)
                return c;
        }
        return null;
    },

    getChildren: function (parent) {
        var container = parent == null ? this.container : parent.firstChild.nextSibling;
        return container == null ? null : container.childNodes;
    },

    getParent: function (n) {
        return n.parentNode.parentNode;
    }
});
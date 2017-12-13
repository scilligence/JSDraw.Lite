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
* ContextMenu class
* <pre>
* <b>Example:</b>
*    var callback = function (key, obj) {
*        alert( key + " clicked");
*    };
*
*    var items = [{ caption: "Color", key: "x", callback: function (key) { alert("Color: " + key);  }, children: ["Red", "Blue"] },
*            "Small", "Big"
*        ];
*
*    var menu = new scil.ContextMenu(items, callback, null);
*    function test() {
*        menu.show(100, 100);
*    }
* </pre>
* @class scilligence.ContextMenu
*/
scil.ContextMenu = scil.extend(scil._base, {
    /**
    * @constructor ContextMenu
    * @param {array} items - an array of menu item deifinitions
    * @param {function} callback - callback function
    * @param {Menu} parentMenu - parent menu item
    */
    constructor: function (items, callback, parentMenu, doc, lang) {
        this.document = doc == null ? document : doc;
        this.tbody = null;
        this.callback = callback;
        this.submenus = {};
        this.items = items;
        this.cur = null;
        this.parentMenu = parentMenu;
        this.obj = null;
        this.lang = lang != null ? lang : scil.Lang;
    },

    isFrom: function (e) {
        if (this.tbody == null)
            return false;
        if (scil.Utils.isChildOf(e, this.tbody.parentNode))
            return true;

        for (var k in this.submenus) {
            if (this.submenus[k].isFrom(e))
                return true;
        }

        return false;
    },

    /**
    * Show this context menu
    * @function show
    * @param {number} x - x coordinate
    * @param {number} y - y coordinate
    * @param {object} obj - tagged object
    */
    show: function (x, y, obj, items, left) {
        this.hide();
        this._create(items);
        this.obj = obj;

        var maxZindex = scil.Utils.getMaxZindex();
        var parent = this.tbody.parentNode;
        parent.style.display = "";
        parent.style.zIndex = maxZindex > 0 ? maxZindex + 1 : 100;
        scil.Utils.moveToScreen(x, y, parent, left);
    },

    /**
    * Hide context menu
    * @function hide
    */
    hide: function (hideParent) {
        if (this.tbody == null || this.tbody.parentNode.style.display == "none")
            return false;
        this.tbody.parentNode.style.display = "none";
        for (var k in this.submenus)
            this.submenus[k].hide();
        this.setCur(null);
        if (hideParent && this.parentMenu != null)
            this.parentMenu.hide(hideParent);
        return true;
    },

    /**
    * Check if the menu is visible
    * @function isVisible
    * @returns true or false
    */
    isVisible: function () {
        return this.tbody != null && this.tbody.parentNode.style.display != "none";
    },

    _create: function (items) {
        if (items != null)
            this.items = items;
        if (this.tbody == null) {
            var me = this;
            this.tbody = scil.Utils.createTable(this.document.body, 0, 0, { position: "absolute", display: "none", backgroundColor: "#eee", color: "#000", border: "solid 1px #ddd" });
            this.tbody.setAttribute("jspopupmenu", "1");
            dojo.connect(this.tbody.parentNode, "onmousedown", function (e) { if (e.button != 2) me.click(e); });
            dojo.connect(this.tbody.parentNode, "onmouseover", function (e) { me.hilit(e); });
            dojo.connect(this.document.body, "onmousedown", function (e) { me.clickOut(e); });
            this._createItems();
        }
        else if (items != null) {
            this._createItems();
        }
    },

    _createItems: function () {
        scil.Utils.removeAll(this.tbody);
        for (var i = 0; i < this.items.length; ++i) {
            var item = this.items[i];
            if (item == "-") {
                if (i == 0 || this.items[i - 1] == "-" || i == this.items.length - 1)
                    continue;
                var tr = scil.Utils.createElement(this.tbody, "tr");
                scil.Utils.createElement(tr, "td", null, { textAlign: "center", width: "20px", backgroundColor: "#f5f5f5" });
                scil.Utils.createElement(tr, "td", "<hr style='margin:0;padding:0'>", { padding: "0 2px 0 2px" }).colSpan = 3;
            }
            else {
                if (typeof item == "string")
                    item = { caption: item };
                if (item.key == null)
                    item.key = item.caption;
                var sub = item.children != null && item.children.length > 0;
                var bg = item.bg == null ? "#eee" : item.bg;
                var tr = scil.Utils.createElement(this.tbody, "tr", null, { backgroundColor: bg }, item.disabled ? null : { menukey: item.key });
                scil.Utils.createElement(tr, "td", item.checked ? "&#10004;" : null, { textAlign: "center", width: "20px", backgroundColor: "#f5f5f5" });
                var style = { padding: "1px 3px 1px 3px", color: item.disabled ? "gray" : "" };
                var s = item.nottranslate ? item.caption : this.lang.res(item.caption);
                if (item.icon != null)
                    s = "<img src='" + item.icon + "'>" + s;
                scil.Utils.createElement(tr, "td", s, style);
                style.fontSize = "75%";
                style.paddingLeft = "10px";
                scil.Utils.createElement(tr, "td", item.shortcut == null ? "" : item.shortcut, style);
                scil.Utils.createElement(tr, "td", sub ? "&rsaquo;" : null, { textAlign: "right", width: "30px", paddingRight: "5px" });

                if (sub)
                    this.submenus[item.key] = new scil.ContextMenu(item.children, item.callback == null ? this.callback : item.callback, this, this.document);
                else
                    delete this.submenus[item.key];
            }
        }
    },

    hilit: function (e) {
        var tr = scil.Utils.getParent(e.srcElement || e.target, "TR");
        if (tr != null && tr.getAttribute("menukey") != null)
            this.setCur(tr);
    },

    setCur: function (tr) {
        if (this.cur != null) {
            this.cur.childNodes[0].style.backgroundColor = "#f5f5f5";
            this.cur.childNodes[1].style.backgroundColor = "";
            this.cur.childNodes[2].style.backgroundColor = "";
            this.cur.childNodes[3].style.backgroundColor = "";
            var sub = this.submenus[this.cur.getAttribute("menukey")];
            if (sub != null)
                sub.hide();
        }

        this.cur = tr;
        if (tr != null) {
            tr.childNodes[0].style.backgroundColor = "#aaf";
            tr.childNodes[1].style.backgroundColor = "#aaf";
            tr.childNodes[2].style.backgroundColor = "#aaf";
            tr.childNodes[3].style.backgroundColor = "#aaf";
            var sub = tr == null ? null : this.submenus[tr.getAttribute("menukey")];
            if (sub != null) {
                var p = scil.Utils.getOffset(tr.childNodes[3], false);
                var p2 = scil.Utils.getOffset(tr.childNodes[0], false);
                sub.show(p.x + tr.childNodes[3].offsetWidth + 1, p.y, null, null, p2.x);
            }
        }
    },

    getCallbackObj: function () {
        return this.parentMenu == null ? this.obj : this.parentMenu.getCallbackObj();
    },

    click: function (e) {
        var tr = scil.Utils.getParent(e.srcElement || e.target, "TR");
        var key = tr == null ? null : tr.getAttribute("menukey");
        if (this.submenus[key] != null)
            return;
        if (key != null && this.callback != null)
            this.callback(key, this.getCallbackObj(), tr.childNodes[0].innerHTML != "");
        this.hide(true);
        e.preventDefault();
    },

    clickOut: function (e) {
        var tbody = scil.Utils.getParent(e.srcElement || e.target, "TBODY");
        if (tbody != null && tbody.getAttribute("jspopupmenu") == "1")
            return;
        this.hide();
    }
});

scil.apply(scil.ContextMenu, {
    isFromContextMenu: function (src) {
        var tbody = scil.Utils.getParent(src, "TBODY");
        return tbody != null && tbody.getAttribute("jspopupmenu") == "1";
    }
});


JSDraw2.ContextMenu = scil.ContextMenu;
//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

/**
* DropdownButton class
* @class scilligence.DropdownButton
* <pre>
* <b>Example:</b>
*    &lt;button id='d'&gt;Select City&lt;/button&gt;
*    &lt;script type="text/javascript"&gt;
*        scil.ready(function () {
*            new scil.DropdownButton('d', { items: ["Boston", "New York", "London"], 
*                callback: function (city) { alert(city); } });
*        });
*    &lt;/script&gt;
* </pre>
*/
scilligence.DropdownButton = scilligence.extend(scilligence._base, {
    /**
    * @constructor DropdownButton
    * @param {string or DOM} button - the BUTTON element to be converted
    * @param {dict} options - { items: [], callback: function(item) {} }
    */
    constructor: function (button, options) {
        this.auto = null;
        this.options = options == null ? {} : options;

        var me = this;
        this.button = typeof (button) == "string" ? document.getElementById(button) : button;
        dojo.connect(this.button, "onclick", function () { me.show(); });

        var s = this.options.dropdown == null ? "&#9660;" : this.options.dropdown;
        if (this.button.tagName == 'TABLE') {
            var list = this.button.getElementsByTagName("TD");
            var td = list[list.length - 1];
            scil.Utils.createElement(td, "span", s);
        }
        else {
            if (this.options.expandright)
                scil.Utils.createElement(this.button, "span", s, { fontSize: "70%" });
            else
                scil.Utils.createElement(this.button, "span", s, { fontSize: "70%" });
        }
    },

    isVisible: function () {
        return this.auto != null && this.auto.style.display == "";
    },

    show: function () {
        if (this.options.onshowdropdown != null)
            this.options.onshowdropdown(this);

        if (this.auto == null) {
            var me = this;
            var w = this.options.width;
            if (!(w > 0) && scil.Utils.isIE && scil.Utils.isIE <= 8)
                w = 200;

            var pos = scil.Utils.isFixedPosition(this.button) ? "fixed" : "absolute";
            var tbody = scil.Utils.createTable(document.body, 0, 1, { borderRadius: "2px", border: JSDraw2.Skin.dialog.border, backgroundColor: JSDraw2.Skin.dialog.bkcolor, display: "none", position: pos, width: w });
            this.auto = tbody.parentNode;

            var div = JsUtils.createElement(JsUtils.createElement(tbody, "tr"), "td", null, { padding: "5px" });
            this.area = scil.Utils.createElement(div, "div", null, { backgroundColor: "#fff" });
            //this.auto = scil.Utils.createElement(document.body, "div", null, { display: "none", backgroundColor: this.options.backgroundColor == null ? "white" : this.options.backgroundColor, border: "solid 1px gray", position: "absolute", width: w });

            dojo.connect(document.body, "onmousedown", function (e) { var src = e.srcElement || e.target; if (src != me.q && !scil.Utils.isChildOf(src, me.auto)) me.clickout(); });
            this.list(this.options.items);
        }
        this.auto.style.display = "";
        this.position();
    },

    hide: function () {
        if (this.auto != null)
            this.auto.style.display = "none";
    },

    position: function () {
        var p = scilligence.Utils.getOffset(this.button);
        var scroll = scilligence.Utils.scrollOffset();
        var zIndex = scil.Utils.getZindex(this.button) + 1;
        if (scil.Utils.isIE) {
            var s2 = JsUtils.getScrollOffset(this.e);
            scroll.offset(-s2.x, -s2.y);
        }

        var x, y;
        if (this.options.expandright) {
            x = p.x + scroll.x + this.button.offsetWidth;
            y = p.y + scroll.y;
        }
        else {
            x = p.x + scroll.x;
            y = p.y + scroll.y + this.button.offsetHeight;
        }
        dojo.style(this.auto, { zIndex: zIndex, display: "", x: 0, y: 0 });
        scil.Utils.moveToScreen(x, y, this.auto);
    },

    list: function (items) {
        if (items == null || items.length == 0)
            return;

        if (this.auto.style.display != "")
            this.position();

        if (items.length == null) {
            var list = [];
            for (var k in items)
                list.push({ label: items[k], key: k });
            items = list;
        }

        scil.Utils.removeAll(this.area);
        var me = this;
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            if (item == "-" && (i == 0 || items[i - 1] == "-" || i == items.length - 1))
                continue;
            this.createItem(item);
        }
    },

    createItem: function (item) {
        if (item == "-") {
            scil.Utils.createElement(this.area, 'hr', null, { margin: 0, padding: 0, borderColor: scil.App.config == null ? null : scil.App.config.frame });
            return;
        }

        if (typeof (item) == "string")
            item = { label: item };

        var label = this.options.translate ? scil.Lang.res(item.label) : item.label;
        if (item.key == null && label != item.label)
            item.key = item.label;

        var div = scil.Utils.createElement(this.area, 'div', null, { padding: "3px 10px 3px 10px", color: JSDraw2.Skin.menu.color, cursor: "pointer" }, { url: item.url, key: item.key });

        var div2 = div;
        if (item.items != null && item.items.length > 0) {
            var tbody = scil.Utils.createTable(div, 0, 0, { width: "100%" });
            var tr = scil.Utils.createElement(tbody, "tr");
            var div2 = scil.Utils.createElement(tr, "td", null, { textAlign: "left" });
            scil.Utils.createElement(tr, "td", "&#9658;", { paddingLeft: "10px", textAlign: "right", fontSize: "50%" });
        }

        if (item.icon != null)
            scil.Utils.createElement(div2, "img", null, { marginRight: "5px" }, { src: item.icon });
        if (label != null)
            scil.Utils.createElement(div2, "span", label);

        var me = this;
        if (item.items != null && item.items.length > 0) {
            item.expandright = true;
            item.dropdown = "";
            new scil.DropdownButton(div, item);
        }
        else {
            if (item.key == null && item.label != null)
                item.key = item.label;
            dojo.connect(div, "onclick", function (e) { if (item.onclick != null) item.onclick(); me.click(e, div); });
        }

        dojo.connect(div, "onmouseover", function (e) { me.mouseover(e, div); });
        dojo.connect(div, "onmouseout", function (e) { me.mouseout(e, div); });
    },

    getItem: function (e) {
        var src = e.srcElement || e.target;
        if (src.tagName != "DIV")
            src = scil.Utils.getParent(src, "DIV");
        return src;
    },

    mouseover: function (e) {
        this.getItem(e).style.backgroundColor = "#ddf";
        this.getItem(e).style.color = JSDraw2.Skin.menu.highlightcolor;
    },

    mouseout: function (e) {
        this.getItem(e).style.backgroundColor = "#fff";
        this.getItem(e).style.color = JSDraw2.Skin.menu.color;
    },

    clickout: function (e) {
        this.hide();
    },

    click: function (e) {
        var src = this.getItem(e);
        var url = src.getAttribute("url");
        var key = src.getAttribute("key");
        if (this.options.callback != null)
            this.options.callback(key == null || key == "" ? src.innerText || src.textContent : key, url);
        else if (this.options.onclick != null)
            this.options.onclick(key == null || key == "" ? src.innerText || src.textContent : key, url);
        else if (url != null) {
            if (this.options.target == null)
                window.location = url;
            else
                window.open(url, this.options.target);
        }
        this.hide();
    }
});
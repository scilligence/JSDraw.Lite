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
* AutoComplete class - Convert a INPUT field into a auto-complete field
* @class scilligence.AutoComplete
* <pre>
* <b>Example:</b>
*    var input = scil.Utils.createElement(document.body, "input");
*    var ac = new scil.AutoComplete(element, "http://server/ajax.ashx?cmd=autocomplete");
* </pre>
*/
scil.AutoComplete = scil.extend(scilligence._base, {
    /**
    * @constructor AutoComplete
    * @param {string or DOM} element - the INPUT element to be converted
    * @param {string} url Ajax url to list items.  The ajax service should return { succeeded: true, ret: { items: [] } }
    */
    constructor: function (element, url, options, form) {
        this.input = null;
        this.auto = null;
        this.url = url;
        this.sugid = 0;
        this.disabled = false;
        this.options = options == null ? {} : options;
        this.form = form;

        var me = this;
        this.input = typeof (element) == "string" ? document.getElementById(element) : element;
        if (this.input.tagName == "INPUT") {
            scil.connect(this.input, "onkeyup", function (e) { me.keydown(e); });

            this.auto = scil.Utils.createElement(document.body, "div", null, { display: "none", backgroundColor: "white", border: "solid 1px gray", position: "absolute" });
            scil.connect(document.body, "onmousedown", function (e) { var src = e.srcElement || e.target; if (src != me.q && !scil.Utils.isChildOf(src, me.auto)) me.clickout(); });

            if (this.options.listedonly) {
                scil.connect(this.input, "onblur", function (e) { me.validateList(); });
            }
        }

        scil.AutoComplete._all.push(this);
    },

    validateList: function() {
        var s = this.input.value;
        if (this.items == null || scil.Utils.indexOf(this.items, s) < 0)
            this.input.value = "";
    },

    isVisible: function () {
        return this.auto != null && this.auto.style.display == "";
    },

    hide: function () {
        if (this.auto != null)
            this.auto.style.display = "none";
    },

    keydown: function (e) {
        if (this.disabled || this.input == null || this.url == null || this.url == "")
            return;

        if (this.input.value.length < 1 || e.keyCode == 27 || (e.ctrlKey || e.metaKey)) {
            this.auto.style.display = "none";
            return;
        }

        if (!this.isVisible() && e.keyCode == 13)
            return;

        if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13) {
            this.highlight(e);
            return;
        }

        var sugid = ++this.sugid;
        if (scil.Utils.startswith(this.url, "data:")) {
            // local data
            var ret = this.filterlist(this.url.substr(5).split(','), this.input.value);
            this.list(ret, sugid);
        }
        else {
            // url to ajax call
            var me = this;
            var args = { q: this.input.value };
            if (this.options.onsuggest != null)
                this.options.onsuggest(args, this.form);
            scil.Utils.jsonp(this.url, function (ret) { me.list(ret.items == null ? ret : ret.items, sugid); }, args);
        }
    },

    filterlist: function (list, q) {
        var ret = [];
        if (q != null && q != "" && list != null) {
            q = q.toLowerCase();
            for (var i = 0; i < list.length; ++i) {
                if (list[i].toLowerCase().indexOf(q) >= 0)
                    ret.push(scil.Utils.trim(list[i]));
            }
        }
        return ret;
    },

    isParentHidden: function (q) {
        var obj = q;
        while (obj != null && obj.style != null) {
            if (obj.style.display == "none" || obj.style.visibility == "hidden")
                return true;
            obj = obj.parentNode;
        }
        return false;
    },

    list: function (items, sugid) {
        if (items == null || items.length == 0 || sugid != this.sugid || this.isParentHidden(this.input)) {
            this.items = null;
            this.auto.style.display = "none";
            return;
        }

        if (this.auto.style.display != "") {
            var p = scilligence.Utils.getOffset(this.input);
            var scroll = scilligence.Utils.scrollOffset();
            var zIndex = scil.Utils.getZindex(this.input) + 1;
            if (scil.Utils.isIE) {
                var s2 = JsUtils.getScrollOffset(this.e);
                scroll.offset(-s2.x, -s2.y);
            }
            var w = this.input.offsetWidth;
            if (this.options.minautowidth > 0 && this.options.minautowidth > w)
                w = this.options.minautowidth;
            if (w < 100)
                w = 100;
            var pos = scil.Utils.isFixedPosition(this.input) ? "fixed" : "absolute";
            dojo.style(this.auto, { zIndex: zIndex, position: pos, display: "", width: (w - 2) + "px", left: (p.x + scroll.x) + "px", top: (p.y + scroll.y + this.input.offsetHeight) + "px" });
        }

        this.items = items;
        scilligence.Utils.removeAll(this.auto);
        var me = this;
        for (var i = 0; i < items.length; ++i) {
            var div = scilligence.Utils.createElement(this.auto, 'div', items[i]);
            dojo.connect(div, "onclick", function (e) { me.click(e); });
            dojo.connect(div, "onmouseover", function (e) { me.mouseover(e); });
            dojo.connect(div, "onmouseout", function (e) { me.mouseout(e); });
        }
    },

    highlight: function (e) {
        if (this.auto == null || this.auto.style.display == "none")
            return;

        e.preventDefault();
        if (e.keyCode == 27) {
            this.hide();
            return;
        }

        var children = this.auto.childNodes;
        var sel = null;
        for (var i = 0; i < children.length; ++i) {
            var item = children[i];
            if (item.getAttribute("sel") == "1") {
                sel = i;
                break;
            }
        }

        if (e.keyCode == 13) {
            if (sel != null)
                this.clickItem(children[sel]);
            return;
        }

        var newsel = null;
        if (e.keyCode == 38 || e.keyCode == 40) {
            if (sel == null) {
                newsel = 0;
            }
            else if (e.keyCode == 38) {
                newsel = sel - 1;
                if (newsel < 0)
                    newsel = children.length - 1;
            }
            else {
                newsel = sel + 1;
                if (newsel >= children.length)
                    newsel = 0;
            }

            e.preventDefault();
        }

        if (newsel != null && newsel != sel) {
            if (sel != null)
                this._hilitItem(children[sel], false);
            this._hilitItem(children[newsel], true);
        }
    },

    mouseover: function (e) {
        this._hilitItem(e.srcElement || e.target, true);
    },

    mouseout: function (e) {
        this._hilitItem(e.srcElement || e.target, false);
    },

    _hilitItem: function (item, f) {
        if (f) {
            item.style.backgroundColor = "#ddf";
            item.setAttribute("sel", "1");
        }
        else {
            item.style.backgroundColor = "white";
            item.removeAttribute("sel");
        }
    },

    getItemValue: function (src) {
        var s = unescape(src.innerHTML);
        if (s == "&nbsp;")
            s = "";
        return s;
    },

    click: function (e) {
        var src = e.srcElement || e.target;
        this.clickItem(src);
    },

    clickItem: function (src) {
        var s = this.getItemValue(src);
        if (this.options.onSetValue != null)
            this.options.onSetValue(this.input, s);
        else if (this.options.overwrite == "unit")
            this.input.value = this.changeUnit(this.input.value, s);
        else if (this.options.overwrite == false)
            this.input.value += s;
        else
            this.input.value = s;
        this.hide();
        if (this.options.overwrite)
            this.input.select();
        this.input.focus();

        if (this.options.onclickitem != null)
            this.options.onclickitem(s);
    },

    clickout: function (e) {
        if (this.auto.style.display == "")
            this.auto.style.display = "none";
    }
});

scil.apply(scil.AutoComplete, {
    _all: [],

    hideAll: function () {
        for (var i = 0; i < this._all.length; ++i)
            this._all[i].hide();
    }
});
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
* DropdownInput class
* @class scilligence.DropdownInput
* <pre>
* <b>Example:</b>
*    &lt;input id='d'/&gt;
*    &lt;script type="text/javascript"&gt;
*        scil.ready(function () {
*            new scil.DropdownInput('d', { items: ["Boston", "New York", "London"],
*                onclickitem: function (city) { alert(city); } 
*            });
*        });
*    &lt;/script&gt;
* </pre>
*/

document.write('<style type="text/css">input._scil_dropdown::-ms-clear {display: none;}</style>');

scil.DropdownInput = scil.extend(scilligence._base, {
    /**
    * @constructor DropdownInput
    * @param {string or DOM} input - the INPUT element to be converted
    * @param {dict} options - { items: [], overwrite: true/false, onclickitem: function(item) {}, onsuggest: function(args) {}, augto }
    */
    constructor: function (input, options) {
        this.auto = null;
        this.options = options == null ? {} : options;
        this.input = typeof (input) == "string" ? document.getElementById(input) : input;
        this.itemschanged = true;
        this.sugid = 0;
        this.suggestlength = this.options.suggestlength > 0 ? this.options.suggestlength : 1;

        if (this.options.autosuggest == "")
            this.options.autosuggest = null;

        var me = this;
        this.input.style.background = "#fff " + scil.Utils.imgSrc("img/dropdown.gif", true) + " no-repeat right center";
        this.input.style.border = "solid 1px #999";
        this.input.style.padding = "2px";
        this.input.className = "_scil_dropdown";
        this.updateReadonly();

        dojo.connect(this.input, "onkeyup", function (e) { me.keyup(e); });
        dojo.connect(this.input, "onclick", function (e) { me.clickMe(e); });
    },

    updateDropdown: function (readonly) {
        if (readonly != null) {
            this.options.readonly = readonly;
            this.updateReadonly();
        }
        this.input.style.backgroundImage = this.options.items == null ? "" : scil.Utils.imgSrc("img/dropdown.gif", true);
    },

    updateReadonly: function () {
        this.input.readOnly = this.options.readonly;
        this.input.style.backgroundColor = this.options.readonly ? "#eee" : "#fff";
    },

    keyup: function (e) {
        if (this.disabled || this.input == null || this.options.autosuggest == null && this.options.onFilter == null && this.options.items == null)
            return;

        if (this.options.readonly) {
            if (this.options.items != null)
                this.highlight(e);
            return;
        }

        if (this.input.value.length < this.suggestlength || e.keyCode == 9 || e.keyCode == 13) {
            if (this.auto != null)
                this.auto.style.display = "none";
            return;
        }

        var sugid = ++this.sugid;
        if (this.options.onFilter != null) {
            var ret = this.options.onFilter(this.input.value);
            this.list(ret, sugid);
            this.itemschanged = true;
        }
        else if (scil.Utils.startswith(this.options.autosuggest, "data:")) {
            // local data
            var ret = this.filterlist(this.options.autosuggest.substr(5).split(','), this.input.value);
            this.list(ret, sugid);
            this.itemschanged = true;
        }
        else if (scil.Utils.startswith(this.options.autosuggest, "javascript:")) {
            var s = this.options.autosuggest.substr(11);
            var fn = scil.Utils.eval(s);
            var items = fn(this);

            var ret = this.filterlist(items, this.input.value);
            this.list(ret, sugid);
            this.itemschanged = true;
        }
        else if (this.options.items != null && this.options.autosuggest == null) {
            // local data
            var ret = this.filterlist(this.options.items, this.input.value);
            this.list(ret, sugid);
            this.itemschanged = true;
        }
        else if (this.options.autosuggest != null) {
            // url to ajax call
            var me = this;
            var args = { q: this.input.value };
            if (this.options.onsuggest != null)
                this.options.onsuggest(args);
            scil.Utils.jsonp(this.options.autosuggest, function (ret) { me.list(ret.items == null ? ret : ret.items, sugid); me.itemschanged = true; }, args);
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

    clickMe: function (e) {
        if (this.options.items == null)
            return;

        var input = e.srcElement || e.target;
        if (input.offsetWidth - (e.offsetX == null ? e.layerX : e.offsetX) < 16)
            this.show();
    },

    setItems: function (list) {
        if (list == null)
            return;
        this.options.items = list;
        this.itemschanged = true;
    },

    isChildOf: function (src) {
        return src == this.input || JsUtils.isChildOf(src, this.auto)
    },

    isDropdownVisible: function () {
        return this.auto != null && this.auto.style.display == "";
    },

    isVisible: function () {
        return this.input != null && this.input.style.display == "";
    },

    show: function () {
        if (this.auto == null) {
            var me = this;
            var pos = scil.Utils.isFixedPosition(this.input) ? "fixed" : "absolute";
            this.auto = scil.Utils.createElement(document.body, "div", null, { display: "none", backgroundColor: "white", overflow: "hidden", border: "solid 1px gray", position: pos, zIndex: 99999 });
            dojo.connect(document.body, "onmousedown", function (e) { var src = e.srcElement || e.target; if (src != me.q && src.parentNode != me.auto) me.clickout(); });
        }

        if (this.itemschanged)
            this.list(this.options.items, ++this.sugid);
        this.auto.style.display = "";
        this.auto.style.zIndex = scil.Utils.getZindex(this.input) + 1;
        this.updateDropdownSize();
    },

    highlight: function (e) {
        if (this.auto == null || this.auto.style.display == "none") {
            if (e.keyCode == 13 || e.keyCode == 40) {
                this.show();
                e.preventDefault();
            }
            return;
        }

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
        else {
            if (e.char != null) {
                var c = e.char.toLowerCase();
                newsel = this.findNextMatch(c, sel == null ? 0 : sel + 1, children.length);
                if (newsel == null && sel != null)
                    newsel = this.findNextMatch(c, 0, sel);
            }
        }

        if (newsel != null && newsel != sel) {
            if (sel != null)
                this._hilitItem(children[sel], false);
            this._hilitItem(children[newsel], true);
        }
    },

    findNextMatch: function (c, start, end) {
        for (var i = start; i < end; ++i) {
            var item = this.auto.childNodes[i];
            if (item.innerHTML) {
                var s = this.getItemValue(item);
                if (s.length > 0 && s.substr(0, 1).toLowerCase() == c)
                    return i;
            }
        }
        return null;
    },

    updateDropdownSize: function () {
        if (!this.isDropdownVisible())
            return;

        var p = scil.Utils.getOffset(this.input);
        var scroll = scilligence.Utils.scrollOffset();
        if (scil.Utils.isIE) {
            var s2 = JsUtils.getScrollOffset(this.e);
            scroll.offset(-s2.x, -s2.y);
        }
        var w = this.input.offsetWidth;
        if (this.options.minautowidth > 0 && this.options.minautowidth > w)
            w = this.options.minautowidth;
        if (w < 100)
            w = 100;
        dojo.style(this.auto, { left: (p.x + scroll.x) + "px", top: (p.y + scroll.y + this.input.offsetHeight) + "px", width: (w - 2) + "px" });
    },

    hide: function () {
        if (this.auto != null && this.auto.style.display != "none")
            this.auto.style.display = "none";
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
            if (this.auto != null) {
                scilligence.Utils.removeAll(this.auto);
                this.auto.style.display = "none";
            }
            return;
        }
        if (this.auto == null || this.auto.style.display == "none") {
            this.itemschanged = false;
            this.show();
        }

        this.itemschanged = false;
        scilligence.Utils.removeAll(this.auto);
        if (items == null || items.length == 0)
            return;

        var me = this;
        for (var i = 0; i < items.length; ++i) {
            var s = items[i];
            var div = scilligence.Utils.createElement(this.auto, 'div', scil.Utils.isNullOrEmpty(s) ? "&nbsp;" : s, { padding: "2px", textAlign: this.options.align });
            dojo.connect(div, "onclick", function (e) { me.click(e); });
            dojo.connect(div, "onmouseover", function (e) { me.mouseover(e); });
            dojo.connect(div, "onmouseout", function (e) { me.mouseout(e); });
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

    clickout: function (e) {
        this.hide();
    },

    click: function (e) {
        var src = e.srcElement || e.target;
        this.clickItem(src);
    },

    getItemValue: function (src) {
        var s = scil.Utils.htmlDecode(src.innerHTML);
        if (s == "&nbsp;")
            s = "";
        return s;
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

        scil.Utils.fireEvent(this.input, "change", false, true);
    },

    changeUnit: function (s, unit) {
        var r = JSDraw2.Table.parseValueUnit(s);
        if (r == null || r.value == null)
            return "";
        return r.value + (unit == null ? "" : unit);
    }
});


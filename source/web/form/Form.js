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
* Form class
* @class scilligence.Form
* <pre>
* Supported field types: 
*    basic types: hidden, number, text, radio, date, color
*    list types: select, dropdowninput, editableselect, dropdowncheck, multiselect
*    table and text: table, tabtext, richtext, html, plaintext
*    chemistry and biology: jsdraw, jdraw.fm, jsdraw.se, jsdraw.table, plate, sketches, plates
*    file: file, filepath, filelink, filedblink, image
*    form: subform
* <b>Example:</b>
*    &lt;script type="text/javascript"&gt;
*        dojo.ready(function () {
*            var parent = scil.Utils.createElement(document.body, "div");
*            var columns = {
*                mass: { label: "Mass", type: "number", width: 200, unit: "g" },
*                name: { label: "Compound Name", type: "input", width: 600, button: { label: "Test", onclick: function () { alert(99); } } },
*                vendor: { label: "Vendor", type: "select", options: ["Company A", "Company B"], width: 700 }
*            };
*            var form = new scil.Form({ viewonly: false });
*            form.render(parent, columns, { immediately: true });
*        });
*    &lt;/script&gt;
* </pre>
*/
scil.Form = scil.extend(scil._base, {
    /**
    * @constructor Form
    * @param {bool} viewonly - build a viewonly Form
    */
    constructor: function (options) {
        if (typeof (options) == "boolean")
            this.options = { viewonly: options };
        else if (options == null)
            this.options = {};
        else
            this.options = options;

        this.lang = this.options.lang == null ? scil.Lang : this.options.lang;
        this.viewonly = this.options.viewonly;
        this.items = null;
        this.tbody = null;
        this.fields = null;
        this.buttons = null;
    },

    destory: function () {
        this.items = null;
        scil.Utils.removeAll(this.tbody);
        this.tbody = null;
        this.fields = null;
        this.buttons = null;
    },

    /**
    * Collect form data in xml format
    * @function getXml
    * @returns xml string
    */
    getXml: function (nowrapper) {
        var ret = nowrapper ? "" : "<data>\n";
        for (var id in this.fields) {
            var field = this.fields[id];
            var v = scil.Form.getFieldData(field, this.items[id]);
            if (v != null && v != "") {
                ret += "<i n='" + scil.Utils.escXmlValue(id) + "'>";
                if (field.stype == "jsdraw" || field.stype == "xdraw" || field.stype == "jsdraw.table" || field.stype == "jsdraw.se" ||
                    field.stype == "jsdraw.fm" || field.stype == "table" || field.stype == "plate" || field.stype == "plates")
                    ret += v;
                else
                    ret += scil.Utils.escXmlValue(v);
                ret += "</i>\n";
            }
        }
        if (!nowrapper)
            ret += "</data>";
        return ret;
    },

    /**
    * Set form data
    * @function setXml
    * @param {xml} data the form data, *id* is the key
    */
    setXml: function (xml) {
        try {
            var data = scil.Form.xml2Json(xml);
            this.setData(data);
        }
        catch (e) {
            alert("Error raised when setting form data: " + e.message);
        }
    },

    /**
    * Collect form data
    * @function getData
    * @returns the form data as a dictionary, with *id* as the key
    */
    getData: function (includeNullValues) {
        var ret = {};
        for (var id in this.fields) {
            var field = this.fields[id];
            if (field != null) {
                var v = scil.Form.getFieldData(field, this.items[id]);
                if (includeNullValues || !scil.Utils.isNullOrEmpty(v))
                    ret[id] = v;
            }
        }
        return ret;
    },

    /**
    * Set form data
    * @function setData
    * @param {dictonary} data the form data, *id* is the key
    */
    setData: function (data, overwritemode) {
        this.dirty = false;
        for (var id in this.fields) {
            var field = this.fields[id];
            if (field == null)
                continue;

            var v = null;
            if (data != null) {
                v = data[id];
                var item = this.items[id];
                if (v == null && item != null) {
                    if (item.alternativekey != null)
                        v = data[item.alternativekey];
                    if (v == null && item.was != null)
                        v = data[item.was];
                }
            }

            if (overwritemode) {
                if (v != null)
                    scil.Form.setFieldData(field, this.items[id], this.viewonly, v, data);
            }
            else {
                scil.Form.setFieldData(field, this.items[id], this.viewonly, v, data);
            }
        }
    },

    /**
    * Set a field value
    * @function setFieldValue
    * @param {string} id - the id of the field
    * @param {string} v - value to be set
    */
    setFieldValue: function (id, v, data) {
        var field = this.fields[id];
        scil.Form.setFieldData(this.fields[id], this.items[id], this.viewonly, v, data);
    },

    /**
    * Clear field values
    * @function clear
    */
    clear: function () {
        this.setData({});
    },

    onchange: function (field, args) {
        this.dirty = true;
        if (this.options.onchange != null)
            this.options.onchange(field, this, args);
    },

    switchForm: function (key) {
        if (this.options.alternativeforms == null)
            return false;

        if (this.alternativeforms == null) {
            this.alternativeforms = {};
            this.alternativeforms[""] = { tbody: this.tbody, fields: this.fields, items: this.items };
        }


        if (this.alternativeforms[key] == null) {
            var items = this.options.alternativeforms[key];
            if (items != null) {
                this.render2(items, this.parent, this.renderoptions);
                this.alternativeforms[key] = { tbody: this.tbody, fields: this.fields, items: this.items };
            }
        }

        var cur = this.alternativeforms[key];
        if (cur == null)
            cur = this.alternativeforms[""];

        this.tbody = cur.tbody;
        this.fields = cur.fields;
        this.items = cur.items;
        for (var k in this.alternativeforms)
            this.alternativeforms[k].tbody.parentNode.style.display = k == key ? "" : "none";
        return true;
    },

    selectrow: function (key) {
        this.highlightrow(this.items[key]);
    },

    onselectrow: function (e) {
        var src = e.target || e.srcElement;
        var td = scil.Utils.getParent(src, "TD");

        var item = null;
        for (var k in this.items) {
            if (this.items[k] != null && (this.items[k].td1 == td || this.items[k].td2 == td)) {
                item = this.items[k];
                break;
            }
        }

        this.highlightrow(item);
    },

    highlightrow: function (item) {
        if (this.currentrow == item)
            return;

        if (this.currentrow != null) {
            this.currentrow.td1.style.backgroundColor = this.currentrowbckcolor;
            if (this.currentrow.td2 != null)
                this.currentrow.td2.style.backgroundColor = "";
        }

        if (item != null) {
            this.currentrowbckcolor = item.td1.style.backgroundColor;
            item.td1.style.backgroundColor = JSDraw2.Skin.form.rowselectcolor;
            if (item.td2 != null)
                item.td2.style.backgroundColor = JSDraw2.Skin.form.rowselectcolor;
        }
        this.currentrow = item;

        if (this.options.onselectrow != null)
            this.options.onselectrow(item);
    },

    /**
    * Render the form
    * @function render
    * @param {string or DOM} parent parent element
    * @param {dict} items field definition
    * @param {immediately: true/false, buttons:[] } options
    */
    render: function (parent, items, options) {
        this.parent = parent;
        this.renderoptions = options;
        this.render2(items, this.parent, this.renderoptions);
    },

    render2: function (items, parent, options) {
        var align = options == null ? null : options.align;
        var buttons = options == null ? null : options.buttons;
        var immediately = typeof (options) == "boolean" ? options : (options == null ? true : options.immediately != false);

        this.tbody = null;
        this.fields = {};
        this.items = {};
        this.buttons = [];

        for (var k in items) {
            var item = items[k];
            if (item == null)
                continue;

            this.items[k] = item;
            if (item.label == null && item.caption != null)
                item.label = item.caption;
            if (JSDraw2.Table != null && scil.Utils.indexOf(JSDraw2.Table.kNumberColumns, item.type) >= 0) {
                item.type = "number";
                if (item.unit == null)
                    item.unit = JSDraw2.Table.kDefaultUnits[item.type];
            }
        }

        if (this.options.usepostform) {
            var div = JsUtils.createElement(parent, "div", "<form method='post' enctype='multipart/form-data'></form>");
            this.postform = div.firstChild;
            parent = this.postform;
        }

        var cols = this.options.cols;
        if (!(cols > 0)) {
            if (!(cols > 1))
                cols = 1;
            for (var id in this.items) {
                var item = this.items[id];
                if (item.colspan > cols)
                    cols = item.colspan;
            }
        }

        var tr = null;
        var colspan = cols;
        this.tbody = scil.Utils.createTable(parent);
        var lastitem = null;
        for (var id in this.items) {
            var item = this.items[id];
            if (typeof (item) == "function") {
                continue;
            }
            else if (item.type == "group") {
                tr = scil.Utils.createElement(this.tbody, "tr");
                colspan = cols;
            }
            else if (lastitem != null && lastitem.type == "group" || !(tr != null && cols > 1 && colspan < cols)) {
                tr = scil.Utils.createElement(this.tbody, "tr");
                colspan = item.colspan > 0 ? item.colspan : 1;
            }
            else {
                colspan += item.colspan > 0 ? item.colspan : 1;
            }

            var field = this.newField(item, tr, immediately, (options == null ? null : options.hidelabel), (options == null ? null : options.vertical));
            if (field != null)
                item.field = this.fields[id] = field;

            if (item.type == "group" && cols > 1)
                item.td1.colSpan = cols * 2;
            else if (item.colspan > 1)
                item.td2.colSpan = (item.td2.colSpan > 0 ? item.td2.colSpan : 1) + (item.colspan - 1) * 2;

            if (field != null && this.options.onenter != null && field.tagName == "INPUT")
                this.connectKeyEnter(field, this.options.onenter);
        }

        if (this.options.onselectrow != null) {
            var me = this;
            dojo.connect(this.tbody.parentNode, "onclick", function (e) { me.onselectrow(e); });
        }

        if (align != null)
            this.tbody.parentNode.setAttribute("align", align);

        if (buttons != null) {
            var tr = scil.Utils.createElement(this.tbody, "tr");
            scil.Utils.createElement(tr, "td", "&nbsp;");
            tr = scil.Utils.createElement(this.tbody, "tr");
            this.buttonTR = tr;

            if (options == null || !options.vertical)
                scil.Utils.createElement(tr, "td");

            var td = scil.Utils.createElement(tr, "td", null, { whiteSpace: "nowrap" });
            if (options.centerbuttons)
                td.style.textAlign = "center";
            if (buttons.length > 0) {
                for (var i = 0; i < buttons.length; ++i) {
                    var b = buttons[i];
                    if (b == " ")
                        scil.Utils.createElement(td, "span", "&nbsp;");
                    else
                        this.buttons.push(scil.Utils.createButton(td, b, this.lang));
                }
            }
            else {
                this.buttons.push(scil.Utils.createButton(td, buttons, this.lang));
            }
        }
    },

    post: function (url, params, callback) {
        if (this.postform == null)
            return;

        if (params == null)
            params = {};
        scil.apply(params, this.getData());

        scil.Utils.ajaxUploadFile(this.postform, url, params, callback);
    },

    postForm: function (url, params, callback) {
        if (this.postform == null)
            return;
        scil.Utils.ajaxUploadFile(this.postform, url, params, callback);
    },

    /**
    * Check required fields
    * @function checkRequiredFields
    */
    checkRequiredFields: function () {
        var fields = this.fields;
        var n = 0;
        for (var k in this.items) {
            var item = this.items[k];
            var field = fields[k];
            if (item == null || field == null)
                continue;

            item.td1.style.backgroundColor = JSDraw2.Skin.form.labelstyles.backgroundColor;
            if (item.type == "jsdraw.table") {
                n += field.jsd.checkRequiredFields(0);
            }

            if (!item.required)
                continue;

            var s = scil.Form.getFieldData(field);
            if (scil.Utils.isNullOrEmpty(s)) {
                item.td1.style.backgroundColor = "red";
                ++n;
            }
        }
        return n;
    },

    /**
    * Reset required fields
    * @function resetRequiredFields
    */
    resetRequiredFields: function () {
        var fields = this.fields;
        for (var k in this.items) {
            var item = this.items[k];
            var field = fields[k];
            if (item == null || field == null)
                continue;

            item.td1.style.backgroundColor = JSDraw2.Skin.form.labelstyles.backgroundColor;
        }
    },

    connectKeyEnter: function (field, onenter) {
        dojo.connect(field, "onkeydown", function (e) { if (e.keyCode == 13) { onenter(field); e.preventDefault(); } });
    },

    newField: function (item, tr, immediately, hidelabel, veritcal) {
        var me = this;
        if (!this.viewonly) {
            if (item.type == "jsdraw" || item.type == "xdraw") {
                if (JSDraw2.defaultoptions != null && JSDraw2.defaultoptions.usexdraw)
                    item.type = "xdraw";
                //if (item.options == null)
                //    item.options = {};

                // I#9132
                if (item.options != null)
                    item.options.ondatachange = function () { me.onchange(field); };
                else
                    item.ondatachange = function () { me.onchange(field); };
            }
            else if (item.type == "jsdraw.table" || item.type == "jsdraw.se" || item.type == "jsdraw.fm" || item.type == "table" ||
                item.type == "plate" || item.type == "plates" || item.type == "tabtext" || item.type == "richtext" || item.type == "plaintext") {
                //if (item.options == null)
                //    item.options = {};

                // I#9132
                if (item.options != null)
                    item.options.onchange = function (jss, args) { me.onchange(field, args); };
                else
                    item.onchange = function (jss, args) { me.onchange(field, args); };
            }
        }

        var field = this.newField2(item, tr, immediately, hidelabel, veritcal);
        if (field == null)
            return null;

        if (!this.viewonly) {
            if (field.tagName == "INPUT" || field.tagName == "TEXTAREA")
                scil.connect(field, "onchange", function () { me.onchange(field); });
            else if (field.tagName == "SELECT" && !JSDraw2.__touchmolapp) // TouchMol for Word fails here
                scil.connect(field, scil.Utils.isIE && scil.Utils.isIE < 9 ? "onclick" : "onchange", function () { me.onchange(field); });

            if (field.tagName == "INPUT" && item.mobiledata != null && item.type != "number")
                new scil.MobileData(field, { category: item.mobiledata, url: scil.MobileData.getDefaultUrl(false) });
        }
        return field;
    },

    newField2: function (item, tr, immediately, hidelabel, veritcal) {
        var s = item.label == null ? "&nbsp;" : this.lang.res(item.label) + ":";
        if (item.type == "group") {
            if (this.tbody.childNodes.length > 0) {
                scil.Utils.createElement(scil.Utils.createElement(this.tbody, "tr"), "td", "&nbsp;", { fontSize: "50%" }, { colSpan: 2 });
                tr = scil.Utils.createElement(this.tbody, "tr");
            }
            tr.style.backgroundImage = scil.Utils.imgSrc("img/header-bg.gif", true);
            tr.style.backgroundRepeat = "repeat-x";

            var d = dojo.clone(JSDraw2.Skin.form.labelstyles);
            scil.apply(d, { fontWeight: "bold", color: "#555", background: "" });
            if (item.collapsible != false)
                scil.apply(d, { backgroundImage: scil.Utils.imgSrc("img/collapse.gif", true), backgroundPosition: "right", backgroundRepeat: "no-repeat" });
            var td = scil.Utils.createElement(tr, "td", s, d, { colSpan: 2 });
            if (item.collapsible != false)
                dojo.connect(td, "onclick", function (e) { scil.Form.expand(e); });
            item.group = td;
            item.td1 = td;
            return null;
        }
        else if (item.type == "note") {
            var td = scil.Utils.createElement(tr, "td", null, null, { colSpan: 2 });
            var div = scil.Utils.createElement(td, "div", this.lang.res(item.label || item.str), item.style);
            if (item.color != null)
                div.style.color = item.color;
            item.td1 = td;
            return null;
        }
        else {
            if (hidelabel) {
                item.td1 = scil.Utils.createElement(tr, "td");
            }
            else {
                if (item.required)
                    s += "<span style='color:red' title='" + this.lang.res("Required") + "'>*</span>";
                if (scil.Utils.isNullOrEmpty(item.icon)) {
                    item.td1 = scil.Utils.createElement(tr, "td", s, JSDraw2.Skin.form.labelstyles);
                }
                else {
                    item.td1 = scil.Utils.createElement(tr, "td");
                    scil.Utils.createElement(item.td1, "img", null, null, { src: item.icon });
                    scil.Utils.createElement(item.td1, "span", s);
                }

                if (item.labelstyle != null)
                    scil.apply(item.td1.style, item.labelstyle);
            }
            if (veritcal)
                tr = scil.Utils.createElement(this.tbody, "tr");
            var td = scil.Utils.createElement(tr, "td", item.leading, null, { valign: "top" });
            item.td2 = td;
            var field = scil.Form.createField(td, item, this.viewonly, item.value, null, immediately, null, this);
            if (item.type == "hidden") {
                tr.style.display = "none";
                tr.setAttribute("hidden", "1");
            }
            return field;
        }
    },

    getFieldValue: function (key) {
        return scil.Form.getFieldData(this.fields[key]);
    },

    focus: function (key) {
        scil.Form.focus(this.fields, key);
    }
});

scil.apply(scil.Form, {
    focus: function (fields, key) {
        if (fields == null)
            return;

        var field = null;
        if (key == null) {
            for (var k in fields) {
                var f = fields[k];
                if (f != null && (f.tagName == "INPUT" || f.tagName == "TEXTAREA" || f.tagName == "SELECT") && !f.disabled && !f.readOnly) {
                    var tr = scil.Utils.getParent(f, "TR");
                    if (tr != null && tr.style.display != "none" && !f.disabled) {
                        field = f;
                        break;
                    }
                }
            }
        }
        else {
            field = fields[key];
        }

        if (field != null && field.style.dislay != "none" && field.focus != null) {
            try {
                field.focus();
            }
            catch (e) {
            }
        }
    },

    mergeForm: function (src1, src2) {
        if (src1 == null && src2 == null)
            return null;

        var ret = {};
        if (src1 == null) {
            for (var k in src2) {
                if (src2[k] != null)
                    ret[k] = src2[k];
            }
            return ret;
        }

        if (src2 == null) {
            for (var k in src1) {
                if (src1[k] != null)
                    ret[k] = src1[k];
            }
            return ret;
        }

        for (var k in src1) {
            if (src2[k] == null && src1[k] != null)
                ret[k] = src1[k];
        }

        for (var k in src2) {
            if (src2[k] != null)
                ret[k] = src2[k];
            else
                delete ret[k];
        }

        return ret;
    },

    createElement: function (parent, tag, html, styles, attributes, onclick) {
        if (attributes != null && attributes.title != null)
            attributes.title = scil.Lang.res(attributes.title);
        return scil.Utils.createElement(parent, tag, html, styles, attributes, onclick);
    },

    expand: function (e) {
        var td = e.target || e.srcElement;
        if (td.tagName != "TD")
            return;
        var s = td.style.backgroundImage;
        var expand = s.indexOf("expand.gif") > 0;
        if (expand)
            td.style.backgroundImage = scil.Utils.imgSrc("img/collapse.gif", true);
        else
            td.style.backgroundImage = scil.Utils.imgSrc("img/expand.gif", true);

        var tr = td.parentNode.nextSibling;
        while (tr != null && tr.childNodes.length != 1 && tr.getAttribute("buttonrow") != "1") {
            if (tr.getAttribute("hidden") != "1")
                tr.style.display = expand ? "" : "none";
            tr = tr.nextSibling;
        }
    },

    _isAllString: function (s) {
        if (s == null || typeof (s) != "object")
            return false;

        if (s.length > 0)
            return true;

        var n = 0;
        for (var k in s) {
            if (typeof (s[k]) != "string")
                return false;
            ++n;
        }
        return n > 0;
    },

    _getListItems: function (item) {
        if (typeof (item.items) == "function")
            item.items = item.items();
        var list = item.items;
        if (list == null && item.options != null && item.options.items != null) {
            list = item.options.items;
            item.items = list;
            item.options.items = null;
        }
        if (list == null && this._isAllString(item.options)) {
            list = item.options;
            item.items = list;
            item.options = null;
        }
        return list;
    },

    createField: function (parent, item, viewonly, value, values, immediately, fortable, form) {
        var tag = "input";
        var itemtype = item.type;
        if (parent != null && (itemtype == "input" || itemtype == "select" || itemtype == "date" || itemtype == "color" || itemtype == "radio" || itemtype == "checkbox" || itemtype == null))
            parent.style.whiteSpace = "nowrap";

        if (/*fortable && */viewonly && (itemtype == null || itemtype == "input" || itemtype == "select" || itemtype == "editableselect" ||
                itemtype == "htmltext" || itemtype == "multiselect" || itemtype == "dropdowninput" || itemtype == "dropdowncheck" || itemtype == "date") &&
                item.template == null && (fortable || item.unit == null))
            itemtype = "html";

        switch (itemtype) {
            case "":
            case "hidden":
            case "date":
            case "color":
            case "editableselect":
            case "dropdowninput":
            case "dropdowncheck":
            case "multiselect":
                tag = "input";
                break;
            case "password":
                tag = "password";
                break;
            case "rawfile":
                tag = "file";
                break;
            case "number":
                tag = "input";
                break;
            case "htmltext":
                tag = "texarea";
                break;
            case "jsdraw":
            case "xdraw":
            case "jsdraw.fm":
            case "jsdraw.se":
            case "jsdraw.table":
            case "plate":
            case "plates":
            case "table":
            case "tabtext":
            case "richtext":
            case "plaintext":
            case "html":
            case "fileshelf":
            case "file":
            case "filepath":
            case "filelink":
            case "filedblink":
            case "subform":
            case "image":
            case "curve":
            case "sketches":
            case "code":
            case "signature":
                tag = "div";
                break;
            case "button":
                tag = "button";
                break;
            case "postfile":
                tag = "file";
                break;
            default:
                if (itemtype != null)
                    tag = itemtype;
                break;
        }

        if (item.viewonly)
            viewonly = item.viewonly;

        //if (item.type == "number" && !viewonly && item.align == null)
        //item.align = "right";

        if (viewonly) {
            if (tag == "textarea")
                tag = "div";
        }

        if (typeof (parent) == "string")
            parent = dojo.byId(parent);

        var field;
        if (itemtype == "checkbox") {
            var p = scil.Utils.createElement(parent, "label", null, { whiteSpace: "nowrap" });
            field = scil.Utils.createElement(p, tag, null, item.style, item.attributes);
            if (item.str != null)
                scil.Utils.createElement(p, "span", form.lang.res(item.str));
        }
        else {
            field = scil.Utils.createElement(parent, tag, null, item.style, item.attributes);
            if (viewonly && tag == "div" && (item.type == "htmltext" || item.type == "textarea")
                && item.width != null && (item.style == null || item.style.maxWidth == null)) {
                if (typeof (item.width) == "number")
                    field.style.maxWidth = item.width + "px";
                else
                    field.style.maxWidth = item.width;

                //field.style.wordBreak ="break-all";
                field.style.wordWrap = "break-word";
            }
        }

        if (item.type == "select")
            this._getListItems(item);

        if (tag == "select") {
            var list = this._getListItems(item);
            if (list != null) {
                var addblank = item.addblank;
                if (addblank == null) {
                    if (list.length == null) {
                        addblank = true;
                        for (var k in list) {
                            if (list[k] == null || list[k] == "") {
                                addblank = false;
                                break;
                            }
                        }
                    }
                    else {
                        if (list.length == 0 || list[0] != null && list[0] != "")
                            addblank = true;
                    }
                }
                if (addblank)
                    scil.Utils.listOptions(field, [""]);
                scil.Utils.listOptions(field, list, value, null, item.sort != false ? true : false);
            }
            else if (item.url != null) {
                scil.Form.listOptions(field, item.url);
            }
        }

        if (!viewonly && item.button != null) {
            if (item.button.length > 0) {
                for (var i = 0; i < item.button.length; ++i)
                    this.createFieldButton(parent, item.button[i], form, field);
            }
            else {
                this.createFieldButton(parent, item.button, form, field);
            }
        }

        if (item.button2 != null)
            scil.Utils.createButton(parent, item.button2);

        if (!fortable && (item.str != null || item.unit != null) && itemtype != "checkbox")
            scil.Utils.createElement(parent, "span", "&nbsp;" + (item.str || item.unit), { whiteSpace: "nowrap" });
        var w = fortable && item.listwidth != null ? item.listwidth : item.width;
        if (w != null && w > 0)
            field.style.width = w + 'px';

        if (item.height > 0 && !(viewonly && tag == "div" && (item.type == "htmltext" || item.type == "textarea")))
            field.style.height = item.height + 'px';

        if (item.align != null)
            field.style.textAlign = item.align;

        if (viewonly) {
            if (tag == "input" || tag == "password") {
                field.readOnly = true;
                field.style.border = "none";
            }
            else if (tag == "checkbox" || tag == "select") {
                field.disabled = true;
            }
        }
        else {
            if (item.readonly || item.viewonly) {
                if (tag == "input")
                    field.readOnly = true;
                else if (tag == "checkbox" || tag == "radio" || tag == "select")
                    field.disabled = true;
            }
        }

        if (tag != "div" || itemtype == "textarea" || itemtype == "html")
            field.style.color = JSDraw2.Skin.form.fieldcolor;
        field.stype = itemtype;

        // I#10377
        // var args = item.options == null ? scil.clone(item) : item.options;
        var args = scil.clone(item);
        if (item.options != null)
            scil.apply(args, item.options);

        if (viewonly)
            args.viewonly = viewonly;

        if (itemtype == "jsdraw" || itemtype == "xdraw") {
            var fn = function () {
                if (itemtype == "xdraw")
                    field.style.height = "";
                field.jsd = itemtype == "jsdraw" || viewonly ? new JSDraw2.Editor(field, args) : new scil.XDraw(field, args);
                if (!scil.Utils.isNullOrEmpty(value))
                    scil.Form.setFieldData(field, item, viewonly, value);
            };
            if (immediately)
                fn();
            else
                scil.ready(fn);
        }
        else if (itemtype == "jsdraw.table") {
            var fn = function () {
                field.jsd = new JSDraw2.Table(null, args, field);
                if (value != null)
                    field.jsd.setXml(value);
                if (item.rows > 0) {
                    for (var i = field.jsd.getRowCount(); i < item.rows; ++i)
                        field.jsd.insert();
                }
            };
            if (immediately)
                fn();
            else
                scil.ready(fn);
        }
        else if (itemtype == "plate" || itemtype == "plates") {
            var fn = function () {
                if (args.hidetable == null)
                    args.hidetable = true;
                if (itemtype == "plate")
                    field.jsd = new JSDraw2.Plate(field, args);
                else
                    field.jsd = new JSDraw2.Plates(field, args);
                if (value != null)
                    field.jsd.setXml(value);
            };
            if (immediately)
                fn();
            else
                scil.ready(fn);
        }
        else if (itemtype == "jsdraw.se") {
            var fn = function () {
                field.jsd = new JSDraw2.SequenceEditor(field, args);
                if (value != null)
                    field.jsd.setXml(value);
            };
            if (immediately)
                fn();
            else
                scil.ready(fn);
        }
        else if (itemtype == "jsdraw.fm") {
            var fn = function () {
                field.jsd = new JSDraw2.Formulation(field, args);
                if (value != null)
                    field.jsd.setXml(value);
            };
            if (immediately)
                fn();
            else
                scil.ready(fn);
        }
        else if (itemtype == "table") {
            field.jsd = new scil.Table(args);
            field.jsd.render(field, item.columns);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "tabtext") {
            field.jsd = new scil.FieldTabText(field, args);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "code") {
            field.style.marginBottom = "4px";
            field.jsd = new scil.FieldCode(field, args);
            if (value != null)
                field.jsd.setValue(value);
        }
        else if (itemtype == "signature") {
            field.jsd = new scil.FieldSignature(field, args);
            if (value != null)
                field.jsd.setValue(value);
        }
        else if (itemtype == "richtext") {
            field.jsd = new scil.FieldRichText(field, args);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "plaintext") {
            field.jsd = new scil.FieldPlainText(field, args);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "subform") {
            field.jsd = new scil.FieldSubform(field, args);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "file" || itemtype == "filelink" || itemtype == "filedblink" || itemtype == "filepath" || itemtype == "image") {
            if (itemtype == "file")
                field.jsd = new scil.FieldFile(field, args);
            else if (itemtype == "image")
                field.jsd = new scil.FieldImage(field, args);
            else if (itemtype == "filelink" || itemtype == "filedblink" || itemtype == "filepath") {
                args.cmd = itemtype;
                field.jsd = new scil.FieldFileLink(field, args);
            }
            if (item.render != null)
                value = item.render(value, values);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "sketches") {
            field.jsd = new scil.FieldSketches(field, args);
            if (item.render != null)
                value = item.render(value, values);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "fileshelf") {
            field.jsd = new scil.FileShelf(field, args);
            if (value != null)
                field.jsd.list(value);
        }
        else if (itemtype == "curve") {
            field.jsd = new scil.FieldCurve(field, args);
            if (value != null)
                field.jsd.setXml(value);
        }
        else if (itemtype == "number") {
            field.jsd = new scil.FieldNumber(field, args);
            this.setFieldData(field, item, viewonly, value, values);
        }
        else if (itemtype == "date") {
            if (!viewonly && !item.viewonly)
                new scil.DatePicker(field, item.options);
            if (value != null) {
                if (value == "{today}")
                    value = scil.Utils.dateStr(new Date(), true, "yyyy-mm-dd");
            }
            this.setFieldData(field, item, viewonly, value, values);
        }
        else if (itemtype == "color") {
            field.jsd = new scil.ColorPicker2(field, { viewonly: viewonly });
            this.setFieldData(field, item, viewonly, value, values);
        }
        else if (itemtype == "button") {
            field.innerHTML = item.text;
        }
        else {
            if (value != null || itemtype == "html" && (item.template != null || item.render != null))
                this.setFieldData(field, item, viewonly, value, values);
        }

        if (itemtype == "img" && item.src != null)
            field.src = item.src;
        if (item.title != null)
            field.setAttribute("title", item.title);
        if (item.onclick != null)
            dojo.connect(field, "onclick", function () { item.onclick(field, item, form); });
        if (field.tagName == "INPUT") {
            if (item.onenter != null)
                dojo.connect(field, "onkeydown", function (e) { if (e.keyCode == 13) { item.onenter(field); e.preventDefault(); } });
            else if (scil.Utils.isIE && scil.Utils.isIE < 9) // fix bug I#6556
                dojo.connect(field, "onkeydown", function (e) { if (e.keyCode == 13) { e.preventDefault(); } });
        }

        if (item.autosuggest != null && item.autosuggest != "" && field.tagName == "INPUT")
            field.jsd = new scil.AutoComplete(field, item.autosuggest, item.options, form);
        else if (item.autosuggesturl != null && item.autosuggesturl != "" && field.tagName == "INPUT")
            field.jsd = new scil.AutoComplete(field, item.autosuggesturl, item.options, form);

        var options = item.options;
        if (options == null)
            options = {};
        if (item.items != null)
            options.items = item.items;

        if (!viewonly && itemtype == "editableselect")
            field.jsd = new scil.EditableSelect(field, options);
        else if (!viewonly && itemtype == "dropdowninput")
            field.jsd = new scil.DropdownInput(field, options);
        else if (!viewonly && itemtype == "dropdowncheck")
            field.jsd = new scil.DropdownCheck(field, options);
        else if (!viewonly && itemtype == "multiselect")
            field.jsd = new scil.DropdownCheck(field, options);
        else if (!viewonly && itemtype == "htmltext") {
            if (args.buttons == null)
                args.buttons = [];
            else if (typeof (args.buttons) == "string")
                args.buttons = [args.buttons];
            args.buttons.push({ iconurl: scil.Utils.imgSrc("img/uploadimg.gif"), tooltips: "Insert Image", onclick: function (ed) { scil.Richtext.insertImage(ed); } });
            args.buttons.push({ iconurl: scil.Utils.imgSrc("img/benzene.gif"), tooltips: "Insert Structure", onclick: function (ed) { scil.Richtext.insertStructure(ed); } });
            if (args.extrabuttons != null)
                args.buttons.push(args.extrabuttons);
            if (value != null && value == "")
                field.value = value;
            scil.Richtext.initTinyMCE(field, args);
        }
        //        else if (itemtype == "number") {
        //            dojo.connect(field, "onchange", function (e) {
        //                var s = field.value;
        //                if (s != "" && s != null && !scil.Utils.isNumber(s, item.allowoperator)) {
        //                    scil.Utils.alert("A number is required!");
        //                    field.value = "";
        //                }
        //            });
        //        }

        // I#9132
        if (field.tagName == "INPUT" || field.tagName == "SELECT" || field.tagName == "TEXTAREA") {
            if (item.onchange != null)
                dojo.connect(field, "onchange", function () { item.onchange(field, form); });
            if (item.onfocus != null)
                dojo.connect(field, "onfocus", function () { item.onfocus(field, form); });
            if (item.onblur != null)
                dojo.connect(field, "onblur", function () { item.onblur(field, form); });
        }

        if (item.padding >= 0 && (field.tagName == "INPUT" || field.tagName == "DIV"))
            field.style.paddingLeft = field.style.paddingRight = item.padding + "px";

        if (field.tagName == "INPUT" && field.disabled != true && item.type != "checkbox" && item.type != "radio")
            dojo.connect(field, "onfocus", function () { field.select(); });

        if (field.jsd != null)
            field.jsd.parentform = form;

        return field;
    },

    createFieldButton: function (parent, button, form, field) {
        var b = scil.Utils.createButton(parent, button);
        if (b != null) {
            if (button.onclick2 != null) {
                dojo.connect(b, "onclick", function () { button.onclick2(field, form); });
            }
            else if (button.ajaxurl != null) {
                dojo.connect(b, "onclick", function () {
                    scil.Utils.ajax(button.ajaxurl, function (ret) {
                        if (button.append != null)
                            field.value += ret + button.append;
                        else
                            field.value = ret;
                    }, { q: field.value });
                });
            }
        }
    },

    getFieldData: function (field, item) {
        if (field == null)
            return null;

        if (field.stype == "jsdraw") {
            if (item != null && item.dataformat != null)
                return field.jsd.getData(item.dataformat);
            else
                return field.jsd.getXml();
        }
        if (field.stype == "xdraw" || field.stype == "jsdraw.se" || field.stype == "jsdraw.fm" ||
            field.stype == "table" || field.stype == "plate" || field.stype == "plates") {
            return field.jsd.getXml();
        }
        else if (field.stype == "jsdraw.table") {
            if (field.jsd.getRowCount() == 0)
                return null;
            return field.jsd.getXml();
        }
        else if (field.type == "checkbox" || field.type == "radio")
            return field.checked;
        else if (field.stype == "htmltext") {
            var ed = scil.Form.getEd(field);
            return ed == null ? field.innerHTML : scil.Richtext.getHtml(ed);
        }
        else if (field.stype == "file" || field.stype == "filelink" || field.stype == "filedblink" || field.stype == "filepath" ||
            field.stype == "image" || field.stype == "curve" || field.stype == "sketches")
            return field.jsd.getXml();
        else if (field.stype == "tabtext" || field.stype == "richtext" || field.stype == "plaintext" || field.stype == "subform")
            return field.jsd.getXml();
        else if (field.stype == "code")
            return field.jsd.getValue();
        else if (field.stype == "signature")
            return field.jsd.getValue();
        else if (field.stype == "number")
            return field.jsd.getValue();
        else if (field.type == "password")
            return field.value == "" ? "" : (item.encrypt != false && JSDraw2.password != null && JSDraw2.password.encrypt && scil.Form.encryptpassword != null ? scil.Form.encryptpassword(field.value) : field.value);
        else if (field.stype == "postfile" || field.stype == "button")
            return null;
        else {
            if (field.value == null)
                return field.getAttribute("originalvalue");
            return field.value == "" ? null : field.value;
        }
    },

    setFieldData: function (field, item, viewonly, value, values) {
        if (item == null)
            return;

        var originalvalue = value;
        if (item.render != null)
            value = item.render(value, values);

        if (viewonly && item.maxlength > 0 && typeof (value) == "string" && value.length > item.maxlength)
            value = value.substr(0, item.maxlength - 3) + "...";

        if (field.stype == "jsdraw" || field.stype == "xdraw" || field.stype == "jsdraw.table" || field.stype == "jsdraw.se" ||
            field.stype == "jsdraw.fm" || field.stype == "plate" || field.stype == "plates") {
            if (field.stype == "jsdraw" || field.stype == "xdraw" || field.stype == "jsdraw.table" && item.options != null && item.options.spreadsheet)
                field.jsd.clear(true);
            else
                field.jsd.clear();

            if (item.type == "jsdraw") {
                if (item.dataformat != null)
                    field.jsd.setData(value, item.dataformat);
                else if (!(value == null || typeof (value) == "string" && value == ""))
                    field.jsd.setXml(value);
            }
            else {
                if (value != null && value.rows != null && field.stype == "jsdraw.table")
                    field.jsd.setJson(value);
                else if (!(value == null || typeof (value) == "string" && value == ""))
                    field.jsd.setXml(value);

                if (field.stype == "jsdraw.table" && item.options != null && item.options.spreadsheet)
                    field.jsd.createTable();

                if (field.stype == "jsdraw.table" && item.rows > 0) {
                    for (var i = field.jsd.getRowCount(); i < item.rows; ++i)
                        field.jsd.insert();
                }
            }
        }
        else if (field.stype == "table") {
            if (value != null && (typeof (value) == "string" || typeof (value) == "object" && value.tagName == "table"))
                field.jsd.setXml(value);
            else if (value != null && value.length > 0)
                field.jsd.setData(value);
            else
                field.jsd.setData([]);
        }
        else if (item.type == "tabtext" || item.type == "richtext" || item.type == "plaintext") {
            field.jsd.setXml(value);
        }
        else if (item.type == "checkbox" || item.type == "radio") {
            field.checked = scil.Utils.isTrue(value);
        }
        else if (item.type == "select") {
            if (viewonly) {
                var list = this._getListItems(item);
                if (list != null && list.length == null)
                    value = list[value];
                this._setInnerHTML(field, value, originalvalue);
            }
            else {
                scil.Utils.selectOption(field, value);
            }
        }
        else if (item.type == "date") {
            if (typeof (value) == "string" && !scil.Utils.isNullOrEmpty(value) && !isNaN(value)) {
                value = parseFloat(value);
                if (isNaN(value))
                    value = null;
            }
            var s = item.timeformat == null ? scil.Utils.dateStr(value, true, item.dateformat) : scil.Utils.timeStr(value, true, item.timeformat);
            if (viewonly) {
                if (field.tagName == "INPUT")
                    field.value = s;
                else
                    this._setInnerHTML(field, s, originalvalue);
            }
            else {
                field.value = s;
            }
        }
        else if (item.type == "color") {
            field.jsd.setValue(value);
        }
        else if (field.stype == "code") {
            field.jsd.setValue(value);
        }
        else if (field.stype == "signature") {
            field.jsd.setValue(value);
        }
        else if (field.stype == "number") {
            return field.jsd.setValue(value);
        }
        else if (field.stype == "html") {
            var s = value == null ? "" : value;
            if (item != null && item.template != null)
                s = this.renderTemplate(item.template, value, values);
            else if (typeof (s) == "string" && s.match(/^((http[s]?)|(ftp)):[\/]{2}.+$/i) != null)
                s = "<a target=_blank href='" + s + "'>" + s + "</a>";
            this._setInnerHTML(field, s, originalvalue);
        }
        else if (field.stype == "file" || field.stype == "filelink" || field.stype == "filedblink" || field.stype == "filepath" || field.stype == "image" || field.stype == "curve" || field.stype == "sketches" || field.stype == "subform") {
            field.jsd.setXml(value);
        }
        else if (field.stype == "fileshelf") {
            field.jsd.list(value);
        }
        else if (item.type == "htmltext") {
            if (viewonly) {
                this._setInnerHTML(field, field.innerHTML = value == null ? "" : value, originalvalue, true);
            }
            else {
                var ed = scil.Form.getEd(field);
                if (ed != null && ed.dom != null)
                    ed.setContent(value == null ? "" : value);
                else
                    field.value = value == null ? "" : value;
            }
        }
        else if (field.stype == "textarea") {
            if (field.tagName == "TEXTAREA")
                field.value = value == null ? "" : value;
            else
                this._setInnerHTML(field, this.wrapTextarea(value), originalvalue, true);
        }
        else if (field.stype != "div" && field.stype != "button") {
            if (field.stype == "hidden" && value != null && typeof (value) == "object" && value.tagName != null) // I#10361
                value = scil.Utils.getOuterXml(value);

            if (field.tagName == "INPUT" || field.tagName == "TEXTAREA")
                field.value = value == null ? "" : value;
            else if (field.tagName == "DIV")
                this._setInnerHTML(field, value == null ? "" : value, originalvalue);
        }

        if (item.onrendered != null)
            item.onrendered(field, value);
    },

    wrapTextarea: function (value) {
        var whitespace = "white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; white-space: pre-wrap; word-wrap: break-word;";
        return value == null ? "" : "<pre style='margin:0;padding:0;" + whitespace + "'>" + scil.Utils.escapeHtml(value) + "</pre>";
    },

    _setInnerHTML: function (field, value, originalvalue, clear) {
        if (value == null)
            value = "";
        else if (clear)
            value += "<div style='clear:both'></div>"; // I#11990

        field.innerHTML = value;

        // very tricky: in chrome:
        //     0 == "" -> true
        //     0 != "" -> false
        // if (originalvalue != null && originalvalue != "")
        if (originalvalue != null && (originalvalue + "") != "")
            field.setAttribute("originalvalue", originalvalue);
    },

    renderTemplate: function (template, value, values) {
        s = template.replace(/\{\?\}/g, value == null ? "" : value);
        if (values == null)
            return s;
        var tokens = s.match(/\{\{[a-z|0-9]+\}\}/ig);
        if (tokens == null)
            return s;
        for (var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];
            var k = token.substr(2, token.length - 4);
            var v = values[k];
            s = s.replace(token, v == null ? "" : v);
        }
        return s;
    },

    listOptions: function (select, url) {
        scil.Utils.ajax(url, function (ret) { scil.Utils.listOptions(select, ret); });
    },

    /**
    * Create a form
    * @function {static} create
    * @param {object} obj the data object to be loaded into the table. obj.load() will be called
    * @param {string or DOM} parent parent element
    * @param {array} buttons an array of button definitions. button: { caption: string, onclick: function }
    * @param {array} items an array of field definitions. item: { id, iskey ... }
    * @param {bool} viewonly indicate if creating a viewonly table
    * @returns a new Table object
    */
    create: function (obj, parent, items, buttons, viewonly) {
        if (typeof parent == "string")
            parent = dojo.byId(parent);

        var div = scil.Utils.createElement(parent, "div");
        var form = new scil.Form(viewonly);
        form.render(div, items);

        if (buttons != null) {
            var tr = scil.Utils.createElement(form.tbody, "tr");
            var td = scil.Utils.createElement(tr, "td");
            td = scil.Utils.createElement(tr, "td");

            if (buttons.length == null) {
                scil.Utils.createButton(td, buttons);
            }
            else {
                for (var i = 0; i < buttons.length; ++i)
                    scil.Utils.createButton(td, buttons[i]);
            }
        }

        if (obj.load != null)
            scil.onload(function () { obj.load(); });
        return form;
    },

    /**
    * Create a HTML form
    * @function {static} createForm2
    * @param {DOM} parent parent element
    * @param {array} items an array of field definitions. item: { id, iskey ... }
    * @param {dict} buttons button definition: { label, onclick }
    * @returns a form object
    * <pre>
    * <b>Example:</b>
    *    dojo.ready(function () {
    *        var parent = scil.Utils.createElement(document.body, "div");
    *        var items = {
    *            notes: { type: "note", label: "This is a test" },
    *            username: { label: "username:", tag: "input", width: 200 },
    *            password: { label: "Your Password:", tag: "password", width: 200 }
    *        };
    *        var form = scil.Form.createForm2(parent, items, { label: "Login", onclick: function () { alert("Blah..." } });
    *    });
    * </pre>
    */
    createForm2: function (parent, items, buttons, options) {
        if (options == null)
            options = {};

        var form = null;
        if (buttons != null)
            options.buttons = buttons;
        if (options.tabs != null) {
            form = new scil.TabbedForm(options).render(parent);
        }
        else {
            form = new scil.Form(options);
            form.render(parent, items, options);

            for (var k in items) {
                if (items[k] == null)
                    continue;
                if (items[k].type == "group" && items[k].group != null && items[k].collapsed)
                    this.expand({ target: items[k].group });
            }
        }

        return form;
    },

    _connetOnClick: function (e, fn) {
        dojo.connect(e, "onclick", function () { fn(); });
    },

    /**
    * Create a HTML Dialog form
    * <pre>
    * <b>Example:</b>
    *    dojo.ready(function () {
    *        var items = {
    *            notes: { type: "note", label: "This is a test" },
    *            username: { label: "username:", tag: "input", width: 200 },
    *            password: { label: "Your Password:", tag: "password", width: 200 }
    *        };
    *        var dlg = scil.Form.createDlgForm("Login", items,
    *                { label: "Login", onclick: function () { alert("Blah..."); dlg.hide(); } }, 350);
    *    });
    * </pre>
    * @function {static} createDlgForm
    * @param {string} caption dialog caption
    * @param {array} items an array of field definitions. item: { id, iskey ... }
    * @param {dict} buttons button definition: { label, onclick }
    * @param {options}: { onenter, viewonly }
    * @returns a dialog object
    */
    createDlgForm: function (caption, items, buttons, options) {
        var args = {};
        if (typeof (options) == "number") {
            args.width = options + "px";
            options = null;
        }
        else if (options != null && options.width > 0) {
            args.width = options.width + "px";
        }
        var div = scil.Utils.createElement(null, "div", null, args);
        var dlg = new JSDraw2.Dialog(caption, div, options);
        dlg.show();
        dlg.form = this.createForm2(div, items, buttons, options);
        dlg._scilform = true;
        dlg.hide(true);
        dlg.show2({ owner: this });
        if (options != null && options.oncreated)
            options.oncreated(dlg.form);
        return dlg;
    },

    createFormDlg: function (caption, items, buttons, options) {
        return this.createDlgForm(caption, items, buttons, options);
    },

    /**
    * Create a HTML Tabbed Dialog form
    * <pre>
    * <b>Example:</b>
    *    &lt;button onclick='test()'&gt;Test&lt;/button&gt;
    *    &lt;script type="text/javascript"&gt;
    *        function test() {
    *            var options = { tabs: {
    *                a: { caption: "Tab A", fields: { field1: { label: "Field1"}} },
    *                b: { caption: "Tab B", fields: { field2: { label: "Field2" }, field3: { label: "Field3"}} }
    *            }, buttons: { label: "Test", onclick: function() { alert(999); } }, border: true
    *            };
    *
    *            var dlg = scil.Form.createTabDlgForm("Test", null, null, options);
    *            dlg.form.setData({ field1: "AAA", field2: "124" });
    *        }
    *    &lt;/script&gt;
    * </pre>
    * @function {static} createTabDlgForm
    * @returns a dialog object
    */
    createTabDlgForm: function (caption, options) {
        return this.createDlgForm(caption, null, null, options);
    },

    createForm: function (items, btn, onclick, border, extra, enter) {
        var style1 = { verticalAlign: "top", whiteSpace: "nowrap" };
        var style2 = { textAlign: "left" };
        if (border) {
            style1.border = "solid 1px #f0f0f0";
            style1.backgroundColor = "#f5f5f5";
        }

        var tbody = scil.Utils.createTable();

        var required = false;
        for (var i = 0; i < items.length; ++i) {
            if (items[i].required) {
                required = true;
                break;
            }
        }
        if (required) {
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td");
            scil.Utils.createElement(tr, "td", "<span style='color:red;font-weight:bold'>* indicates required field</span>", style2);
        }

        for (var i = 0; i < items.length; ++i) {
            var it = items[i];
            var tr = scil.Utils.createElement(tbody, "tr");
            var td = scil.Utils.createElement(tr, "td", it.label + (it.required ? "<b style='color:red'>*</b>" : ""), style1);
            if (it.colspan) {
                td.colSpan = 2;
            }
            else {
                td = scil.Utils.createElement(tr, "td", null, style2);

                if (it.tag != null) {
                    var input = scil.Utils.createElement(td, it.tag);
                    if (it.tag == "select")
                        scil.Utils.listOptions(input, it.options);
                    if (it.width != null)
                        input.style.width = it.width + "px";
                    if (it.height != null)
                        input.style.height = it.height + "px";
                    if (it.id != null)
                        input.id = it.id;
                    if (it.tag == "hidden")
                        tr.style.display = "none";
                    if (it.align != null)
                        input.style.textAlign = it.align;

                    if (it.id == enter)
                        dojo.connect(input, "onkeydown", function (e) { if (e.keyCode == 13) { onclick(); e.preventDefault(); } });
                }

                if (it.span != null)
                    scil.Utils.createElement(td, "span", it.span);
            }
        }

        var tr = scil.Utils.createElement(tbody, "tr");
        scil.Utils.createElement(tr, "td", "&nbsp;");

        tr = scil.Utils.createElement(tbody, "tr");
        scil.Utils.createElement(tr, "td");
        var td = scil.Utils.createElement(tr, "td");
        if (btn != null) {
            if (typeof (btn) == "string") {
                var b = scil.Utils.createElement(td, "button", btn);
                dojo.connect(b, "onclick", onclick);
            }
            else if (btn != null && typeof (btn) == "object" && btn.length > 0) {
                var buttons = [];
                for (var i = 0; i < btn.length; ++i) {
                    var bn = btn[i];
                    var b = scil.Utils.createElement(td, "button", bn.caption);
                    if (bn.id != null)
                        b.id = bn.id;
                    this._connetOnClick(b, bn.onclick);
                }
            }
        }

        if (extra != null)
            scil.Utils.createElement(td, "span", extra);
        return tbody.parentNode;
    },

    fillForm: function (data, prefix) {
        for (k in data) {
            var field = dojo.byId((prefix == null ? "" : prefix) + k);
            if (field != null) {
                if (field.tagName == "SELECT")
                    JsUtils.selectOption(field, data[k]);
                else
                    field.value = data[k] == null ? "" : data[k];
            }
        }
    },

    collectFormData: function (parent) {
        var ret = {};

        var inputs = parent.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; ++i) {
            var n = inputs[i];
            var type = (n.getAttribute("type") + "").toLowerCase();
            switch (type) {
                case "radio":
                case "checkbox":
                    if (n.checked)
                        this._addValue(ret, n.id, n.value == null || n.value.length == 0 ? "true" : n.value);
                    break;
                case "button":
                    break;
                default:
                    this._addValue(ret, n.id, n.value);
                    break;
            }
        }

        var textareas = parent.getElementsByTagName("textarea");
        for (var i = 0; i < textareas.length; ++i) {
            var n = textareas[i];
            this._addValue(ret, n.id, n.value);
        }

        var selects = parent.getElementsByTagName("select");
        for (var i = 0; i < selects.length; ++i) {
            var n = selects[i];
            this._addValue(ret, n.id, n.value);
        }

        return ret;
    },

    _addValue: function (dict, key, value) {
        if (key == null || key.length == 0)
            return;

        var p = key.lastIndexOf('.');
        if (p > 0)
            key = key.substr(p + 1);
        dict[key] = value;
    },

    toAmount: function (v, liquid) {
        if (v == null || v == 0)
            return "-";
        else if (v >= 1000)
            return (v / 1000) + (liquid ? "L" : "kg");
        else if (v < 0.001 && liquid)
            return (v * 1000000) + "ug";
        else if (v < 1)
            return (v * 1000) + (liquid ? "uL" : "mg");
        else
            return v + (liquid ? "mL" : "g");
    },

    processAmount: function (c) {
        if (!(c.amount > 0))
            c.amount = null;
        if (!(c.amountleft > 0))
            c.amountleft = null;
        var v = c.amount == null ? c.amountleft : c.amount;
        if (v <= 0)
            v = null;
        if (v === null) {
            c.unit = c.isliquid ? "L" : "kg";
        }
        else if (v >= 1000) {
            c.amount /= 1000;
            c.amountleft /= 1000;
            c.unit = c.isliquid ? "L" : "kg";
        }
        else if (v < 0.001 && !c.isliquid) {
            c.amount *= 1000000;
            c.amountleft *= 1000000;
            c.unit = "ug";
        }
        else if (v < 1) {
            c.amount *= 1000;
            c.amountleft *= 1000;
            c.unit = c.isliquid ? "uL" : "mg";
        }
        else {
            c.unit = c.isliquid ? "mL" : "g";
        }
    },

    setButtonValueByKey: function (buttons, key, s) {
        if (buttons == null)
            return;

        for (var i = 0; i < buttons.length; ++i) {
            if (buttons[i].key == key) {
                buttons[i].b.value = s == null ? "" : s;
                break;
            }
        }
    },

    setButtonValueByKey: function (buttons, key, value) {
        if (buttons == null || scil.Utils.isNullOrEmpty(key) || scil.Utils.isNullOrEmpty(value))
            return;

        for (var i = 0; i < buttons.length; ++i) {
            if (buttons[i].key == key) {
                buttons[i].b.value = value;
                break;
            }
        }
    },

    getButtonValueByKey: function (buttons, key) {
        if (buttons == null)
            return null;
        for (var i = 0; i < buttons.length; ++i) {
            if (buttons[i].key == key)
                return buttons[i].b.value;
        }
        return null;
    },

    getButtonValuesByKey: function (buttons, keys, dict) {
        if (dict == null)
            dict = {};

        for (var i = 0; i < keys.length; ++i)
            dict[keys[i]] = this.getButtonValueByKey(buttons, keys[i]);
        return dict;
    },

    createToolbarButtons: function (parent, buttons, padding, tableAlign) {
        if (parent == null || buttons == null)
            return;

        var tr = null;
        if (tableAlign != null)
            tr = scil.Utils.createElement(scil.Utils.createTable2(parent, null, { cellSpacing: 0, cellPadding: 0, align: tableAlign }), "tr");

        for (var i = 0; i < buttons.length; ++i) {
            if ((i == 0 || buttons[i - 1] == "-" || buttons[i - 1] == "|") && (buttons[i] == "-" || buttons[i] == "|"))
                continue;

            if (tableAlign != null)
                parent = scil.Utils.createElement(tr, "td");
            this._createButton(parent, buttons[i], padding);
        }
    },

    _createButton: function (parent, button, padding) {
        if (button == null)
            return;

        if (typeof (padding) != "number" || padding <= 0)
            padding = 3;

        if (button == "-" || button == "|") {
            scil.Utils.createElement(parent, "span", "|", { margin: "0 " + (2 * padding) + "px 0 " + (2 * padding) + "px" });
            return;
        }

        button.label = scil.Lang.res(button.label);
        button.caption = scil.Lang.res(button.caption);
        button.title = scil.Lang.res(button.title);

        var b = null;
        if (button.type == "select") {
            if (button.label != null) {
                var l = scil.Utils.createElement(parent, "span", button.label + ":", button.labelstyle);
                l.style.marginLeft = padding + "px";
            }
            b = scil.Utils.createElement(parent, "select", null, button.styles, button.attributes);
            scil.Utils.listOptions(b, button.items || button.options, button.value, null, button.sort);
            if (button.onchange != null)
                dojo.connect(b, "onchange", function (b) { button.onchange(b); });
            b.style.marginRight = padding + "px";
        }
        else if (button.type == "input" || button.type == "date" || button.type == "color") {
            if (button.label != null) {
                var l = scil.Utils.createElement(parent, "span", button.label + ":", button.labelstyle);
                l.style.marginLeft = padding + "px";
            }
            b = scil.Utils.createElement(parent, "input", null, button.styles, button.attributes);
            if (button.onenter != null)
                dojo.connect(b, "onkeydown", function (e) { if (e.keyCode == 13) button.onenter(b); });
            if (button.onchange != null)
                dojo.connect(b, "onchange", function (b) { button.onchange(b); });
            if (button.autosuggesturl != null)
                new scil.AutoComplete(b, button.autosuggesturl, { onsuggest: button.onsuggest });
            b.style.marginRight = padding + "px";

            if (button.type == "date")
                new scil.DatePicker(b);
            else if (button.type == "color")
                new scil.ColorPicker2(b);

            if (button.value != null)
                b.value = button.value;
        }
        else {
            b = scil.Utils.createButton(parent, button);
            b.style.margin = padding + "px";
        }
        button.b = b;
    },

    getEd: function (field) {
        return tinymce.get(field.id);
    },

    dict2formxml: function (dict) {
        return this.json2xml(dict);
    },

    json2xml: function (dict, nowrapper) {
        if (dict == null)
            return null;

        var ret = nowrapper ? "" : "<data>\n";
        for (var k in dict) {
            var v = dict[k];
            if (v != null && v != "") {
                ret += "<i n='" + scil.Utils.escXmlValue(k) + "'>";
                ret += scil.Utils.escXmlValue(v);
                ret += "</i>\n";
            }
        }
        if (!nowrapper)
            ret += "</data>";
        return ret;
    },

    encryptpassword: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return null;

        var Key = CryptoJS.enc.Utf8.parse(JSDraw2.password != null && JSDraw2.password.key != null ? JSDraw2.password.key : "PSVJQRk9qTEp!6U1dWUZ%RVFG=1VVT0=");
        var IV = CryptoJS.enc.Utf8.parse(JSDraw2.password != null && JSDraw2.password.iv != null ? JSDraw2.password.iv : "!WlSLVE2ZU+NaW?=");
        var encryptedText = CryptoJS.AES.encrypt(s, Key, { iv: IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return "(?|" + encryptedText + ")";
    },

    xml2Json: function (xml) {
        var root = null;
        if (typeof xml == "object") {
            root = xml;
        }
        else if (typeof xml == "string") {
            var doc = scil.Utils.parseXml(xml);
            if (doc != null)
                root = doc.documentElement || doc.firstElementChild;
        }

        if (root == null || root.childNodes == null)
            return null;

        var data = {};
        for (var i = 0; i < root.childNodes.length; ++i) {
            var e = root.childNodes[i];
            if (e.tagName != "i")
                continue;

            var id = e.getAttribute("id");
            if (id == null)
                id = e.getAttribute("n");
            var v = scil.Utils.getFirstElement(e);
            if (v != null && scil.Utils.isIE && scil.Utils.isIE < 9)
                v = v.xml;
            data[id] = v != null ? v : (e.text || e.textContent);
        }

        return data;
    },

    ext2Icon: function (filename) {
        if (filename == null)
            return "unknown";
        var p = filename.lastIndexOf('.');
        if (p < 0)
            return "unknown";
        var ext = filename.substr(p + 1).toLowerCase();
        switch (ext) {
            case "avi":
            case "bmp":
            case "c":
            case "cab":
            case "cdx":
            case "cer":
            case "chm":
            case "dll":
            case "doc":
            case "eps":
            case "exe":
            case "fasta":
            case "fdf":
            case "gif":
            case "hlp":
            case "htm":
            case "iso":
            case "jar":
            case "java":
            case "jdx":
            case "jpg":
            case "js":
            case "jsdraw":
            case "mdb":
            case "mht":
            case "molengine":
            case "mov":
            case "mp3":
            case "mrv":
            case "msg":
            case "msi":
            case "pdb":
            case "pdf":
            case "pic":
            case "ppt":
            case "ps":
            case "py":
            case "pyc":
            case "rm":
            case "sdf":
            case "skc":
            case "sql":
            case "swf":
            case "txt":
            case "vbs":
            case "vsd":
            case "xls":
            case "xml":
            case "xps":
            case "zip":
                return ext;
            case "docx":
            case "rtf":
                return "doc";
            case "dx":
                return "jdx";
            case "oxps":
                return "xps";
            case "pptx":
                return "ppt";
            case "xlsx":
            case "csv":
                return "xls";
            case "jpeg":
                return "jpg";
            case "svg":
            case "tif":
            case "tiff":
                return "pic";
            case "mp4":
                return "mp3";
            case "wav":
                return "avi";
            case "png":
            case "wmf":
            case "emf":
                return "bmp";
            case "html":
            case "shtml":
            case "xhtml":
                return "htm";
            case "gz":
                return "zip";
            case "cdxml":
                return "cdx";
            case "tgf":
                return "skc";
            case "mol":
            case "rxn":
            case "jsd":
            case "jssdf":
                return "jsdraw";
            case "cs":
            case "vb":
            case "cpp":
            case "c":
            case "aspx":
            case "asp":
                return "script";
            case "config":
                return "xml";
            default:
                return "unknown";
        }
    }
});
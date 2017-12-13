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
* Table class - Table Control
* @class scilligence.Table
* <pre>
* <b>Example 1:</b>
*    dojo.ready(function () {
*        var parent = scil.Utils.createElement(document.body, "div");
*        var columns = {
*            user: { label: "User", type: "input", width: 300 },
*            role: { label: "Role", type: "select", options: ["", "Member", "Manager"], width: 300 }
*        };
*        var table = new scilligence.Table({viewonly: false, header: true});
*        table.render(parent, columns);
*
*        table.setData([{ user: "Tony", role: "Member" }, { user: "Jack", role: "Manager"}]);
*    });
*
* <b>Example 2 (Double Header Table):</b>
*    &lt;script type="text/javascript"&gt;
*        var table;
*        dojo.ready(function () {
*            var parent = scil.Utils.createElement(document.body, "div");
*            var columns = {
*                mass: { label: "Mass", type: "number", align: "center", width: 200, unit: "g" },
*                file: { label: "NMR", type: "file", options: { uploadurl: "service.aspx?cmd=upload"} },
*                name: { label: "Compound Name", type: "input", width: 200 },
*                vendor: { label: "Vendor", type: "editableselect", options: ["Company A", "Company B"], width: 200 }
*            };
*            table = new scil.Table({ viewonly: true, header0: [null, { label: "Scilli", colspan: 2 }, { label: "Kinase"}] });
*            table.render(parent, columns);
*            table.addRow({ mass: 160, name: "Compound 123", vendor: "Sigma" });
*        });
*  &lt;/script&gt;
* </pre>
*/
scil.Table = scil.extend(scil._base, {
    /**
    * @constructor Table
    * @param {bool} viewonly
    * @param {bool} header
    * @param {dictionary} options - { viewonly(bool), header(bool), selectrow (bool), rowcheck(bool), delrow(bool), addrow (bool), selectrow (bool), onAdd, onselectrow, onchange }
    */
    constructor: function (viewonly, header, options) {
        if (viewonly != null && typeof (viewonly) == "object") {
            this.options = viewonly;
            this.viewonly = this.options.viewonly;
            this.header = this.options.header;
        }
        else {
            // old constructor: (viewonly, header, options)
            this.viewonly = viewonly;
            this.header = header;
            if (scil.Table._tableincrease == null)
                scil.Table._tableincrease = 0;
            this._tableid = ++scil.Table._tableincrease;

            if (typeof (options) == "function")
                this.options = { onAdd: options };
            else if (options == null)
                this.options = {};
            else
                this.options = options;
        }

        this.groupIndex = 0;
        this.checkIndex = 1;
        this.dataIndex = 2;
        this._startrow = 2;
        this.tbody = null;
        this.items = null;
        this.key = null;

        this._lastcheck = null;
    },

    /**
    * Get table data as xml
    * @function getData
    */
    getXml: function () {
        var n = this.tbody.childNodes.length - this._startrow;
        if (n == 0)
            return "";
        var xml = "<table>\n";
        for (var i = 0; i < n; ++i) {
            var tr = this.tbody.childNodes[i + this._startrow];

            var hasdata = false;
            var row = {};
            var j = this.dataIndex;
            for (var k in this.items) {
                var v = scil.Form.getFieldData(tr.childNodes[j++].field);
                row[k] = v;
                if (!hasdata && v != null && v != "")
                    hasdata = true;
            }

            if (!hasdata)
                continue;

            xml += "<r";
            if (tr.getAttribute("isnew") == "1")
                xml += " isnew='1'";
            xml += ">\n";
            for (var k in row) {
                var v = row[k];
                if (v != null && v != "")
                    xml += "<i n='" + scil.Utils.escXmlValue(k) + "'>" + scil.Utils.escXmlValue(v) + "</i>\n";
            }
            xml += "</r>\n";
        }
        xml += "</table>";
        return xml;
    },

    /**
    * Set table xml data
    * @function setXml
    * @param {xml} xml
    * @returns null
    */
    setXml: function (xml, lockeditems) {
        var root = null;
        if (typeof xml == "object") {
            root = xml;
        }
        else if (typeof xml == "string") {
            var doc = scil.Utils.parseXml(xml);
            if (doc != null)
                root = doc.documentElement || doc.firstElementChild;
        }

        var data = [];
        try {
            if (root != null && root.getElementsByTagName == null)
                root = null;
        }
        catch (e) {
        }

        if (root != null) {
            var rows = root.getElementsByTagName("r");
            for (var i = 0; i < rows.length; ++i) {
                var row = {};

                var cells = rows[i].getElementsByTagName("i");
                for (var j = 0; j < cells.length; ++j) {
                    var e = cells[j];
                    var k = e.getAttribute("n");
                    row[k] = e.text || e.textContent;
                }

                data.push(row);
            }
        }

        this.setData(data);
    },

    getCsv: function () {
        var s = "";
        var i = 0;
        for (var k in this.items) {
            if (++i > 1)
                s += ",";
            s += scil.Utils.escCsvValue(this.items[k].label);
        }
        s += "\n";

        var n = this.tbody.childNodes.length - this._startrow;
        for (var j = 0; j < n; ++j) {
            var tr = this.tbody.childNodes[j + this._startrow];
            var row = this.getRowData(tr, true);

            i = 0;
            for (var k in this.items) {
                if (++i > 1)
                    s += ",";
                s += scil.Utils.escCsvValue(row[k]);
            }

            s += "\n";
        }
        return s;
    },

    /**
    * Get table data  - collection: { id.1: {...}, id.2 : {...}, ... }
    * @function getData
    * @param {dictionary} collection - the collection that data will be placed in
    * @param {string} id - id prefix
    */
    getData: function (collection, id, rowcheck) {
        if (collection == null) {
            var rows = [];
            var n = this.tbody.childNodes.length - this._startrow;
            for (var i = 0; i < n; ++i) {
                var tr = this.tbody.childNodes[i + this._startrow];
                var row = this.getRowData(tr, rowcheck);
                rows.push(row);
            }
            return rows;
        }
        else {
            var n = this.tbody.childNodes.length - this._startrow;
            collection[id + ".n"] = n;
            for (var i = 0; i < n; ++i) {
                var tr = this.tbody.childNodes[i + this._startrow];
                var key = id + "." + i + ".";
                if (tr.getAttribute("isnew") == "1")
                    collection[key + "isnew"] = 1;

                var j = this.dataIndex;
                for (var k in this.items)
                    collection[key + k] = scil.Form.getFieldData(tr.childNodes[j++].field);
            }
        }
    },

    /**
    * Get JSON data of a row
    * @function getRowData
    */
    getRowData: function (tr, rowcheck) {
        if (tr == null)
            return null;
        if (typeof (tr) == "number") {
            tr = this.tbody.childNodes[tr + this._startrow];
            if (tr == null)
                return null;
        }

        var row = {};
        if (tr.getAttribute("isnew") == "1")
            row.isnew = 1;

        var j = this.dataIndex;
        for (var k in this.items) {
            var td = tr.childNodes[j++];
            var v = td == null ? null : scil.Form.getFieldData(td.field);
            if (v != null && v != "")
                row[k] = v;
        }

        if (rowcheck && tr.childNodes[this.checkIndex].firstChild.checked)
            row.rowchecked = true;

        return row;
    },

    getRowTexts: function (tr) {
        if (tr == null)
            return null;
        if (typeof (tr) == "number") {
            tr = this.tbody.childNodes[tr + this._startrow];
            if (tr == null)
                return null;
        }

        var row = {};
        if (tr.getAttribute("isnew") == "1")
            row.isnew = 1;

        var j = this.dataIndex;
        for (var k in this.items) {
            var e = tr.childNodes[j++];
            var v = e.text || e.textContent;
            if (v != null && v != "")
                row[k] = v;
        }

        return row;
    },

    /**
    * Get JSON data of the current selected row
    * @function getCurrentRowData
    */
    getCurrentRowData: function () {
        return this.getRowData(this.currow);
    },

    /**
    * Set table data
    * @function setData
    * @param {array} data - the array of table data, one array item is for one row
    * @returns null
    */
    setData: function (data, lockeditems) {
        this.clear();
        if (data != null) {
            for (var i = 0; i < data.length; ++i)
                this.addRow(data[i], lockeditems);
        }

        if (!this.viewonly && this.options.addrow != false)
            this.addRow();
    },

    /**
    * Remove all rows
    * @function clear
    * @returns null
    */
    clear: function () {
        this.dirty = false;
        for (var i = this.tbody.childNodes.length - 1; i >= this._startrow; --i)
            this.tbody.removeChild(this.tbody.childNodes[i]);
        this.currow = null;
    },

    /**
    * Render table
    * @function render
    * @param {string or DOM} parent - parent element
    * @param {array} item - column definition as an array
    * @returns null
    */
    render: function (parent, items) {
        this.items = {};
        for (var id in items) {
            if (items[id] != null) {
                this.items[id] = items[id];
                if (items[id].iskey)
                    this.key = id;
            }
        }

        if (typeof (parent) == "string")
            parent = dojo.byId(parent);

        var me = this;
        var div = scil.Utils.createElement(parent, 'div');
        this.tbody = scilligence.Utils.createTable(div, 0, 3, { borderRight: JSDraw2.Skin.jssdf.border, borderBottom: JSDraw2.Skin.jssdf.border, borderTop: JSDraw2.Skin.jssdf.border });
        this.tbody.parentNode.setAttribute("class", "scil_table");
        if (!this.viewonly && this.options.addrow != false) {
            var addbtn = scil.Utils.createElement(scil.Utils.createElement(div, "div"), "img", null, null, { src: scil.Utils.imgSrc("img/add.gif"), title: scil.Lang.res("Add") });
            dojo.connect(addbtn, "onclick", function () { if (me.options.onAdd != null) me.options.onAdd(me); else me.addRow(); });
        }

        var r0 = scil.Utils.createElement(this.tbody, "tr");
        var header0 = this.options.header0;
        var r = scil.Utils.createElement(this.tbody, "tr");
        if (header0 != null) {
            scil.Utils.createElement(r0, "td", null, { display: this.options.grouping ? "" : "none" });
            scil.Utils.createElement(r0, "td", null, { display: this.options.rowcheck ? "" : "none" });
            for (var i = 0; i < header0.length; ++i) {
                var item = header0[i];
                if (item == null) {
                    scil.Utils.createElement(r0, "td");
                }
                else {
                    var td = scil.Utils.createElement(r0, "td", scil.Lang.res(item.label), scil.Table.headerstyles, { colSpan: item.colspan });
                    td.style.textAlign = "center";
                }
            }
        }

        var td = scil.Utils.createElement(r, "td", null, scil.Table.headerstyles);
        if (this.options.grouping) {
            td.style.width = "5px";
            scil.Utils.createElement(td, "img", null, null, { src: scil.Utils.imgSrc("img/minus.gif") }, function (e) { me.groupExpandAll(e); });
        }
        else {
            td.style.display = "none";
        }

        var td = scil.Utils.createElement(r, "td", null, scil.Table.headerstyles);
        if (this.options.rowcheck) {
            td.style.width = "5px";
            if (this.options.rowcheck != "radio")
                scil.Utils.createElement(td, "checkbox", null, null, null, function (e) { me.checkAll((e.srcElement || e.target).checked); });
        }
        else {
            td.style.display = "none";
        }

        var style = scil.clone(scil.Table.headerstyles);
        style.borderBottom = JSDraw2.Skin.jssdf.border;
        style.borderLeft = JSDraw2.Skin.jssdf.border;

        for (var id in this.items) {
            var item = this.items[id];
            var s = item.label;
            if (item.unit != null && item.unit != "")
                s += " (" + item.unit + ")";
            var td = scil.Utils.createElement(r, "td", scil.Lang.res(s), style, { key: id });
            if (item.width != null)
                td.style.width = item.width + "px";
            if (item.type == "hidden" || item.ishidden)
                td.style.display = "none";

            if (item.type == "checkbox" && item.headercheckbox != false && !this.viewonly && !item.viewonly) {
                var chk = scil.Utils.createElement(td, "checkbox");
                this.connectCheckAll(chk, id);
            }
        }
        if (this.header == false)
            r.style.display = "none";
        if (!this.viewonly) {
            if (this.options.delrow != false)
                scil.Utils.createElement(r, "td", "&nbsp;", style);
            this.addRow();
        }

        if (this.options.selectrow)
            dojo.connect(this.tbody, "onclick", function (e) { me.clickRow(e); });
    },

    connectCheckAll: function (chk, id) {
        var me = this;
        dojo.connect(chk, "onclick", function (e) { me.checkAll((e.srcElement || e.target).checked, id); });
    },

    hidColumn: function (key) {
        return this.showColumn(key, false);
    },

    /**
    * Show or hide a column
    * @function showColumn
    * @param {string} key
    * @param {bool} f
    * @returns true or false
    */
    showColumn: function (key, f) {
        if (this.options.header0 != null)
            return false;

        if (f == null)
            f = true;

        var item = this.items[key];
        if (item == null || item.type == "hidden")
            return false;
        item.ishidden = !f;

        if (this.tbody == null || this.tbody.childNodes.length <= 1)
            return false;

        var icol = this.getColIndex(key);
        if (icol == -1)
            return false;

        for (var i = 1; i < this.tbody.childNodes.length; ++i)
            this.tbody.childNodes[i].childNodes[icol].style.display = f ? "" : "none";

        return true;
    },

    getColIndex: function (key) {
        var tr = this.tbody.childNodes[1];
        for (var i = 0; i < tr.childNodes.length; ++i) {
            if (tr.childNodes[i].getAttribute("key") == key)
                return i;
        }

        return -1;
    },

    /**
    * Check all rows
    * @function checkAll
    */
    checkAll: function (f, key) {
        var nodes = this.tbody.childNodes;
        if (key == null) {
            for (var i = this._startrow; i < nodes.length; ++i) {
                if (nodes[i].style.display == "none")
                    nodes[i].childNodes[this.checkIndex].firstChild.checked = false;
                else
                    nodes[i].childNodes[this.checkIndex].firstChild.checked = f;
            }
        }
        else {
            var icol = this.getColIndex(key);
            if (icol == -1)
                return false;

            for (var i = this._startrow; i < nodes.length; ++i) {
                if (nodes[i].style.display == "none") {
                    nodes[i].childNodes[this.checkIndex].firstChild.checked = false;
                }
                else {
                    var td = nodes[i].childNodes[icol];
                    var list = td.getElementsByTagName("input");
                    if (list != null && list.length == 1)
                        list[0].checked = f;
                }
            }
        }
    },

    /**
    * Get checked rows
    * @function getCheckedRows
    */
    getCheckedRows: function () {
        var ret = [];
        var list = this.tbody.childNodes;
        for (var i = this._startrow; i < list.length; ++i) {
            if (list[i].childNodes[this.checkIndex].firstChild.checked)
                ret.push(i - this._startrow);
        }
        return ret;
    },

    /**
    * Get checked row data
    * @function getCheckedRowData
    */
    getCheckedRowData: function () {
        var ret = [];
        var list = this.tbody.childNodes;
        for (var i = this._startrow; i < list.length; ++i) {
            if (list[i].childNodes[this.checkIndex].firstChild.checked)
                ret.push(this.getRowData(list[i]));
        }
        return ret;
    },

    /**
    * Get checked row data.  If no row checked, it will use the current row
    * @function getCheckedRowData2
    */
    getCheckedRowData2: function () {
        var ret = [];
        var list = this.tbody.childNodes;
        for (var i = this._startrow; i < list.length; ++i) {
            if (list[i].childNodes[this.checkIndex].firstChild.checked)
                ret.push(this.getRowData(list[i]));
        }

        if (ret.length == 0 && this.cur != null)
            ret.push(this.getCurrentRowData());
        return ret;
    },

    /**
    * Get key of a row
    * @function getKey
    */
    getKey: function (tr) {
        return tr == null ? null : tr.getAttribute("key");
    },

    /**
    * Check a row by using its key
    * @function checkRow
    */
    checkRow: function (key) {
        if (!this.options.rowcheck)
            return;

        if (typeof key == "string") {
            var list = this.tbody.childNodes;
            for (var i = this._startrow; i < list.length; ++i)
                if (list[i].getAttribute("key") == key)
                    list[i].childNodes[this.checkIndex].firstChild.checked = true;
        }
        else if (typeof key == "object") {
            var tr = key;
            if (tr.tagName == "TR")
                tr.childNodes[this.checkIndex].firstChild.checked = true;
        }
    },

    /**
    * Get all keys of checked rows
    * @function getCheckedKeys
    */
    getCheckedKeys: function () {
        var ret = [];
        var list = this.tbody.childNodes;
        for (var i = this._startrow; i < list.length; ++i) {
            if (list[i].childNodes[this.checkIndex].firstChild.checked)
                ret.push(list[i].getAttribute("key"));
        }
        return ret;
    },

    /**
    * Get all keys of checked rows.  If no row checked, it returns selected row.
    * @function getCheckedKeys2
    */
    getCheckedKeys2: function () {
        var ret = this.getCheckedKeys();
        if (ret.length == 0) {
            var key = this.getCurrentKey();
            if (key != null)
                ret.push(key);
        }
        return ret;
    },

    /**
    * Check a row by using its key.  If no row checked, it returns selected row.
    * @function getCheckedKeys2
    */
    getCheckedRows2: function () {
        var ret = this.getCheckedRows();
        if (ret.length == 0) {
            if (this.currow != null)
                ret.push(this.currow);
        }
        return ret;
    },

    /**
    * Get the key of current row
    * @function getCurrentKey
    */
    getCurrentKey: function () {
        if (this.currow == null)
            return null;

        var key = this.currow.getAttribute("key");
        return key == "" ? null : key;
    },

    clickRow: function (e) {
        var src = e.srcElement || e.target;
        var src;
        if (src.tagName == "TR")
            tr = src;
        else if (src.tagName == "A")
            return;
        else
            tr = scil.Utils.getParent(src, "TR");

        if (tr != null && this.tbody != tr.parentNode)
            tr = null;
        this.selectRow(tr);
    },

    selectFirstRow: function () {
        var tr = this.tbody.childNodes[this._startrow];
        this.selectRow(tr);
    },

    findRow: function (key) {
        var list = this.tbody.childNodes;
        for (var i = this._startrow; i < list.length; ++i) {
            if (list[i].getAttribute("key") == key)
                return list[i];
        }
        return null;
    },

    selectRow: function (tr) {
        if (typeof (tr) == "string")
            tr = this.findRow(tr);

        var old = this.currow;
        if (this.currow != null)
            this.currow.style.backgroundColor = this.currow.getAttribute("bgcolor");
        this.currow = tr;
        if (this.currow != null)
            this.currow.style.backgroundColor = JSDraw2.Skin.jssdf.rowcolor;

        if (this.options.onselectrow != null)
            this.options.onselectrow(this.currow, old);
    },

    /**
    * Delete a row
    * @function delRow
    * @param {string} key the key value
    * @returns true or false
    */
    delRow: function (key) {
        var list = this.tbody.childNodes;
        for (var i = 0; i < list.length; ++i) {
            if (list[i].getAttribute("key") == key) {
                this.tbody.removeChild(list[i]);
                if (this.options.onchange != null)
                    this.options.onchange(this);
                this.dirty = true;
                return true;
            }
        }
        return false;
    },

    /**
    * Update a row
    * @function updateRow
    * @param {string} key the key value
    * @param {dictionary} data row data
    * @returns true or false
    */
    updateRow: function (key, data) {
        var list = this.tbody.childNodes;
        for (var i = this._startrow; i < list.length; ++i) {
            if (list[i].getAttribute("key") == key) {
                var tr = list[i];
                if (data == null)
                    data = {};
                data.rowchecked = this.options.rowcheck && tr.childNodes[this.checkIndex].firstChild.checked;
                var r = this.addRow(data, null, tr);
                this.tbody.removeChild(tr);
                if (this.currow == tr)
                    this.selectRow(r);
                return true;
            }
        }
        return false;
    },

    /**
    * Set cell value
    * @function setCellValue2
    * @param {string/number/DOM} rowkey the key of the row, or row index, or TR
    * @param {string} colkey the key of the column
    * @param {object} value
    * @returns true or false
    */
    setCellValue2: function (rowkey, colkey, value) {
        if (this.items[colkey] == null)
            return false;

        var tr = null;
        if (typeof (rowkey) == "number") {
            tr = this.tbody.childNodes[this._startrow + rowkey];
        }
        else if (typeof (rowkey) == "object" && rowkey.tagName == "TR") {
            tr = rowkey
        }
        else {
            var list = this.tbody.childNodes;
            for (var i = this._startrow; i < list.length; ++i) {
                if (list[i].getAttribute("key") == rowkey) {
                    tr = list[i];
                    break;
                }
            }
        }

        if (tr == null)
            return false;

        for (var i = 0; i < tr.childNodes.length; ++i) {
            var td = tr.childNodes[i];
            if (td.getAttribute("__tid") == colkey && td.field != null) {
                scil.Form.setFieldData(td.field, this.items[colkey], this.viewonly, value);
                return true;
            }
        }

        return false;
    },

    /**
    * Get cell value
    * @function getCellValue2
    * @param {string/number} rowkey the key of the row, or row index
    * @param {string} colkey the key of the column
    * @returns the cell value
    */
    getCellValue2: function (rowkey, colkey) {
        if (this.items[colkey] == null)
            return null;

        var tr = null;
        if (typeof (rowkey) == "number") {
            tr = this.tbody.childNodes[this._startrow + rowkey];
        }
        else {
            var list = this.tbody.childNodes;
            for (var i = this._startrow; i < list.length; ++i) {
                if (list[i].getAttribute("key") == rowkey) {
                    tr = list[i];
                    break;
                }
            }
        }

        if (tr == null)
            return null;

        for (var i = 0; i < tr.childNodes.length; ++i) {
            var td = tr.childNodes[i];
            if (td.getAttribute("__tid") == colkey && td.field != null)
                return scil.Form.getFieldData(td.field);
        }

        return null;
    },

    _hilitRow: function (e, f) {
        var tr = e.target || e.srcElement;
        if (tr.tagName != "TR")
            tr = scil.Utils.getParent(tr, "TR");
        if (tr == null || tr.getAttribute("sciltable") != "1")
            return;

        if (f || tr == this.currow)
            tr.style.backgroundColor = JSDraw2.Skin.jssdf.rowcolor;
        else
            tr.style.backgroundColor = tr.getAttribute("bgcolor");
    },

    groupExpandAll: function (e) {
        var img = e.target || e.srcElement;
        var f = scil.Utils.endswith(img.src, "minus.gif");
        img.src = scil.Utils.imgSrc("img/" + (f ? "plus" : "minus") + ".gif");

        var tr = this.tbody.childNodes[this._startrow];
        while (tr != null)
            tr = this.groupExpand(tr, f);
    },

    groupExpand: function (tr, f) {
        var s0 = this.getCellValue(tr, this.options.grouping);
        if (scil.Utils.isNullOrEmpty(s0))
            return null;

        var img = tr.childNodes[this.groupIndex].firstChild;
        if (img.tagName != "IMG")
            return null;
        if (f == null) {
            f = scil.Utils.endswith(img.src, "minus.gif");
        }

        var n = 0;
        while ((tr = tr.nextSibling) != null) {
            var s = this.getCellValue(tr, this.options.grouping);
            if (s0 != s)
                break;
            ++n;
            tr.style.display = f ? "none" : "";
        }

        img.src = scil.Utils.imgSrc("img/" + (f ? (n > 0 ? "plus" : "plus0") : "minus") + ".gif");
        return tr;
    },

    /**
    * Add a row
    * @function addRow
    * @param {dictionary} values row values
    * @param {reserved} lockeditems
    * @param {DOM} beforerow new row will be inserted before this row
    * @returns null
    */
    addRow: function (values, lockeditems, beforerow) {
        if (values == null && this.options.onAdd != null)
            return null;

        if (this.options.onBeforeAddRow != null)
            values = this.options.onBeforeAddRow(values);

        var me = this;
        var bgcolor = this.tbody.childNodes.length % 2 == 1 ? JSDraw2.Skin.jssdf.oddcolor : JSDraw2.Skin.jssdf.evencolor;
        var r = scil.Utils.createElement(null, "tr", null, { backgroundColor: bgcolor }, { sciltable: "1", bgcolor: bgcolor });
        if (beforerow == null)
            this.tbody.appendChild(r);
        else
            this.tbody.insertBefore(r, beforerow);

        dojo.connect(this.tbody.parentNode, "onmouseover", function (e) { me._hilitRow(e, true); });
        dojo.connect(this.tbody.parentNode, "onmouseout", function (e) { me._hilitRow(e, false); });

        var newgroup = false;
        var td = scil.Utils.createElement(r, "td");
        if (this.options.grouping) {
            var s = values == null ? null : values[this.options.grouping];
            var s0 = this.getCellValue(r.previousSibling, this.options.grouping);
            if (scil.Utils.isNullOrEmpty(s) || s != s0) {
                newgroup = true;
                var img = scil.Utils.createElement(td, "img", null, null, { title: "Expand/Collapse All", src: scil.Utils.imgSrc("img/minus.gif") });
                scil.connect(img, "onclick", function (e) { me.groupExpand(r); })
            }
        }
        else {
            td.style.display = "none";
        }

        var td = scil.Utils.createElement(r, "td");
        if (this.options.rowcheck) {
            var name = this.options.rowcheck == "radio" ? "__scil_table_" + this._tableid + "_radio" : null;
            var checktype = this.options.rowcheck == "radio" ? "radio" : "checkbox";
            var check = scil.Utils.createElement(td, checktype, null, null, { name: name });
            check.checked = values == null ? false : values.rowchecked;
            if (this.options.onrowcheck != null)
                dojo.connect(check, "onchange", function () { me.options.onrowcheck(r, check.checked); });

            if (checktype == "checkbox")
                scil.connect(check, "onclick", function (e) { me.checkedClick(e); });
        }
        else {
            td.style.display = "none";
        }

        if (values == null) {
            r.setAttribute("isnew", "1");
        }
        else {
            if (this.key != null && values[this.key] != null)
                r.setAttribute("key", values[this.key]);
        }

        for (var id in this.items) {
            var item = this.items[id];
            var td = scil.Utils.createElement(r, "td", null, item.styles, item.attributes);
            td.style.borderLeft = JSDraw2.Skin.jssdf.border;
            if (item.type == "hidden" || item.ishidden)
                td.style.display = "none";

            var viewonly = this.viewonly || item.viewonly || lockeditems != null && lockeditems[id];
            td.field = scil.Form.createField(td, item, viewonly, values == null ? item.value : values[id], values, true, true);
            if (viewonly && item.type != "img") {
                td.field.style.width = "100%";
            }
            else {
                if (td.field.tagName == "INPUT" || td.field.tagName == "SELECT" || td.field.tagName == "TEXTAREA") {
                    this._connectOnchange(td.field, item);
                    if (item.addrowonenter && beforerow == null)
                        td.field.focus();
                }
            }

            td.setAttribute("__tid", id);
            this.connectKeydown(td, item);
        }

        if (!this.viewonly && lockeditems == null && this.options.delrow != false) {
            var td = scil.Utils.createElement(r, "td");
            td.style.borderLeft = JSDraw2.Skin.jssdf.border;
            var b = scil.Utils.createElement(td, "img", null, null, { src: scil.Utils.imgSrc("img/del.gif"), title: scil.Lang.res("Delete") });
            dojo.connect(b, "onclick", function () { me.removeRow(this); });
        }

        if (this.options.onAddRow != null)
            this.options.onAddRow(r, values);

        if (newgroup && this.options.grouplinestyle != null) {
            for (var i = 0; i < r.childNodes.length; ++i)
                r.childNodes[i].style.borderTop = this.options.grouplinestyle;
        }

        return r;
    },

    checkedClick: function (e) {
        var check = e.srcElement || e.target;
        if (!check.checked)
            return;

        if (e.shiftKey) {
            var nodes = this.tbody.childNodes;
            var start = scil.Utils.indexOf(nodes, scil.Utils.getParent(this._lastcheck, "TR"));
            var end = scil.Utils.indexOf(nodes, scil.Utils.getParent(check, "TR"));
            if (st != -1 && ed != -1) {
                var st = Math.min(start, end);
                var ed = Math.max(start, end);
                for (var i = st; i <= ed; ++i) {
                    if (nodes[i].style.display == "none")
                        nodes[i].childNodes[this.checkIndex].firstChild.checked = false;
                    else
                        nodes[i].childNodes[this.checkIndex].firstChild.checked = true;
                }
            }
        }
        this._lastcheck = check;
    },

    _connectOnchange: function (field, item) {
        var me = this;
        dojo.connect(field, "onchange", function (e) { me.onchange(e, item); });
    },

    setCellValue: function (tr, key, v) {
        for (var i = 0; i < tr.childNodes.length; ++i) {
            var td = tr.childNodes[i];
            if (td.field != null && td.getAttribute("__tid") == key) {
                scil.Form.setFieldData(td.field, this.items[key], this.viewonly, v);
                break;
            }
        }
    },

    getCellValue: function (tr, key) {
        for (var i = 0; i < tr.childNodes.length; ++i) {
            var td = tr.childNodes[i];
            if (td.field != null && td.getAttribute("__tid") == key)
                return scil.Form.getFieldData(td.field);
        }
        return null;
    },

    connectKeydown: function (td, item) {
        if (this.viewonly || td.field.tagName != "INPUT" || !item.addrowonenter)
            return;

        var me = this;
        dojo.connect(td.field, "onkeydown", function (e) {
            if (e.keyCode == 13) {
                var tr = scil.Utils.getParent(td, "TR");
                if (typeof (item.addrowonenter) == "function")
                    item.addrowonenter(td, item, me);
                if (me.tbody.childNodes[me.tbody.childNodes.length - 1] == tr)
                    me.addRow();
            }
        });
    },

    onchange: function (e, item) {
        this.dirty = true;
        if (this.options.onchange != null)
            this.options.onchange(this, e, item);
    },

    removeRow: function (img) {
        var me = this;
        scil.Utils.confirmYes("Delete this row?", function () {
            var tr = scilligence.Utils.getParent(img, "TR");
            tr.parentNode.removeChild(tr);
            if (me.options.onchange != null)
                me.options.onchange(this);
            me.dirty = true;
        });
    },

    showHideColumns: function () {
        if (this.showhideDlg == null) {
            var columns = {
                caption: { label: "Caption", width: 400 },
                key: { label: "Key", width: 100, iskey: true }
            };

            var me = this;
            var fields = { table: { type: "table", columns: columns, options: { rowcheck: true, viewonly: true}} };
            this.showhideDlg = scil.Form.createDlgForm("Show/Hide Columns", fields, { label: "OK", onclick: function () { me.showHideColumns2(); } }, { hidelabel: true });
        }

        this.showhideDlg.show();

        var rows = [];
        for (var k in this.items) {
            if (this.items[k].type != "hidden")
                rows.push({ caption: this.items[k].label, key: k, rowchecked: !this.items[k].ishidden });
        }
        this.showhideDlg.form.setData({ table: rows });
        this.showhideDlg.moveCenter();
    },

    showHideColumns2: function () {
        var table = this.showhideDlg.form.fields.table.jsd;
        var list = table.getData(null, null, true);
        for (var i = 0; i < list.length; ++i)
            this.showColumn(list[i].key, list[i].rowchecked == true);
        this.showhideDlg.hide();
    }
});


scilligence.apply(scilligence.Table, {
    headerstyles: { /*border: "solid 1px #eee", */whiteSpace: "nowrap", textAlign: "center", verticalAlign: "top", backgroundColor: "#bbb"}, //scil.Utils.imgSrc("img/header-bg.gif", true) + " repeat-x" },

    /**
    * Create a table
    * @function {static} create
    * @param {object} obj the data object to be loaded into the table. obj.load() will be called
    * @param {string or DOM} parent parent element
    * @param {array} items table column items. item: { id, iskey ... }
    * @param {bool} viewonly indicate if creating a viewonly table
    * @returns a new Table object
    */
    create: function (obj, parent, items, viewonly, loadimmediately) {
        if (typeof parent == "string")
            parent = dojo.byId(parent);

        var div = scil.Utils.createElement(parent, "div");
        var table = new scil.Table(viewonly);
        table.render(div, items);

        if (loadimmediately != false && obj.load != null)
            scil.onload(function () { obj.load(); });
        return table;
    },

    /**
    * List pages
    * @function {static} listPages
    * @param {DOM} div - parent div
    * @param {number} page
    * @param {number} totalpages
    * @param {function} onclick(page) {}
    */
    listPages: function (div, page, totalpages, onclick) {
        scil.Utils.removeAll(div);
        if (!(page >= 1) || !(totalpages > 1))
            return;

        --page;

        var st, ed;
        if (totalpages <= 11) {
            st = 0;
            ed = totalpages;
        }
        else {
            st = page - 5;
            if (st < 0)
                st = 0;
            ed = st + 11;
            if (ed > totalpages)
                ed = totalpages;
            if (ed - st < 11) {
                st = ed - 11;
                if (st < 0)
                    st = 0;
            }
        }

        this.createPage(div, scil.Lang.res("Previous Page"), page > 0 ? page : null, onclick);

        if (st > 0) {
            this.createPage(div, 1, 1, onclick);
            if (st > 1)
                this.createPage(div, "...", null, onclick);
        }

        for (var k = st; k < page; ++k)
            this.createPage(div, k + 1, k + 1, onclick);
        this.createPage(div, page + 1, null, onclick);
        for (var k = page + 1; k < ed; ++k)
            this.createPage(div, k + 1, k + 1, onclick);
        if (ed < totalpages) {
            if (ed + 1 < totalpages)
                this.createPage(div, "...", null, onclick);
            this.createPage(div, totalpages, totalpages, onclick);
        }

        this.createPage(div, scil.Lang.res("Next Page"), page + 1 < totalpages ? page + 2 : null, onclick);
    },

    createPage: function (div, label, page, onclick) {
        if (page == null)
            scil.Utils.createElement(div, "span", label);
        else
            scil.Utils.createButton(div, { label: label, type: "a", onclick: function () { onclick(page); } });

        scil.Utils.createElement(div, "span", "&nbsp;");
    },

    rows2xml: function (rows) {
        if (rows == null)
            return null;

        var s = "<table>";
        for (var i = 0; i < rows.length; ++i) {
            var r = rows[i];
            s += "<r>";
            for (var k in r) {
                var v = r[k];
                if (!scil.Utils.isNullOrEmpty(v))
                    s += "<i n='" + scil.Utils.escXmlValue(k) + "'>" + scil.Utils.escXmlValue(v) + "</i>";
            }
            s += "</r>";
        }
        s += "</table>";
        return s;
    }
});

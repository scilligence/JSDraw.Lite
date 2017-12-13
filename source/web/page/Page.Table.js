//////////////////////////////////////////////////////////////////////////////////
//
// Scilligence JSDraw
// Copyright (C) 2014 Scilligence Corporation
// Version 1.0.0.2013-11-06
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Page.Table class - Page.Table Control
* @class scilligence.Page.Table
*/
scil.Page.Table = scil.extend(scil._base, {
    constructor: function (page, options, parent) {
        var me = this;
        this.refreshneeded = true;
        this.page = page;
        this.options = options;
        this.receivers = [];

        var buttons = [];
        if (!options.norefresh)
            buttons.push({ src: scil.App.imgSmall("refresh.png"), title: "Refresh", onclick: function () { me.refresh(); } });
        if (this.options.fields != null) {
            buttons.push("-");
            if (this.options.canadd != false)
                buttons.push({ src: scil.App.imgSmall("add.png"), title: "New", onclick: function () { me.add(); } });
            if (this.options.canedit != false)
                buttons.push({ src: scil.App.imgSmall("edit.png"), title: "Edit", onclick: function () { me.edit(); } });
        }
        if (this.options.buttons != null)
            buttons = buttons.concat(this.options.buttons);

        if (this.options.columnhidable) {
            buttons.push("-");
            buttons.push({ src: scil.App.imgSmall("columns.png"), title: "Show/Hide Columns", onclick: function () { me.table.showHideColumns(); } });
        }

        this.form = new scil.Page.ExplorerForm(parent, { expandable: options.expandable, caption: options.caption, visible: options.visible, marginBottom: options.marginBottom, buttons: buttons, expanded: this.options.expanded, onexpand: this.options.onexpand });
        this.form.host = this;
        this.pages = scil.Utils.createElement(this.form.div, "div");

        this.tablediv = scil.Utils.createElement(this.form.div, "div");
        this.recreateTable();
    },

    recreateTable: function () {
        scil.Utils.removeAll(this.tablediv);

        var me = this;
        this.table = new scil.Table(true, null, { onAddRow: this.options.onAddRow, selectrow: true, onselectrow: function (tr) { me.selectrow(tr); }, rowcheck: this.options.rowcheck, grouping: this.options.grouping, grouplinestyle: this.options.grouplinestyle });
        this.table.render(this.tablediv, this.options.columns);
        this.table.tbody.parentNode.style.width = "100%";

        if (this.options.oncreatetable != null)
            this.options.oncreatetable(this);
    },

    selectFirstRow: function () {
        this.table.selectFirstRow();
    },

    show: function () {
        this.form.show();
    },

    hide: function () {
        this.form.hide();
    },

    clear: function () {
        scil.Utils.removeAll(this.pages);
        this.table.setData({});
        this.page.receiverClear(this);
    },

    selectrow: function (tr) {
        var id = tr == null ? null : tr.getAttribute("key");
        var args = null;
        /*if (id != null)*/
        {
            args = {};
            args[this.options.key] = id;
            var data = this.table.getRowData(tr);
            if (this.options.name != null && data != null)
                args[this.options.name] = data[this.options.name];
            this.page.receiverRefresh(this, args);
        }

        if (this.options.onselectrow != null)
            this.options.onselectrow(tr, args);
    },

    loadPage: function (page) {
        if (this.args == null)
            this.args = {};
        if (this.options.onloadpage != null)
            this.options.onloadpage(this.args, page, this);
        this.refresh(null, null, null, page);
    },

    list: function (ret) {
        var me = this;
        if (ret == null)
            ret = {};
        this.table.setData(ret.rows == null ? ret : ret.rows);
        scil.Table.listPages(this.pages, ret.page, ret.pages, function (page) { me.loadPage(page); });
    },

    refresh: function (from, args, selectfirstrow, page) {
        if (args != null)
            this.args = args;
        if (this.args == null)
            this.args = {};
        this.args.page = page;

        if (!this.form.isVisible() || !this.form.isExpanded()) {
            this.refreshneeded = true;
            return;
        }

        this.page.receiverClear(this);
        this.refreshneeded = false;

        var me = this;
        var params = this.args;
        if (params == null)
            params = {};
        if (me.options.onbeforerefresh != null)
            me.options.onbeforerefresh(params);

        var fun = this.options.jsonp ? scil.Utils.jsonp : scil.Utils.ajax;
        fun(this.page.url + this.options.object + ".list", function (ret) {
            if (me.options.onbeforelisting != null)
                me.options.onbeforelisting(ret, me);

            if (selectfirstrow) {
                me.list(ret);
                me.table.selectFirstRow();
            }
            else {
                var key = me.table.getCurrentKey();
                me.list(ret);
                if (key != null)
                    me.table.selectRow(key);
            }
            //if (ret.length == 0)
            //    scil.Utils.alert("No records found.  It might because you don't have access to it.");
            if (me.options.onrefreshed != null)
                me.options.onrefreshed(me);
        }, params);
    },

    add: function (values) {
        if (this.options.onAddNew != null && this.options.onAddNew(this.args) == false)
            return;

        this.add2(values);
    },

    add2: function (values) {
        this.create();
        this.dlg.show();
        if (this.options.usetabs)
            this.dlg.form.tabs.showTab(0);

        if (this.options.onshowform != null)
            this.options.onshowform(this.dlg, this.args);
        var data = values != null ? values : (this.options.defaultvalues == null ? {} : this.options.defaultvalues);
        this.applyArgs(data);
        if (this.options.key != null)
            data[this.options.key] = null;
        if (this.options.onloaddata)
            this.options.onloaddata(data, this.args, this.dlg);
        this.dlg.form.setData(data);
        this.dlg.editkey = null;

        this.showDelButton(false);
    },

    copyNew: function (key) {
        if (key == null) {
            for (var k in this.options.fields) {
                if (this.options.fields[k].iskey) {
                    key = k;
                    break;
                }
            }
        }
        if (key == null)
            return;

        var me = this;
        this.edit(function (ret) { ret[key] = " "; me.dlg.editkey = null; });
    },

    edit: function (onsetdata) {
        if (this.table.currow == null) {
            scil.Utils.alert("please select a row first");
            return;
        }

        this.add2();
        this.showDelButton(true);

        var me = this;
        var data = {};
        data[this.options.key] = this.table.currow.getAttribute("key");
        this.dlg.editkey = data[this.options.key];

        if (this.options.onEdit != null && this.options.onEdit(data) == false)
            return;

        scil.Utils.ajax(this.page.url + this.options.object + ".load", function (ret) {
            //me.applyArgs(ret);
            if (me.options.onloaddata)
                me.options.onloaddata(ret, me.args, me.dlg);

            if (onsetdata != null)
                onsetdata(ret, me);

            if (me.options.savedoc && ret.doc != null && ret.doc != "") {
                me.dlg.form.setXml(ret.doc);
                me.dlg.form.setData(ret, true);
            }
            else {
                me.dlg.form.setData(ret);
            }
        }, data);
    },

    applyArgs: function (data) {
        if (this.args != null)
            scil.apply(data, this.args);
    },

    cancel: function () {
        if (this.dlg != null)
            this.dlg.hide();
    },

    save: function () {
        if (this.dlg.form.checkRequiredFields() > 0) {
            scil.Utils.alert("Some required field(s) are blank");
            return;
        }

        var me = this;
        var data = this.dlg.form.getData();
        if (this.options.savedoc)
            data.doc = this.dlg.form.getXml();
        if (this.options.onbeforesave) {
            if (this.options.onbeforesave(data, this.args, this.dlg.form) == false)
                return false;
        }

        scil.Utils.ajax(this.page.url + this.options.object + ".save", function (ret) {
            me.dlg.hide();
            if (ret != null && ret.rows != null && ret.rows.length > 0) {
                for (var i = 0; i < ret.rows.length; ++i) {
                    if (me.dlg.editkey != null)
                        me.table.updateRow(me.dlg.editkey, ret.rows[i]);
                    else
                        me.table.addRow(ret.rows[i]);
                }
            }
            else {
                me.refresh();
            }

            if (me.options.onaftersave)
                me.options.onaftersave(ret, me);
        }, data, { showprogress: true });
    },

    del: function () {
        var me = this;
        scil.Utils.confirmYes("Delete this record?", function () {
            var data = me.dlg.form.getData();
            scil.Utils.ajax(me.page.url + me.options.object + ".del", function (ret) {
                me.dlg.hide();
                me.refresh();
            }, data);
        });
    },

    showDelButton: function (f) {
        if (this.dlg == null)
            return;

        for (var i = 0; i < this.dlg.form.buttons.length; ++i) {
            var b = this.dlg.form.buttons[i];
            if (b != null && b.getAttribute("key") == "delete") {
                b.style.display = f ? "" : "none";
                break;
            }
        }
    },

    create: function () {
        if (this.dlg != null)
            return;

        var me = this;
        var buttons = [{ src: scil.App.imgSmall("submit.png"), label: "Save", key: "save", onclick: function () { me.save(); } }];
        if (this.options.candelete != false)
            buttons.push({ src: scil.App.imgSmall("del.png"), label: "Delete", key: "delete", onclick: function () { me.del(); } });
        buttons.push({ src: scil.App.imgSmall("cancel.png"), label: "Cancel", key: "cancel", onclick: function () { me.cancel(); } });

        if (this.options.usetabs) {
            this.dlg = scil.Form.createTabDlgForm(this.options.formcaption, { tabs: this.options.fields, buttons: buttons, border: true, onchange: this.options.onformdatachange });
        }
        else {
            this.dlg = scil.Form.createDlgForm(this.options.formcaption, this.options.fields, buttons,
            { alternativeforms: this.options.alternativeforms, hidelabel: this.options.hidelabel, oncreated: this.options.oncreateform, onchange: this.options.onformdatachange });
        }
    }
});

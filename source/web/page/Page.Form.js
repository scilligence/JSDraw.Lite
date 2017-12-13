//////////////////////////////////////////////////////////////////////////////////
//
// Scilligence JSDraw
// Copyright (C) 2014 Scilligence Corporation
// Version 1.0.0.2013-11-06
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Page.Form class - Page.Form Control
* @class scilligence.Page.Form
*/
scil.Page.Form = scil.extend(scil._base, {
    constructor: function (page, options, parent) {
        var me = this;
        this.refreshneeded = true;
        this.page = page;
        this.options = options;
        this.receivers = [];

        var buttons = [];
        if (options.norefresh == false)
            buttons.push({ src: scil.App.imgSmall("refresh.png"), title: "Refresh", onclick: function () { me.refresh(); } });
        if (this.options.buttons != null)
            buttons = buttons.concat(this.options.buttons);

        if (options.viewonly == null)
            options.viewonly = true;

        this.form = new scil.Page.ExplorerForm(parent, { expandable: options.expandable, caption: options.caption, visible: options.visible, buttons: buttons, marginBottom: options.marginBottom, expanded: this.options.expanded, onexpand: this.options.onexpand });
        this.form.host = this;
        this.table = new scil.Form({ alternativeforms: this.options.alternativeforms, viewonly: options.viewonly, onchange: this.options.onformchange });
        this.table.render(this.form.div, this.options.fields, { immediately: true, hidelabel: options.hidelabel });
    },

    show: function () {
        this.form.show();
    },

    hide: function () {
        this.form.hide();
    },

    refresh: function (from, args) {
        if (args != null)
            this.args = args;

        if (!this.form.isVisible() || !this.form.isExpanded()) {
            this.refreshneeded = true;
            return;
        }

        if (scil.Utils.isDictEmpty(this.args))
            return;

        var me = this;
        this.refreshneeded = false;
        var params = this.args;
        if (params == null)
            params = {};
        if (me.options.onbeforerefresh != null)
            me.options.onbeforerefresh(params);

        this.page.receiverClear(this);

        scil.Utils.ajax(this.page.url + this.options.object + ".load", function (ret) {
            if (me.options.onsetdata != null) {
                me.options.onsetdata(me.table, ret);
            }
            else if (me.options.savedoc && ret.doc != null && ret.doc != "") {
                me.table.setXml(ret.doc);
                me.table.setData(ret, true);
            }
            else {
                me.table.setData(ret);
            }
        }, params);
    },

    clear: function () {
        this.table.setData({});
        this.page.receiverClear(this);
    }
});

//////////////////////////////////////////////////////////////////////////////////
//
// Scilligence JSDraw
// Copyright (C) 2014 Scilligence Corporation
// Version 1.0.0.2013-11-06
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Page.Custom class - Page.Custom Control
* @class scilligence.Page.Custom
* <pre>
* <b>Example:</b>
*        var tabs = this.page.addTabs();
*        scil.pmf.Company.allForms(this, tabs, this.parenttable, true);
*
*        var me = this;
*        this.dynamicform = tabs.addForm({
*            caption: "Dynamic Form",
*            type: "custom",
*            onclear: function () {
*                scil.Utils.removeAll(me.dynamicform.form.div);
*            },
*            onrefresh: function (from, args) {
*                scil.Utils.removeAll(me.dynamicform.form.div);
*                var fields = {
*                    mass: { label: "Mass", type: "number", width: 200, unit: "g" },
*                    name: { label: "Compound Name", type: "input", width: 200, button: { label: "Test", onclick: function () { alert(99); } } },
*                    vendor: { label: "Vendor", type: "select", options: ["Company A", "Company B"], width: 200 }
*                };
*                var form = new scil.Form({ viewonly: false });
*                form.render(me.dynamicform.form.div, fields, { immediately: true });
*            }
*        });
* </pre>
*/
scil.Page.Custom = scil.extend(scil._base, {
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

        this.form = new scil.Page.ExplorerForm(parent, { expandable: options.expandable, caption: options.caption, visible: options.visible, buttons: buttons, marginBottom: options.marginBottom, expanded: this.options.expanded, onexpand: this.options.onexpand });
        this.form.host = this;
        if (this.options.oncreate != null)
            this.options.oncreate(this.form.div, this.options);
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

        if (!this.form.isVisible()) {
            this.refreshneeded = true;
            return;
        }

        this.refreshneeded = false;
        if (this.options.onrefresh != null)
            this.options.onrefresh(from, this.args, this);
    },

    clear: function () {
        if (this.options.onclear != null)
            this.options.onclear();
    }
});

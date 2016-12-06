﻿//////////////////////////////////////////////////////////////////////////////////
//
// Scilligence JSDraw
// Copyright (C) 2016 Scilligence Corporation
// Version 1.0.0.2013-11-06
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Page.Tab class - Page.Tab Control
* @class scilligence.Page.Tab
*/
scil.Page.Tab = scil.extend(scil._base, {
    constructor: function (page, options, parent) {
        this.page = page;
        this.options = options == null ? {} : options;
        this.onShowTab2 = this.options.onShowTab;

        var me = this;
        this.options.onShowTab = function (tab, old) {
            if (old != null && old.form != null)
                old.form.hide();
            if (tab.form != null)
                tab.form.show();

            if (me.onShowTab2 != null)
                me.onShowTab2(tab, old);
        };
        this.tabs = new scil.Tabs(parent, this.options);
    },

    addForm: function (options, listento) {
        var td = this.tabs.addTab(options);

        var caption = options.captions;
        options.caption = null;
        td.form = scil.Page.addForm(this.page, options, listento, td.clientarea);
        options.caption = caption;

        scil.Page.setBorder(td.form.form);
        return td.form;
    },

    removeTab: function(key) {
        return this.tabs.removeTab(key);
    },

    findTab: function(key) {
        return this.tabs.findTab(key);
    },

    showTab: function (td) {
        this.tabs.showTab(td);
    },

    show: function () {
        this.tabs.show();
    },

    hide: function () {
        this.tabs.hide();
    }
});
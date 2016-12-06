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
* TabbedForm class - TabbedForm Control
* @class scilligence.TabbedForm
*/
scil.TabbedForm = scil.extend(scil._base, {
    constructor: function (options) {
        this.form = null;
        this.options = options;
        this.buttons = [];
    },

    render: function(parent) {
        if (typeof(parent) == "string")
            parent = dojo.byId(parent);

        var me = this;
        this.options.onShowTab = function(td, old) {
            if (!td.rendered && old != null)
                me.renderTabForm(td);
        };

        this.options.onBeforeShowTab = function(td, old) {
            if (me.options.onbeforeshowtab != null && td != old)
                return me.options.onbeforeshowtab(td, old);
        };

        var first = true;
        this.tabs = new scil.Tabs(parent, this.options);
        for (var k in this.options.tabs) {
            this.options.tabs[k].tabkey = k;
            var td = this.tabs.addTab(this.options.tabs[k]);
            td.form = new scil.Form(this.options);

            if (!this.options.delayrender || first) {
                this.renderTabForm(td);
                first = false;
            }
        }

        var buttons = this.options.buttons;
        if (buttons != null) {
            var div = scil.Utils.createElement(parent, "div", null, { marginTop: "10px", textAlign: "center"});
            if (buttons.length > 0) {
                for (var i = 0; i < buttons.length; ++i)
                    this.buttons.push(scil.Utils.createButton(div, buttons[i]));
            }
            else {
                this.buttons.push(scil.Utils.createButton(div, buttons));
            }
        }

        return this;
    },

    renderTabForm: function(td) {
        if (td.rendered)
            return;

        var k = td.getAttribute("key");
        var display = td.clientarea.style.display;
        td.clientarea.style.display = "";
        td.form.render(td.clientarea, this.options.tabs[k].fields, this.options.tabs[k]);
        td.clientarea.style.display = display;

        td.rendered = true;
    },

    getCurTabData: function (includeNullValues) {
        if (this.tabs.currenttab == null || this.tabs.currenttab.form == null)
            return null;
        return this.tabs.currenttab.form.getData(includeNullValues);
    },

    /**
    * Collect form data in xml format
    * @function getXml
    * @returns xml string
    */
    getXml: function (nowrapper) {
        var ret = nowrapper ? "" : "<data>\n";
        var tabs = this.tabs.allTabs();
        for (var k in tabs) {
            var form = tabs[k].form;
            if (form != null)
                ret += form.getXml(true);
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

    getData: function (includeNullValues) {
        if (this.options.getdata == "tab")
            return this.getCurTabData(includeNullValues);

        var ret = {};
        var tabs = this.tabs.allTabs();
        for (var k in tabs) {
            var form = tabs[k].form;
            if (form != null) {
                var data = form.getData(includeNullValues);
                scil.apply(ret, data);
            }
        }

        return ret;
    },

    setData: function (data, overwritemode) {
        if (this.options.setdata == "tab") {
            if (this.tabs.currenttab != null && this.tabs.currenttab.form != null)
                this.tabs.currenttab.form.setData(data, overwritemode);
        }
        else {
            var tabs = this.tabs.allTabs();
            for (var k in tabs) {
                var form = tabs[k].form;
                if (form != null)
                    form.setData(data, overwritemode);
            }
        }
    }
});
//////////////////////////////////////////////////////////////////////////////////
//
// Scilligence JSDraw
// Copyright (C) 2016 Scilligence Corporation
// Version 1.0.0.2013-11-06
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Page class - Page Framework
* JSDraw.Page framework helps to quickly build modern web applications
* @class scilligence.Page
* <pre>
* <b>Example:</b>
*    &lt;div id="placeholder"&gt;&lt;/div&gt;
*
*    &lt;script type="text/javascript"&gt;
*    scil.ready(function () { init(); });
*
*    function init() {
*        var tree = {
*            caption: "Analytical Category",
*            key: "category",
*            name: "category",
*            //object: "instrument",
*            root: { name: "Categories", icon: "img/ext/bmp.gif", children: [
*                { name: "Cambridge", icon: "img/ext/pdf.gif", isleaf: true },
*                { name: "Boston", icon: "img/ext/doc.gif", isleaf: true }
*            ]
*            }
*        };
*        this.page = new scil.Page(scil.byId("placeholder"), tree, { resizable: true, leftwidth: 300 });
*
*        var width = 300;
*        var instruments = this.page.addForm({
*            caption: "Analyticals",
*            key: "analyticalid",
*            name: "name",
*            object: "analytical",
*            columns: {
*                analyticalid: { type: "hidden", iskey: true },
*                name: { label: "Analytical Name", width: 200 },
*                category: { label: "Category", width: 200 },
*                version: { label: "Version", width: 100 }
*            },
*            formcaption: "Analytical",
*            fields: {
*                analyticalid: { type: "hidden", iskey: true },
*                name: { label: "Analytical Name", width: 800 },
*                category: { label: "Category", width: 800 },
*                version: { label: "Version", width: 100 },
*                requestform: { label: "Request Form", type: "textarea", height: 200, width: 800 },
*                resultform: { label: "Request Form", type: "textarea", height: 200, width: 800 }
*            }
*        }, this.page.tree);
*
*    }
*    &lt;/script&gt;
* </pre>
*/
scil.Page = scil.extend(scil._base, {
    constructor: function (parent, tree, forms, middle, onRefreshReceivers) {
        var args;
        if (forms != null && forms.length > 0 || middle != null || onRefreshReceivers != null) {
            args = { middle: middle, onRefreshReceivers: onRefreshReceivers, forms: forms };
        }
        else {
            args = forms == null ? {} : forms;
        }

        if (tree == null && args.left == null)
            args.left = false;

        if (tree != null)
            args.onresize = tree.onresizetree;

        this.onRefreshReceivers = args.onRefreshReceivers;
        this.url = scil.Page.ajaxurl == null ? "ajax.ashx?cmd=" : scil.Page.ajaxurl;
        this.explorer = new scil.Page.Explorer(parent, args);

        if (tree != null && tree.root != null && tree.root.children != null) {
            for (var i = 0; i < tree.root.children.length; ++i)
                tree.root.children[i].name = scil.Lang.res(tree.root.children[i].name);
        }

        this.tree = null;
        if (tree != null) {
            // var div = scil.Utils.createElement(this.explorer.left, "div", null, { width: tree.width > 0 ? tree.width : 240 });
            if (tree.type == "table")
                this.table = new scil.Page.Table(this, tree, this.explorer.left);
            else if (tree.type == "form")
                this.form = new scil.Page.Form(this, tree, this.explorer.left);
            else
                this.tree = new scil.Page.Tree(this, tree, this.explorer.left);
        }

        if (args.forms != null) {
            var last = this.tree == null ? this.form : this.tree;
            for (var i = 0; i < args.forms.length; ++i)
                last = this.addForm(args.forms[i], last);
        }
    },

    addTabs: function (options) {
        var tabs = new scil.Page.Tab(this, options, this.explorer.right);
        if (options != null && options.visible == false || options == false)
            tabs.hide();
        return tabs;
    },

    addDiv: function (text, style) {
        return scil.Utils.createElement(this.explorer.right, "div", text, style);
    },

    addForm: function (options, listento, parent, leftside) {
        return scil.Page.addForm(this, options, listento, parent, leftside);
    },

    addResizeHandle: function(onresize, height) {
        var div = this.addDiv();
        div.style.height = (height > 0 ? height : scil.Page.kHandleWidth) + "px";
        div.style.marginBottom = "2px";
        new scil.Resizable(div, { direction: "y", mouseovercolor: scil.Page.kHandleColor, onresize: onresize });
        return div;
    },

    removeForm: function (form) {
        var root = form.form.root;
        root.parentNode.removeChild(root);
    },

    receiverRefresh: function (form, args) {
        if (this.onRefreshReceivers != null)
            this.onRefreshReceivers(args, form);

        for (var i = 0; i < form.receivers.length; ++i)
            form.receivers[i].refresh(form, args);
    },

    receiverClear: function (form) {
        for (var i = 0; i < form.receivers.length; ++i)
            form.receivers[i].clear();
    }
});


scil.apply(scil.Page, {
    kHandleWidth: 5,
    kHandleColor: "#aaf",

    addForm: function (page, options, listento, parent, leftside) {
        if (parent == null)
            parent = leftside ? page.explorer.left : page.explorer.right;

        var form = null;
        if (options.type == "form")
            form = new scil.Page.Form(page, options, parent);
        else if (options.type == "custom")
            form = new scil.Page.Custom(page, options, parent);
        else if (options.type == "calendar")
            form = new scil.Page.Calendar(page, options, parent);
        else
            form = new scil.Page.Table(page, options, parent);

        if (listento != null)
            listento.receivers.push(form);

        scil.Page.setBorder(form.form);
        options.form = form;
        return form;
    },

    setBorder: function (form) {
        form.toolbar.style.borderLeftColor = scil.Tabs.kHighlightColor;
        form.toolbar.style.borderRightColor = scil.Tabs.kHighlightColor;
        form.main.style.borderLeftColor = scil.Tabs.kHighlightColor;
        form.main.style.borderRightColor = scil.Tabs.kHighlightColor;
        form.main.style.borderBottomColor = scil.Tabs.kHighlightColor;
    }
});
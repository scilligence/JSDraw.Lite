//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scillignece.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* HomePage class - create RegMol/Inventory like Home Page
* @class scilligence.HomePage
* <pre>
* <b>Example:</b>
*        var args = {
*            ajaxurl: "ajax.aspx?cmd=user.home",
*            search: { label: "Search", autosuggesturl: "ajax?cmd=search.suggest", hints: "Use Product #, Lot #, Package #, Location #.", url: "Search.aspx?text=" },
*            columns: [
*                { section: "projects", caption: "My Projects", text: "projectcode", link: "Project.aspx?projectid=", id: "projectid" }
*            ]
*        };
*        scil.HomePage.init(div, args);
* </pre>
*/
scil.HomePage = {
    q: null,
    options: null,
    columns: [],

    div: null,
    onloaded: null,

    // options: { ajaxurl, search: {label, autosuggesturl, hints, url}, columns: [{section, caption, text, link, id, render, lastline}]};
    init: function (div, options) {
        var me = this;
        scil.ready(function () {
            me.init2(div, options);
        });
    },

    init2: function (div, options) {
        if (typeof div == "string")
            div = scil.byId(div);
        this.options = options;
        this.div = div;

        if (this.oninit != null)
            this.oninit(this.options);

        var me = this;
        var tbody = scil.Utils.createTable(div, 0, 0);
        tbody.parentNode.setAttribute("align", "center");

        var cols = this.options.columns == null ? 0 : this.options.columns.length;
        if (!this.options.notifications)
            this.notification = scil.Utils.createElement(tbody, "tr", null, { display: "none" });

        if (this.options.search != null) {
            var tr = scil.Utils.createElement(tbody, "tr");
            var top = scil.Utils.createElement(tr, "td", null, { padding: "20px" }, { colSpan: cols });

            var tbody2 = scil.Utils.createTable(top, 0, 0);
            tbody2.parentNode.setAttribute("align", "center");
            var tr2 = scil.Utils.createElement(tbody2, "tr");
            scil.Utils.createElement(tr2, "td", scil.Lang.res(this.options.search.label) + ":&nbsp;");
            this.q = scil.Utils.createElement(scil.Utils.createElement(tr2, "td"), "input", null, { width: "300px", padding: "5px" });
            if (this.options.search.autosuggesturl != null)
                this.q_auto = new scil.AutoComplete(this.q, this.options.search.autosuggesturl);
            dojo.connect(this.q, "onkeyup", function (e) {
                if (e.keyCode == 13 && !me.q_auto.isVisible())
                    me.search();
            });
            scil.Utils.createButton(scil.Utils.createElement(tr2, "td"),
                { src: scil.App.imgSmall("submit.png"), label: scil.Lang.res("Search"), type: "a", onclick: function () { me.search(); } });

            tr2 = scil.Utils.createElement(tbody2, "tr");
            scil.Utils.createElement(tr2, "td");
            scil.Utils.createElement(tr2, "td", this.options.search.hints, { color: "#aaa" });
        }

        var style = { padding: "0 20px 0 20px" };
        var style2 = { padding: "0 20px 0 20px", borderLeft: "solid 2px " + (scil.App.config == null ? "#fff" : scil.App.config.frame) };
        tr = scil.Utils.createElement(tbody, "tr");
        if (cols > 0) {
            for (var i = 0; i < this.options.columns.length; ++i)
                this.columns[i] = scil.Utils.createTable(scil.Utils.createElement(tr, "td", null, style2, { valign: "top" }));
        }

        if (this.options.onloaded != null) {
            var tr = scil.Utils.createElement(tbody, "tr");
            this.bottom = scil.Utils.createElement(tr, "td", null, null, { colSpan: cols });
        }

        this.load();
    },

    search: function () {
        if (this.q.value == "") {
            scil.Utils.alert("No input!");
            return;
        }
        window.location = this.options.search.url + escape(this.q.value);
    },

    load: function () {
        if (this.options.columns == null || this.options.columns.length == 0) {
            if (this.options.onloaded != null)
                this.options.onloaded(this.bottom);
            return;
        }

        var me = this;
        scil.Utils.ajax(this.options.ajaxurl, function (ret) {
            me.loadData(ret);
            if (me.options.onloaded != null)
                me.options.onloaded(me.bottom);

            if (me.onloaded != null)
                me.onloaded(me);
        });
    },

    loadData: function (ret) {
        var cols = this.options.columns == null ? 0 : this.options.columns.length;

        if (ret.notifications != null && ret.notifications.length > 0) {
            this.notification.style.display = "";
            var td = scil.Utils.createElement(this.notification, "td", null, { padding: "20px" }, { colSpan: cols });

            var div = scil.Utils.createElement(td, "div", null, { border: "solid 2px red", padding: "5px" });
            var tbody = scil.Utils.createTable(div);
            tbody.parentNode.setAttribute("align", "center");
            for (var i = 0; i < ret.notifications.length; ++i) {
                var r = ret.notifications[i];

                var tr = scil.Utils.createElement(tbody, "tr");
                scil.Utils.createElement(tr, "td", (i + 1) + ".");
                scil.Utils.createElement(tr, "td", scil.Utils.isNullOrEmpty(r.category) ? null : "[" + r.category + "]");
                var td = scil.Utils.createElement(tr, "td");

                if (scil.Utils.isNullOrEmpty(r.link))
                    td.innerHTML = r.text;
                else
                    scil.Utils.createElement(td, "a", r.text, null, { href: r.link });
            }
        }

        for (var i = 0; i < cols; ++i) {
            var col = this.options.columns[i];
            var parent = this.columns[i];

            scil.Utils.createElement(scil.Utils.createElement(parent, "tr"), "td", "<b>" + scil.Lang.res(col.caption) + "</b>", null, { colSpan: col.colspan, vAlign: "top" });
            var items = ret[col.section];
            if (items == null)
                items = col.items;
            if (items == null)
                continue;

            for (var j = 0; j < items.length; ++j) {
                var item = items[j];
                var tr = scil.Utils.createElement(parent, "tr");
                if (col.render != null) {
                    col.render(tr, item);
                    continue;
                }

                var td = scil.Utils.createElement(tr, "td");
                if (item.icon != null)
                    scil.Utils.createElement(td, "img", null, { paddingRight: "5px" }, { src: item.icon });

                if (item == "-" || item == "|")
                    scil.Utils.createElement(td, "hr", null, { margin: 0 });
                else if (item.onclick != null)
                    scil.Utils.createButton(td, item);
                else if (col.text == null && col.id == null)
                    scil.Utils.createElement(td, "a", item, null, { href: col.link + item });
                else
                    scil.Utils.createElement(td, "a", item[col.text], null, { href: col.link + item[col.id] });
            }

            if (col.lastline != null) {
                var tr = scil.Utils.createElement(parent, "tr");
                scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "div", col.lastline);
            }
        }
    }
};



//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////



/**
* DatePicker class
* @class scilligence.DatePicker
* <pre>
* <b>Example:</b>
*    scil.ready(function () {
*        var input = scilligence.Utils.createElement(document.body, "input");
*        new scilligence.DatePicker(input);
*    });
* </pre>
*/
scil.DatePicker = scil.extend(scilligence._base, {
    /**
    * @constructor DatePicker
    * @param {string or DOM} input - the INPUT element to be converted
    */
    constructor: function (input, options) {
        if (typeof input == "string")
            input = document.getElementById(input);
        this.input = input;
        this.disablepopup = false;
        this.options = options == null ? {} : options;

        //input.readonly = true;
        var me = this;
        dojo.connect(input, "onclick", function () { scilligence.DatePicker.show(me); });
    },

    getFormat: function() {
        var format = scil.Utils.isNullOrEmpty(this.options.dateformat) ? JSDraw2.defaultoptions.dateformat : this.options.dateformat;
        if (scil.Utils.isNullOrEmpty(format))
            format = "yyyy-mm-dd";
        return format;
    },

    formatDate: function(dt) {
        return scil.Utils.dateStr(dt, true, this.getFormat());
    },

    /**
    * Show the picker
    * @function show
    */
    show: function () {
        if (this.options.startdate == "today")
            this.options.startdate = scil.Utils.today();
        if (this.options.enddate == "today")
            this.options.enddate = scil.Utils.today();

        scilligence.DatePicker.show(this);
    },

    /**
    * Hide the picker
    * @function hide
    */
    hide: function () {
        scilligence.DatePicker.hide();
    }
});

scilligence.apply(scilligence.DatePicker, {
    cellwidth: 30,
    dropdown: null,
    area: null,
    title: null,
    dp: null,
    year: null,
    month: null,
    date: null,

    show: function (dp) {
        if (dp.disablepopup)
            return;

        this.create();

        this.dp = dp;
        this.date = this.setDate(dp.input.value);
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth() + 1;
        this.loadMonth(this.year, this.month);

        var zi = scil.Utils.getZindex(dp.input);
        this.dropdown.style.zIndex = zi == null ? 10 : zi + 1;
        scil.DatePicker.dropdown.style.display = "";

        var offset = JsUtils.getOffset(dp.input, false);
        scil.DatePicker.dropdown.style.left = offset.x + "px";
        scil.DatePicker.dropdown.style.top = (offset.y + dp.input.offsetHeight) + "px";
    },

    setDate: function (s) {
        var dt = this.parseDate(s);
        return dt == null ? new Date() : dt;
    },

    parseDate: function (s) {
        if (s == null)
            return null;

        var ss = s.split("-");
        if (ss.length != 3)
            return null;

        // 2017-12-15
        // 15-12-2017
        // 2017-DEC-15
        // 15-DEC-2017
        // DEC-15-2017
        if (ss[1].length == 4) {
            if (ss[0] == 3)
                return scil.Utils.time(ss[2] + "-" + ss[0] + "-" + ss[1]);
            return scil.Utils.time(ss[2] + "-" + ss[1] + "-" + ss[0]);
        }
        else {
            return scil.Utils.time(s);
        }
    },

    hide: function () {
        if (scilligence.DatePicker.dropdown != null) {
            scilligence.DatePicker.dropdown.style.display = "none";
            if (this.dp != null && this.dp)
                this.dp.input.focus();
        }
        this.dp = null;
    },

    isDropdownVisible: function () {
        return scilligence.DatePicker.dropdown != null && scilligence.DatePicker.dropdown.style.display != "none";
    },

    clickOut: function (e) {
        var src = e.srcElement || e.target;
        if (this.dp != null && src == this.dp.input)
            return;

        var parent = JsUtils.getParent(src, "TBODY");
        if (parent != this.area && parent != this.header)
            this.hide();
    },

    create: function () {
        if (this.dropdown != null)
            return;

        var me = this;
        dojo.connect(document, "onclick", function (e) { me.clickOut(e); });
        var tbody = scil.Utils.createTable(document.body, 0, 1, { border: JSDraw2.Skin.dialog.border, backgroundColor: JSDraw2.Skin.dialog.bkcolor, textAlign: "center", display: "none", position: "absolute" });
        this.dropdown = tbody.parentNode;
        dojo.connect(this.dropdown, "onclick", function (e) { me.select(e.srcElement || e.target); });

        var div = JsUtils.createElement(JsUtils.createElement(tbody, "tr"), "td", null, { padding: "5px" });
        this.area = scil.Utils.createTable(div, 0, 0, { backgroundColor: "#fff" });

        var header = JsUtils.createElement(JsUtils.createElement(this.area, "tr", null, { backgroundColor: "#ddd" }), "td", null, null, { colSpan: 7 });

        var tr = JsUtils.createElement(this.area, "tr");
        JsUtils.createElement(tr, "td", "Su", { width: this.cellwidth, color: "gray" });
        JsUtils.createElement(tr, "td", "Mo", { width: this.cellwidth });
        JsUtils.createElement(tr, "td", "Tu", { width: this.cellwidth });
        JsUtils.createElement(tr, "td", "We", { width: this.cellwidth });
        JsUtils.createElement(tr, "td", "Th", { width: this.cellwidth });
        JsUtils.createElement(tr, "td", "Fr", { width: this.cellwidth });
        JsUtils.createElement(tr, "td", "Sa", { width: this.cellwidth, color: "gray" });

        this.header = scil.Utils.createTable(header, 0, 0, { width: "100%" });
        tr = JsUtils.createElement(this.header, "tr");
        JsUtils.createElement(tr, "td", "&lt;", { cursor: "pointer", color: "blue", textDecoration: "none" }, { title: JSDraw2.Language.res("Previous Month") });
        JsUtils.createElement(tr, "td", "&lt;&lt;", { cursor: "pointer", color: "blue", textDecoration: "none" }, { colSpan: 2, title: JSDraw2.Language.res("Previous Year") });
        this.title = JsUtils.createElement(tr, "td", null, { textAlign: "center", fontWeight: "bold" });
        JsUtils.createElement(tr, "td", "&gt;&gt;", { cursor: "pointer", color: "blue", textDecoration: "none" }, { colSpan: 2, title: JSDraw2.Language.res("Next Year") });
        JsUtils.createElement(tr, "td", "&gt;", { cursor: "pointer", color: "blue", textDecoration: "none" }, { title: JSDraw2.Language.res("Next Month") });
    },

    select: function (e) {
        if (e.tagName != "TD" || e.style.cursor != "pointer")
            return;

        if (e.innerHTML == "&lt;" || e.innerHTML == "<") {
            --this.month;
            if (this.month == 0) {
                --this.year;
                this.month = 12;
            }
            this.loadMonth(this.year, this.month);
        }
        else if (e.innerHTML == "&gt;" || e.innerHTML == ">") {
            ++this.month;
            if (this.month == 13) {
                ++this.year;
                this.month = 1;
            }
            this.loadMonth(this.year, this.month);
        }
        else if (e.innerHTML == "&lt;&lt;" || e.innerHTML == "<<") {
            --this.year;
            this.loadMonth(this.year, this.month);
        }
        else if (e.innerHTML == "&gt;&gt;" || e.innerHTML == ">>") {
            ++this.year;
            this.loadMonth(this.year, this.month);
        }
        else {
            var date = parseInt(e.innerHTML);
            this.dp.input.value = this.dp.formatDate(new Date(this.year, this.month - 1, date));

            try {
                if (this.dp.input.onchange != null)
                    this.dp.input.onchange();
                scil.Utils.fireEvent(this.dp, "change", false, true)
                //if ("createEvent" in document) {
                //    var evt = document.createEvent("HTMLEvents");
                //    evt.initEvent("change", false, true);
                //    this.dp.input.dispatchEvent(evt);
                //}
                //else {
                //    this.dp.input.fireEvent("onchange");
                //}
            }
            catch (e) {
            }

            this.hide();
        }
    },

    loadMonth: function (year, month) {
        var tbody = this.area;
        for (var i = tbody.childNodes.length - 1; i >= 2; --i)
            tbody.removeChild(tbody.childNodes[i]);

        var dt = new Date(year, month - 1, 1);
        //dt.setFullYear(year, month - 1, 1);
        var firstDay = dt.getDay();

        // I#10540
        // var nextMonth = new Date();
        // nextMonth.setFullYear(month == 12 ? year + 1 : year, month == 12 ? 0 : month, 1);
        var nextMonth = new Date(month == 12 ? year + 1 : year, month == 12 ? 0 : month, 1);
        var totalDays = Math.round((nextMonth.getTime() - dt.getTime()) / 1000 / 60 / 60 / 24);

        for (var i = 0; i < firstDay; ++i)
            this.loadDay(null);

        for (var i = 0; i < totalDays; ++i)
            this.loadDay(i + 1, this.makeDate(year, month, i + 1));

        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.title.innerHTML = JSDraw2.Language.res(months[month - 1]) + ", " + year;
    },

    makeDate: function (year, month, day) {
        var dt = new Date(year, month - 1, day);
        return dt;
    },

    loadDay: function (date, dt) {
        var tbody = this.area;
        var tr = tbody.childNodes[tbody.childNodes.length - 1];
        if (tr.childNodes.length == 7)
            tr = JsUtils.createElement(tbody, "tr");
        var style = {};
        if (date != null)
            style.cursor = "pointer";
        if (tr.childNodes.length == 0 || tr.childNodes.length == 6)
            style.color = "gray";
        if (date == this.date.getDate()) {
            style.textDecoration = "underline";
            if (this.year == this.date.getFullYear() && this.month == this.date.getMonth() + 1)
                style.backgroundColor = "yellow";
        }

        if (dt != null && (this.dp.options.startdate != null && dt < this.dp.options.startdate || this.dp.options.enddate != null && dt > this.dp.options.enddate)) {
            style.color = "#ccc";
            style.cursor = "";
        }

        JsUtils.createElement(tr, "td", date, style);
    }
});
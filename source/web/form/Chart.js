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
* Chart class - Chart Control
* @class scilligence.Chart
* Supported chart types: pie, line, stackedline, area, stackedarea, column, clusteredcolumn, bar, clusteredbar, bubble
* <pre>
* <b>Example 1:</b>
*    &lt;script type="text/javascript"&gt;
*        scil.ready(function () {
*            new scil.Chart('div1', { type: "bar", width: 800, height: 300,
*                ajax: { url: "service.aspx?cmd=datasource&source=bug" }
*            });
*        });
*    &lt;/script&gt;
*
* <b>Example 2:</b>
*    &lt;script type="text/javascript"&gt;
*        scil.ready(function () {
*            new scil.Chart('div1', { type: "bar", width: 800, height: 300,
*                series: [
*                    { label: "Series 1", data: { A: 10000, B: 9200, C: 11811, D: 12000, E: 7662, F: 13887} },
*                    { label: "Series 2", data: { A: 3000, B: 12000, D: 12783} }
*                ]
*            });
*        });
*    &lt;/script&gt;
*
* <b>Example 3:</b>
*    &lt;script type="text/javascript"&gt;
*        scil.ready(function () {
*            new scil.Chart('div1', { type: "bar", width: 800, height: 300,
*                xlabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
*                series: [
*                    { label: "Series 1", data: [10000, 9200, 11811, 12000, 7662, 13887] }
*                ]
*            });
*        });
*    &lt;/script&gt;
*
* <b>Example 4:</b>
*    &lt;script type="text/javascript"&gt;
*        new scil.Chart('container', { type: "bubble", width: 800, height: 300, xmin: 0, ymin: 0, xmax: 8, ymax: 20, ytitle: "Bubble",
*            series: [
*                    { label: "Series 1", data: [
*                    { x: 1, y: 12.45, size: 1, color: 'red' },
*                     { x: 2, y: 15.45, size: 2, color: "green" },
*                     { x: 3, y: 2, size: 1.5 },
*                     { x: 4, y: 7, size: 3.5 },
*                     { x: 5, y: 12, size: 1.5 },
*                     { x: 6, y: 7, size: 4.5 }
*                     ]
*                    }
*                ]
*        });
*    });
*    &lt;/script&gt;
* </pre>
*/

if (typeof (__JSDraw2_TouchMol) == "undefined") {
    dojo.require("dojox.charting.Chart");
    dojo.require("dojox.charting.plot2d.Areas");
    dojo.require("dojox.charting.plot2d.StackedAreas");
    dojo.require("dojox.charting.plot2d.Bars");
    dojo.require("dojox.charting.plot2d.ClusteredBars");
    dojo.require("dojox.charting.plot2d.Columns");
    dojo.require("dojox.charting.plot2d.ClusteredColumns");
    dojo.require("dojox.charting.plot2d.StackedColumns");
    dojo.require("dojox.charting.plot2d.Lines");
    dojo.require("dojox.charting.plot2d.StackedLines");
    dojo.require("dojox.charting.plot2d.Markers");
    dojo.require("dojox.charting.plot2d.MarkersOnly");
    dojo.require("dojox.charting.plot2d.Pie");
    dojo.require("dojox.charting.plot2d.Scatter");
    dojo.require("dojox.charting.plot2d.Grid");
    dojo.require("dojox.charting.plot2d.Spider");
    dojo.require("dojox.charting.plot2d.Bubble");

    dojo.require("dojox.charting.axis2d.Default");
    dojo.require("dojox.charting.action2d.Highlight");
    dojo.require("dojox.charting.action2d.Tooltip");
    dojo.require("dojox.charting.action2d.MoveSlice");
    dojo.require("dojox.charting.action2d.Magnify");
    dojo.require("dojox.charting.widget.Legend");
    dojo.require("dojox.charting.themes.Claro");
}

// http://demos.dojotoolkit.org/dojox/charting/tests/test_pie_smart_label.html
scil.Chart = scil.extend(scil._base, {
    /**
    * @constructor Chart
    * @param {string or DOM} element - the parent Element
    * @param {dict} options - { type { string }, width, height, title {string}, legend {bool}, labelstyle: { string: hidden, columns, null }, 
    *      theme {string}, animate {bool}, shadow {bool}, xtitle {string}, ytitle {string}, linewith: {int},
    *      series: [{label, data}] } 
    */
    constructor: function (parent, options) {
        scil.Chart.addStylesheet();

        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.parent = parent;
        this.loadData(options);
    },

    loadData: function (options) {
        this.options = options == null ? {} : options;
        if (this.options.series != null)
            this.render();
        else
            this.loadDataFromUrl(this.options.ajax == null ? null : this.options.ajax.url);
    },

    loadDataFromUrl: function (url) {
        if (scil.Utils.isNullOrEmpty(url))
            return false;

        this.options.series = null;

        var me = this;
        scil.Utils.jsonp(url, function (ret) {
            if (ret == null || ret.length == null || ret.length == 0)
                return;

            if (typeof (ret[0]) != "object") {
                me.options.series = [{ data: ret}];
            }
            else {
                var keys = [];
                for (var k in ret[0])
                    keys.push(k);

                var x = keys[0];
                var data = [];
                for (var i = 0; i < ret.length; ++i)
                    data.push(ret[i][x]);

                me.options.series = [];
                if (keys.length == 1) {
                    me.options.series.push({ label: x, data: data });
                }
                else {
                    me.options.xlabels = data;

                    for (var k = 1; k < keys.length; ++k) {
                        var data = [];
                        var y = keys[k];
                        for (var i = 0; i < ret.length; ++i)
                            data.push(ret[i][y]);
                        me.options.series.push({ label: y, data: data });
                    }
                }
            }

            me.render();
        });
    },

    downloadImage: function () {
        if (JSDrawServices.url == null || JSDrawServices.url == "") {
            scil.Utils.alert("JSDraw web service is not available");
            return;
        }

        var html = "<div style='width:" + this.parent.offsetWidth + "px'>" + this.parent.innerHTML + "</div>";
        scil.Utils.post(JSDrawServices.url + "?cmd=html2image", { html: html, css: scil.Chart.getCss(), width: this.parent.offsetWidth });
    },

    render: function () {
        scil.Utils.removeAll(this.parent);

        var type = null;
        switch (this.options.type) {
            case "column":
                type = dojox.charting.plot2d.Columns;
                break;
            case "clusteredcolumn":
                type = dojox.charting.plot2d.ClusteredColumns;
                break;
            case "stackedcolumn":
                type = dojox.charting.plot2d.StackedColumns;
                break;
            case "bar":
                type = dojox.charting.plot2d.Bars;
                break;
            case "clusteredbar":
                type = dojox.charting.plot2d.ClusteredBars;
                break;
            case "line":
                type = dojox.charting.plot2d.Lines;
                break;
            case "stackedline":
                type = dojox.charting.plot2d.StackedLines;
                break;
            case "area":
                type = dojox.charting.plot2d.Areas;
                break;
            case "stackedarea":
                type = dojox.charting.plot2d.StackedAreas;
                break;
            case "scatter":
                type = dojox.charting.plot2d.Scatter;
                break;
            case "grid":
                type = dojox.charting.plot2d.Grid;
                break;
            case "spider":
                type = dojox.charting.plot2d.Spider;
                break;
            case "bubble":
                type = dojox.charting.plot2d.Bubble;
                break;
            case "pie":
                type = dojox.charting.plot2d.Pie;
                if (!(this.options.radius > 0))
                    this.options.radius = 100;
                break;
        }

        if (!scil.Utils.isNullOrEmpty(this.options.title)) {
            scil.Utils.createElement(this.parent, "h3", scil.Lang.res(this.options.title), { margin: 0, textAlign: "center", fontSize: this.options.titlesize > 0 ? this.options.titlesize + "px" : null });
        }

        var div = scil.Utils.createElement(this.parent, "div");

        if (this.options.width > 0)
            this.parent.style.width = this.options.width + "px";
        if (this.options.height > 0)
            div.style.height = this.options.height + "px";

        var chart = new dojox.charting.Chart(div);

        if (this.options.theme != null)
            chart.setTheme(dojox.charting.themes[this.options.theme]);
        else
            chart.setTheme(dojox.charting.themes.Claro);

        if (this.options.fontcolor == null)
            this.options.fontcolor = "blue";

        var args = {
            type: type,
            markers: true,
            gap: this.options.gap > 0 ? this.options.gap : 5,
            radius: this.options.radius > 0 ? this.options.radius : null,
            htmlLabels: true,
            fontColor: this.options.fontcolor,
            labelWiring: this.options.fontcolor,
            animate: this.options.animate
        };
        if (this.options.linewidth > 0)
            args.stroke = { width: this.options.linewidth };
        if (this.options.labelstyle != null)
            args.labelStyle = this.options.labelstyle;
        if (this.options.shadow != false)
            args.shadow = { dx: 2, dy: 2, width: 2, color: [0, 0, 0, 0.3] };
        chart.addPlot("default", args);
        if (this.options.plots != null) {
            for (var k in this.options.plots)
                chart.addPlot(k, this.options.plots[k]);
        }

        var xargs = {};
        var yargs = { vertical: true, fixLower: "major", fixUpper: "major" };

        if (this.options.xmin != null)
            xargs.min = this.options.xmin;
        if (this.options.xmax != null)
            xargs.max = this.options.xmax;
        if (this.options.xtitle != null) {
            xargs.title = this.options.xtitle;
            xargs.titleOrientation = "away";
            xargs.titleGap = 1;
        }

        if (this.options.ymin != null)
            yargs.min = this.options.ymin;
        if (this.options.ymax != null)
            yargs.max = this.options.ymax;
        if (this.options.ytitle != null) {
            yargs.title = scil.Lang.res(this.options.ytitle);
            yargs.titleGap = 5;
        }

        var series = this.options.series;
        var xlabels = this.options.xlabels;
        if (series[0].data != null && series[0].data.length == null) {
            xlabels = [];
            var values = [];
            var data = series[0].data;
            for (var k in data) {
                xlabels.push(k);
                values.push(data[k]);
            }

            var series2 = [];
            for (var i = 0; i < series.length; ++i) {
                if (i > 0) {
                    values = [];
                    data = series[i].data;
                    for (var k = 0; k < xlabels.length; ++k) {
                        var v = data[xlabels[k]];
                        values.push(v == null ? 0 : v);
                    }
                }
                series2.push({ label: scil.Lang.res(series[i].label), data: values, args: series[i].args, additup: series[i].additup });
            }
            series = series2;
        }

        if (this.options.type == "pie") {
            chart.addSeries(series[0].label, series[0].xydata != null ? series[0].xydata : this.array2data(series[0].data, null, xlabels, this.options.showpercentage));
        }
        else {
            if (xlabels != null)
                xargs.labels = this.array2data(xlabels, true);

            chart.addAxis("x", xargs);
            chart.addAxis("y", yargs);

            if (this.options.type == "bubble") {
                chart.addSeries(series[0].label, series[0].xydata || series[0].data);
            }
            else {
                for (var i = 0; i < series.length; ++i)
                    chart.addSeries(series[i].label == null ? "Series-" + (i + 1) : series[i].label, series[i].xydata != null ? series[i].xydata : this.array2data(series[i].data, null, xlabels, null, series[i].additup), series[i].args);
            }
        }

        //new dojox.charting.widget.Legend(chart, "default");
        if (this.options.tooltips != false)
            new dojox.charting.action2d.Tooltip(chart, "default");
        switch (this.options.type) {
            case "pie":
            case "scatter":
            case "grid":
                new dojox.charting.action2d.MoveSlice(chart, "default");
                break;
            case "bar":
            case "clusteredbar":
                new dojox.charting.action2d.Highlight(chart, "default");
                break;
            case "column":
            case "clusteredcolumn":
                new dojox.charting.action2d.Highlight(chart, "default");
                break;
            case "line":
            case "stackedline":
                new dojox.charting.action2d.Magnify(chart, "default");
                break;
            case "area":
            case "stackedarea":
                new dojox.charting.action2d.Magnify(chart, "default");
                break;
        }

        chart.render();

        if (this.options.legend) {
            var legend = scil.Utils.createElement(this.parent, "div");
            new dojox.charting.widget.Legend({ chart: chart }, legend);
        }

        var me = this;
        chart.connectToPlot("default", function (evt) {
            if (evt.type == "onclick") {
                if (me.options.onclick != null)
                    me.options.onclick(evt);
            }
            else if (evt.type == "onmouseover") {
                if (me.options.onmouseover != null)
                    me.options.onmouseover(evt);
            }
            else if (evt.type == "onmouseout") {
                if (me.options.onmouseout != null)
                    me.options.onmouseout(evt);
            }
        });
    },

    array2data: function (list, asAxis, xlabels, showpercentage, additup) {
        var sum = 0;
        if (showpercentage) {
            for (var i = 0; i < list.length; ++i) {
                if (!isNaN(list[i]))
                    sum += list[i];
            }
        }

        var v = null;
        var ret = [];
        for (var i = 0; i < list.length; ++i) {
            if (asAxis) {
                ret.push({ value: i + 1, text: list[i] });
            }
            else {
                var v2 = null;
                if (additup) {
                    if (v == null)
                        v = list[i];
                    else if (list[i] != null && !isNaN(list[i]))
                        v += list[i];
                    v2 = list[i] == null ? null : v;
                }
                else {
                    v2 = list[i];
                }

                var s = v2;
                var t = s;
                if (xlabels != null && xlabels[i] != null) {
                    if (showpercentage && !isNaN(s) && sum > 0)
                        s = (Math.round(s / sum * 1000) / 10) + "%";
                    s = xlabels[i] + " (" + s + ")";
                    t = xlabels[i];
                }

                ret.push({ x: i + 1, y: v2, text: t, tooltip: s });
            }
        }

        return ret;
    }
});


scil.apply(scil.Chart, {
    stylesheetAdded: false,

    addStylesheet: function () {
        if (this.stylesheetAdded)
            return;

        this.stylesheetAdded = true;
        scil.Utils.addCss(this.getCss());
    },

    getCss: function () {
        var code = ".dijitTooltip { position: absolute; z-index: 2000; display: block; left: 0; overflow: visible; }\r\n";
        code += ".dijitTooltipContainer { border: solid #aaf 1px; background: #fff; color: blue; padding: 2px; border-radius: 3px; }\r\n";
        code += ".dijitTooltipConnector { position: absolute; }\r\n";
        code += ".dojoxLegendIcon { float: left; }\r\n";

        return code;
    }
});
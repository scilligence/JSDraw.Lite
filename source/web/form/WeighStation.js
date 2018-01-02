//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* WeighStation class
* @class scilligence.WeighStation
*/
scil.WeighStation = {
    dlg: null,
    kDefaultLastMinutes: 10,
    kTimes: ["", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "##:##"],

    show: function (callback, jss) {
        this.callback = callback;
        this.jss = jss;

        if (this.dlg == null)
            this.create();
        else
            this.dlg.show();
    },

    useData: function () {
        var rows = this.dlg.form.fields.data.jsd.getCheckedRowData();
        if (rows == null || rows.length == 0) {
            scil.Utils.alert("Please select a row first");
            return;
        }

        for (var k = 0; k < rows.length; ++k) {
            var r = rows[k];
            var row = { dataid: r.dataid, weight: r.weight, deviceid: r.deviceid, ip: r.ip, dt: r.dt, note: r.note };
            if (typeof (row.dt) == "string")
                row.dt = parseInt(row.dt);

            if (this.callback != null) {
                this.callback(row);
            }
            else if (this.jss != null) {
                var mass = null;
                for (var i = 0; i < this.jss.columns.length; ++i) {
                    var col = this.jss.columns[i];
                    if (col.type == "mass") {
                        mass = col;
                        break;
                    }
                }

                if (mass != null) {
                    var data = {};
                    data[col.key] = row.weight;
                    this.jss.addRow(data);
                    this.jss.setWeighingTag(mass, row, this.jss.getRowCount() - 1);
                }
            }
        }

        this.dlg.hide();
    },

    onSelectScale: function () {
        this.dlg.form.fields.data.jsd.clear();
        this.loadData();
    },

    loadData: function () {
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        var data = this.dlg.form.getData();
        data.data = null;

        var me = this;
        var url = scil.MobileData.getDefaultUrl(true, "list");
        scil.Utils.jsonp(url, function (ret) {
            me.dlg.form.fields.data.jsd.setData(ret);
        }, data);
    },

    create: function () {
        if (this.dlg != null)
            return;

        var me = this;
        if (this.onGetStations != null)
            this.onGetStations(function (list) { me.create2(list); });
        else
            this.create2(JSDraw2.weighstations);
    },

    create2: function (stations) {
        var me = this;

        var items = {
            deviceid: { label: "Select Balance", type: "select", width: 200, items: stations, sort: false, onchange: function () { me.onSelectScale(); } },
            lastminutes: { label: "Last Minutes", type: "int", width: 200, value: scil.WeighStation.kDefaultLastMinutes, onenter: function () { me.clearValues(true); me.onSelectScale(); } },
            startdate: { label: "Start Date", type: "date", width: 200, onenter: function () { me.clearValues(false); me.onSelectScale(); } },
            starttime: { label: "Start Time", type: "dropdowninput", items: scil.WeighStation.kTimes, width: 200, onenter: function () { me.clearValues(false); me.onSelectScale(); } },
            enddate: { label: "End Date", type: "date", width: 200, onenter: function () { me.clearValues(false); me.onSelectScale(); } },
            endtime: { label: "End Time", type: "dropdowninput", items: scil.WeighStation.kTimes, width: 200, onenter: function () { me.clearValues(false); me.onSelectScale(); } },
            data: {
                label: "Data", type: "table", viewonly: true, rowcheck: true, columns: {
                    dataid: { label: "DataID", width: 100 },
                    deviceid: { label: "Balance", width: 200 },
                    weight: { label: "Weight", width: 100 },
                    dt: { label: "Time", width: 150, render: function (v) { return scil.Utils.timeStr(v, true); } },
                    ip: { label: "IP Address", width: 150 },
                    note: { label: "Note", width: 250 }
                }
            }
        };

        var me = this;
        var button = [
            { src: scil.App.imgSmall("submit.png"), label: "Use Data", onclick: function () { me.useData(); } },
            " ",
            { src: scil.App.imgSmall("refresh.png"), label: "Refresh", onclick: function () { me.onSelectScale(); } },
        ];

        this.dlg = scil.Form.createDlgForm(scil.Lang.res("Weigh Station"), items, button);
    },

    clearValues: function (useLastminutes) {
        var fields = this.dlg.form.fields;
        if (useLastminutes) {
            fields.startdate.value = "";
            fields.starttime.value = "";
            fields.enddate.value = "";
            fields.endtime.value = "";
        }
        else {
            fields.lastminutes.value = "";
        }
    }
};


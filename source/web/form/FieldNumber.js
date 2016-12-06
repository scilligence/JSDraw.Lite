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
* FieldNumber class - FieldNumber Control
* @class scilligence.FieldNumber
*/
scil.FieldNumber = scil.extend(scil._base, {
    /**
    * Constructor
    * @function constroctor
    * @param {DOM} parent
    * @param {dict} options - { width, min, max, allowoperator, scale, units }
    */
    constructor: function (input, options) {
        if (typeof (input) == "string")
            input = scil.byId(input);
        this.options = options == null ? {} : options;
        this.input = input;
        this.unit = null;
        //this.input.style.textAlign = "right";

        var me = this;
        if (this.options.allowoperator) {
            this.auto = new scil.DropdownInput(input,
                { items: this.options.items == null ? ["", "≥", "≤", "&lt;", "&gt;", "±"] : this.options.items,
                    onSetValue: function (input, s) { me.onSetOperator(input, s); }
                });
        }

        var tr;
        var viewonly = this.options.viewonly || this.input.disabled || this.input.readOnly;
        if (this.options.units != null && !viewonly) {
            var tbody = scil.Utils.createTable(null, 0, 0, { border: "solid 1px #ccc" });
            this.input.parentNode.insertBefore(tbody.parentNode, this.input);

            tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td").appendChild(this.input);
            this.unit = scil.Utils.createElement(scil.Utils.createElement(tr, "td", null, { borderLeft: "solid 1px #ccc" }), "select", null, { width: this.options.unitwidth });
            scil.Utils.listOptions(this.unit, this.options.units, null, true, false);

            scil.connect(this.unit, "onchange", function () { scil.Utils.fireEvent(me.input, "change") });

            this.input.style.border = "none";
            this.unit.style.border = "none";
        }

        var me = this;
        scil.connect(input, "onchange", function (e) {
            var s = input.value;
            if (s != "" && s != null && !scil.Utils.isNumber(s, me.options.allowoperator)) {
                scil.Utils.alert("A number is required!");
                input.value = "";
            }
            else {
                if (me.unit != null)
                    s += me.unit.value;
                me.setValue(s);
            }
        });

        if (!viewonly && this.options.mobiledata != null) {
            var me = this;
            new scil.MobileData(input, { category: this.options.mobiledata, weighstation: true, url: scil.MobileData.getDefaultUrl(true), onresult: function (ret) { me.setValue(ret.barcode); return true; } });
            scil.Utils.createButton(scil.Utils.createElement(tr, "td"), { label: "&#9878;", title: "Select Weigh Station", type: "a", onclick: function () { scil.MobileData.selectWeighstation(); } });
        }
    },

    onSetOperator: function (input, op) {
        if (op == "")
            return;

        var s = scil.Utils.trim(input.value);
        if (op == "±") {
            if (s.indexOf("±") >= 0)
                return;
            input.value = s + " ±";
        }
        else {
            var c = s.length > 0 ? s.substr(0, 1) : null;
            if (c == "≥" || c == "≤" || c == ">" || c == "<")
                s = s.substr(1);
            input.value = op + s;
        }
    },

    clear: function () {
        this.input.value = "";
    },

    setValue: function (v) {
        v = v == null ? null : (JSDraw2.Table == null ? { value: v} : JSDraw2.Table.splitUnit(v + ""));
        if (v == null) {
            this.input.value = "";
            return;
        }

        if (this.options.scale > 0 && !isNaN(v.value))
            v.value *= this.options.scale;

        if (this.options.decimal > 0)
            v.value = scil.Utils.round(v.value, this.options.decimal);

        if (v.unit2 == null)
            v.unit2 = this.options.defaultunit;

        if (this.unit != null) {
            this.input.value = v.value;
            scil.Utils.selectOption(this.unit, v.unit2, true);
        }
        else {
            this.input.value = v.value + (v.unit2 == null ? "" : v.unit2);
            if (JSDraw2.ColorCoding != null)
                JSDraw2.ColorCoding.show(this.input, v.value, this.options);
        }
    },

    getValue: function () {
        var v = scil.Utils.trim(this.input.value);
        if (!scil.Utils.isNullOrEmpty(v) && !isNaN(v)) {
            if (this.options.scale > 0)
                v /= this.options.scale;

            if (this.unit != null)
                v = v + this.unit.value;
        }

        return v;
    }
});

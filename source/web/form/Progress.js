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
* Progress class - To Show Progress
* @class {static} scilligence.Progress
* <pre>
* <b>Example:</b>
*    scilligence.Progress.show("Running", function() { alert("cancelled"); });
*    var count = 0;
*    setInterval(function() { scilligence.Progress.update(++count, "Value " + count); }, 500);
* </pre>
*/
scilligence.Progress = {
    dlg: null,
    bar: null,
    msg: null,
    oncancel: null,

    /**
    * Show progress bar
    * @function {static} show
    * @param {string} caption dialog caption
    * @param {function} or false: oncalcel callback function when users click on Cancel button
    * @param {string} msg Message
    * @param {boolean} showprogressbar
    * @returns null
    */
    show: function (caption, oncancel, msg, showprogressbar) {
        this.create();
        if (oncancel == false) {
            this.cancelbtn.style.display = "none";
            this.oncancel = null;
        }
        else if (typeof(oncancel) == "function") {
            this.cancelbtn.style.display = "";
            this.oncancel = oncancel;
        }
        this.msg.innerHTML = msg == null ? "" : msg;
        this.frame.style.display = showprogressbar == false ? "none" : "";
        this.dlg.show(caption);
    },

    hide: function () {
        if (this.dlg != null)
            this.dlg.hide();
    },

    cancel: function () {
        if (this.oncancel != null)
            this.oncancel();
        this.hide();
    },

    update: function (percent, msg) {
        if (percent > 100)
            percent = 100;
        else if (!(percent > 0))
            percent = 0;

        var n = Math.round(300 * percent / 100);
        if (n < 0)
            n = 0;
        this.bar.style.width = n + "px";
        this.msg.innerHTML = msg == null ? "" : msg;
    },
    
    create: function (u) {
        if (this.dlg != null)
            return false;

        var div = scilligence.Utils.createElement(null, "div", null, { margin: "5px", width: "320px", textAlign: "center" });
        this.animator = scilligence.Utils.createElement(div, "div", scil.Utils.imgTag("animator.gif"), { textAlign: "center" });
        this.msg = scilligence.Utils.createElement(div, "div", "&nbsp;", { textAlign: "center" });
        this.frame = scilligence.Utils.createElement(div, "div", null, { width: "300px", height: "20px", border: "solid 1px #e0e0e0", textAlign: "left" });
        this.bar = scilligence.Utils.createElement(this.frame, "div", "&nbsp;", { width: "1px", height: "20px", backgroundColor: "blue" });
        this.cancelbtn = scilligence.Utils.createElement(div, "button", scil.Utils.imgTag("cancel.gif") + "Cancel", { marginTop: "10px" });
        dojo.connect(this.cancelbtn, "onclick", function () { scilligence.Progress.cancel(); });

        this.dlg = new JSDraw2.Dialog("Progress", div);
        return true;
    }
};

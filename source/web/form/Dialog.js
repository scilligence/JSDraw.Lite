//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////



/**
* Dialog class
* @class scilligence.Dialog
* <pre>
* <b>Example:</b>
*    // Create a popup dialog
*    var div = scil.Utils.createElement(null, "div");
*    var txt = scil.Utils.createElement(div, "textarea", null, { width: "580px", height: "400px" });
*    var btn = scil.Utils.createElement(
*            scil.Utils.createElement(div, "div", null, { textAlign: "center" }), 
*                "button", "OK", { width: "200px" });
* 
*    var dlg = new scilligence.Dialog("My Dialog", div);
*    dojo.connect(btn, "onclick", function (e) { dlg.hide(); });
*    dlg.show();
* </pre>
*/
scil.Dialog = scil.extend(scil._base, {
    /**
    * @constructor Dialog
    * @param {string} title - defaultdialog title
    * @param {DOM} body - dialog body
    * @param {dictionary} options { parentWindow, noclose, notitle }
    */
    constructor: function (title, body, options) {
        this.options = options == null ? {} : options;
        this.lang = this.options.lang == null ? scil.Lang : this.options.lang;
        this.id = this.options.id;
        if (this.id == null || this.id == "") {
            if (scil.Dialog._idincrease == null)
                scil.Dialog._idincrease = 0;
            this.id = "__jsdialog" + (++scil.Dialog._idincrease);
        }
        if (scil.Dialog._allitems == null)
            scil.Dialog._allitems = {};
        scil.Dialog._allitems[this.id] = this;

        this.parentWindow = this.options.parentWindow == null ? window : this.options.parentWindow;
        this.body = body;
        this.title = title;
        this.WRAPPER = 'content';
        this.dialog = null;
        this.dialogmask = null;
        this.movingSt = null;
    },

    /**
    * Check if the dialog is visible
    * @function isVisible
    * @returns true or false
    */
    isVisible: function () {
        return this.dialog != null && this.dialog.style.display != "none";
    },

    isFrom: function (e) {
        if (!this.isVisible())
            return false;
        return scil.Utils.isChildOf(e, this.dialog);
    },

    show2: function (options) {
        if (options == null)
            options = {};
        this.show(options.title, options.zindex, options.modal, options.immediately, options.owner);
    },

    /**
    * Show dialog
    * @function show
    * @param {string} title - dialog title
    * @param {number} zindex - zIndex of dialog DOM
    * @param {bool} modal - Modal dialog
    * @returns true or false
    */
    show: function (title, zindex, modal, immediately, owner) {
        this.owner = owner;
        if (this.isVisible()) {
            if (title != null && this.dialog.titleElement != null)
                this.dialog.titleElement.innerHTML = this.lang.res(title);
            return;
        }

        if (modal == null)
            modal = true;

        if (!(scil.Dialog.kTimer > 0))
            immediately = true;

        this._create();
        this.movingSt = null;
        if (title != null && this.dialog.titleElement != null)
            this.setTitle(title);
        var maxZindex = scil.Utils.getMaxZindex();
        if (JSDraw2.defaultoptions.minDlgZindex > 0 && maxZindex < JSDraw2.defaultoptions.minDlgZindex)
            maxZindex = JSDraw2.defaultoptions.minDlgZindex;
        var z = zindex == null ? maxZindex + 10 : zindex;
        this.dialog.alpha = 0;
        this.dialog.style.display = "";
        this.dialogmask.style.display = "";
        this.dialogmask.style.minHeight = "100%";
        this.dialogmask.style.height = "100%";
        this.dialogmask.style.width = "100%";
        if (z > 0) {
            this.dialogmask.style.zIndex = z + 1;
            this.dialog.style.zIndex = z + 2;
        }
        if (!modal) {
            this.dialog.style.zIndex = z + 1;
            this.dialogmask.style.display = "none";
        }

        this.dialog.style.borderColor = modal ? "#fff" : JSDraw2.Skin.dialog.bkcolor;

        if (scilligence.Utils.isTouch || immediately) {
            dojo.style(this.dialog, { display: "", opacity: 1.00, filter: 'alpha(opacity=100)' });
        }
        else {
            dojo.style(this.dialog, { display: "", opacity: .00, filter: 'alpha(opacity=0)' });
            this.dialog.timer = setInterval("scil.Dialog.get('" + this.id + "').fade(1)", scil.Dialog.kTimer);
        }
        this.moveCenter();
        scil.Dialog.stack.push(this);

        if (this._scilform && this.form != null && this.form.fields != null)
            this.form.focus();
    },

    setTitle: function (title) {
        this.dialog.titleElement.innerHTML = this.lang.res(title);
    },

    moveCenter: function () {
        var d = dojo.window.getBox();
        var width = d.w;
        var height = d.h;
        var left = d.l;
        var top = d.t;
        var dialogwidth = this.dialog.offsetWidth;
        var dialogheight = this.dialog.offsetHeight;
        var topposition = Math.round(top + (height - dialogheight) / 2);
        var leftposition = Math.round(left + (width - dialogwidth) / 2);

        dojo.style(this.dialog, { top: Math.max(top, topposition) + "px", left: Math.max(left, leftposition) + "px" });
        this.scroll();
        this.updateWidth();
    },

    _create: function () {
        if (this.dialog != null)
            return;

        var me = this;
        var topBody = this.parentWindow.document.body;
        var zi = 200;
        var tbody = scilligence.Utils.createTable(topBody, 0, 0, { position: "absolute", borderRadius: "3px", width: w, height: h, zIndex: zi, backgroundColor: JSDraw2.Skin.dialog.bkcolor, border: JSDraw2.Skin.dialog.border });
        this.dialog = tbody.parentNode;
        this.dialog.setAttribute("__scilligence_dlg", this.id);

        var tr, td;
        var bordertop = "0";
        if (this.options.notitle) {
            bordertop = "5px";
        }
        else {
            tr = scilligence.Utils.createElement(tbody, "tr", null, { height: "30px" });
            td = scilligence.Utils.createElement(tr, "td", this.lang.res(this.title), { paddingLeft: "5px", fontWeight: "bold", color: scil.App == null || scil.App.config == null ? "" : scil.App.config.text });
            this.dialog.titleElement = td;
            td = scilligence.Utils.createElement(tr, "td", null, { textAlign: "right", verticalAlign: "top" });
            if (!this.options.noclose) {
                var img = scilligence.Utils.createElement(td, "img", null, { cursor: "pointer", marginRight: "5px" }, { title: JSDraw2.Language.res("Close"), src: scil.Utils.imgSrc("img/dlgclose.jpg") });
                dojo.connect(scilligence.Utils.isIpad ? td : img, "onclick", function (e) { me.hide(); e.preventDefault(); });
            }

            if (this.options.movable != false) {
                if (scilligence.Utils.isTouch) {
                    dojo.connect(tr, "ontouchstart", function (e) { if (e.touches.length == 1) me.startMove(e.touches[0]); });
                    dojo.connect(topBody, "ontouchmove", function (e) { if (e.touches.length == 1 && me.move(e.touches[0])) { e.preventDefault(); return false; } });
                    dojo.connect(topBody, "ontouchend", function () { me.endMove(); });
                }
                else {
                    tr.style.cursor = "move";
                    dojo.connect(tr, "onmousedown", function (e) { me.startMove(e); });
                    dojo.connect(topBody, "onmousemove", function (e) { me.move(e); });
                    dojo.connect(topBody, "onmouseup", function () { me.endMove(); });
                }
            }
        }

        tr = scil.Utils.createElement(tbody, "tr");
        td = scil.Utils.createElement(tr, "td", null, { padding: bordertop + " 5px 5px 5px" });
        td.colSpan = 2;

        var w = this.options.width;
        var h = this.options.height;
        var style = { background: "#fff", padding: "5px" };
        if (w > 0 || h > 0)
            scil.apply(style, { width: w > 0 ? w : null, height: h > 0 ? h : null, overflow: "scroll" });

        if (this.options.bodystyle != null)
            scil.apply(style, this.options.bodystyle);

        var div = scil.Utils.createElement(td, "div", null, style);
        if (typeof this.body == "string")
            div.innerHTML = "<div>" + this.body + "</div>";
        else
            div.appendChild(this.body);

        var opacity = this.options.opacity > 0 ? this.options.opacity : 75;
        this.dialogmask = scilligence.Utils.createElement(topBody, 'div', null, { position: "absolute", top: "0", left: "0", minHeight: "100%", height: "100%", width: "100%", background: "#999", opacity: opacity / 100.0, filter: "alpha(opacity=" + opacity + ")", zIndex: zi - 1 });
        dojo.connect(window, "onresize", function () { me.resize(); });
        dojo.connect(window, "onscroll", function () { me.scroll(); });

        // bug: I#5763
        if (this.options.fixtransparentissue && dojox.gfx.renderer == "silverlight") {
            this.dialogmask.style.backgroundColor = "white";
            this.dialogmask.style.opacity = "1.0";
            this.dialogmask.style.filter = "alpha(opacity=100)";
        }
    },

    scroll: function () {
        if (!this.isVisible() || this.dialogmask == null || this.dialogmask.style.display == "none")
            return;
        var d = dojo.window.getBox();
        var right = Math.max(d.w + d.l, this.dialog.offsetLeft + this.dialog.offsetWidth);
        var bottom = Math.max(d.h + d.t, this.dialog.offsetTop + this.dialog.offsetHeight);
        if (this.dialogmask.offsetWidth <= right)
            this.dialogmask.style.width = right + "px";
        if (this.dialogmask.offsetHeight <= bottom)
            this.dialogmask.style.height = bottom + "px";
    },

    resize: function () {
        this.scroll();
    },

    /**
    * Move the dialog to a new position
    * @function move
    * @param {number} x
    * @param {number} y
    */
    moveTo: function (x, y) {
        scil.Utils.moveToScreen(x, y, this.dialog);
    },

    startMove: function (e) {
        this.movingSt = null;
        var src = e.srcElement || e.target;
        if (src.tagName == "IMG")
            return;
        this.movingSt = new JSDraw2.Point(e.clientX, e.clientY);
    },

    move: function (e) {
        if (this.movingSt == null || (e.which || e.button) != 1)
            return false;

        var delta = new JSDraw2.Point(e.clientX - this.movingSt.x, e.clientY - this.movingSt.y);
        var top = scilligence.Utils.parsePixel(this.dialog.style.top) + delta.y;
        var left = scilligence.Utils.parsePixel(this.dialog.style.left) + delta.x;
        this.moveTo(left, top);

        this.movingSt = new JSDraw2.Point(e.clientX, e.clientY);
        return true;
    },

    endMove: function () {
        this.movingSt = null;
    },

    updateWidth: function (f) {
        this.dialog.style.width = (this.dialog.firstChild.firstChild.offsetWidth + 2) + "px";
    },

    /**
    * Hide dialog
    * @function hide
    * @param {bool} immediately - set this to true to skip fading animation
    */
    hide: function (immediately) {
        if (this.options.onhide != null)
            this.options.onhide();

        if (!(scil.Dialog.kTimer > 0))
            immediately = true;

        if (immediately || scilligence.Utils.isTouch) {
            this.close();
        }
        else {
            if (this.dialog != null) {
                clearInterval(this.dialog.timer);
                this.dialog.timer = setInterval("scil.Dialog.get('" + this.id + "').fade(0)", scil.Dialog.kTimer);
            }
        }

        scil.Dialog.stack.pop();
        scil.AutoComplete.hideAll();
    },

    close: function () {
        if (this.dialog == null)
            return;

        clearInterval(this.dialog.timer);
        this.dialog.timer = null;
        this.dialog.style.display = "none";
        this.dialogmask.style.display = "none";
        this.dialogmask.style.width = "0px";
        this.dialogmask.style.height = "0px";
    },

    fade: function (flag) {
        if (flag == null)
            flag = 1;

        var value = flag == 1 ? this.dialog.alpha + scil.Dialog.kSpeed : this.dialog.alpha - scil.Dialog.kSpeed;
        this.dialog.alpha = value;
        dojo.style(this.dialog, { opacity: value / 100, filter: 'alpha(opacity=' + value + ')' });

        if (value >= 99) {
            clearInterval(this.dialog.timer);
            this.dialog.timer = null;
        } else if (value <= 1) {
            this.close();
        }
    }
});

scil.apply(scil.Dialog, {
    stack: [],
    kTimer: 10,
    kSpeed: 40,

    keydown: function (e) {
        if (e.keyCode == 27 && this.stack.length > 0)
            this.stack[this.stack.length - 1].hide();
    },

    /**
    * Get the Dialog object by its ID
    * @function {static} get
    * @param {string} id - the dialog ID
    */
    get: function (id) {
        if (scil.Dialog._allitems == null)
            scil.Dialog._allitems = {};
        return scil.Dialog._allitems[id];
    },

    getDialog: function (e) {
        while (e != null) {
            var t = scil.Utils.getParent(e, "TABLE");
            if (t == null)
                return null;

            var id = t.getAttribute("__scilligence_dlg");
            if (id != null)
                return this.get(id);
            e = t.parentNode;
        }
        return null;
    }
});

scil.onload(function () {
    dojo.connect(document.body, "onkeydown", function (e) { scil.Dialog.keydown(e); });
});


JsDialog = JSDraw2.Dialog = scil.Dialog;
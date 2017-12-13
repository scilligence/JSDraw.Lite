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
* Editor class - define an Editor object.
*<pre>
* <b>Example:</b>
*   &lt;html&gt;
*   &lt;head&gt;
*   &lt;script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/dojo/1.11.2/dojo/dojo.js"&gt;&lt;/script&gt;
*   &lt;script type="text/javascript" src='http://[PATH]/Scilligence.JSDraw2.js'&gt;&lt;/script&gt;
*   &lt;/head&gt;
*   &lt;body&gt;
*   &lt;div id='ed'&gt;&lt;/div&gt;
*   &lt;script type='text/javascript'&gt;
*     dojo.ready(function() {
*       // create a JSDraw Editor
*       var editor = new JSDraw2.Editor("ed", { skin: "w8", width: 800, height: 400 });
*
*       // create a JSDraw viewer
*       //var editor = new JSDraw2.Editor("ed", { skin: "w8", width: 800, height: 400, viewonly: true });
*
*       // create a JSDraw popup Editor
*       //var editor = new JSDraw2.Editor("ed", { skin: "w8", width: 800, height: 400, popup: true });
*     });
*   &lt;/script&gt;
*   &lt;/body&gt;
*   &lt;/html&gt;
* </pre>
* @class scilligence.JSDraw2.Editor
*/
JSDraw2.Editor = scilligence.extend(scilligence._base, {
    /**
    @property {Mol} atoms Mol object
    */
    /**
    @property {bool} chiral Molecule Chiral Flag
    */

    /**
    * Called when the structure is changed
    * @event {bool} ondatachange 
    * @param {Editor} editor this Editor
    * @return null
    */

    /**
    * Constructor a JSDraw Editor
    * @constructor Editor
    * @param {string} dv - the id of the div placeholder
    * @param {dictionary} options - the options for the editor:<ul>
    * <li>background - background color </li>
    * <li>biology - Set this flag to false to hide seqence button</li>
    * <li>buttonshape - circle, or square</li>
    * <li>data - actual data</li>
    * <li>dataformat - data format. It can be molfile, rxnfile, html</li>
    * <li>height</li>
    * <li>focusbox - indicate if show focusing box if focused. default: true </li>
    * <li>focuscolor - the border color when focused </li>
    * <li>inktools - set this flag to false to hide ink tools</li>
    * <li>highlighterrors - set this flag to false not to highlight errors in reb box</li>
    * <li>ondatachange - datachange event handler</li>
    * <li>plugins - plugins, as an array [{iconurl, tooltips, onclick}, ...]</li>
    * <li>popup - Create a viewer, and double-click to show popup editor</li>
    * <li>popupheight - Popup Editor height</li>
    * <li>popupwidth - Popup Editor width</li>
    * <li>query - Set this flag to false to disable query atoms (A, R, X, Q, *, etc.) in periodic table</li>
    * <li>removeHydrogens - Remove hydrogen atoms before show the structure</li>
    * <li>rxn - Set this flag to false to disable reaction buttons on toolbar</li>
    * <li>scale - A factore to zoom the whole editor, including toolbars. This is useful for iPad applications</li>
    * <li>sendquery - Set this flag to false to hide PubChem, ChemSpider search button</li>
    * <li>skin - set this to "w8" to display the editor in JSDraw2 mode; leave this parameter to empty to display editor in classic mode (2.0)</li>
    * <li>showcarbon - all or terminal</li>
    * <li>showfilemenu - set this flag to false to hide file menus</li>
    * <li>showimplicithydrogens - Set flag to false to hide implicit hydrogens</li>
    * <li>showtoolbar - set this flag to false not to show toolbar</li>
    * <li>viewonly</li>
    * <li>width</li>
    * </ul>
    */
    constructor: function (dv, options) {
        this.disableundo = JSDraw2.speedup.disableundo;

        this.T = "DRAW";
        JSDraw2.Editor.COLORCURRENT = [0, 255, 0, 0.5];
        JSDraw2.Editor.COLORSELECTED = [0, 0, 255, 0.5];
        this.options = options == null ? {} : options;
        this.chiral = null;

        if (JSDraw2.Editor._id == null) {
            JSDraw2.Editor._id = 0;
            JSDraw2.Editor._allitems = {};
        }

        ++JSDraw2.Editor._id;
        if ((typeof dv) == "string")
            dv = dojo.byId(dv);
        if (dv == null)
            return;

        this.ptElement = null;
        this.connectHandlers = [];
        this.maintable = null;
        this.div = dv;
        if (this.div.id == null || this.div.id.length == 0)
            this.div.id = "__JSDraw_" + JSDraw2.Editor._id;
        this.id = this.div.id;

        JSDraw2.Editor._allitems[this.id] = this;
        if (JSDraw2.defaultoptions == null)
            JSDraw2.defaultoptions = {};

        if (this.options.popup == null)
            this.options.popup = scil.Utils.isAttTrue(this.div, "popup");
        if (this.options.viewonly == null)
            this.options.viewonly = scil.Utils.isAttTrue(this.div, "viewonly");
        if (this.options.removehydrogens == null)
            this.options.removehydrogens = JSDraw2.defaultoptions.removehydrogens != null ? JSDraw2.defaultoptions.removehydrogens : scil.Utils.isAttTrue(this.div, "removehydrogens");
        if (this.options.query == null)
            this.options.query = JSDraw2.defaultoptions.query != null ? JSDraw2.defaultoptions.query : !scil.Utils.isAttFalse(this.div, "query");
        if (this.options.rxn == null)
            this.options.rxn = JSDraw2.defaultoptions.rxn != null ? JSDraw2.defaultoptions.rxn : !scil.Utils.isAttFalse(this.div, "rxn");
        if (this.options.biology == null)
            this.options.biology = JSDraw2.defaultoptions.biology != null ? JSDraw2.defaultoptions.biology : !scil.Utils.isAttFalse(this.div, "biology");
        if (this.options.sendquery == null)
            this.options.sendquery = JSDraw2.defaultoptions.sendquery != null ? JSDraw2.defaultoptions.sendquery : !scil.Utils.isAttFalse(this.div, "sendquery");
        if (this.options.showtoolbar == null)
            this.options.showtoolbar = JSDraw2.defaultoptions.showtoolbar != null ? JSDraw2.defaultoptions.showtoolbar : !scil.Utils.isAttFalse(this.div, "showtoolbar");
        if (this.options.showcustomtemplates == null)
            this.options.showcustomtemplates = JSDraw2.defaultoptions.showcustomtemplates != null ? JSDraw2.defaultoptions.showcustomtemplates : !scil.Utils.isAttFalse(this.div, "showcustomtemplates");
        if (this.options.usechemdraw == null)
            this.options.usechemdraw = JSDraw2.defaultoptions.usechemdraw != null ? JSDraw2.defaultoptions.usechemdraw : scil.Utils.isAttTrue(this.div, "usechemdraw");
        if (this.options.showcarbon == null)
            this.options.showcarbon = JSDraw2.defaultoptions.showcarbon;
        if (this.options.pastechemdraw == null)
            this.options.pastechemdraw = JSDraw2.defaultoptions.pastechemdraw;
        if (this.options.width > 0)
            this.div.style.width = this.options.width + "px";
        if (this.options.height > 0)
            this.div.style.height = this.options.height + "px";
        if (this.options.ondatachange == null)
            this.options.ondatachange = dojo.attr(this.div, "ondatachange");
        if (this.options.data == null)
            this.options.data = dojo.attr(this.div, "data");
        if (this.options.dataformat == null)
            this.options.dataformat = dojo.attr(this.div, "dataformat");
        if (this.options.showimplicithydrogens == null)
            this.options.showimplicithydrogens = JSDraw2.defaultoptions.showimplicithydrogens != null ? JSDraw2.defaultoptions.showimplicithydrogens : !scil.Utils.isAttFalse(this.div, "showimplicithydrogens");
        if (this.options.inktools == null)
            this.options.inktools = JSDraw2.defaultoptions.inktools != null ? JSDraw2.defaultoptions.inktools : !scil.Utils.isAttFalse(this.div, "inktools");
        if (this.options.highlighterrors == null)
            this.options.highlighterrors = JSDraw2.defaultoptions.highlighterrors != null ? JSDraw2.defaultoptions.highlighterrors : !scil.Utils.isAttFalse(this.div, "highlighterrors");
        if (this.options.skin == null) {
            this.options.skin = JSDraw2.defaultoptions.skin != null ? JSDraw2.defaultoptions.skin : dojo.attr(this.div, "skin");
            if (this.options.skin == null)
                this.options.skin = "w8"
        }
        if (this.options.monocolor == null)
            this.options.monocolor = scil.Utils.isAttTrue(this.div, "monocolor");
        if (this.options.fullscreen == null)
            this.options.fullscreen = JSDraw2.defaultoptions.fullscreen != null ? JSDraw2.defaultoptions.fullscreen : scil.Utils.isAttTrue(this.div, "fullscreen");

        if (this.options.buttonshape == null)
            this.options.buttonshape = JSDraw2.defaultoptions.buttonshape != null ? JSDraw2.defaultoptions.buttonshape : dojo.attr(this.div, "buttonshape");
        if (this.options.buttonshape == null || this.options.buttonshape == "")
            this.options.buttonshape = scil.Utils.isIE ? "circle" : "square";
        if (this.options.buttonshape == "square")
            this.options.buttonshape = "btnrec";
        else if (this.options.buttonshape == "circle")
            this.options.buttonshape = "btncir";

        if (!(this.options.scale > 0)) {
            if (JSDraw2.defaultoptions.scale != null) {
                this.options.scale = JSDraw2.defaultoptions.scale;
            }
            else {
                var s = dojo.attr(this.div, "scale");
                if (!isNaN(s))
                    this.options.scale = parseFloat(s);
                //if (!(this.options.scale > 0))
                //    this.options.scale = this.isSkinW8() ? 1.3 : 1.0;
            }
        }
        this.options.btnsize = this.isSkinW8() ? 42 : (20 * this.options.scale);

        if (this.options.data == null) {
            var molfile = dojo.attr(this.div, "molfile");
            if (molfile != null) {
                this.options.data = molfile;
                this.options.dataformat = "molfile";
            }
        }
        if (this.options.data == null) {
            var rxnfile = dojo.attr(this.div, "rxnfile");
            if (rxnfile != null) {
                this.options.data = rxnfile;
                this.options.dataformat = "rxnfile";
            }
        }

        if (this.options.skin == "w8")
            JSDraw2.Skin.jsdraw = { bkcolor: "#fff" };

        this.movingresolution = this.options.movingresolution > 0 ? this.options.movingresolution : 6;

        this.bondlength = JSDraw2.Editor.BONDLENGTH;
        this.tor = JSDraw2.Editor.TOR;
        this.linewidth = JSDraw2.Editor.LINEWIDTH;
        this.fontsize = JSDraw2.Editor.FONTSIZE;
        this.angleStop = JSDraw2.Editor.ANGLESTOP;
        var rect = scil.Utils.styleRect(this.div);
        this.dimension = new JSDraw2.Point(rect.width, rect.height);
        if (!(this.dimension.x > 0))
            this.dimension.x = this.div.offsetWidth == 0 ? 650 : this.div.offsetWidth;
        if (!(this.dimension.y > 0))
            this.dimension.y = this.div.offsetHeight == 0 ? 320 : this.div.offsetHeight;

        this.div.style.textAlign = "left";
        this.div.style.cursor = "default";
        this.div.style.width = this.dimension.x + "px";
        this.div.style.height = this.dimension.y + "px";

        if (scil.helm != null && this.options.helm != false)
            this.helm = new scil.helm.Plugin(this);

        this.m = new JSDraw2.Mol(this.options.showimplicithydrogens);
        this.status = null;
        this.modified = false;
        this.toolbar = null;

        this.touching = null;
        this.start = null;
        this.lastmove = null;
        this.end = null;
        this.curObject = null;
        this.curButton = null;
        this.movingClone = null;
        this.resizing = null;
        this.texteditor = { input: null, text: null, atom: null };
        this.rotating = null,
        this.mousedownPoint = null;
        this._lastMousedownTm = null;
        this.lassolast = null;
        this.chaintool = null;
        this.activated = false;
        this.ink = null;
        JSDraw2.Security._check();

        this.undocapacity = 10;
        this._undostack = new JSDraw2.Stack(this.undocapacity);
        this._redostack = new JSDraw2.Stack(this.undocapacity);

        if (!this.setMol(this.options.data)) {
            switch ((this.options.dataformat + "").toLowerCase()) {
                case "mol":
                case "molfile":
                    this.setMolfile(this.options.data);
                    break;
                case "molbase64":
                    this.setMolbase64(this.options.data);
                    break;
                case "rxn":
                case "rxnfile":
                    this.setRxnfile(this.options.data);
                    break;
                case "rxnbase64":
                    this.setRxnbase64(this.options.data);
                    break;
                case "jdx":
                    this.setJdx(this.options.data);
                    break;
                case "html":
                case "xml":
                case "jsdraw":
                    this.setXml(this.options.data == null ? this.div : this.options.data);
                    break;
                case "helm":
                    this.setHelm(this.options.data == null ? this.div : this.options.data);
                    break;
                case "molurl":
                    this.download(this.options.data, "mol");
                    break;
                case "rxnurl":
                    this.download(this.options.data, "rxn");
                    break;
                case "xmlurl":
                    this.download(this.options.data, "xml");
                    break;
                case "jdxurl":
                    this.download(this.options.data, "jdx");
                    break;
                default:
                    this.setXml(this.div);
            }
        }

        var hastoolbar = !this.options.popup && !this.options.viewonly;
        this.div.innerHTML = "";
        if (this.options.background != null)
            this.div.style.background = this.options.background;
        else
            this.div.style.background = "#fff";
        if (hastoolbar && this.options.showtoolbar) {
            if (this.isSkinW8()) {
                this.dimension.y -= 70;
            }
            else {
                this.dimension.x -= 28;
                this.dimension.y -= 24;
            }
        }
        dojo.style(this.div, { width: this.dimension.x + "px", height: this.dimension.y + "px" });

        var me = this;
        if (!this.options.viewonly || this.options.popup == true) {
            if (scil.Utils.serviceAvailable() && scil.DnDFile != null) {
                new scil.DnDFile(this.div, {
                    url: JSDrawServices.url + "?cmd=openjsd",
                    onupload: function (args) {
                        if (!scil.Utils.isChemFile(scil.Utils.getFileExt(args.filename))) return false;
                    },
                    callback: function (ret) {
                        me.activate(true); JSDraw2.JSDrawIO.jsdFileOpen2(me, ret);
                    }
                });
            }
        }

        if (hastoolbar) {
            this.toolbar = new JSDraw2.Toolbar(this);
            this.toolbar.createToolbars(this.div);
            if (!this.options.showtoolbar)
                this.toolbar.show(false);

            if (window.navigator.msPointerEnabled) {
                dojo.connect(this.div, "onselectstart", function (e) { e.preventDefault(); });

                // only caption multi-touch. one-point touch is handler by mouse-down/move/up
                dojo.connect(this.div, "onMSPointerDown", function (e) { e = scilligence.mstouch.down(e); if (e != null && e.touches.length > 1) me.touchStart(e); else me.resetGesture(); });
                dojo.connect(this.div, "onMSPointerMove", function (e) { e = scilligence.mstouch.move(e); if (e != null && e.touches.length > 1) me.touchMove(e); });
                dojo.connect(this.div, "onMSPointerUp", function (e) { e = scilligence.mstouch.up(e); if (e != null && e.touches.length > 1) me.touchEnd(e); });

                dojo.connect(this.div, "onMSGestureHold", function (e) { me.showContextMenu(e); e.preventDefault(); });
                //this.div.addEventListener("MSGestureStart", function (e) { me.gestureStart(e); }, false);
                //this.div.addEventListener("MSGestureChange", function (e) { me.gestureChange(e); }, false);
                //this.div.addEventListener("MSGestureEnd", function (e) { me.gestureEnd(e); }, false);
            }

            if (scil.Utils.isTouch) {
                this.activate(false, false);
                this.connectHandlers.push(dojo.connect(document.body, 'ontouchstart', function (e) { return me.bodyTouchStart(e); }));
                this.connectHandlers.push(dojo.connect(this.maintable, 'onclick', function (e) { return me.touchClick(e); }));
                this.connectHandlers.push(dojo.connect(this.div, 'ontouchstart', function (e) { return me.touchStart(e); }));
                this.connectHandlers.push(dojo.connect(this.div, 'ontouchmove', function (e) { return me.touchMove(e); }));
                this.connectHandlers.push(dojo.connect(this.div, 'ontouchend', function (e) { return me.touchEnd(e); }));
            }
            else {
                this.activate(false, false);
                this.connectHandlers.push(dojo.connect(document, 'onmousedown', function (e) { return me.bodyMouseDown(e); }));
                //this.connectHandlers.push(dojo.connect(document, 'onclick', function (e) { me.bodyClick(e); }));
                this.connectHandlers.push(dojo.connect(document, 'onkeydown', function (e) { me.keydown(e); }));
                this.connectHandlers.push(dojo.connect(this.div, 'onmousedown', function (e) { me.mousedown(e); }));
                this.connectHandlers.push(dojo.connect(this.div, 'onmousemove', function (e) { me.mousemove(e); }));
                this.connectHandlers.push(dojo.connect(this.div, 'onmouseup', function (e) { me.mouseup(e); }));
                if (scil.Utils.isFirefox)
                    this.connectHandlers.push(dojo.connect(this.div, 'onwheel', function (e) { me.mousewheel(e); }));
                else
                    this.connectHandlers.push(dojo.connect(this.div, 'onmousewheel', function (e) { me.mousewheel(e); }));
            }

            dojo.attr(this.div, '__ajaxform', '1');
        }
        else {
            if (this.options.popup) {
                if (scil.Utils.isTouch) {
                    this.connectHandlers.push(dojo.connect(this.div, 'ontouchstart', function (e) { if (!scil.Utils.isTouchDblClick(e)) return; me.dblclick(); e.preventDefault(); return false; }));
                } else {
                    this.connectHandlers.push(dojo.connect(this.div, 'ondblclick', function (e) { me.dblclick(); }));
                }
            }

            if (!scil.Utils.isTouch) {
                this.connectHandlers.push(dojo.connect(this.div, 'onmousedown', function (e) { me.mousedown(e, true); }));
                this.connectHandlers.push(dojo.connect(this.div, 'onmousemove', function (e) { me.mousemove(e, true); }));
                this.connectHandlers.push(dojo.connect(this.div, 'onmouseup', function (e) { me.mouseup(e, true); }));
                if (scil.Utils.isFirefox)
                    this.connectHandlers.push(dojo.connect(this.div, 'DOMMouseScroll', function (e) { me.mousewheel(e); }));
                else
                    this.connectHandlers.push(dojo.connect(this.div, 'onmousewheel', function (e) { me.mousewheel(e, true); }));
            }
        }
        this.connectHandlers.push(dojo.connect(this.div, 'onresize', function () { if (!me._clearing) me.onResize(); }));

        dojo.style(this.div, { userSelect: "none", oUserSelect: "none", MozUserSelect: "none", khtmlUserSelect: "none", webkitUserSelect: "none" });

        // guarantee all parents are visible
        var parents = null;
        if (scil.Utils.isIE && (scil.Utils.isIE < 9 || dojox.gfx.renderer != "svg"))
            parents = this._showAllParents(this.div);
        this.surface = dojox.gfx.createSurface(this.div, this.dimension.x, this.dimension.y);
        if (parents != null) {
            //this.surface.rowNode.setAttribute("unselectable", "on");
            this._hideElements(parents);
        }

        if (scil.Utils.isSilverlight == null)
            scil.Utils.isSilverlight = this.div.firstChild != null && this.div.firstChild.type == "application/x-silverlight";

        if (scil.Utils.isSilverlight) {
            if (this.options.popup) {
                // this.connectHandlers.push(dojo.connect(this.div, 'onmousedown', function (e) { me.mousedown2(e); e.preventDefault(); }));
                this.div.style.position = "relative";
                var zindex = parseInt(this.div.zIndex + "");
                if (isNaN(zindex))
                    zindex = 0;
                scil.Utils.createElement(this.div, "div", null, { position: "absolute", left: 0, top: 0, background: "white", filter: "alpha(opacity=1)", width: this.dimension.x + "px", height: this.dimension.y + "px", zIndex: zindex + 1 });
            }
            else if (hastoolbar) {
                this.surface.connect("onkeydown", function (e) { me.keydown(e); });
            }
        }

        if (this.options.showcontextmenu != false) {
            scil.Utils.disableContextMenu(this.div);
            //scil.Utils.disableContextMenu(this.surface);
        }

        this.modified = false;
        //this.activate(true);

        if (this.options.scale > 0) {
            var s = 30 / this.bondlength * this.options.scale;
            if (s != 1)
                this.scale(this.options.scale);
            this.fitToWindow();
        }
        this.redraw();
        this.loaded = true;

        if (hastoolbar) {
            if (this.options.tlcplate)
                this.doCmd("tlc");
            else
                this.doCmd("select");

            if (!this.options.appmode && !scil.Utils.isIE) // except IE, I#10205
                scil.connect(document, "onpaste", function (e) { if (me.doPaste(e)) e.preventDefault(); });
        }
        else {
            this.doCmd("moveview");
        }
    },

    doPaste: function (s) {
        if (!this.activated)
            return false;

        if (this.texteditor.ed != null && this.texteditor.ed.input != null && this.texteditor.ed.input.style.display != "none")
            return false;

        var maxZindex = scil.Utils.getMaxZindex();
        var zindex = scil.Utils.getZindex(this.div);
        if (maxZindex > zindex)
            return false;

        var clipboard = s;
        if (clipboard != null && clipboard.clipboardData != null)
            s = clipboard.clipboardData.getData("text/plain");

        var m = null;
        if (!scil.Utils.isNullOrEmpty(s)) {
            m = new JSDraw2.Mol();
            m.setXml(s);
            if (m.isEmpty())
                m = null;
        }

        if (m == null)
            m = JSDraw2.Editor.getClipboard();

        if (m == null) {
            // try ajax paste
            if (clipboard != null && clipboard.clipboardData != null && JSDrawServices != null && JSDrawServices.url != null) {
                var rtf = clipboard.clipboardData.getData("text/rtf");
                if (!scil.Utils.isNullOrEmpty(rtf)) {
                    var me = this;
                    scil.Utils.ajax(JSDrawServices.url + "?cmd=paste.rtf2jsdraw", function (ret) {
                        if (ret == null && ret.jsdraw == null)
                            return;
                        var m = new JSDraw2.Mol();
                        if (m.setXml(ret.jsdraw) == null)
                            return;
                        var f = me.pasteMol(m);
                        if (f)
                            me.refresh();
                    }, { rtf: rtf });
                }
            }
            return false;
        }

        var ret = this.pasteMol(m);
        if (ret)
            this.refresh();
        return true;
    },

    _showAllParents: function (e) {
        var ret = { display: [], visibility: [], visvalues: [] };
        while (e != null && e.style != null) {
            if (e.style.display == "none") {
                ret.display.push(e);
                e.style.display = "";
            }
            if (e.style.visibility != "" && e.style.visibility != null && e.style.visibility != "visible") {
                ret.visibility.push(e);
                ret.visvalues.push(e.style.visibility);
                e.style.visibility = "visible";
            }
            e = e.parentNode;
        }
        return ret;
    },

    _hideElements: function (ret) {
        if (ret == null)
            return;
        for (var i = 0; i < ret.display.length; ++i)
            ret.display[i].style.display = "none";
        for (var i = 0; i < ret.visibility.length; ++i)
            ret.visibility[i].style.visibility = ret.visvalues[i];
    },

    reset: function () {
        this.clear(true);
        this._undostack.clear();
        this._redostack.clear();

        if (this.options.tlcplate)
            this.doCmd("tlc");
        else
            this.doCmd("select");
    },

    /**
    * Push the current status into undo stack
    * @function pushundo
    * @returns null
    */
    pushundo: function (m, action) {
        if (this.disableundo)
            return;

        if (m == null && action != null && this.lastaction == action)
            return;

        this.lastaction = action;
        this._redostack.clear();
        this._undostack.push(m == null ? this.clone() : m);
    },

    /**
    * Undo once
    * @function undo
    * @returns null
    */
    undo: function () {
        if (this.disableundo)
            return;

        var m = this._undostack.pop();
        if (m == null)
            return false;

        this._redostack.push(this.clone());
        this.restoreClone(m);
        this.setModified(true);
        return true;
    },

    restoreClone: function (m) {
        this._setmol(m.mol);
        this.resetScale(m);
    },


    /**
    * Redo once
    * @function redo
    * @returns null
    */
    redo: function () {
        if (this.disableundo)
            return;

        var m = this._redostack.pop();
        if (m == null)
            return false;

        this._undostack.push(this.clone());
        this._setmol(m.mol);
        this.resetScale(m);
        this.setModified(true);
        return true;
    },

    /**
    * Copy
    * @function copy
    * @returns null
    */
    copy: function (m) {
        if (m == null) {
            m = this.m.clone(true);
            m.bondlength = this.bondlength;
        }
        JSDraw2.Editor.setClipboard(m, this.bondlength);

        if (scil.Clipboard != null && m != null && !m.isEmpty()) {
            scil.Clipboard.copy(m.getXml(null, null, null, null, this.bondlength));
            return true;
        }

        return false;
    },

    /**
    * Cut
    * @function cut
    * @returns null
    */
    cut: function () {
        if (!this.copy())
            return false;
        this.pushundo();
        return this.delSelected() > 0;
    },

    /**
    * Paste
    * @function past
    * @param {Point} pos - place the pasted structure to this location
    * @returns the Mol
    */
    paste: function (pos) {
        var m = JSDraw2.Editor.getClipboard();
        return this.pasteMol(m);
    },

    /**
    * Paste a mol
    * @function past
    * @param {Mol} m - molecule to be pasted
    * @param {Point} pos - place the pasted structure to this location
    * @returns the Mol
    */
    pasteMol: function (m, pos, clear) {
        if (m == null)
            return false;

        if (typeof (m) == "string") {
            var mol = new JSDraw2.Mol(this.options.showimplicithydrogens);
            mol.setMolfile(m);
            m = mol;
        }

        var empty = this.m.isEmpty();
        this.pushundo();

        if (clear == true)
            this.clear(null, true);

        var len = null;
        if (m.bondlength > 0) {
            len = this.bondlength; //I#9549
            m.scale(this.bondlength / m.bondlength);
            //this.resetScale();
        }
        else {
            var len2 = m.medBondLength();
            if (!(len2 > 0))
                len2 = 1.56;
            var len = this.m.medBondLength();
            if (!(len > 0))
                len = this.bondlength;
            m.scale(len / len2);
        }

        if (pos == null) {
            m.moveCenter(this.dimension.x, this.dimension.y);
            m.offset(10, 10);
        }
        else {
            var c = m.center();
            m.offset(pos.x - c.x, pos.y - c.y);
        }

        m.showimplicithydrogens = this.options.showimplicithydrogens;
        this.m.setSelected();
        m.setSelected(true);
        m.calcHCount(true);

        // make rxn
        var reaction = null;
        var rxn = this.m.parseRxn(true);
        var rxn2 = m.parseRxn(true);
        if ((clear == "reactant" || clear == "product") && rxn2 != null && rxn2.arrow == null) {
            if (clear == "reactant")
                scil.Utils.mergeArray(rxn.reactants, rxn2.reactants);
            else
                scil.Utils.mergeArray(rxn.products, rxn2.reactants);
            reaction = rxn;
        }
        else if (rxn != null && (rxn.reactants.length > 0 || rxn.products.length > 0)) {
            if (rxn.arrow != null) {
                if (rxn2.arrow == null) {
                    if (rxn.reactants.length == 0)
                        rxn.reactants = rxn2.reactants;
                    else
                        scil.Utils.mergeArray(rxn.products, rxn2.reactants);
                    reaction = rxn;
                }
            }
            else {
                if (rxn2.arrow != null) {
                    if (rxn.arrow == null) {
                        if (rxn2.reactants.length == 0)
                            rxn2.reactants = rxn.reactants;
                        else
                            scil.Utils.mergeArray(rxn2.products, rxn.reactants);
                    }
                    reaction = rxn2;
                }
            }
        }

        if (reaction != null) {
            this.m.setRxn(reaction, len);
            this.fitToWindow();
        }
        else {
            var tlcplates = [];
            for (var i = m.graphics.length - 1; i >= 0; --i) {
                var t = JSDraw2.TLC.cast(m.graphics[i]);
                if (t != null) {
                    m.graphics.splice(i, 1);
                    tlcplates.splice(0, 0, t);
                }
            }

            this.m.mergeMol(m);
            for (var i = 0; i < tlcplates.length; ++i)
                this.addTlcPlate(tlcplates[i]);

            if (empty)
                this.fitToWindow();
        }

        this.setModified(true);
        return true;
    },

    /**
    * Reset scaling
    * @function resetScale
    * @returns null
    */
    resetScale: function (s) {
        this.bondlength = s == null ? JSDraw2.Editor.BONDLENGTH : s.bondlength;
        this.tor = s == null ? JSDraw2.Editor.TOR : s.tor;
        this.linewidth = s == null ? JSDraw2.Editor.LINEWIDTH : s.linewidth;
        this.fontsize = s == null ? JSDraw2.Editor.FONTSIZE : s.fontsize;
        this.angleStop = s == null ? JSDraw2.Editor.ANGLESTOP : s.angleStop;
    },

    clone: function () {
        return { mol: this.m.clone(), bondlength: this.bondlength, tor: this.tor, linewidth: this.linewidth, fontsize: this.fontsize, angleStop: this.angleStop };
    },

    showTextEditor: function (obj, p, str) {
        var text = this.texteditor.text = JSDraw2.Text.cast(obj);
        if (text != null && text.readonly)
            return;

        if (this.texteditor.hidetime != null) {
            var tm = this.texteditor.hidetime;
            this.texteditor.hidetime = null;
            if (new Date().getTime() - tm < 500)
                return;
        }

        var a = this.texteditor.atom = JSDraw2.Atom.cast(obj);
        var t = JSDraw2.Text.cast(obj);
        var shp = this.texteditor.shape = JSDraw2.Shape.cast(obj);
        var br = t != null && t.anchors != null && t.anchors.length == 1 ? JSDraw2.Bracket.cast(t.anchors[0]) : null;
        if (a != null) {
            p.x -= 6 * this.bondlength / 30;
            p.y -= 9 * this.bondlength / 30;
        }
        else if (shp != null) {
            p.x = shp._rect.left + shp._rect.width / 10;
            p.y = shp._rect.center().y - 9 * this.bondlength / 30;
        }

        var me = this;
        if (this.texteditor.ed == null) {
            var input = scil.Utils.createElement(document.body, "input");
            this.texteditor.ed = new scil.DropdownInput(input, { onclickitem: function (s) { return me.clickTextItem(s); } });
            dojo.style(this.texteditor.ed.input, { position: "absolute", display: "none", zIndex: 999 });
            this.connectHandlers.push(dojo.connect(this.texteditor.ed.input, "onkeydown", function (e) { return me.txtKeypress(e); }));
        }

        var options = this.texteditor.ed.options;
        if (a != null) {
            var list = null;
            if (a.bio != null && this.helm != null)
                list = scil.helm.Monomers.getMonomerList(a);
            else
                list = JSDraw2.defaultoptions.atomlist != null ? JSDraw2.defaultoptions.atomlist : JSDraw2.PT.getCommonUsedElements("list");
            this.texteditor.ed.setItems(list);
            options.onSetValue = function (input, s) { input.value = s; };
            options.minautowidth = JSDraw2.defaultoptions.minautowidth1 > 0 ? JSDraw2.defaultoptions.minautowidth1 : 100;
            if (a.bio != null)
                options.onFilter = null;
            else
                options.onFilter = function (q) { return me.filterAtomType(q); };
        }
        else if (shp != null) {
            this.texteditor.ed.setItems(null);
        }
        else if (br != null) {
            if (t.fieldtype == "BRACKET_TYPE") {
                this.texteditor.ed.setItems(JSDraw2.SGroup == null ? null : JSDraw2.SGroup.getDisplayTypes());
                options.onSetValue = function (input, s) {
                    var s2 = "";
                    if (scil.Utils.endswith(s, ")")) {
                        var p = s.lastIndexOf('(');
                        if (p > 0)
                            s2 = s.substr(p + 1, s.length - p - 2);
                    }
                    input.value = s2;
                };
                options.minautowidth = JSDraw2.defaultoptions.minautowidth2 > 0 ? JSDraw2.defaultoptions.minautowidth2 : 150;
                options.onFilter = null;
            }
            else if (t.fieldtype == "MOL_TYPE") {
                this.texteditor.ed.setItems(JSDraw2.MOLECULETYPES);
                options.onSetValue = function (input, s) {
                    if (scil.Utils.isNullOrEmpty(s))
                        this.mol.delGraphics(t);
                    else
                        input.value = s;
                };
                options.minautowidth = JSDraw2.defaultoptions.minautowidth2 > 0 ? JSDraw2.defaultoptions.minautowidth2 : 150;
                options.onFilter = null;
            }
        }
        else {
            this.texteditor.ed.setItems(JSDraw2.defaultoptions.textlist != null ? JSDraw2.defaultoptions.textlist : JSDraw2.TEXTKEYWORDS);
            options.onSetValue = function (input, s) { if (scil.Utils.indexOf(options.items, s) >= 0) input.value += s; else input.value = s; };
            options.minautowidth = JSDraw2.defaultoptions.minautowidth3 > 0 ? JSDraw2.defaultoptions.minautowidth3 : 300;
            options.autosuggest = this.options.reagentsuggest;
            options.onFilter = options.autosuggest != null ? null : function () { };
        }
        var z = scil.Utils.getZindex(this.div);
        this.texteditor.ed.input.style.zIndex = z > 0 ? (z + 1) : 1;

        if (text != null)
            p = new JSDraw2.Point(text._rect.left, text._rect.top);
        else
            p.offset(-2, -2);
        var offset = scil.Utils.getOffset(this.div, false);
        dojo.style(this.texteditor.ed.input, { fontSize: this.fontsize + "px" });
        dojo.style(this.texteditor.ed.input, { left: (p.x + offset.x) + "px", top: (p.y + offset.y) + "px", display: "" });

        var selectall = true;
        if (text != null) {
            this.texteditor.ed.input.value = str == null ? text.text : str;
        }
        else if (a != null) {
            var s = a.getLabel();
            if (a.charge > 0) {
                if (a.charge > 1)
                    s += a.charge;
                else
                    s += "+";
            }
            else if (a.charge < 0) {
                if (a.charge > 1)
                    s += a.charge;
                else
                    s += "-";
            }
            this.texteditor.ed.input.value = s;
        }
        else if (shp != null) {
            this.texteditor.ed.input.value = shp.text;
        }
        else if (str != null) {
            this.texteditor.ed.input.value = str;
            selectall = false;
        }
        // dojo.attr(this.texteditor.ed, "changed", '');

        this.txtAutosize();
        if (selectall)
            this.texteditor.ed.input.select();
        this.texteditor.ed.input.style.display = "";
        this.texteditor.ed.input.focus();
        this.texteditor.showtime = new Date().getTime();
    },

    filterAtomType: function (q) {
        if (this.texteditor.atom == null)
            return;
        return JSDraw2.SuperAtoms.filter(q, JSDraw2.defaultoptions.suggestcount > 0 ? JSDraw2.defaultoptions.suggestcount : 10);
    },

    createImageTo: function (parent) {
        if (!scil.Utils.serviceAvailable() || parent == null)
            return;

        if (typeof (parent) == "string")
            parent = scil.byId(parent);

        var jsdraw = this.getXml();
        scil.Utils.ajax(JSDrawServices.url + "?cmd=jsdraw2img", function (ret) {
            scil.Utils.createElement(parent, "img", null, null, { src: ret.src, jsdraw: JSDraw2.Base64.encode(jsdraw) });
        }, { jsdraw: jsdraw });
    },

    clickTextItem: function (s) {
        if (this.texteditor.atom != null) {
            if (s == "...") {
                this.hideTextEditor(true);

                this.m.setSelected(false);
                this.texteditor.atom.selected = true;
                this.refresh(false);

                var me = this;
                this.showPT(function (elem) { me.menuSetAtomType2(elem); });
            }
            else {
                this.hideTextEditor();
            }
        }
        else {
            this.txtAutosize();
        }
    },

    insertSymbol: function (symbol) {
        if (this.texteditor.ed == null || this.texteditor.ed.input.style.display == "none")
            return false;
        this.texteditor.ed.input.focus();

        var caretposition = JSDraw2.Symbol.getCaretPosition(this.texteditor.ed.input);
        var s = this.texteditor.ed.input.value;
        if (caretposition > 0 && caretposition < s.length) {
            this.texteditor.ed.input.value = s.substr(0, caretposition) + symbol + s.substr(caretposition);
            ++caretposition;
            JSDraw2.Symbol.setCaretPosition(this.texteditor.ed.input, caretposition);
        }
        else {
            this.texteditor.ed.input.value += symbol;
        }
        this.txtAutosize();
        return false;
    },

    hideTextEditor: function (cancel) {
        if (this.texteditor.ed == null || this.texteditor.ed.input.style.display == "none")
            return;

        if (this.texteditor.showtime != null) {
            var tm = this.texteditor.showtime;
            this.texteditor.showtime = null;
            if (new Date().getTime() - tm < 500)
                return;
        }

        this.texteditor.ed.hide();
        this.texteditor.ed.input.style.display = "none";
        this.texteditor.ed.input.style.display = "none";
        this.texteditor.hidetime = new Date().getTime();

        var s = scil.Utils.trim(this.texteditor.ed.input.value);
        this.texteditor.ed.input.value = "";
        if (cancel == true)
            return;

        if (JSDraw2.Symbol != null)
            JSDraw2.Symbol.hide();

        if (this.texteditor.atom != null) {
            if (s == "")
                s = "C";
            var cloned = this.clone();

            if (this.texteditor.atom.bio != null) {
                if (this.helm != null && scil.helm.isHelmNode(this.texteditor.atom)) {
                    f = this.helm.setNodeTypeFromGui(this.texteditor.atom, s);
                }
            }
            else {
                s = JSDraw2.FormulaParser.stripHs(s);
                var f = this.m.setAtomAlias(this.texteditor.atom, s) || this.m.setAtomType(this.texteditor.atom, s, true);
            }

            if (f) {
                this.pushundo(cloned);
                this.refresh(true);
            }
        }
        else if (this.texteditor.shape != null) {
            if (this.texteditor.shape.text != s) {
                this.pushundo();
                this.texteditor.shape.text = s;
                this.refresh(true);
            }
        }
        else {
            if (this.texteditor.text == null) {
                if (s.length == 0)
                    return;

                var offset = scil.Utils.getOffset(this.div, false);
                var rect = scil.Utils.styleRect(this.texteditor.ed.input);
                rect.offset(-offset.x, -offset.y);
                var txt = new JSDraw2.Text(rect, s);
                this.pushundo();
                this.m.addGraphics(txt);
                this.refresh(true);
            }
            else {
                if (s == this.texteditor.text.text)
                    return;

                this.pushundo();
                if (s.length == 0)
                    this.texteditor.text._parent.delObject(this.texteditor.text);
                else
                    this.texteditor.text.text = s;
                if (this.texteditor.text.fieldtype == "BRACKET_TYPE" && this.texteditor.text.anchors.length == 1 && JSDraw2.Bracket.cast(this.texteditor.text.anchors[0]) != null) {
                    if (scil.Utils.isNumber(s))
                        this.texteditor.text.anchors[0].type = "mul";
                    else
                        this.texteditor.text.anchors[0].type = s;
                }
                this.texteditor.text = null;
                this.refresh(true);
            }
        }
    },

    showTemplatesDlg: function () {
        JSDraw2.CustomTemplates.show(false, this);
    },

    showSymbolDlg: function () {
        var input = this.texteditor == null || this.texteditor.ed == null ? null : this.texteditor.ed.input;
        var pt = input == null || input.style.display == "none" ? null : { x: input.offsetLeft, y: input.offsetTop + input.offsetHeight + 5 };
        var me = this;
        JSDraw2.Symbol.show(false, function (s) { return me.insertSymbol(s); }, pt);
    },

    txtKeypress: function (e) {
        if ((e.keyCode == 40 || e.keyCode == 38) && (e.ctrlKey || e.metaKey) && JSDraw2.Symbol != null) {
            if (e.keyCode == 40)
                this.showSymbolDlg();
            else
                JSDraw2.Symbol.hide();
            e.preventDefault();
            return false;
        }

        if (e.keyCode == 27 || e.keyCode == 13) {
            this.hideTextEditor(e.keyCode == 27);
            e.time2 = 903;
            e.preventDefault();
            return false;
        }
        this.txtAutosize();
    },

    txtAutosize: function () {
        var w = scil.Utils.textWidth(this.texteditor.ed.input.value) * this.fontsize * 0.6 + this.fontsize * 3;
        this.texteditor.ed.input.style.width = (w < 100 ? 100 : w) + "px";
        this.texteditor.ed.updateDropdownSize();
    },

    _setmol: function (m) {
        this.m = m;
        this.m.showimplicithydrogens = this.options.showimplicithydrogens;
        this.start = null;
        this.end = null;
        this.status = null;
        this.curObject = null;
    },

    /**
    * Scale the molecule
    * @function scale
    * @param {number} s - the scaling factor
    * @param {Point} origin - the scaling origin
    * @returns null
    */
    scale: function (s, origin) {
        if (s <= 0 || s == 1.0)
            return;

        if (this.bondlength * s < JSDraw2.speedup.minbondlength)
            s = JSDraw2.speedup.minbondlength / this.bondlength;

        this.m.scale(s, origin);
        this.bondlength *= s;
        this.tor *= s;
        this.linewidth *= s;
        this.fontsize *= s;

        if (origin == null)
            this.moveCenter();
    },

    /**
    * Set modified flag
    * @function setModified
    * @param {bool} f - true or false
    * @returns null
    */
    setModified: function (f) {
        this.modified = f;
        if (f == false)
            return;

        if (this.options.ondatachange != null && this.loaded) {
            if (typeof this.options.ondatachange == "function") {
                this.options.ondatachange(this);
            }
            else {
                try {
                    eval(this.options.ondatachange)(this);
                }
                catch (e) {
                }
            }
        }
    },

    /**
    * Refresh the display
    * @function refresh
    * @param {bool} modified - modified flag
    * @returns null
    */
    refresh: function (modified) {
        this.m.stats = null;
        if (modified == true || modified == false)
            this.setModified(modified);
        this.redraw();
    },

    calcTextRect: function () {
        if (this.surface == null || scil.Utils.isIE8Lower && this.surface.rawNode == null)
            return;

        var g = this.createGroup();
        this.m.draw(g, this.linewidth, this.fontsize, true, null, null, true);
        this.surface.remove(g);
    },

    createGroup: function (parent) {
        var g = (parent == null ? this.surface : parent).createGroup();
        if (dojox.gfx.renderer == "svg")
            g.rawNode.setAttribute("__surface_parentid", this.id);
        return g;
    },

    moveview: function (p) {
        this.viewoffset = p;
        if (this.viewoffset != null)
            this.surface.rootgroup.setTransform([dojox.gfx.matrix.translate(this.viewoffset.x, this.viewoffset.y)]);
        else
            this.surface.rootgroup.setTransform([dojox.gfx.matrix.translate(0, 0)]);
    },

    /**
    * Redraw the molecule
    * @function redraw
    * @returns null
    */
    redraw: function (extraOnly) {
        if (this.surface == null || scil.Utils.isIE8Lower && this.surface.rawNode == null)
            return;

        if (this.surface.rootgroup == null) {
            this.surface.rootgroup = this.createGroup();

            if (JSDraw2.Security.error != null) {
                this.surface.createText({ x: 5, y: 25, text: JSDraw2.Security.error, align: "start" })
                    .setFont({ family: "Arial", size: "20px", weight: "normal" })
                    .setFill("#ffe0e0");
            }
        }
        if (this.viewoffset != null)
            this.surface.rootgroup.setTransform([dojox.gfx.matrix.translate(this.viewoffset.x, this.viewoffset.y)]);
        else
            this.surface.rootgroup.setTransform(null);

        this._clearing = true;
        if (extraOnly) {
            if (this.surface.extra != null) {
                this.surface.extra.clear();
                this.surface.extra.lasso = null;
            }
        }
        else {
            this.surface.rootgroup.clear();
            this.surface.extra = null;
            this._clearing = false;
            var g = this.createGroup(this.surface.rootgroup);
            g.monocolor = this.options.monocolor || JSDraw2.defaultoptions.monocolor;
            this.simpledraw = this.fontsize <= JSDraw2.speedup.fontsize;
            this.updateGroupRect();
            this.m.draw(g, this.linewidth, this.fontsize, null, this.dimension, this.options.highlighterrors, this.options.showcarbon, this.simpledraw);
        }

        var cmd = this.getCmd();
        if (this.surface.extra == null)
            this.surface.extra = this.createGroup(this.surface.rootgroup);
        var extra = this.surface.extra;
        if (this.curObject != null)
            this.curObject.drawCur(extra, this.fontsize / 2 + 1, JSDraw2.Editor.COLORCURRENT, this.m, cmd);

        if (this.start != null && this.end != null) {
            switch (cmd) {
                case "arrow":
                    if (this.arrowtool != null && this.arrowtool.connector == "rejector")
                        JSDraw2.Drawer.drawArrow(extra, this.start, this.end, "gray", this.linewidth, this.linewidth * 2);
                    else
                        JSDraw2.Drawer.drawArrow(extra, this.start, this.end, "gray", this.linewidth);
                    break;
                case "curve":
                    JSDraw2.Drawer.drawCurveArrow(extra, this.start, this.end, null, null, "gray", this.linewidth / 2);
                    break;
                case "rectangle":
                    JSDraw2.Drawer.drawRect(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 2, 5);
                    break;
                case "assaycurve":
                    JSDraw2.Drawer.drawRect(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 4);
                    break;
                case "spectrum":
                    JSDraw2.Drawer.drawRect(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 4);
                    break;
                case "ellipse":
                    JSDraw2.Drawer.drawEllipse(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 2);
                    break;
                case "diamond":
                    JSDraw2.Drawer.drawDiamond(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 2);
                    break;
                case "dreversed":
                    JSDraw2.Drawer.drawDShape(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 2, true);
                    break;
                case "dshape":
                    JSDraw2.Drawer.drawDShape(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth / 2);
                    break;
                case "doublearrow":
                    JSDraw2.Drawer.drawDoubleArrow(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth);
                    break;
                case "tlc":
                case "electrophoresis":
                    if (this.movingClone == null)
                        new JSDraw2.TLC.create(cmd, this.start, this.end, this.fontsize / 2).draw(extra, this.linewidth, null, this.fontsize);
                    break;
                case "select":
                case "lasso":
                case "selfrag":
                case "zoombox":
                    if (this.movingClone == null)
                        JSDraw2.Drawer.drawRect(extra, new JSDraw2.Rect().set(this.start, this.end), "#aaaaff", 1);
                    break;
                case "bracket":
                    JSDraw2.Drawer.drawBracket(extra, new JSDraw2.Rect().set(this.start, this.end), "gray", this.linewidth);
                    break;
                case "chain":
                    if (this.chaintool != null) {
                        var pts = this.chaintool.points;
                        for (var i = 1; i < pts.length; ++i)
                            JSDraw2.Drawer.drawLine(extra, pts[i - 1], pts[i], "gray", this.linewidth);
                    }

                    if (!(scil.Utils.isIE && scil.Utils.isIE < 9 && this.options.appmode))
                        JSDraw2.Drawer.drawText(extra, pts[pts.length - 1], pts.length - 1, "gray", this.fontsize);
                    break;
                default:
                    if (cmd == "sgroup")
                        JSDraw2.Drawer.drawArrow(extra, this.start, this.end, "red", this.linewidth / 2);
                    else if (cmd != "rotate" && cmd != "eraser" && cmd != "plus" && cmd != "rxnmap" && cmd != "text" &&
                        cmd != "undo" && cmd != "redo" && cmd != "zoomin" && cmd != "zoomout")
                        JSDraw2.Drawer.drawLine(extra, this.start, this.end, "gray", this.linewidth);
                    break;
            }
        }

        if (this.status != null && this.status.length > 0) {
            var y = this.dimension.y - 10;
            extra.createText({ x: 5, y: y, text: this.status, align: "bottom" })
              .setFont({ family: "Arial", size: "14px", weight: "normal" })
              .setFill("#000");
        }
    },

    /**
    * Fit the molecule to the view window
    * @function fitToWindow
    * @param {number} maxBondLength - maximum bond length
    * @returns null
    */
    fitToWindow: function (maxBondLength) {
        var rect = this.m.rect();
        if (rect == null)
            return;

        if (maxBondLength == null) {
            maxBondLength = JSDraw2.Editor.BONDLENGTH;
            if (this.options.scale > 0)
                maxBondLength *= this.options.scale;
        }

        rect.inflate(this.bondlength, this.bondlength);
        var hs = rect.width / this.dimension.x;
        var vs = rect.height / this.dimension.y;

        var s;
        if (hs == 0)
            s = vs;
        else if (vs == 0)
            s = hs;
        else
            s = Math.max(vs, hs);

        if (maxBondLength > 0 && this.bondlength / s > maxBondLength)
            s = this.bondlength / maxBondLength;

        if (s == 1.0)
            this.moveCenter();
        else
            this.scale(1.0 / s);
    },

    /**
    * Move the structure to center of the view window
    * @function moveCenter
    * @returns null
    */
    moveCenter: function () {
        this.m.moveCenter(this.dimension.x, this.dimension.y);
    },

    updateGroupRect: function () {
        for (var i = 0; i < this.m.graphics.length; ++i) {
            var g = JSDraw2.Group.cast(this.m.graphics[i]);
            if (g != null)
                g._updateRect(this.m, this.bondlength);
        }
    },

    /**
    * Clean up reaction
    * @function cleanupRxn
    * @returns true if it is a reaction
    */
    cleanupRxn: function () {
        var f = this.m.cleanupRxn(this.bondlength);
        if (f)
            this.fitToWindow(this.bondlength);
        return f;
    },

    setRxn: function (rxn, redraw, bondlength, addlabel) {
        this.pushundo();
        if (bondlength != null)
            this.bondlength = bondlength;

        if (addlabel) {
            for (var i = 0; i < rxn.reactants.length; ++i)
                rxn.reactants[i].removeTextByFieldType("RXNLABEL");
            for (var i = 0; i < rxn.products.length; ++i)
                rxn.products[i].removeTextByFieldType("RXNLABEL");
        }

        this.m.setRxn(rxn, this.bondlength);
        this.calcTextRect();
        this.m._layoutRxn(rxn, this.bondlength);

        if (addlabel) {
            for (var i = 0; i < rxn.reactants.length; ++i)
                this.m._addRxnLabel(rxn.reactants[i], this.bondlength / 2);
            for (var i = 0; i < rxn.products.length; ++i)
                this.m._addRxnLabel(rxn.products[i], this.bondlength / 2);
        }

        this.fitToWindow(this.bondlength);
        if (redraw != false)
            this.redraw();
    },

    /**
    * Clear all contents
    * @function clear
    * @param {bool} redraw - indicate if redrawing the view wndow
    * @returns null
    */
    clear: function (redraw, fireevents) {
        var isempty = this.m.isEmpty();

        this.m.clear();
        this.curObject = null;
        if (redraw)
            this.redraw();
        this.resetScale();
        if (this.options.scale > 0)
            this.scale(this.options.scale);
        if (this.ink != null)
            this.ink.clear();

        if (!isempty) {
            if (fireevents && this.options.onClear != null)
                this.options.onClear();
        }
    },

    toggleAtom: function (p) {
        return this.m.toggleAtom(p, this.simpledraw ? JSDraw2.Editor.TOR : this.tor);
    },

    toggle: function (p) {
        return this.m.toggle(p, this.simpledraw ? JSDraw2.Editor.TOR : this.tor);
    },

    fixWedgeDir: function (b) {
        var atoms1 = this.m.getNeighborAtoms(b.a1, b.a2);
        var atoms2 = this.m.getNeighborAtoms(b.a2, b.a1);
        if ((atoms1.length == 0 || atoms1.length == 1) && atoms1.length < atoms2.length)
            b.reverse();
    },

    /**
    * Get the fragment containing a given atom
    * @function getFragment
    * @param {Atom} a - the given atom
    * @returns the fragement as a Mol object
    */
    getFragment: function (a) {
        var frags = this.m.splitFragments();
        for (var i = 0; i < frags.length; ++i) {
            if (frags[i].containsAtom(a))
                return frags[i];
        }
        return null;
    },

    /**
    * Get the center of a set of atoms
    * @function getCenter
    * @param {array} atoms - an array of atoms
    * @returns a Point object
    */
    getCenter: function (atoms) {
        var x = 0;
        var y = 0;
        if (atoms == null)
            atoms = this.m.atoms;
        if (atoms.length == 0)
            return null;

        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            x += a.p.x;
            y += a.p.y;
        }

        return new JSDraw2.Point(x / atoms.length, y / atoms.length);
    },

    /**
    * Rotate atoms around a point
    * @function rotate
    * @param {array} atoms - an array of atom
    * @param {Point} origin - rotating orgin
    * @param {deg} atoms - rotating degree
    * @returns null
    */
    rotate: function (atoms, origin, deg) {
        if (atoms == null)
            atoms = this.m.atoms;

        if (Math.abs(deg) < 0.1 || atoms.length == 0)
            return false;

        for (var i = 0; i < atoms.length; ++i)
            atoms[i].p.rotateAround(origin, deg);

        return true;
    },

    //    mousedown2: function (e) {
    //        // silverlight - simulate double-click
    //        if (this.options.popup) {
    //            var tm = new Date().getTime();
    //            if (this._lastMousedownTm != null && tm - this._lastMousedownTm < 300)
    //                this.dblclick();
    //            this._lastMousedownTm = tm;
    //        }
    //    },

    startResize: function (obj, p, ctrl, cmd) {
        if (obj.resize == null)
            return;

        var corner = obj.cornerTest(p, this.tor, ctrl, cmd);
        if (corner != null) {
            var list = [];
            this.resizing = { corner: corner, obj: obj, start: p, list: list };
            var br = JSDraw2.Bracket.cast(obj);
            if (br != null)
                this.resizing.texts = br.getTexts(this.m);
        }
    },

    getConnectingAtomBonds: function (list) {
        var links = [];
        if (list != null && list.length > 0) {
            var m = list[0]._parent;
            m.clearFlag();
            for (var i = 0; i < list.length; ++i)
                list[i].f = true;
            for (var i = 0; i < m.bonds.length; ++i) {
                var b = m.bonds[i];
                if (b.a1.f != b.a2.f) {
                    links.push({ a: b.a1.f ? b.a1 : b.a2, b: b });
                }
            }
        }
        return links;
    },

    mousewheel: function (e, viewonly) {
        if (!this.activated && !viewonly)
            return;

        var cmd = this.getCmd();
        if (cmd != "moveview")
            return;

        var delta = (e.wheelDelta || -e.detail || (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX));
        if (scil.Utils.isFirefox)
            delta *= 20.0;

        if (delta > 0 || delta < 0) {
            var p = this.eventPoint(e);
            this.scale(1.0 + delta / 500.0, p);
            if (!viewonly) {
                this.pushundo(null, "moveview");
                this.refresh(true);
            }
            else {
                this.redraw();
            }
        }

        if (scil.Utils.isFirefox) {
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
        e.preventDefault();
    },

    mousedown: function (e, viewonly) {
        if (!this.activated) {
            this.mousedownPoint = new JSDraw2.Point(e.clientX, e.clientY);
            if (viewonly && e.button == 0)
                this.start = this.eventPoint(e);
            return;
        }
        if (this.contextmenu != null && this.contextmenu.hide())
            return;

        JSDraw2.Menu.close();
        this.holding.start(e, this);

        //this.div.focus();
        if (!scil.Utils.isTouch && e.button != (scil.Utils.isIE8Lower ? 1 : 0))
            return;

        this.start = null;
        this.end = null;
        this.movingClone = null;
        this.resizing = null;
        this.lassolast = null;

        var cmd = this.getCmd();

        var tm = new Date().getTime();
        var tm0 = this._lastMousedownTm;
        this._lastMousedownTm = tm;
        if (tm - tm0 < JSDraw2.Editor.dblclickdelay && (cmd == "select" || cmd == "lasso" || cmd == "selfrag")) {
            if (this.surface.extra != null)
                this.surface.extra.lasso = null;
            this.mousedblclick(e);
            e.preventDefault();
            return;
        }

        var p = this.eventPoint(e);
        if (cmd == "moveview") {
            this.start = p;
            this.viewoffset = null;
            return;
        }

        if (scil.Utils.startswith(cmd, "spot-")) {
            this.start = p;
            return;
        }

        if (cmd == "inkred" || cmd == "inkblue" || cmd == "inkgreen") {
            if (this.ink == null) {
                this.surface.ink = this.createGroup();
                this.ink = new JSDraw2.Ink(this.surface.ink);
            }
            this.ink.start(cmd.substr(3), p);
            return;
        }

        var obj = this.toggle(p);
        if (cmd == "eraser") {
            this.start = p;
            this.erasercache = { count: 0, cloned: this.clone(), singleton: false };
            if (obj != null) {
                if (JSDraw2.TLC.cast(obj) != null) {
                    obj.cornerTest(p, this.tor, false, "eraser");
                    if (obj.curspot != null)
                        this.erasercache.singleton = true;
                }
                this.delObject(obj);
                ++this.erasercache.count;
                this.redraw();
            }
            this.div.style.cursor = "pointer";
            return;
        }

        this.curObject = obj;
        this.div.style.cursor = "crosshair";
        if (obj != null) {
            if (cmd == "select" || cmd == "lasso" || cmd == "selfrag" || (cmd == "tlc" || cmd == "electrophoresis") && JSDraw2.TLC.cast(obj) != null) {
                if (obj.selected && obj.resize != null && this.m.countSelected() == 1)
                    this.startResize(obj, p, e.ctrlKey || e.metaKey, cmd);

                if (this.resizing == null && !obj.selected) {
                    var a = null;
                    var g = null;
                    if (cmd == "selfrag") {
                        var a = JSDraw2.Atom.cast(obj);
                        var b = JSDraw2.Bond.cast(obj);
                        var g = JSDraw2.Group.cast(obj);
                        var br = JSDraw2.Bracket.cast(obj);
                        if (b != null)
                            a = b.a1;
                    }

                    if (!e.shiftKey)
                        this.m.setSelected(false);
                    if (a != null) {
                        // selfrag to select a fragment
                        if (a != null) {
                            var m = a._parent.getFragment(a, a._parent);
                            for (var i = 0; i < m.atoms.length; ++i)
                                m.atoms[i].selected = true;
                            for (var i = 0; i < m.bonds.length; ++i)
                                m.bonds[i].selected = true;
                        }

                        if (this.options.onselectionchanged != null)
                            this.options.onselectionchanged(this);
                        this.redraw();
                    }
                    else if (g != null) {
                        // selfrag to select group atoms
                        for (var i = 0; i < g._parent.atoms.length; ++i) {
                            if (g._parent.atoms[i].group == g)
                                g._parent.atoms[i].selected = true;
                        }
                    }
                    else if (br != null) {
                        // selfrag to select bracket atoms
                        for (var i = 0; i < br.atoms.length; ++i) {
                            if (br.atoms[i].group == g)
                                br.atoms[i].selected = true;
                        }
                    }
                    else {
                        obj.selected = true;
                        var b = JSDraw2.Bond.cast(obj);
                        if (b != null)
                            b.a1.selected = b.a2.selected = true;
                        else
                            this.startResize(obj, p, e.ctrlKey || e.metaKey, cmd == "tlc" || cmd == "electrophoresis");
                    }
                }

                if (cmd != "tlc" && cmd != "electrophoresis" || this.resizing != null) {
                    this.start = p;
                    this.movingClone = this.clone();
                    this.movingClone.startPt = p.clone();
                    this.div.style.cursor = "moveview";
                }

                if (cmd == "tlc" || cmd == "electrophoresis")
                    this.redraw();
                return;
            }
        }

        var a1 = JSDraw2.Atom.cast(obj);
        if (a1 != null) {
            p.x = a1.p.x;
            p.y = a1.p.y;
            p.atom = a1;
        }
        this.lastmove = this.start = p;
        if (this.start.tm == null)
            this.start.tm = new Date().getTime();

        if (cmd == "lasso" && obj == null) {
            if (!e.shiftKey && this.m.setSelected(false) > 0)
                this.redraw();
            this.lassolast = p;
            return;
        }

        if (cmd == "chain") {
            this.chaintool = { a: a1, start: this.start, p2: null, end: null, points: [] };
            return;
        }

        if (cmd == "rotate" && a1 == null && !this.m.isEmpty()) {
            var atoms = this.m.atoms;

            var list = [];
            for (var i = 0; i < atoms.length; ++i) {
                if (atoms[i].selected)
                    list.push(atoms[i]);
            }

            if (list.length == 0) {
                var center = this.getCenter(null);
                if (center != null)
                    this.rotating = { atoms: null, center: center };
            }
            else if (list.length == 1) {
                var center = list[0].p.clone();
                if (list.length == 1) {
                    var frag = this.getFragment(list[0]);
                    if (frag != null)
                        list = frag.atoms;
                }
                this.rotating = { atoms: list.length == 1 ? null : list, center: center };
            }
            else {
                var links = this.getConnectingAtomBonds(list, false);
                if (links.length == 1)
                    this.rotating = { atoms: list, center: links[0].a.p.clone() };
                else
                    this.rotating = { atoms: list, center: this.getCenter(list) };
            }

            if (this.rotating != null)
                this.rotating.cloned = this.clone();

            if (a1 != null) {
                this.m.setSelected();
                a1.selected = true;
                this.redraw();
            }
            return;
        }

        if (cmd == "arrow") {
            this.arrowtool = { from: obj };
            if (JSDraw2.Shape.cast(obj) != null) {
                var conn = obj.bestConnectPoint(this.start, this.tor);
                this.start = conn.p;
                this.arrowtool.connector = conn.connector;
            }
        }

        if (cmd != "rxnmap" && !(e.ctrlKey || e.metaKey)) {
            if (!e.shiftKey && this.m.setSelected() > 0)
                this.redraw();
        }
    },

    selectCurrent: function (obj, e) {
        if (this.curObject == obj)
            return false;

        this.curObject = obj;
        if (this.options.onselectcurrent != null)
            this.options.onselectcurrent(e, obj, this);

        if (this.options.showhelmpopup)
            this.onHelmSelectCurrent(e, obj);
        return true;
    },

    onHelmSelectCurrent: function (e, obj) {
        var a = JSDraw2.Atom.cast(obj);
        if (a == null || this.start != null || this.contextmenu != null && this.contextmenu.isVisible()) {
            org.helm.webeditor.MolViewer.hide();
            return;
        }
        var type = a == null ? null : a.biotype();
        if (type == null)
            return;
        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        var s = a == null ? null : a.elem;
        var m = set == null ? null : set[s.toLowerCase()];
        org.helm.webeditor.MolViewer.show(e, type, m, s, this, a);
    },

    mousemove: function (e, viewonly) {
        if (!this.activated) {
            //this.mousedownPoint = null;
            if (viewonly && this.start != null && !this.frozen) {
                var p = this.eventPoint(e);
                this.moveview(new JSDraw2.Point(p.x - this.start.x, p.y - this.start.y));
                e.preventDefault();
            }
            return;
        }
        this.holding.move(e);

        var cmd = this.getCmd();
        var p = this.eventPoint(e);

        if (cmd == "moveview") {
            if (this.start != null && e.button == 0) {
                this.moveview(new JSDraw2.Point(p.x - this.start.x, p.y - this.start.y));
                e.preventDefault();
            }
            return;
        }

        if (cmd == "inkblue" || cmd == "inkred" || cmd == "inkgreen") {
            if (this.ink != null)
                this.ink.add(p);
            return;
        }

        this.lastmove = p;
        var f = false;

        var obj = null;
        if (this.start == null || cmd != "select" && cmd != "lasso" && cmd != "selfrag") {
            obj = this.toggle(p);
            f = this.selectCurrent(obj, e);
        }

        if (this.start != null) {
            if (cmd == "arrow") {
                if (this.start != null) {
                    this.end = this.guessArrow(this.start, p);
                    f = true;
                }
            }
            else if (cmd == "zoombox" || cmd == "curve") {
                if (this.start != null) {
                    this.end = p;
                    f = true;
                }
            }
            else if (cmd == "rotate") {
                if (this.rotating != null) {
                    if (this.rotating.a1 == null) {
                        this.rotating.a0 = this.rotating.a1 = p.angleTo(this.rotating.center);
                    }
                    else {
                        var a2 = p.angleTo(this.rotating.center);
                        f = this.rotate(this.rotating.atoms, this.rotating.center, a2 - this.rotating.a1);
                        if (f)
                            f = "all";
                        this.rotating.a1 = a2;
                    }
                }
            }
            else if (cmd == "select" || cmd == "lasso" || cmd == "selfrag" || cmd == "tlc" || cmd == "electrophoresis") {
                if (this.start != null) {
                    if (this.lassolast) {
                        this.end = p;
                        this.lassoSelect(this.lassolast);
                        this.lassolast = p;
                    }
                    else if (this.resizing != null) {
                        if (!this.resizing.start.equalsTo(p)) {
                            var delta = p.clone().offset(-this.resizing.start.x, -this.resizing.start.y);
                            this.resizing.obj.resize(this.resizing.corner, delta, this.resizing.texts);
                            if (e.shiftKey && JSDraw2.Shape.cast(this.resizing.obj) != null)
                                this.resizing.obj._rect.height = this.resizing.obj._rect.width;
                            this.resizing.start = p;
                            this.resizing.changed = true;
                            f = "all";
                        }
                    }
                    else if (this.movingClone != null) {
                        if (this.end == null) {
                            this.end = this.start;
                            if (e.ctrlKey || e.metaKey) {
                                var m = this.m.clone(true);
                                m.showimplicithydrogens = this.options.showimplicithydrogens;
                                if (!m.isEmpty()) {
                                    this.m.setSelected();
                                    m.setSelected(true);
                                    m.calcHCount(true);
                                    this.m.mergeMol(m);
                                }
                            }
                        }

                        if (!this.end.equalsTo(p)) {
                            this.m.offset(p.x - this.end.x, p.y - this.end.y, true);
                            this.end = p;
                        }
                        f = "all";
                    }
                    else {
                        this.end = p;
                        f = true;
                    }
                }
            }
            else if (cmd == "rectangle" || cmd == "ellipse" || cmd == "diamond" || cmd == "dshape" || cmd == "dreversed") {
                if (e.shiftKey)
                    p.equalMove(this.start);
                this.end = p;
                f = true;
            }
            else if (cmd == "bracket" || cmd == "sgroup" || cmd == "assaycurve" || cmd == "spectrum" || cmd == "doublearrow" || cmd == "tlc" || cmd == "electrophoresis") {
                this.end = p;
                f = true;
            }
            else if (cmd == "chain") {
                this.end = p;
                f = this._makeChain(this.chaintool, p);
            }
            else if (cmd == "eraser") {
                if (this.erasercache != null && !this.erasercache.singleton) {
                    obj = this.toggle(p);
                    if (obj != null) {
                        this.delObject(obj);
                        ++this.erasercache.count;
                        f = "all";
                    }
                }
            }
            else if (scil.Utils.startswith(cmd, "spot-")) {
            }
            else {
                if (JSDraw2.Atom.cast(this.curObject) != null)
                    this.end = this.curObject.p.clone();
                else
                    this.end = this._guessBond(this.start, p);
                f = true;
            }
        }

        if (f != false && !(this.start != null && p.tm - this.start.tm < JSDraw2.Editor.undoGestureTime))
            this.redraw(f != "all");
    },

    mouseup: function (e, viewonly) {
        this.holding.end();

        if (!scil.Utils.isTouch && e.button == 2) {// right click
            if (!viewonly) {
                if (!this.activated)
                    this.activate(true);
            }

            if (this.touch.start1 == null) // Windows8 issue
                this.showContextMenu(e, viewonly);
            e.preventDefault();
            return;
        }

        if (!this.activated) {
            if (this.mousedownPoint != null && this.mousedownPoint.x == e.clientX && this.mousedownPoint.y == e.clientY)
                this.activate(true);
            if (viewonly && e.button == 0) {
                this.endMove(e, viewonly);
                e.preventDefault();
            }
            return;
        }

        var cmd = this.getCmd();

        if (cmd == "moveview") {
            this.endMove(e, viewonly);
            e.preventDefault();
            return;
        }

        if (cmd == "inkred" || cmd == "inkblue" || cmd == "inkgreen") {
            if (this.ink != null)
                this.ink.end();
            return;
        }

        if (this.start == null)
            return;
        this.div.style.cursor = "default";

        var p1 = this.start;
        var p2 = this.lastmove == null ? p1.clone() : this.lastmove;
        this.lastmove = null;
        this.start = null;

        // detect undo gesture
        var dx = Math.abs(p1.x - p2.x);
        if ((p2.tm - p1.tm < JSDraw2.Editor.undoGestureTime) && Math.abs(dx) > 2 * 10 && dx > 5 * Math.abs(p1.y - p2.y) && this.toggle(p1) == null && this.toggle(p2) == null) {
            if (p1.x > p2.x)
                this.undo();
            else
                this.redo();
            this.refresh(false);
            return;
        }

        var f = null;
        if (cmd == "text") {
            this.showTextEditor(this.curObject, new JSDraw2.Point(p2.x, p2.y));
            return;
        }

        if (cmd == "sgroup") {
            if (p1.equalsTo(p2)) {
                this.showTextEditor(this.curObject, new JSDraw2.Point(p2.x, p2.y));
            }
            else {
                var obj1 = p1.atom != null ? p1.atom : this.toggle(p1);
                var obj2 = this.toggle(p2);
                if (JSDraw2.Text.cast(obj1) != null) {
                    var cloned = this.clone();
                    if (obj1.attach(obj2))
                        this.pushundo(cloned);
                }
                this.refresh(true);
            }
            return;
        }

        if (cmd == "eraser") {
            if (this.erasercache != null) {
                if (this.erasercache.count > 0) {
                    this.pushundo(this.erasercache.cloned);
                    this.curObject = null;
                    if (this.helm != null)
                        this.helm.resetIDs();
                    this.refresh(true);
                }
                this.erasercache = null;
            }
            return;
        }

        if (cmd == "plus") {
            if (this.curObject == null) {
                this.pushundo();
                this.m.addGraphics(new JSDraw2.Plus(p2));
                this.refresh(true);
            }
            return;
        }

        if (cmd == "rxnmap") {
            this.doRxnMap(this.curObject);
            return;
        }

        var d = p1.distTo(p2);
        if (cmd == "arrow" || cmd == "curve") {
            if (this.arrowtool != null && this.arrowtool.from != null) {
                var from = JSDraw2.Shape.cast(this.arrowtool.from);
                var to = JSDraw2.Shape.cast(this.curObject);
                var connector = this.arrowtool.connector;
                this.arrowtool = null;
                if (from != null && from != to) {
                    if (connector == "rejector") {
                        if (from.reject != from) {
                            this.pushundo();
                            from.reject = to;
                            this.refresh(true);
                            return;
                        }
                    }
                    else {
                        this.pushundo();
                        if (to == null) {
                            var rect = from.rect();
                            var dx = 0;
                            var dy = 0;
                            var pp2 = p2.clone();
                            if (p2.x < p1.x)
                                pp2.x -= rect.width;
                            if (p2.y < p1.y)
                                pp2.y -= rect.height;
                            to = this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect(pp2.x, pp2.y, rect.width, rect.height), "rectangle"));
                        }

                        if (to != null) {
                            this.pushundo();
                            if (this.isShapeConnected(from, to)) {
                                scil.Utils.delFromArray(to.froms, from);
                            }
                            else {
                                if (this.isShapeConnected(to, from))
                                    scil.Utils.delFromArray(from.froms, to);

                                if (Math.abs(p1.y - p2.y) < this.tor) {
                                    if (this.isIsolatedShape(to)) {
                                        var dy = from._rect.center().y - to._rect.center().y;
                                        to._rect.offset(0, dy);
                                    }
                                    else if (this.isIsolatedShape(from)) {
                                        var dy = to._rect.center().y - from._rect.center().y;
                                        from._rect.offset(0, dy);
                                    }
                                }
                                else if (Math.abs(p1.x - p2.x) < this.tor) {
                                    if (this.isIsolatedShape(to)) {
                                        var dx = from._rect.center().x - to._rect.center().x;
                                        to._rect.offset(dx, 0);
                                    }
                                    else if (this.isIsolatedShape(from)) {
                                        var dx = to._rect.center().x - from._rect.center().x;
                                        from._rect.offset(dx, 0);
                                    }
                                }

                                to.froms.push(from);
                            }

                            this.refresh(true);
                            return;
                        }
                    }
                    this.refresh();
                    return;
                }
            }

            this.pushundo();
            if (d >= this.bondlength)
                p2 = this.guessArrow(p1, p2);
            else
                p2 = p1.clone().offset(3 * this.bondlength, 0);

            if (cmd == "arrow")
                this.m.addGraphics(new JSDraw2.Arrow(p1, p2));
            else
                this.m.addGraphics(new JSDraw2.Curve(p1, p2));
            this.refresh(true);
            return;
        }
        if (cmd == "rectangle" || cmd == "ellipse" || cmd == "doublearrow" || cmd == "diamond" || cmd == "dshape" || cmd == "dreversed") {
            if (d < this.bondlength / 8)
                p2 = new JSDraw2.Point(p1.x + this.bondlength, p1.y + this.bondlength);
            else if (d < this.bondlength / 2)
                return;

            this.pushundo();
            if (cmd == "rectangle")
                this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect().set(p1, p2), "rectangle"));
            else if (cmd == "ellipse")
                this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect().set(p1, p2), "ellipse"));
            else if (cmd == "diamond")
                this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect().set(p1, p2), "diamond"));
            else if (cmd == "dshape")
                this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect().set(p1, p2), "dshape"));
            else if (cmd == "dreversed")
                this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect().set(p1, p2), "dreversed"));
            else if (cmd == "doublearrow")
                this.m.addGraphics(new JSDraw2.Shape(new JSDraw2.Rect().set(p1, p2), "doublearrow"));
            this.refresh(true);
            return;
        }
        if (cmd == "assaycurve") {
            if (d < this.bondlength / 8 && this.m.isEmpty())
                p2 = new JSDraw2.Point(p1.x + this.bondlength * 8, p1.y + this.bondlength * 6);
            else if (Math.abs(p1.x - p2.x) < this.bondlength * 2 || Math.abs(p1.y - p2.y) < this.bondlength * 2)
                return;

            this.pushundo();
            this.m.addGraphics(new JSDraw2.AssayCurve(new JSDraw2.Rect().set(p1, p2)));
            this.refresh(true);
            return;
        }
        if (cmd == "spectrum") {
            if (d < this.bondlength / 8 && this.m.isEmpty())
                p2 = new JSDraw2.Point(p1.x + this.bondlength * 14, p1.y + this.bondlength * 6);
            else if (Math.abs(p1.x - p2.x) < this.bondlength * 2 || Math.abs(p1.y - p2.y) < this.bondlength * 2)
                return;

            this.pushundo();
            this.m.addGraphics(new JSDraw2.Spectrum(new JSDraw2.Rect().set(p1, p2)));
            this.refresh(true);
            return;
        }
        if (cmd == "tlc" || cmd == "electrophoresis") {
            var modified = false;
            if (this.movingClone == null) {
                if (d < this.bondlength / 2)
                    return;

                this.pushundo();
                var tlc = new JSDraw2.TLC.create(cmd, p1, p2, this.fontsize / 2);
                if (tlc.rect().height > 2 * this.bondlength && tlc.spots.length > 0) {
                    this.addTlcPlate(tlc);
                    modified = true;
                }
                this.refresh(modified);
                return;
            }
        }
        if (scil.Utils.startswith(cmd, "spot-")) {
            var tlc = JSDraw2.TLC.cast(this.curObject);
            var clone = this.clone();
            if (tlc != null && tlc.addSpot(cmd.substr(5), p2, this.tor)) {
                this.pushundo(clone);
                this.refresh(true);
            }
            return;
        }

        if (cmd == "rotate" && this.rotating != null) {
            if (this.rotating.a1 != this.rotating.a0) {
                this.pushundo(this.rotating.cloned);
                this.refresh(true);
            }
            this.rotating = null;
            return;
        }

        if (cmd == "select" || cmd == "lasso" || cmd == "selfrag" || cmd == "rotate" || cmd == "tlc" || cmd == "electrophoresis") {
            if (this.lassolast != null) {
                this.lassolast = null;
            }
            else if (this.resizing != null) {
                if (this.resizing.changed) {
                    this._bracketReselectAtoms();
                    this.pushundo(this.movingClone);
                    this.movingClone = null;
                    this.resizing = null;
                    f = true;
                }
            }
            else if (this.movingClone != null) {
                if (!this.movingClone.startPt.equalsTo(p2)) {
                    this._bracketReselectAtoms();
                    this.pushundo(this.movingClone);
                    this.mergeOverlaps();
                    this.movingClone = null;
                    f = true;
                }
            }
            else {
                if (d < this.bondlength) {
                    if (this.curObject != null)
                        this.curObject.selected = true;
                }
                else {
                    this.selectInRect(new JSDraw2.Rect().set(p1, p2));
                }
            }
            this.refresh(f);

            if (this.options.onselectionchanged != null)
                this.options.onselectionchanged(this);
            return;
        }

        if (cmd == "zoombox") {
            var rect = new JSDraw2.Rect().set(p1, p2);
            if (rect.width > 10 && rect.height > 10) {
                var s = Math.min(this.dimension.x / rect.width, this.dimension.y / rect.height);
                var c = rect.center();
                this.pushundo();
                this.scale(s * 0.9, c);
                this.m.offset(this.dimension.x / 2 - c.x, this.dimension.y / 2 - c.y);
            }
            else if (rect.width < 5 && rect.height < 5) {
                this.fitToWindow();
            }
            this.redraw();
            return;
        }

        if (cmd == "chain") {
            if (this.chaintool != null && this.chaintool.points.length > 0) {
                f = false;
                var cloned = this.clone();
                var pts = this.chaintool.points;
                var m = null;
                for (var i = 1; i < pts.length; ++i) {
                    var a1 = this.toggleAtom(pts[i - 1]);
                    var a2 = this.toggleAtom(pts[i]);
                    if (m == null) {
                        if (a1 != null)
                            m = a1._parent;
                        else if (a2 != null)
                            m = a2._parent;
                        else
                            m = this.m;
                    }
                    if (a1 != null && a1._parent != m)
                        a1 = null;
                    if (a2 != null && a2._parent != m)
                        a2 = null;

                    if (a1 == null) {
                        a1 = new JSDraw2.Atom(pts[i - 1]);
                        m.addAtom(a1);
                        this._addNewAtomInExistingGroup(a2, [a1]);
                        f = true;
                    }
                    if (a2 == null) {
                        a2 = new JSDraw2.Atom(pts[i]);
                        m.addAtom(a2);
                        this._addNewAtomInExistingGroup(a1, [a2]);
                        f = true;
                    }

                    if (m.findBond(a1, a2) == null) {
                        m.addBond(new JSDraw2.Bond(a1, a2), null, true);
                        f = true;
                    }
                }
                this.chaintool = null;
                if (f)
                    this.pushundo(cloned);
                this.refresh(f);
                return;
            }
        }

        if (cmd == "bracket") {
            this.m.setSelected(false);
            var r = new JSDraw2.Rect().set(p1, p2);
            var list = this.m.bracketSelect(r);
            if (list.length > 0) {
                this.pushundo();
                var br = new JSDraw2.Bracket(null, r);
                br.atoms = list;
                list[0]._parent.addGraphics(br);
                f = true;
            }
            this.refresh(f);

            if (br != null) {
                var t = br.createSubscript(this.m, "#");
                if (t != null)
                    this.showTextEditor(t, null, "");
            }
            return;
        }

        // atom properties
        if (cmd == "&#9679;") {
            var a;
            if ((a = JSDraw2.Atom.cast(this.curObject)) != null)
                this.showAtomDlg(a);
            else if ((a = JSDraw2.Bond.cast(this.curObject)) != null)
                this.showBondDlg(a);
            return;
        }

        if (cmd == "undo" || cmd == "redo" || cmd == "zoomin" || cmd == "zoomout")
            return;

        var cloned = this.clone();
        if (d <= this.tor) {
            // no mouse drag, this is just a click event
            if (scil.Utils.startswith(cmd, "template.")) {
                this.pushundo(cloned);
                this.addTemplate(cmd.substr(9), this.curObject, p2);
                this.refresh(true);
                return;
            }

            var a;
            if ((a = JSDraw2.Atom.cast(this.curObject)) != null) {
                var e = JSDraw2.PT[cmd];
                if (cmd == "antibody" || cmd == "protein" || cmd == "gene")
                    f = this.m.setAtomType(a, cmd);
                else if (e != null)
                    f = this.m.setAtomType(a, cmd);
                else if (cmd == "..." || cmd == "more")
                    f = this.m.setAtomType(a, this.ptElement);
                else if (cmd == "chargep" || cmd == "chargen")
                    f = this.increaseNum(a, cmd == "chargep" ? +1 : -1);
                else if (this.helm != null && this.helm != null && this.helm.isHelmCmd(cmd)) {
                    if (scil.helm.isHelmNode(a))
                        this.helm.changeMonomer(a, cloned);
                }
                else {
                    if (this.helm != null && scil.helm.isHelmNode(a))
                        this.helm.changeMonomer(a, cloned);
                    else
                        f = this._addAutoBond(a, cmd);
                }
            }

            var b;
            if ((b = JSDraw2.Bond.cast(this.curObject)) != null) {
                switch (cmd) {
                    case "double":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.DOUBLE);
                        break;
                    case "triple":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.TRIPLE);
                        break;
                    case "unknown":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.UNKNOWN);
                        break;
                    case "dummy":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.DUMMY);
                        break;
                    case "either":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.EITHER);
                        break;
                    case "wiggly":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.WIGGLY);
                        break;
                    case "bold":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.BOLD);
                        break;
                    case "boldhash":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.BOLDHASH);
                        break;
                    case "delocalized":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.DELOCALIZED);
                        break;
                    case "singledouble":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.SINGLEORDOUBLE);
                        break;
                    case "singlearomatic":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.SINGLEORAROMATIC);
                        break;
                    case "doublearomatic":
                        f = this.m.setBondType(b, JSDraw2.BONDTYPES.DOUBLEORAROMATIC);
                        break;
                    case "up":
                        if (b.type == JSDraw2.BONDTYPES.WEDGE) {
                            b.reverse();
                            f = true;
                        }
                        else {
                            f = this.m.setBondType(b, JSDraw2.BONDTYPES.WEDGE);
                            this.fixWedgeDir(b);
                        }
                        break;
                    case "down":
                        if (b.type == JSDraw2.BONDTYPES.HASH) {
                            b.reverse();
                            f = true;
                        }
                        else {
                            f = this.m.setBondType(b, JSDraw2.BONDTYPES.HASH);
                            this.fixWedgeDir(b);
                        }
                        break;
                    default:
                        f = this.m.setBondType(b, b.type == JSDraw2.BONDTYPES.SINGLE ? JSDraw2.BONDTYPES.DOUBLE : JSDraw2.BONDTYPES.SINGLE);
                        break;
                }
            }

            if (!f && this.curObject == null) {
                if (this.options.helmtoolbar && !this.helm.isHelmCmd(cmd))
                    return;

                var bondtype = this.Cmd2BondType(cmd);
                if (bondtype != null) {
                    var a1 = this.m.addAtom(new JSDraw2.Atom(p2));
                    var p = p2.clone().offset(this.bondlength, 0).rotateAround(p2, -30);
                    var a2 = JSDraw2.Atom.cast(this.toggle(p));
                    if (a2 == null)
                        a2 = this.m.addAtom(new JSDraw2.Atom(p));
                    this.m.addBond(new JSDraw2.Bond(a1, a2));
                    f = true;
                }
            }

            // draw isolated atom
            if (!f && this.curObject == null) {
                var s = cmd == "more" || cmd == "..." ? this.ptElement : cmd;
                var e = JSDraw2.PT[s];
                if (e != null && e.a > 0 || cmd == "antibody" || cmd == "protein" || cmd == "gene" || this.helm != null && this.helm.isHelmCmd(cmd)) {
                    var a = this.m.addAtom(new JSDraw2.Atom(p2));
                    if (cmd == "antibody") {
                        a.bio = { type: JSDraw2.BIO.ANTIBODY };
                        a.elem = "X";
                    }
                    else if (cmd == "protein") {
                        a.bio = { type: JSDraw2.BIO.PROTEIN };
                        a.elem = "X";
                    }
                    else if (cmd == "gene") {
                        a.bio = { type: JSDraw2.BIO.GENE };
                        a.elem = "X";
                    }
                    else if (this.helm != null && this.helm.createIsolatedMonomer(cmd, a)) {
                        ;
                    }
                    else {
                        this.m.setAtomType(a, s);
                    }
                    f = true;
                }
            }

            if (f) {
                this.pushundo(cloned);
                this.refresh(f);
            }
            return;
        }

        var a1 = JSDraw2.Atom.cast(p1.atom != null ? p1.atom : this.toggle(p1));
        var a2 = JSDraw2.Atom.cast(this.toggle(p2));
        if (a1 != null && a2 != null) {
            if (a1._parent != a2._parent) {
                scil.Utils.alert("Cannot create bond between the two atoms");
                return;
            }
        }

        if (this.options.helmtoolbar) {
            if (this.helm.connnectGroup(p1, this.curObject)) {
                this.pushundo(cloned);
                this.redraw();
                return;
            }

            if ((a1 == null || a2 == null) && this.helm != null && !this.helm.isHelmCmd(cmd)) {
                if (cmd == "single") {
                    if (this.helm.connnectGroup(p1, this.curObject))
                        this.pushundo(cloned);
                }
                this.redraw();
                return;
            }

            if (this.helm != null && this.helm.isHelmCmd(cmd)) {
                if (a1 != null && a2 == null) {
                    this.helm.extendChain(a1, cmd, p1, p2, cloned);
                    return;
                }
                else if (a1 == null && a2 == null) {
                    this.redraw();
                    return;
                }
            }
        }

        var m = a1 != null ? a1._parent : (a2 != null ? a2._parent : this.m);
        this.pushundo(cloned);
        var c1 = this._countAABonds(a1);
        var ao1 = a1;
        if (a1 == null) {
            if (c1 != null) {
                // add H or OH on peptide terminal Amino Acid
                if (c1.peptideN == 0 && c1.others == 0)
                    a1 = m.addAtom(new JSDraw2.Atom(p1, "H"));
                else if (c1.peptideC == 0 && c1.others == 0)
                    a1 = m.addAtom(new JSDraw2.Atom(p1, "O"));
            }
            else {
                a1 = m.addAtom(new JSDraw2.Atom(p1));
            }
        }

        var c2 = this._countAABonds(a2);
        var ao2 = a2;
        if (a2 == null) {
            p2 = this._guessBond(p1, p2);
            if (c1 != null) {
                // add H or OH on peptide terminal Amino Acid
                if (c1.peptideN == 0 && c1.others == 0)
                    a2 = m.addAtom(new JSDraw2.Atom(p2, "H"));
                else if (c1.peptideC == 0 && c1.others == 0)
                    a2 = m.addAtom(new JSDraw2.Atom(p2, "O"));
            }
            else {
                a2 = m.addAtom(new JSDraw2.Atom(p2));
            }
        }

        if (a1 != null && a2 != null) {
            this._addNewAtomInExistingGroup(ao1, [a2]);
            this._addNewAtomInExistingGroup(ao2, [a1]);

            var b = this.m.findBond(a1, a2);
            if (b == null) {
                if (ao1 != null && ao2 != null && ao1._parent != ao2._parent) {
                    scil.Utils.alert("Cannot create bond between the two atoms");
                }
                else if (this.helm != null && (scil.helm.isHelmNode(a1) || scil.helm.isHelmNode(a2))) {
                    this.helm.connectFragment(a1, a2, !scil.helm.isHelmNode(a1) || !scil.helm.isHelmNode(a2));
                }
                else {
                    var bondtype = this.Cmd2BondType(cmd);
                    if (bondtype == null)
                        bondtype == JSDraw2.BONDTYPES.SINGLE;
                    if (c1 != null && c2 != null) {
                        // connect two amino acids
                        if (c1.peptideN == 0 && c2.peptideC == 0)
                            b = new JSDraw2.Bond(a1, a2, JSDraw2.BONDTYPES.PEPTIDE); // peptide bond
                        else if (c2.peptideN == 0 && c1.peptideC == 0)
                            b = new JSDraw2.Bond(a2, a1, JSDraw2.BONDTYPES.PEPTIDE); // reversed peptide bond
                        else if (ao1.elem == "C" && ao2.elem == "C" && c1.disulfide == 0 && c2.disulfide == 0)
                            b = new JSDraw2.Bond(a1, a2, JSDraw2.BONDTYPES.DISULFIDE);
                        else if (ao1.elem == "K" && c1.amide == 0 && c2.peptideC == 0)
                            b = new JSDraw2.Bond(a1, a2, JSDraw2.BONDTYPES.AMIDE); // amide bond to K
                        else if (ao2.elem == "K" && c2.amide == 0 && c1.peptideC == 0)
                            b = new JSDraw2.Bond(a2, a1, JSDraw2.BONDTYPES.AMIDE); // reversed amide bond to K
                    }
                    else if (c1 != null) {
                        // connect one amino acid to structure
                        if (c1.peptideN + c1.peptideC + c1.others < 2)
                            b = new JSDraw2.Bond(a1, a2, a2.elem == "H" ? JSDraw2.BONDTYPES.PEPTIDE : JSDraw2.BONDTYPES.SINGLE);
                        else if (ao1.elem == "C" && c1.disulfide == 0)
                            b = new JSDraw2.Bond(a1, a2, JSDraw2.BONDTYPES.DISULFIDE); // using sulfide bond to C
                        else if (ao1.elem == "K" && c1.amide == 0)
                            b = new JSDraw2.Bond(a1, a2, JSDraw2.BONDTYPES.AMIDE); // using amide bond to K
                    }
                    else if (c2 != null) {
                        // connect one amino acid to structure
                        if (c2.peptideN + c2.peptideC + c2.others < 2)
                            b = new JSDraw2.Bond(a2, a1, a1.elem == "H" ? JSDraw2.BONDTYPES.PEPTIDE : JSDraw2.BONDTYPES.SINGLE);
                        else if (ao2.elem == "C" && c2.disulfide == 0)
                            b = new JSDraw2.Bond(a2, a1, JSDraw2.BONDTYPES.DISULFIDE); // using sulfide bond to C
                        else if (ao2.elem == "K" && c2.amide == 0)
                            b = new JSDraw2.Bond(a2, a1, JSDraw2.BONDTYPES.AMIDE); // using amide bond to K
                    }
                    else {
                        b = new JSDraw2.Bond(a1, a2, bondtype);
                    }
                }

                if (b != null)
                    m.addBond(b, bondtype != JSDraw2.BONDTYPES.DUMMY, true);
            }
        }

        this.start = null;
        this.refresh(b != null);
    },

    _bracketReselectAtoms: function () {
        var br = JSDraw2.Bracket.cast(this.curObject);
        if (br == null)
            return;

        var list = this.m.bracketSelect(br.rect());
        if (list != null && list.length > 0)
            br.atoms = list;
    },

    _addNewAtomInExistingGroup: function (olda, atoms) {
        if (olda == null)
            return;

        for (var k = 0; k < atoms.length; ++k) {
            var a = atoms[k];
            if (a == null)
                continue;

            // attach to existing groups
            if (olda.group != null && a.group == null)
                a.group = olda.group;

            // attach to existing brackets
            for (var i = 0; i < this.m.graphics.length; ++i) {
                var br = JSDraw2.Bracket.cast(this.m.graphics[i]);
                if (br == null || br.atoms == null)
                    continue;

                if (scil.Utils.indexOf(br.atoms, olda) >= 0 && scil.Utils.indexOf(br.atoms, a) < 0)
                    br.atoms.push(a);
            }
        }
    },

    mousedblclick: function (e) {
        if (this.options.viewonly)
            return;

        var p = this.eventPoint(e);
        var obj = this.toggle(p);
        if (obj == null)
            return;

        var a = JSDraw2.Atom.cast(obj);
        if (a == null) {
            var b = JSDraw2.Bond.cast(obj);
            if (b != null)
                a = b.a1;
        }

        if (a == null)
            return;

        this.m.setSelected(false);
        var m = a._parent.getFragment(a, a._parent);
        for (var i = 0; i < m.atoms.length; ++i)
            m.atoms[i].selected = true;
        for (var i = 0; i < m.bonds.length; ++i)
            m.bonds[i].selected = true;

        this.refresh(false);
    },

    endMove: function (e, viewonly) {
        if (this.start == null)
            return;

        var p = this.eventPoint(e);
        var d = new JSDraw2.Point(p.x - this.start.x, p.y - this.start.y);
        this.start = null;
        this.moveview(null);

        if (d.x != 0 || d.y != 0) {
            if (!viewonly)
                this.pushundo();
            this.m.offset(d.x, d.y);
            if (viewonly)
                this.redraw();
            else
                this.refresh(true);
        }
    },

    isIsolatedShape: function (n) {
        if (n.froms.length > 0)
            return false;

        for (var i = 0; i < this.m.graphics.length; ++i) {
            var s = JSDraw2.Shape.cast(this.m.graphics[i]);
            if (s != null && scil.Utils.indexOf(s.froms, n) >= 0)
                return false;
        }

        return true;
    },

    isShapeConnected: function (from, to) {
        if (from == null || to == null)
            return false;

        for (var i = 0; i < to.froms.length; ++i) {
            if (to.froms[i] == from)
                return true;
        }
        return false;
    },

    _countAABonds: function (a) {
        if (a == null || a.biotype() != JSDraw2.BIO.AA)
            return null;

        var ret = { peptideN: 0, peptideC: 0, disulfide: 0, amide: 0, others: 0 };
        var list1 = this.m.getAllBonds(a);
        for (var i = 0; i < list1.length; ++i) {
            if (list1[i].type == JSDraw2.BONDTYPES.PEPTIDE) {
                if (list1[i].a1 == a)
                    ++ret.peptideN;
                else
                    ++ret.peptideC;
            }
            else if (list1[i].type == JSDraw2.BONDTYPES.DISULFIDE) {
                ++ret.disulfide;
            }
            else if (list1[i].type == JSDraw2.BONDTYPES.AMIDE) {
                ++ret.amide;
            }
            else if (list1[i].type == JSDraw2.BONDTYPES.SINGLE) {
                var oa = list1[i].otherAtom(a);
                if (oa.bio == null)
                    ++ret.others;
            }
        }
        return ret;
    },

    addTlcPlate: function (tlc) {
        if (tlc == null || !(tlc.spots.length > 0))
            return;

        var tlcsetting = null;
        if (JSDraw2.defaultoptions != null && JSDraw2.defaultoptions.tlc != null && tlc.type != "electrophoresis") {
            tlcsetting = JSDraw2.defaultoptions.tlc;
            var scale = tlc.spotsize / (JSDraw2.Editor.FONTSIZE / 2);
            if (tlcsetting.width > 0)
                tlc._rect.width = tlcsetting.width * scale;
            if (tlcsetting.height > 0)
                tlc._rect.height = tlcsetting.height * scale;

            var list = this.getAllTlcPlates(true);
            if (list != null && list.length > 0) {
                var prev = list[list.length - 1];
                var gap = tlcsetting.gap > 0 ? tlcsetting.gap : tlcsetting.width / 5;
                tlc._rect.left = prev._rect.right() + gap;
                tlc._rect.top = prev._rect.top
            }
        }
        this.m.addGraphics(tlc);
        if (tlcsetting != null && tlcsetting.autonumbering)
            this.numberTlcPlates();

        if (this.options.onAddTLC != null)
            this.options.onAddTLC(tlc);

        this.moveCenter();
    },

    hideChirarlities: function (selectonly) {
        var texts = [];
        for (var i = 0; i < this.m.graphics.length; ++i) {
            var t = JSDraw2.Text.cast(this.m.graphics[i]);
            if (t != null && t.anchors != null && t.anchors.length == 1 && t.fieldtype == "CHIRAL") {
                var a = JSDraw2.Atom.cast(t.anchors[0]);
                if (!selectonly || a.selected)
                    texts.push(t);
            }
        }

        if (texts.length > 0) {
            for (var i = 0; i < texts.length; ++i)
                this.m.delGraphics(texts[i]);
            this.pushundo();
            this.refresh(true);
        }
    },

    detectChiralities: function (selectonly) {
        var me = this;
        JSDraw2.JSDrawIO.callWebservice("mol.getchiralatoms", { mol: this.getXml(), format: "xml" }, function (ret) {
            var n = 0;
            var cloned = me.clone();
            for (var k in ret) {
                var id = parseInt(k);
                var a = me.m.getObjectById(id);
                if ((!selectonly || a.selected) && me.m.markChirality(a, ret[k], me.bondlength))
                    ++n;
            }
            if (n > 0) {
                me.pushundo(cloned);
                me.refresh(true);
            }
        });
    },

    increaseNum: function (a, delta) {
        if (delta != 1 && delta != -1)
            return false;
        var f = false;
        if (a.elem == "R") {
            var r = scil.Utils.parseIndex(a.alias);
            if (r == null || r.index == null) {
                f = a._parent.setAtomAlias(a, (r == null || r.prefix == null ? "R" : r.prefix) + "1");
            }
            else {
                if (delta > 0) {
                    f = a._parent.setAtomAlias(a, r.prefix + (r.index + 1));
                }
                else {
                    if (r.index > 1)
                        f = a._parent.setAtomAlias(a, r.prefix + (r.index - 1));
                }
            }
        }
        else {
            f = a._parent.setAtomCharge(a, a.charge + delta);
        }
        return f;
    },

    mergeOverlaps: function () {
        var overlaps = [];
        for (var i = 0; i < this.m.atoms.length; ++i) {
            if (this.m.atoms[i].selected) {
                var a1 = this.m.atoms[i];
                for (var k = 0; k < this.m.atoms.length; ++k) {
                    var a2 = this.m.atoms[k];
                    if (!a2.selected && a2.toggle(a1.p, this.tor)) {
                        overlaps.push({ a1: a1, a2: a2 });
                        break;
                    }
                }
            }
        }

        var bonds = [];
        for (var k = 0; k < overlaps.length; ++k) {
            var a1 = overlaps[k].a1;
            var a2 = overlaps[k].a2;
            var b = this.m.findBond(a1, a2);
            if (b != null) {
                bonds.push(b);
                continue;
            }

            for (var i = 0; i < this.m.bonds.length; ++i) {
                b = this.m.bonds[i];
                if (b.a1 == a1) {
                    if (b.a2 != a2) {
                        var t = this.m.findBond(b.a2, a2);
                        b.a1 = a2;
                        if (t != null)
                            bonds.push(b);
                    }
                }
                else if (b.a2 == a1) {
                    if (b.a1 != a2) {
                        var t = this.m.findBond(b.a1, a2);
                        b.a2 = a2;
                        if (t != null)
                            bonds.push(b);
                    }
                }
            }
        }

        for (var i = 0; i < bonds.length; ++i)
            this.m.delBond(bonds[i], false);
        for (var i = 0; i < overlaps.length; ++i)
            this.m.delAtom(overlaps[i].a1, false);

        return bonds.length + overlaps.length;
    },

    onDel: function () {
        if (this.texteditor.ed != null && this.texteditor.ed.input.style.display != "none")
            return false;

        var cloned = this.clone();
        if (this.delObject(this.curObject) || this.delSelected() > 0) {
            this.pushundo(cloned);
            if (this.helm != null)
                this.helm.resetIDs();
            this.curObject = null;
            this.refresh(true);
            return true;
        }

        return false;
    },

    showContextMenu: function (e, viewonly) {
        if (this.options.showcontextmenu == false)
            return;

        var items = org.helm.webeditor.Interface.onContextMenu(this, e, viewonly);
        if (items == null)
            return;

        var me = this;
        if (this.contextmenu == null)
            this.contextmenu = new JSDraw2.ContextMenu(items, function (cmd, obj) { me.menuCallback(cmd, obj); });
        var scrolloffset = scil.Utils.scrollOffset();
        this.contextmenu.show(e.clientX + scrolloffset.x, e.clientY + scrolloffset.y, this.curObject, items);
        this.contextmenu.pos = this.eventPoint(e);
    },

    menuSetStereochemistry: function (cmd) {
        if (cmd == "abs")
            cmd = null;

        this.pushundo();
        if (this.m.chiral == cmd)
            this.m.chiral = null;
        else
            this.m.chiral = cmd;
        this.refresh(true);
    },

    menuCallback: function (cmd, obj) {
        var modified = false;
        var cloned = this.clone();
        switch (cmd) {
            //            case "Chiral":                                                                                                       
            //                this.pushundo();                                                                                                       
            //                this.m.chiral = !this.m.chiral;                                                                                                       
            //                this.refresh(true);                                                                                                       
            //                break;                                                                                                       
            case "curveline":
                obj.setAssayCurveLine(this);
                break;
            case "curveonly":
                obj.setAssayCurveOnly(this);
                break;
            case "overlaycurves":
                this.overlayCurves2(obj);
                break;
            case "setrawassaydata":
                obj.setAssayCurveRawData(this);
                break;
            case "spectrum_setdata":
                obj.setSpectrumData(this);
                break;
            case "spectrum_setdatafromfile":
                obj.setSpectrumDataFromFile(this);
                break;
            case "spectrum_attributes":
                obj.viewAttributes(this);
                break;
            case "maskassaysamplepoint":
                modified = obj.maskSamplePoint(obj.curspot);
                break;
            case "pastechemdraw":
                JSDraw2.ChemDraw.paste(this);
                break;
            case "pastechemdrawasproduct":
                JSDraw2.ChemDraw.paste(this, "product");
                break;
            case "pastechemdrawasreactant":
                JSDraw2.ChemDraw.paste(this, "reactant");
                break;
            case "copychemdraw":
                JSDraw2.ChemDraw.copy(this);
                break;
            case "copymolfile":
                this.copyAs("molfile");
                break;
            case "copymolfile2000":
                this.copyAs("molfile2000");
                break;
            case "copymolfile3000":
                this.copyAs("molfile3000");
                break;
            case "copysmiles":
                this.copyAs("smiles");
                break;
            case "pastemolfile":
                this.pasteAs("molfile");
                break;
            case "about":
                JSDraw2.Editor.showAbout();
                break;
            case "abouthelm":
                scil.helm.about();
                break;
            case "removeatomvalues":
                this.removeAtomValues();
                break;
            case "viewlarge":
                this.viewLarge();
                break;
            case "movecenter":
                this.moveCenter();
                this.redraw();
                break;
            case "atom_prop":
                if ((a = JSDraw2.Atom.cast(obj)) != null)
                    this.showAtomDlg(a);
                break;
            case "atom_tag":
                var s = obj.bio == null ? "Atom " + obj.elem : obj.bio.type;
                if (obj.bio != null && obj.bio.subtype != null)
                    s += " " + obj.bio.subtype;
                this.addTag(obj, obj.p, s, true);
                break;
            case "helm_set_sense":
                if (obj.bio.annotation != "5'ss") {
                    obj.bio.annotation = "5'ss";
                    modified = true;
                }
                break;
            case "helm_set_antisense":
                if (obj.bio.annotation != "5'as") {
                    obj.bio.annotation = "5'as";
                    modified = true;
                }
                break;
            case "helm_set_clear":
                if (obj.bio.annotation != "5'") {
                    obj.bio.annotation = "5'";
                    modified = true;
                }
                break;
            case "helm_complementary_strand":
                if (scil.Utils.startswith(obj.bio.annotation, "5'"))
                    modified = this.helm.makeComplementaryStrand(obj) != null;
                break;
            case "helm_create_group":
                modified = this.helm.createGroup(obj, null, true) != null;
                break;
            case "helm_group_collapse":
                modified = this.helm.collapseGroup(obj, true) != null;
                break;
            case "helm_bond_prop":
                this.helm.setBondProp(obj);
                break;
            case "helm_atom_prop":
                this.helm.setAtomProp(obj);
                break;
            case "group_setproperties":
                this.setGroupProperties(obj);
                break;
            case "detectstereochemistry":
                this.detectChiralities(true);
                break;
            case "hidestereochemistry":
                this.hideChirarlities(true);
                break;
            case "detectstereochemistry2":
                this.detectChiralities();
                break;
            case "hidestereochemistry2":
                this.hideChirarlities();
                break;
            case "bond_prop":
                if ((a = JSDraw2.Bond.cast(obj)) != null)
                    this.showBondDlg(a);
                break;
            case "bond_tag":
                this.addTag(obj, obj.center(), "[None]", true);
                break;
            case "bond_locant":
                this.addTag(obj, obj.center(), "U = Unknown Locant");
                break;
            case "bio_showsequence":
                this.showSequences(obj);
                break;
            case "rgroup_define":
                this.rgroupDefine(obj);
                break;
            case "rgroup_remove":
                var a = JSDraw2.Atom.cast(obj);
                if (a != null && a.rgroup != null) {
                    a.rgroup = null;
                    modified = true;
                }
                break;
            case "rgroup_addstructure":
                this.addRgroupStructure(obj);
                modified = true;
                break;
            case "setbracketratio":
                this.setBracketRatio(obj);
                break;
            case "setbracketmw":
                this.setBracketData(obj, "POLYMER_MW", "MW=", 1);
                break;
            case "registrationparent":
                this.setBracketData(obj, "REG_PARENT", "Parent=", 2);
                break;
            case "graphics_bring2front":
                modified = this.m.setZOrder(obj, -1);
                break;
            case "graphics_set2back":
                modified = this.m.setZOrder(obj, 0);
                break;
            case "tlc_addlane":
                modified = JSDraw2.TLC.cast(obj) != null && obj.addLane();
                break;
            case "tlc_duplicatespot":
                modified = JSDraw2.TLC.cast(obj) != null && obj.duplicateSpot(obj.curspot);
                break;
            case "tlc_duplicatelane":
                modified = JSDraw2.TLC.cast(obj) != null && obj.duplicateLane(obj.curspot);
                break;
            case "tlc_showlanelabel":
                modified = JSDraw2.TLC.cast(obj) != null && obj.showLaneLabel(!obj.showlanelabel);
                break;
            case "tlc_removespot":
                modified = JSDraw2.TLC.cast(obj) != null && obj.removeSpot(obj.curspot);
                break;
            case "tlc_setrfvalue":
                modified = JSDraw2.TLC.cast(obj) != null && obj.setRfValue(obj.curspot, this);
                break;
            case "tlc_setlanelabels":
                JSDraw2.TLC.setLaneLabels(this, obj);
                break;
            case "Copy":
                this.copy();
                break;
            case "Select All":
                if (this.selectAll())
                    this.refresh(false);
                break;
            case "copy-viewonly":
                this.copy(cloned == null ? null : cloned.mol);
                break;
            case "Cut":
                if (this.cut())
                    this.refresh(false);
                break;
            case "edit-popup":
                if (this.options.popup)
                    this.dblclick();
                break;
            case "Expand":
                this.expandSuperatom();
                break;
            case "Paste":
                if (this.paste(this.contextmenu.pos))
                    this.refresh(false);
                break;
            case "Delete":
                modified = this.delSelected() > 0;
                break;
            case "multi-center":
                modified = this.createMulticenter() != null;
                break;
            case "Clear":
                this.clear(false, true);
                modified = true;
                break;
            case "Undo":
                if (this.undo())
                    this.refresh(false);
                break;
            case "Redo":
                if (this.redo())
                    this.refresh(false);
                break;
            case "workflow_properties":
                JSDraw2.Shape.showProperties(this, JSDraw2.Shape.cast(obj));
                break;
        }

        if (modified) {
            this.pushundo(cloned);
            this.refresh(modified);
        }
    },

    overlayCurves2: function (curve) {
        curve = JSDraw2.AssayCurve.cast(curve);
        if (curve == null)
            return;

        var list = [];
        for (var i = 0; i < this.m.graphics.length; ++i) {
            var c = JSDraw2.AssayCurve.cast(this.m.graphics[i]);
            if (c != null && c.selected)
                list.push(c);
        }
        this.overlayCurves(list, curve);
    },

    overlayCurves: function (list, curve) {
        if (scil.Utils.indexOf(list, curve) < 0)
            return;

        this.pushundo();
        for (var i = 0; i < list.length; ++i) {
            list[i].curveline = false;
            if (list[i] == curve) {
                list[i].curveonly = false;
            }
            else {
                list[i]._rect = curve._rect.clone();
                list[i].curveonly = true;
            }
        }

        this.refresh(true);
    },

    setGroupProperties: function (obj) {
        var g = JSDraw2.Group.cast(obj);
        if (g == null)
            return;

        var me = this;
        if (this.groupPropDlg == null) {
            var me = this;
            var fields = { ratio: { label: "Ratio", type: "number", accepts: "(and)|(or)|[*|?]", width: 100 }, tag: { label: "Annotation", width: 300} };
            this.groupPropDlg = scil.Form.createDlgForm("Group Properties", fields, { label: "Save", onclick: function () { me.setGroupProperties2(); } });
        }
        this.groupPropDlg.show();
        this.groupPropDlg.form.setData({ ratio: g.ratio, tag: g.tag });
        this.groupPropDlg.g = g;
    },

    setGroupProperties2: function () {
        var data = this.groupPropDlg.form.getData();
        var g = this.groupPropDlg.g;
        if (data.ratio != "" && this.hasGroupBond(g))
            data.ratio = "";

        if ((g.ratio == null ? "" : g.ratio + "") != data.ratio || g.tag != data.tag) {
            this.pushundo();
            g.ratio = data.ratio;
            g.tag = data.tag;
            this.groupPropDlg.hide();
            this.refresh(true);
        }
    },

    hasGroupBond: function (g) {
        var list = g.a == null ? null : this.m.getAllBonds(g.a);
        return list != null && list.length > 0;
    },

    copyAs: function (fmt) {
        var s = null;
        switch (fmt) {
            case "molfile":
                s = this.getMolfile();
                break;
            case "molfile2000":
                s = this.getMolfile(false);
                break;
            case "molfile3000":
                s = this.getMolfile(true);
                break;
            case "smiles":
                s = this.getSmiles(true);
                break;
        }

        if (scil.Utils.isNullOrEmpty(s)) {
            scil.Utils.alert("Nothing placed on clipboard");
            return;
        }

        scil.Clipboard.copy(s);
    },

    pasteAs: function (fmt) {
    },

    rgroupDefine: function (obj) {
        JSDraw2.needPro();
    },

    createMulticenter: function () {
        JSDraw2.needPro();
    },

    viewLarge: function () {
        var label = this.options.viewonly ? "Dismiss" : "Save";
        JSDraw2.Editor.showPopup("View Structure", label, null, { value: this.clone(), format: "clone" });
    },

    removeAtomValues: function () {
        var cloned = null;
        for (var i = 0; i < this.m.atoms.length; ++i) {
            var a = this.m.atoms[i];
            if (a.tag != null && a.tag != "") {
                if (cloned == null)
                    cloned = this.clone();
                a.tag = null;
            }
        }

        if (cloned != null) {
            this.pushundo(cloned);
            this.refresh(true);
        }
        return cloned != null;
    },

    /**
    * Select all object
    * @function selectAll
    * @returns true or false
    */
    selectAll: function () {
        var f = this.m.setSelected(true) > 0;
        if (this.options.onselectionchanged != null)
            this.options.onselectionchanged(this);
        return f;
    },

    addRgroupStructure: function (rgroup) {
        JSDraw2.needPro();
    },

    menuTLCSetSpotShape: function (obj, shape, size) {
        JSDraw2.needPro();
    },

    menuTLCSetSpotSize: function (obj, size) {
        JSDraw2.needPro();
    },

    menuTLCLabel: function (obj, cmd) {
        JSDraw2.needPro();
    },

    menuTLCSetLabel: function (obj, cmd) {
        JSDraw2.needPro();
    },

    menuTLCFill: function (obj, cmd) {
        JSDraw2.needPro();
    },

    menuShapeType: function (obj, cmd) {
        JSDraw2.needPro();
    },

    menuAlignShapes: function (obj, cmd) {
        JSDraw2.needPro();
    },

    menuShapeFill: function (obj, cmd) {
        JSDraw2.needPro();
    },

    menuAntiboyType: function (obj, cmd) {
        JSDraw2.needPro();
    },

    showSequences: function (obj) {
        JSDraw2.needPro();
    },

    menuSetFontsize: function (cmd, obj) {
        JSDraw2.needPro();
    },

    menuSetColor: function (cmd, obj) {
        JSDraw2.needPro();
    },

    addTag: function (obj, p, s, edit) {
        JSDraw2.needPro();
    },

    setBracketData: function (br, fieldtype, prefix, ypos) {
        JSDraw2.needPro();
    },

    setBracketRatio: function (br) {
        JSDraw2.needPro();
    },

    menuBracket: function (cmd, sub, checked, obj) {
        JSDraw2.needPro();
    },

    menuSetTextField: function (cmd, txt) {
        JSDraw2.needPro();
    },

    menuSetAttachPoint: function (cmd, obj) {
        JSDraw2.needPro();
    },

    lockAtomConnection: function (f) {
        JSDraw2.needPro();
    },

    menuSetAtomQuery: function (cmd, sub, checked, obj) {
        JSDraw2.needPro();
    },

    menuSetAtomQuery2: function (key, val) {
        JSDraw2.needPro();
    },

    menuSetAtomType: function (cmd, obj) {
        if (cmd == "..." || cmd == "more") {
            var me = this;
            this.showPT(function (elem) { me.menuSetAtomType2(elem); });
        }
        else {
            this.menuSetAtomType2(cmd);
        }
    },

    menuSetAtomType2: function (elem) {
        var n = 0;
        var cloned = this.clone();

        var atoms = this.m.allAtoms();
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            if (a.selected && a._parent.setAtomType(atoms[i], elem))
                ++n;
        }

        if (n > 0) {
            this.pushundo(cloned);
            this.refresh(true);
        }
    },

    menuSetAtomCharges: function (cmd) {
        var charges = parseInt(cmd);
        if (isNaN(charges))
            return;

        var n = 0;
        var cloned = this.clone();

        var atoms = this.m.allAtoms();
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            if (a.selected && a._parent.setAtomCharge(a, charges))
                ++n;
        }

        if (n > 0) {
            this.pushundo(cloned);
            this.refresh(true);
        }
    },

    menuSetAtomIsotope: function (cmd) {
        JSDraw2.needPro();
    },

    menuSetAtomRadical: function (cmd) {
        JSDraw2.needPro();
    },

    menuSetEhnStereochemistry: function (cmd) {
        JSDraw2.needPro();
    },

    menuSetBondTop: function (cmd) {
        JSDraw2.needPro();
    },

    menuSetRxnCenter: function (cmd) {
        JSDraw2.needPro();
    },

    menuSetBondType: function (cmd) {
        JSDraw2.needPro();
    },

    getAllTlcPlates: function (sorting) {
        JSDraw2.needPro();
    },

    numberTlcPlates: function () {
        JSDraw2.needPro();
    },

    expandSuperatom: function () {
        if (!this.helm.expandSuperAtom(this.curObject))
            JSDraw2.needPro();
    },

    _setSelectedBondType: function (bt) {
        var n = 0;
        var bonds = this.m.allBonds();
        for (var i = 0; i < bonds.length; ++i) {
            var b = bonds[i];
            if (b.selected && b._parent.setBondType(bonds[i], bt))
                ++n;
        }
        return n;
    },

    doRxnMap: function (curobj) {
        JSDraw2.needPro();
    },

    Cmd2BondType: function (cmd) {
        switch (cmd) {
            case "single":
                return JSDraw2.BONDTYPES.SINGLE;
            case "double":
                return JSDraw2.BONDTYPES.DOUBLE;
            case "triple":
                return JSDraw2.BONDTYPES.TRIPLE;
            case "unknown":
                return JSDraw2.BONDTYPES.UNKNOWN;
            case "dummy":
                return JSDraw2.BONDTYPES.DUMMY;
            case "either":
                return JSDraw2.BONDTYPES.EITHER;
            case "wiggly":
                return JSDraw2.BONDTYPES.WIGGLY;
            case "bold":
                return JSDraw2.BONDTYPES.BOLD;
            case "boldhash":
                return JSDraw2.BONDTYPES.BOLDHASH;
            case "delocalized":
                return JSDraw2.BONDTYPES.DELOCALIZED;
            case "up":
                return JSDraw2.BONDTYPES.WEDGE;
            case "down":
                return JSDraw2.BONDTYPES.HASH;
        }
        return null;
    },

    delObject: function (obj) {
        if (obj == null)
            return false;

        var br = JSDraw2.Bracket.cast(obj);
        if (br != null) {
            for (var i = 0; i < this.m.graphics.length; ++i) {
                var t = JSDraw2.Text.cast(this.m.graphics[i]);
                if (t != null && scil.Utils.indexOf(t.anchors, br) >= 0)
                    this.m.delObject(t);
            }
            this.m.delObject(br);
            return true;
        }

        var tlc = JSDraw2.TLC.cast(obj);
        if (tlc != null) {
            if (tlc.removeSpot(tlc.curspot))
                return true;
        }

        var rgroup = JSDraw2.RGroup.cast(obj);
        if (rgroup != null)
            return false;

        var a = JSDraw2.Atom.cast(obj);
        if (a != null) {
            if (this.delAA(a))
                return true;

            if (JSDraw2.defaultoptions.delheteroatom != false && a.bio == null) {
                if (a.elem != "C" || a.alias != null && a.alias != "") {
                    a.elem = "C";
                    a.alias = null;
                    a._parent.setHCount(a);
                    return true;
                }
            }
        }

        var f = obj._parent.delObject(obj);
        if (f) {
            if (tlc != null)
                this.numberTlcPlates();
        }

        return f;
    },

    delSelected: function () {
        var hasTcl = false;
        for (var i = 0; i < this.m.graphics.length; ++i) {
            if (JSDraw2.TLC.cast(this.m.graphics[i]) != null) {
                hasTcl = true;
                break;
            }
        }

        var n = this.m.delSelected();
        if (n > 0 && hasTcl)
            this.numberTlcPlates();
        return n;
    },

    hasSelected: function () {
        var n = this.m.hasSelected();
        if (n > 0) {
            for (var i = 0; i < this.m.graphics.length; ++i) {
                if (JSDraw2.TLC.cast(this.m.graphics[i]) != null) {
                    this.numberTlcPlates();
                    break;
                }
            }
        }

        return n;
    },

    lassoSelect: function (last) {
        if (this.start == null || this.end == null)
            return;

        var extra = this.surface.extra;
        if (extra.lasso == null)
            extra.lasso = new JSDraw2.Lasso(extra, this.linewidth, true);

        JSDraw2.Drawer.drawLine(extra, last, this.end, "#aaf", this.linewidth / 2);
        this.m.lassoSelect(extra, this.start, this.end, last, this.linewidth, this.tor / 8);
    },

    selectInRect: function (r) {
        return this.m.selectInRect(r);
    },

    addTemplate: function (key, obj, p) {
        var a = JSDraw2.Atom.cast(obj);
        var b = JSDraw2.Bond.cast(obj);

        var m2 = key == "[custom]" ? JSDraw2.CustomTemplates.get(key) : JSDraw2.SuperAtoms.getTemplate(key);
        if (m2 == null)
            return;
        var m = m2.clone();
        m.setBondLength(b == null ? this.bondlength : b.bondLength());

        if (a != null) {
            this._addNewAtomInExistingGroup(a, m.atoms);
            var a0 = m.atoms[0];
            if (JSDraw2.SuperAtoms._alignMol(a._parent, a, m, m.atoms[0]))
                m.replaceAtom(a0, a);
            else
                return;
        }
        else if (b != null) {
            this._addNewAtomInExistingGroup(b.a1, m.atoms);
            this._addNewAtomInExistingGroup(b.a2, m.atoms);
            var b0 = null;
            for (var i = 0; i < m.bonds.length; ++i) {
                if (m.bonds[i].type != JSDraw2.BONDTYPES.SINGLE) {
                    b0 = m.bonds[i];
                    break;
                }
            }
            if (b0 == null)
                b0 = m.bonds[0];
            m.offset(b.a1.p.x - b0.a1.p.x, b.a1.p.y - b0.a1.p.y);
            var dir = this._caclBondDir(this.m, b);
            var dir0 = this._caclBondDir(m, b0);
            if (dir > 0 && dir0 > 0 || dir < 0 && dir0 < 0)
                m.flipX(b.a1.p.x);

            var deg = b.angle();
            var deg0 = b0.angle();
            m.rotate(b0.a1.p.clone(), deg - deg0);

            m.replaceBond(b0, b);
        }
        else {
            var a0 = m.atoms[0];
            m.offset(p.x - a0.p.x, p.y - a0.p.y);
        }

        for (var i = 0; i < m.atoms.length; ++i) {
            var a0 = m.atoms[i];
            var a2 = JSDraw2.Atom.cast(this.toggle(a0.p));
            if (a2 != null && a != a0)
                m.replaceAtom(a0, a2);
        }

        // attach to existing group
        var group = null;
        if (a != null && a.group != null)
            group = a.group;
        if (b != null && b.a1.group != null && b.a2.group != null && b.a1.group == b.a2.group)
            group = b.a1.group;
        if (group != null) {
            for (var i = 0; i < m.atoms.length; ++i)
                m.atoms[i].group = group;
        }

        var parent = a != null ? a._parent : (b != null ? b._parent : null);
        if (parent != null)
            parent.mergeMol(m);
        else
            this.m.mergeMol(m);
    },

    _caclBondDir: function (m, b) {
        var n = 0;
        var atoms = m.getNeighborAtoms(b.a1, b.a2);
        for (var i = 0; i < atoms.length; ++i) {
            if (b.a1.p.angleAsOrigin(b.a2.p, atoms[i].p) > 180)
                ++n;
            else
                --n;
        }

        var atoms = m.getNeighborAtoms(b.a2, b.a1);
        for (var i = 0; i < atoms.length; ++i) {
            if (b.a2.p.angleAsOrigin(atoms[i].p, b.a1.p) > 180)
                ++n;
            else
                --n;
        }

        return n;
    },

    keydown: function (e) {
        if (!this.activated)
            return;

        if (this.texteditor.ed != null && this.texteditor.ed.input.style.display == "")
            return;
        if (this.helm != null) {
            this.helm.cancelDnD();
            org.helm.webeditor.MolViewer.hide();
        }

        if (scil.Utils.getZindex(this.div) < scil.Utils.getMaxZindex())
            return;

        this._keypresschar = String.fromCharCode(e.keyCode);

        if (e.preventDefault == null)
            e.preventDefault = function () { };

        if (this.contextmenu != null)
            this.contextmenu.hide();

        if (e.keyCode == 27) {
            if (this.start != null) {
                this.start = null;
                this.redraw();
            }
        }

        // ctrl
        if (e.ctrlKey || e.metaKey) {
            switch (e.keyCode) {
                case 89: // Y
                case 121:
                    if (!this.options.appmode) {
                        if (this.redo())
                            this.refresh(true);
                    }
                    break;
                case 90: // Z
                case 122:
                    if (!this.options.appmode) {
                        if (this.undo())
                            this.refresh(true);
                    }
                    break;
                case 67: // C
                case 99:
                    if (!this.options.appmode)
                        this.copy();
                    break;
                case 86: // V
                case 118:
                    if (!this.options.appmode && scil.Utils.isIE) { // except IE, I#10205
                        // IE uses this;  All other browsers use document.onpaste event
                        if (this.paste())
                            this.refresh(true);
                    }
                    break;
                case 88: // X
                case 120:
                    if (!this.options.appmode) {
                        if (this.cut())
                            this.refresh(true);
                    }
                    break;
                case 65: // A
                case 97:
                    if (this.selectAll())
                        this.refresh(false);
                    e.preventDefault();
                    break;
            }
            return;
        }

        var a = JSDraw2.Atom.cast(this.curObject);
        if (e.keyCode == 8 || e.keyCode == 46) { // del
            if (this.onDel())
                e.preventDefault();
            return;
        }

        // move selected objects
        if (this.m.hasSelected()) {
            var dx = 0;
            var dy = 0;
            switch (e.keyCode) {
                case 37: // left
                    dx = -1;
                    break;
                case 38: // up
                    dy = -1;
                    break;
                case 39: // right
                    dx = 1;
                    break;
                case 40: // down
                    dy = 1;
                    break;
            }

            if (dx != 0 || dy != 0) {
                this.pushundo();
                //this.m.offset(e.shiftKey ? dx : dx * this.bondlength / 2, e.shiftKey ? dy : dy * this.bondlength / 2, true);
                this.m.offset(e.shiftKey ? dx : dx * 20, e.shiftKey ? dy : dy * 20, true);
                this.refresh(true);
                e.preventDefault();
                return;
            }
        }

        if (this.curObject == null) {
            if (this.getCmd() == "seq") {
                var c = String.fromCharCode(e.keyCode);
                if (JSDraw2.SuperAtoms.getAA(c) != null) {
                    this.createAA(this.lastmove, c, JSDraw2.BIO.AA);
                }
            }
            else if (this.getCmd() == "helix") {
                var c = String.fromCharCode(e.keyCode);
                if (JSDraw2.SuperAtoms.getDNA(c) != null) {
                    this.createAA(this.lastmove, c, JSDraw2.BIO.BASE_DNA);
                }
            }
            else if (this.getCmd() == "rna") {
                var c = String.fromCharCode(e.keyCode);
                if (JSDraw2.SuperAtoms.getRNA(c) != null) {
                    this.createAA(this.lastmove, c, JSDraw2.BIO.BASE_RNA);
                }
            }
            return;
        }

        if (a != null) {
            if (a.bio) {
                if (e.keyCode == 13) {
                    this.showTextEditor(a, a.p.clone());
                    e.preventDefault();
                    return;
                }

                if (this.helm != null && scil.helm.isHelmNode(a)) {
                    var c = String.fromCharCode(e.keyCode);
                    if (scil.helm.Monomers.getMonomer(a, c) != null) {
                        this.pushundo();
                        a.elem = c;
                        this.refresh(true);
                    }
                }
                else if (a.biotype() == JSDraw2.BIO.AA && JSDraw2.SuperAtoms.getAA(c) != null || a.biotype() == JSDraw2.BIO.BASE_DNA && JSDraw2.SuperAtoms.getDNA(c) != null || a.biotype() == JSDraw2.BIO.BASE_RNA && JSDraw2.SuperAtoms.getRNA(c) != null) {
                    var c = String.fromCharCode(e.keyCode);
                    if (a.selected) {
                        if (a.elem != c) {
                            this.pushundo();
                            a.elem = c;
                            this._setSuperatom(a);
                            this.refresh(true);
                        }
                    }
                    else {
                        this.insertAA(a, c);
                    }
                }
                return;
            }
            else if (a.elem == "R") {
                if (e.keyCode >= 49 && e.keyCode <= 57) {
                    var rlabel = "R" + (e.keyCode - 48);
                    if (a.alias != rlabel) {
                        this.pushundo();
                        this.m.setAtomAlias(a, rlabel);
                        this.refresh(true);
                    }
                    return;
                }
            }

            var c = null;
            switch (e.keyCode) {
                //case 16: // *                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                case 56:
                    c = '*';
                    break;
                case 50:
                    c = '@';
                    break;
                case 187:
                case 107:
                    c = '+';
                    break;
                case 189:
                case 109:
                    c = '-';
                    break;
                case 61:
                    if (scil.Utils.isFirefox)
                        c = '+';
                    break;
                case 173:
                    if (scil.Utils.isFirefox)
                        c = '-';
                    break;
                case 65:
                case 97:
                    c = 'A';
                    break;
                case 81:
                case 113:
                    c = 'Q';
                    break;
                case 66:
                case 98:
                    c = 'Br';
                    break;
                case 67:
                case 99:
                    c = 'C';
                    break;
                case 68:
                case 100:
                    c = 'D';
                    break;
                case 70:
                case 102:
                    c = 'F';
                    break;
                case 72:
                case 104:
                    c = 'H';
                    break;
                case 73:
                case 105:
                    c = 'I';
                    break;
                case 76:
                case 108:
                    c = 'Cl';
                    break;
                case 78:
                case 110:
                    c = 'N';
                    break;
                case 79:
                case 111:
                    c = 'O';
                    break;
                case 80:
                case 112:
                    c = 'P';
                    break;
                case 82:
                case 114:
                    c = 'R';
                    break;
                case 83:
                case 115:
                    c = 'S';
                    break;
                case 84:
                case 116:
                    c = 'T';
                    break;
                case 88:
                case 120:
                    c = 'X';
                    break;
                case 77:
                case 109:
                    c = 'M';
                    break;
                case 69:
                    c = "Me";
                    break;
                case 13:
                    this.showTextEditor(a, a.p.clone());
                    e.preventDefault();
                    return;
            }

            if (c == '+' || c == '-') {
                var cloned = this.clone();
                if (this.increaseNum(a, c == '+' ? +1 : -1)) {
                    this.pushundo(cloned);
                    this.refresh(true);
                    return;
                }
            }
            else if (c == "Me") {
                var cloned = this.clone();
                if (this.m.setAtomAlias(a, c)) {
                    this.pushundo(cloned);
                    this.refresh(true);
                    return;
                }
            }
            else if (c != null) {
                var cloned = this.clone();
                if (this.m.setAtomType(a, c)) {
                    this.pushundo(cloned);
                    this.refresh(true);
                    return;
                }
            }
            return;
        }

        var shp = JSDraw2.Shape.cast(this.curObject);
        if (shp != null && e.keyCode == 13) {
            this.showTextEditor(shp, shp._rect.center());
            e.preventDefault();
            return;
        }

        var b = JSDraw2.Bond.cast(this.curObject);
        if (b != null) {
            if (b.isBio()) {
                var f = false;
                var cloned = null;
                if (e.keyCode == 83 && b.type == JSDraw2.BONDTYPES.PEPTIDE) {
                    cloned = this.clone();
                    f = this.m.setBondType(b, JSDraw2.BONDTYPES.DISULFIDE);
                }
                else if (e.keyCode == 49 && b.type == JSDraw2.BONDTYPES.DISULFIDE) {
                    cloned = this.clone();
                    f = this.m.setBondType(b, JSDraw2.BONDTYPES.PEPTIDE);
                }
                if (f) {
                    this.pushundo(cloned);
                    this.refresh(true);
                }
            }
            else {
                var c = -1;
                if (e.keyCode == 189 || e.keyCode == 109)
                    c = 10;
                else if (e.keyCode == 187 || e.keyCode == 107)
                    c = 11;
                else if (e.keyCode == 192)
                    c = 13;
                else
                    c = e.keyCode - 48;

                if (c >= JSDraw2.BONDTYPES.UNKNOWN && c <= JSDraw2.BONDTYPES.DUMMY && this.curObject.type != c) {
                    var cloned = this.clone();
                    if (this.m.setBondType(b, c)) {
                        this.pushundo(cloned);
                        if (b.type == JSDraw2.BONDTYPES.WEDGE || b.type == JSDraw2.BONDTYPES.HASH)
                            this.fixWedgeDir(b);
                        this.refresh(true);
                        return;
                    }
                }
                else if (c == 9 && (b.type == JSDraw2.BONDTYPES.WEDGE || b.type == JSDraw2.BONDTYPES.HASH)) {
                    this.pushundo();
                    b.reverse();
                    this.refresh(true);
                    return;
                }
            }
            return;
        }

        var txt = JSDraw2.Text.cast(this.curObject);
        if (txt != null) {
            this.showTextEditor(txt);
            e.preventDefault();
            return;
        }

        var t = JSDraw2.TLC.cast(this.curObject);
        if (t != null) {
            if (t.curspot != null) {
                switch (e.keyCode) {
                    case 187:
                    case 189:
                        var clone = this.clone();
                        if (t.curspot.move((e.keyCode == 187 ? 0.1 : -0.1) * (e.shiftKey ? 0.1 : 1))) {
                            this.pushundo(clone);
                            this.refresh(true);
                        }
                        e.preventDefault();
                        break;
                    case 190: // >
                        this.pushundo();
                        t.changeSize(t.curspot, "110%");
                        this.refresh(true);
                        break;
                    case 188: // <
                        this.pushundo();
                        t.changeSize(t.curspot, "90%");
                        this.refresh(true);
                        break;
                    case 82: // R
                    case 76: // L
                        {
                            this.pushundo();
                            //if (Math.abs(t.curspot.ry1) <= 1)
                            t.curspot.rx += e.shiftKey ? -0.2 : 0.2;
                            if (t.curspot.rx < 0.1)
                                t.curspot.rx = 0.1;
                            this.refresh(true);
                        }
                        break;
                    case 85: // U
                        {
                            this.pushundo();
                            //if (Math.abs(t.curspot.ry1) <= 1)
                            t.curspot.ry1 += e.shiftKey ? -0.2 : 0.2;
                            this.refresh(true);
                        }
                        break;
                    case 68: // D
                        {
                            this.pushundo();
                            //if (Math.abs(t.curspot.ry1) <= 1)
                            t.curspot.ry2 += e.shiftKey ? -0.2 : 0.2;
                            this.refresh(true);
                        }
                        break;
                }
            }
        }
    },

    toCharArray: function (s, m) {
        if (!(m > 0))
            m = 1;

        var ss = [];
        for (var i = 0; i < s.length; ++i)
            ss.push(s.substr(i, m));
        return ss;
    },

    splitString: function (s, pat) {
        var ss = [];

        var re = new RegExp("^" + pat);
        var ret;
        while ((ret = re.exec(s)) != null) {
            var c = ret + "";
            ss.push(c);
            if (s.length == c.length)
                return ss;
            s = s.substr(c.length);
        }
        return null;
    },

    createAA2: function (s, biotype, expand, asrxn, nterminal, cterminal, selected) {
        if (scil.Utils.isNullOrEmpty(s))
            return;

        if (expand)
            s = s.replace(/[>|\^]/g, "");

        if (new RegExp("^[a-z|^|>]+$").test(s))
            s = scil.Utils.trim(s).toUpperCase();

        var ss = null;
        if (biotype == JSDraw2.BIO.BASE_DNA) {
            if (new RegExp("^[A|G|T|C]+$").test(s)) {
                ss = this.toCharArray(s);
            }
            else {
                scil.Utils.alert2("Invalid DNA sequence.");
                return;
            }
        }
        if (biotype == JSDraw2.BIO.BASE_RNA) {
            if (new RegExp("^[A|G|T|C|U]+$").test(s)) {
                ss = this.toCharArray(s);
            }
            else {
                scil.Utils.alert2("Invalid RNA sequence.");
                return;
            }
        }
        else if (biotype == JSDraw2.BIO.AA) {
            s = s.replace(/[\.]/g, "-");
            if (s.indexOf('-') > 0)
                ss = s.split('-');
            else if (new RegExp("^([A-Z][a-z|0-9]{2}[\\^]?)+[>]?$").test(s))
                ss = this.splitString(s, "[A-Z][a-z|0-9]{2}[\\^|>]?");
            else if (new RegExp("^([A-Z][\\^]?)+[>]?$").test(s)) {
                ss = this.splitString(s, "[A-Z][\\^|>]?");
            }
            if (ss == null) {
                scil.Utils.alert2("Invalid peptide sequence.");
                return;
            }
        }

        if (ss.length >= 3 && scil.Utils.endswith(ss[ss.length - 1], ">") && s.indexOf('^') <= 0)
            ss[0] += "^";

        var m;
        if (expand && biotype == JSDraw2.BIO.AA)
            m = this._createExpandedAA(ss, biotype, nterminal, cterminal);
        else
            m = this._createCollapsedAA(ss, biotype, nterminal, cterminal);
        if (m == null)
            return false;

        if (nterminal == null || nterminal == "")
            nterminal = "H";
        if (cterminal == null || cterminal == "")
            cterminal = "OH";

        var seq = (nterminal != null ? nterminal + "-" : "") + s + (cterminal != null ? "-" + cterminal : "");
        if (this.options.onAddSequence != null) {
            if (this.options.onAddSequence(m, seq, asrxn))
                return true;
        }

        this.m.setSelected(false);
        if (selected != false)
            m.setSelected(true);

        this.pushundo();
        if (asrxn == "reactant" || asrxn == "product") {
            var rxn = this.m.parseRxn();
            if (asrxn == "reactant")
                rxn.reactants.push(m);
            else
                rxn.products.push(m);
            this.setRxn(rxn, false, this.bondlength);
        }
        else {
            this.m.mergeMol(m);
        }

        this.fitToWindow();

        //        var t = null;
        //        if (biotype == JSDraw2.BIO.AA) {
        //            var c = m.rect().centerBottom();
        //            var r = new JSDraw2.Rect(c.x - s.length * this.fontsize / 3, c.y + this.bondlength / 2, 0, 0);
        //            t = new JSDraw2.Text(r, seq);
        //            t.fieldtype = "SEQUENCE";
        //            t.anchors = scil.clone(m.atoms);
        //            this.m.addGraphics(t);
        //        }

        this.refresh(true);
        //        if (t != null) {
        //            var c = m.rect().centerBottom();
        //            t._rect.offset(c.x - t._rect.center().x, 0);
        //        }

        return true;
    },

    _createCollapsedAA: function (ss, biotype, nterminal, cterminal) {
        if (nterminal == null || nterminal == "")
            nterminal = "H";
        if (cterminal == null || cterminal == "")
            cterminal = "OH";

        var head = [];
        var circle = null;
        var tail = null;
        var all = [];

        for (var i = 0; i < ss.length; ++i) {
            var c = ss[i];
            var iscircle = c.length > 1 && (c.substr(c.length - 1) == "^" || c.substr(c.length - 1) == ">");
            if (iscircle)
                c = c.substr(0, c.length - 1);

            var a = new JSDraw2.Atom(null, c, { type: biotype });
            switch (biotype) {
                case JSDraw2.BIO.AA:
                    a.superatom = JSDraw2.SuperAtoms.getAA(c);
                    break;
                case JSDraw2.BIO.BASE_DNA:
                    a.superatom = JSDraw2.SuperAtoms.getDNA(c);
                    break;
                case JSDraw2.BIO.BASE_RNA:
                    a.superatom = JSDraw2.SuperAtoms.getRNA(c);
                    break;
            }
            if (a.superatom == null) {
                scil.Utils.alert("It cannot parse: " + c);
                return;
            }
            all.push(a);

            if (iscircle) {
                if (circle == null) {
                    circle = [a];
                }
                else {
                    if (tail == null) {
                        circle.push(a);
                        tail = [];
                    }
                    else {
                        tail.push(a);
                    }
                }
            }
            else {
                if (tail != null)
                    tail.push(a);
                else if (circle != null)
                    circle.push(a);
                else
                    head.push(a);
            }
        }

        var bondtype = JSDraw2.BONDTYPES.SINGLE;
        if (biotype == JSDraw2.BIO.AA)
            bondtype = JSDraw2.BONDTYPES.PEPTIDE;
        else if (biotype == JSDraw2.BIO.DNA || biotype == JSDraw2.BIO.RNA)
            bondtype = JSDraw2.BONDTYPES.NUCLEOTIDE;

        if (circle != null && circle.length == 1) {
            head.push(circle[0]);
            circle = null;
            if (tail != null) {
                for (var i = 0; i < tail.length; ++i)
                    head.push(tail[i]);
                tail = null;
            }
        }

        var nterm = null;
        var cterm = null;
        var m = new JSDraw2.Mol(this.options.showimplicithydrogens);
        if (head.length > 0) {
            nterm = new JSDraw2.Atom(null, "C");
            m.addAtom(nterm);
            head.splice(0, 0, nterm);

            var b = new JSDraw2.Bond(head[1], nterm, biotype == JSDraw2.BIO.AA ? JSDraw2.BONDTYPES.PEPTIDE : JSDraw2.BONDTYPES.NUCLEOTIDE);
            b.apo1 = 1;
            m.addBond(b);
        }

        m.addAtom(all[0]);
        for (var i = 1; i < all.length; ++i) {
            m.addAtom(all[i]);
            var b = new JSDraw2.Bond(all[i], all[i - 1], bondtype);
            b.apo1 = 1;
            b.apo2 = 2;
            m.addBond(b);
        }

        if (circle == null) {
            var o = new JSDraw2.Atom(null, biotype == JSDraw2.BIO.AA ? 'O' : "3'");
            m.addAtom(o);
            head.push(o);
            cterm = o;

            var b = new JSDraw2.Bond(o, head[head.length - 2], biotype == JSDraw2.BIO.AA ? JSDraw2.BONDTYPES.PEPTIDE : JSDraw2.BONDTYPES.NUCLEOTIDE);
            b.apo2 = 2;
            m.addBond(b);
        }
        else {
            if (head.length == 0 && (tail == null || tail.length == 0)) {
                var b = new JSDraw2.Bond(circle[0], circle[circle.length - 1], JSDraw2.BONDTYPES.PEPTIDE);
                b.apo1 = 1;
                b.apo2 = 2;
                m.addBond(b);
            }
            else if (circle[0].elem == 'C' && circle[circle.length - 1].elem == 'C') {
                var b = new JSDraw2.Bond(circle[0], circle[circle.length - 1], JSDraw2.BONDTYPES.DISULFIDE);
                b.apo1 = 3;
                b.apo2 = 3;
                m.addBond(b);
            }
            else if (circle[0].elem == 'K' && (tail == null || tail.length == 0)) {
                var b = new JSDraw2.Bond(circle[0], circle[circle.length - 1], JSDraw2.BONDTYPES.AMIDE);
                b.apo1 = 3;
                b.apo2 = 2;
                m.addBond(b);
            }

            if (tail != null && tail.length > 0) {
                cterm = new JSDraw2.Atom(null, "C");
                m.addAtom(cterm);
                tail.push(cterm);

                var b = new JSDraw2.Bond(tail[tail.length - 2], cterm, JSDraw2.BONDTYPES.SINGLE);
                b.apo1 = 1;
                m.addBond(b);
            }
        }

        if (circle == null || circle.length == 1) {
            var last = null;
            this.layoutAtoms(head, "line", this.bondlength, last);
            if (head.length > 0)
                last = head[head.length - 1];
            if (circle != null) {
                this.layoutAtoms(circle, "line", this.bondlength, last);
                if (circle.length > 0)
                    last = circle[circle.length - 1];
                if (tail != null)
                    this.layoutAtoms(tail, "line", this.bondlength, last);
            }
        }
        else {
            var center = new JSDraw2.Point(0, 0);
            this.layoutAtoms(circle, "circle", this.bondlength, center.clone().offset(1, 0), center);
            if (head.length > 0) {
                head.push(null);
                head.reverse();
                this.layoutAtoms(head, "line", this.bondlength, circle[0].p, center);
            }
            if (tail != null && tail.length > 0) {
                tail.splice(0, 0, null);
                this.layoutAtoms(tail, "line", this.bondlength, circle[circle.length - 1].p, center);
            }
        }

        if (nterm != null) {
            if (biotype == JSDraw2.BIO.AA) {
                if (nterminal == "H")
                    nterm.elem = "H";
                else
                    m.setAtomAlias(nterm, nterminal)
            }
            else {
                nterm.elem = "5'";
            }
        }

        if (cterm != null) {
            if (biotype == JSDraw2.BIO.AA) {
                if (cterminal == "OH")
                    cterm.elem = "O";
                else if (cterminal == "NH2")
                    cterm.elem = "N";
                else
                    m.setAtomAlias(cterm, cterminal)
            }
            else {
                cterm.elem = "3'";
            }
        }

        return m;
    },

    _createExpandedAA: function (ss, biotype, nterminal, cterminal) {
        if (nterminal == null || nterminal == "")
            nterminal = "H";
        if (cterminal == null || cterminal == "")
            cterminal = "OH";

        var mol = null;
        var last = null;
        for (var i = 0; i < ss.length; ++i) {
            var c = ss[i];
            var m = JSDraw2.SuperAtoms.getAA(c);
            if (m == null) {
                scil.Utils.alert("Unknow Amino Acid: " + c);
                return null;
            }
            m = m.clone();
            m.setBondLength(this.bondlength);
            var attachs = JSDraw2.SuperAtoms._getAttachAtoms(m);
            for (var k = 2; k < attachs.length; ++k)
                attachs[k].a.attachpoints = [];

            if (i == 0) {
                mol = m;

                attachs[0].a.attachpoints = [];

                if (nterminal != "H") {
                    var p = this._guessAutoBond(attachs[0].a);
                    var a = new JSDraw2.Atom(p, "C");
                    var b = new JSDraw2.Bond(attachs[0].a, a, JSDraw2.BONDTYPES.SINGLE);
                    mol.addAtom(a);
                    mol.addBond(b);

                    mol.setAtomAlias(a, nterminal)
                }

                last = attachs[1].a;
                continue;
            }

            if (i % 2 == 1) {
                for (var k = 0; k < m.atoms.length; ++k)
                    m.atoms[k].p.y *= -1;

                for (var k = 0; k < m.bonds.length; ++k) {
                    if (m.bonds[k].type == JSDraw2.BONDTYPES.WEDGE)
                        m.bonds[k].type = JSDraw2.BONDTYPES.HASH;
                    else if (m.bonds[k].type == JSDraw2.BONDTYPES.HASH)
                        m.bonds[k].type = JSDraw2.BONDTYPES.WEDGE;
                }
            }

            var p0 = attachs[0].a.p;
            var p = this._guessAutoBond(last);
            m.offset(p.x - p0.x, p.y - p0.y);
            mol.mergeMol(m);

            last.attachpoints = [];
            attachs[0].a.attachpoints = [];
            var b = new JSDraw2.Bond(last, attachs[0].a, JSDraw2.BONDTYPES.SINGLE);
            mol.addBond(b);

            last = attachs[1].a;
        }

        if (last != null) {
            last.attachpoints = [];

            if (cterminal != "H") {
                var p = this._guessAutoBond(last);
                var a = new JSDraw2.Atom(p, "C");
                var b = new JSDraw2.Bond(last, a, JSDraw2.BONDTYPES.SINGLE);
                mol.addAtom(a);
                mol.addBond(b);

                if (cterminal == "OH")
                    a.elem = "O";
                else
                    mol.setAtomAlias(a, cterminal)
            }
        }
        return mol;
    },

    layoutAtoms: function (atoms, shape, d, p1, p2) {
        if (atoms == null || atoms.length == 0)
            return;

        if (p2 == null)
            p2 = new JSDraw2.Point(0, 0);
        if (p1 == null)
            p1 = p2.clone().offset(d, 0);

        switch (shape) {
            case "line":
                if (atoms[0] != null)
                    atoms[0].p = p1.clone();
                var s = d / p1.distTo(p2);
                var dx = (p1.x - p2.x) * s;
                var dy = (p1.y - p2.y) * s;
                for (var i = 1; i < atoms.length; ++i)
                    atoms[i].p = p1.clone().offset(dx * i, dy * i);
                break;
            case "circle":
                var deg = 360 / atoms.length;
                var r = d / 2 / Math.sin(deg / 2 * Math.PI / 180);
                var s = r / p1.distTo(p2);
                p1 = new JSDraw2.Point(p2.x + (p1.x - p2.x) * s, p2.y + (p1.y - p2.y) * s);
                if (atoms[0] != null)
                    atoms[0].p = p1.clone();
                for (var i = 1; i < atoms.length; ++i)
                    atoms[i].p = p1.clone().rotateAround(p2, deg * i);
                break;
        }
    },

    createAA: function (p, c, biotype) {
        if (p == null)
            return;

        this.pushundo();
        var h = new JSDraw2.Atom(p.clone().offset(-this.bondlength, 0), biotype == JSDraw2.BIO.AA ? 'H' : "5'");
        var a = new JSDraw2.Atom(p.clone(), c, { type: biotype });
        a.superatom = null;
        if (biotype == JSDraw2.BIO.AA)
            a.superatom = JSDraw2.SuperAtoms.getAA(c);
        else if (biotype == JSDraw2.BIO.BASE_DNA)
            a.superatom = JSDraw2.SuperAtoms.getDNA(c);
        else if (biotype == JSDraw2.BIO.BASE_RNA)
            a.superatom = JSDraw2.SuperAtoms.getRNA(c);
        var o = new JSDraw2.Atom(p.clone().offset(this.bondlength, 0), biotype == JSDraw2.BIO.AA ? 'O' : "3'");
        this.m.addAtom(h);
        this.m.addAtom(a);
        this.m.addAtom(o);

        var b = new JSDraw2.Bond(h, a, JSDraw2.BONDTYPES.SINGLE);
        a.apo2 = 2;
        this.m.addBond(b);

        b = new JSDraw2.Bond(a, o, JSDraw2.BONDTYPES.SINGLE);
        a.apo1 = 1;
        this.m.addBond(b);

        this.curObject = a;
        this.refresh(true);
    },

    delAA: function (a) {
        if (a == null || a.biotype() != JSDraw2.BIO.AA && a.biotype() != JSDraw2.BIO.BASE_DNA && a.biotype() != JSDraw2.BIO.BASE_RNA)
            return false;

        var next = this.findNextAA(a, false);
        if (next == null)
            return false;

        this.m.delBond(next.b, false);
        var mm = this.m.getFragment(next.a);
        mm.offset(a.p.x - next.a.p.x, a.p.y - next.a.p.y);

        var bonds = this.m.getNeighborBonds(a);
        for (var i = 0; i < bonds.length; ++i) {
            var b = bonds[i];
            if (b.a1 == a)
                b.a1 = next.a;
            else if (b.a2 == a)
                b.a2 = next.a;
        }
        a._parent.delAtom(a);

        return true;
    },

    _setSuperatom: function (a) {
        a.superatom = null;
        var c = a.elem;
        switch (a.biotype()) {
            case JSDraw2.BIO.BASE_DNA:
                a.superatom = JSDraw2.SuperAtoms.getDNA(c);
                break;
            case JSDraw2.BIO.BASE_RNA:
                a.superatom = JSDraw2.SuperAtoms.getRNA(c);
                break;
            case JSDraw2.BIO.AA:
                a.superatom = JSDraw2.SuperAtoms.getAA(c);
                break;
        }
    },

    insertAA: function (a, c) {
        if (a == null || !a.bio)
            return;

        if (a.biotype() == JSDraw2.BIO.AA && JSDraw2.SuperAtoms.getAA(c) == null || a.biotype() == JSDraw2.BIO.BASE_DNA && JSDraw2.SuperAtoms.getDNA(c) != null || a.biotype() == JSDraw2.BIO.BASE_RNA && JSDraw2.SuperAtoms.getRNA(c) != null)
            return;

        var dx = this.bondlength;
        var right = true;
        var list = null;

        var next = this.findNextAA(a, true);
        this.pushundo();
        var na = new JSDraw2.Atom(a.p.clone().offset(dx, 0), c, dojo.clone(a.bio));
        var nb = new JSDraw2.Bond(na, a, a.biotype() == JSDraw2.BIO.AA ? JSDraw2.BONDTYPES.PEPTIDE : JSDraw2.BONDTYPES.SINGLE);
        this.m.addAtom(na);
        this.m.addBond(nb);

        this._setSuperatom(na);
        nb.apo1 = 1;
        nb.apo2 = 2;

        if (next != null) {
            this.m.delBond(next.b, false);
            var mm = this.m.getFragment(next.a);
            mm.offset(dx, 0);
            var b = new JSDraw2.Bond(next.a, na, a.biotype() == JSDraw2.BIO.AA ? JSDraw2.BONDTYPES.PEPTIDE : JSDraw2.BONDTYPES.SINGLE, true);
            b.apo1 = 1;
            b.apo2 = 2;
            this.m.addBond(b);
        }

        this.curObject = na;
        this.refresh(true);
    },

    findNextAA: function (a, forinsert) {
        var bonds = this.m.getNeighborBonds(a);
        if (bonds.length == 0)
            return null;
        else if (bonds.length == 1)
            return { a: bonds[0].otherAtom(a), b: bonds[0] };

        var backup = null;
        for (var i = bonds.length - 1; i >= 0; --i) {
            var oa = bonds[i].otherAtom(a);
            if (Math.abs(a.p.y - oa.p.y) < this.tor / 2) {
                if (oa.p.x < a.p.x) {
                    backup = bonds[i];
                    bonds.splice(i, 1);
                }
                else if (oa.p.x >= a.p.x) {
                    return { a: oa, b: bonds[i] };
                }
            }
        }

        var ret = null;
        for (var i = 0; i < bonds.length; ++i) {
            var b = bonds[i];
            var oa = b.otherAtom(a);
            if (ret == null) {
                ret = { a: oa, b: b };
            }
            else if (!forinsert && b.isBio() && !ret.b.isBio()) {
                ret = { a: oa, b: b };
            }
            else {
                if (oa.p.x < a.p.x && ret.a.p.x < a.p.x || oa.p.x > a.p.x && ret.a.p.x > a.p.x) {
                    if (oa.p.y > ret.a.p.y)
                        ret = { a: oa, b: b };
                }
                else if (oa.p.x > a.p.x) {
                    ret = { a: oa, b: b };
                }
            }
        }

        if (ret == null) {
            return { a: backup.otherAtom(a), b: backup };
        }
        else if (!forinsert && !ret.a.bio) {
            var oa = backup.otherAtom(a);
            if (oa.bio)
                return { a: oa, b: backup };
        }

        return ret;
    },

    findNextAAs: function (a, right) {
        var list = [];
        while (a != null) {
            var r = this._findNextAA(a, right);
            if (r != null) {
                list.push(r);
                a = r.a;
            }
            else {
                break;
            }
        }
        return list;
    },

    _findNextAA: function (a, right) {
        var bonds = this.m.bonds;
        for (var i = 0; i < bonds.length; ++i) {
            var oa = bonds[i].otherAtom(a);
            if (oa != null && Math.abs(oa.p.y - a.p.y) < this.tor / 2 && (right && oa.p.x > a.p.x || !right && oa.p.x < a.p.x))
                return { b: bonds[i], a: oa }
        }
        return null;
    },

    /**
    * Set the view window size
    * @function setSize
    * @param {number} width - new width
    * @param {number height - new height
    * @returns null
    */
    setSize: function (width, height) {
        if (this.maintable != null) {
            if (width > 0)
                this.maintable.style.width = width + "px";
            if (height > 0)
                this.maintable.style.height = height + "px";

            if (this.isSkinW8())
                this.resize(width, height - 24);
            else
                this.resize(width - 28, height - 24);
        }
        else {
            this.resize(width, height);
        }
    },

    onResize: function (width, height) {
        if (this.options.onresize != null) {
            if (this.options.onresize())
                return;
        }
        this.resize(width > 0 ? width : this.div.offsetWidth, height > 0 ? height : this.div.offsetHeight);
    },

    resize: function (width, height) {
        if (scil.Utils.isIpad) {
            // this one cause ELN problem on iPad
            if (scil.eln != null /* ELN 2.0 */ || scil.App != null && scil.App.AccountTypes != null /* ELN 1.x */)
                return;
        }
        if (this._setSurfaceSize(new JSDraw2.Point(width, height))) {
            if (this.isSkinW8() && this.toolbar != null)
                this.toolbar.recreateTopToolbar();
        }
    },

    _setSurfaceSize: function (sz) {
        if (Math.abs(sz.x - this.dimension.x) < 6 && Math.abs(sz.y - this.dimension.y) < 6)
            return false;

        if (sz.x > 0)
            this.dimension.x = sz.x;
        if (sz.y > 0)
            this.dimension.y = sz.y;

        this.div.style.width = this.dimension.x + "px";
        this.div.style.height = this.dimension.y + "px";
        this.surface.setDimensions(this.dimension.x, this.dimension.y);
        this.fitToWindow();
        this.redraw();
        return true;
    },

    dblclick: function () {
        if (this.popuplocked) {
            scil.Utils.alert("Editing is currently locked");
            return false;
        }

        var me = this;
        var fn = function (jsd) {
            me.restoreClone(jsd.clone());
            me.fitToWindow();
            me.refresh(true);
            if (me.options.onpopupsaved != null)
                me.options.onpopupsaved(me);
        };
        JSDraw2.Editor.showPopup("JSDraw2 Popup Editor", "Save", fn, { value: this.clone(), format: "clone" });
    },

    _makeChain: function (chain, end) {
        if (chain == null || chain.end != null && chain.end.distTo(end) < this.tor)
            return false;
        if (end.distTo(chain.start) < this.bondlength * 2)
            chain.p2 = end;
        chain.end = end;
        chain.points = [];

        var d = chain.start.distTo(end);
        var p1 = chain.start;
        var p2;
        if (chain.a == null) {
            if (Math.abs(end.y - p1.y) / Math.abs(end.x - p1.x) < 0.1) // horizontally
                p2 = p1.clone().offset(this.bondlength * (end.x > p1.x ? 1 : -1), 0).rotateAround(p1, 30);
            else
                p2 = this._guessBond(p1, chain.p2, true);
        }
        else {
            p2 = this._guessAutoBond(chain.a, end);
        }
        if (p2 == null)
            return false;
        chain.points = [chain.start];
        chain.points.push(p2);

        var angle;
        var d2 = chain.start.distTo(p2);
        while (d2 != 0 && d2 < d) {
            var origin = p2;
            if (chain.points.length == 2) {
                var t1 = p1.clone().rotateAround(origin, 120);
                var t2 = p1.clone().rotateAround(origin, -120);
                if (t1.distTo(end) < t2.distTo(end)) {
                    p2 = t1;
                    angle = 120;
                }
                else {
                    p2 = t2;
                    angle = -120;
                }
            }
            else {
                angle = -angle;
                p2 = p1.clone().rotateAround(origin, angle);
            }
            p1 = origin;
            chain.points.push(p2);
            d2 = chain.start.distTo(p2);
        }
        return true;
    },

    _guessAutoBond: function (a, end) {
        if (a == null)
            return null;
        if (end == null)
            return a._parent.guessBond(a, this.bondlength);

        var p = null;
        var atoms = a._parent.getNeighborAtoms(a);
        if (atoms.length == 0) {
            p = a.p.clone().offset(this.bondlength, 0);
            if (end != null) {
                var deg = Math.round(end.angleTo(a.p) / 30) * 30;
                p.rotateAround(a.p, deg);
            }
        }
        else if (atoms.length == 1) {
            var a1 = atoms[0];
            var p = a1.p.clone().rotateAround(a.p, -120);
            if (end != null) {
                var t = a1.p.clone().rotateAround(a.p, 120);
                if (t.distTo(end) < p.distTo(end))
                    p = t;
            }
        }
        else if (atoms.length == 2) {
            var a1 = atoms[0];
            var a2 = atoms[1];
            var ang1 = a1.p.angleTo(a.p);
            var mid = a.p.middleAngle(a1.p, a2.p);
            p = a1.p.clone().rotateAround(a.p, mid - ang1 + 180);
        }
        return p;
    },

    _addAutoBond: function (a, cmd) {
        var m = a._parent;
        var p = this._guessAutoBond(a);
        if (p == null)
            return false;

        var elem = null;
        var c = this._countAABonds(a);
        var bondtype = this.Cmd2BondType(cmd);
        if (c != null) {
            // add H or OH on peptide terminal Amino Acid
            if (c.peptideN == 0 && c.others == 0) {
                elem = "H";
                bondtype = JSDraw2.BONDTYPES.PEPTIDE;
            }
            else if (c.peptideC == 0 && c.others == 0)
                elem = "O";
            else
                return false;
        }

        var na = JSDraw2.Atom.cast(this.toggle(p));
        if (na != null) {
            if (na._parent != a._parent)
                na = null;
        }

        if (na == null) {
            na = new JSDraw2.Atom(p, elem);
            this._addNewAtomInExistingGroup(a, [na]);
            m.addAtom(na);
            // attach to existing group
            if (a.group != null)
                na.group = a.group;
        }
        else {
            if (m.findBond(a, na) != null)
                return false;
        }

        var nb = new JSDraw2.Bond(a, na, bondtype);
        m.addBond(nb, null, true);
        return true;
    },

    _guessBond: function (p1, p2, notor) {
        if (!notor && p1.distTo(p2) < this.tor)
            return null;

        var a = p2.angleTo(p1);
        var m = Math.abs(a) % this.angleStop;
        if (a > 0)
            a = a - m + (m > (this.angleStop / 2) ? this.angleStop : 0);
        else
            a = -(-a - m + (m > (this.angleStop / 2) ? this.angleStop : 0));

        return new JSDraw2.Point(this.bondlength, 0).rotate(a).offset(p1.x, p1.y);
    },

    guessArrow: function (p1, p2) {
        if (p1.distTo(p2) < this.bondlength)
            return null;

        var a = p2.angleTo(p1);
        var m = a % 90;
        if (m == 0)
            return p2;

        var s = 0;
        if (m < 5)
            s = -m;
        else if (90 - m < 5)
            s = 90 - m;
        else
            return p2;

        return p2.clone().rotateAround(p1, s);
    },

    frameoffset: { x: 0, y: 0 },
    setFrameoffset: function (x, y) {
        this.frameoffset.x = x;
        this.frameoffset.y = y;
    },

    eventPoint: function (e) {
        var f = true;
        //if (scil.Utils.isIpad)
        //    f = false;
        var objoffset = scil.Utils.getOffset(this.div, f);
        //objoffset = new JSDraw2.Point(0, 0);
        var pt = new JSDraw2.Point(e.clientX - objoffset.x - this.frameoffset.x, e.clientY - objoffset.y - this.frameoffset.y);
        pt.tm = new Date().getTime();
        pt.clientX = e.clientX;
        pt.clientY = e.clientY;
        return pt;
    },

    getCmd: function (td) {
        if (td == null)
            td = this.curButton;
        var s = td == null ? "select" : td.getAttribute('cmd');
        if (s.length > 2 && s.substr(0, 2) == "e-")
            s = s.substr(2);
        return s;
    },

    onSelBtn: function (e) {
        var td = e.target || e.srcElement;
        if (td.getAttribute('cmd') != null) {
            this.onCmd(td);
            return;
        }

        for (var i = 0; i < 5; ++i) {
            td = td.parentNode;
            if (td == null || td.tagName != "TD")
                return;

            if (td.getAttribute('cmd') != null) {
                this.onCmd(td);
                return;
            }
        }
    },

    /**
    * Do a toolbar command
    * @function doCmd
    * @param {string} cmd - the command name
    * @returns null
    */
    doCmd: function (cmd) {
        if (this.toolbar == null)
            return;

        var list = this.toolbar.getButtons();
        for (var i = 0; i < list.length; ++i) {
            var p = list[i];
            if (this.options.skin == "si")
                p = p.parentNode;
            if (p.getAttribute("cmd") == cmd) {
                this.onCmd(p);
                break;
            }
        }
    },

    onCmd: function (td) {
        var useonce = true;
        this.start = null;
        var cmd = this.getCmd(td);
        JSDraw2.Menu.close();
        switch (cmd) {
            case "about":
            case "jsdraw":
                JSDraw2.Editor.showAbout();
                break;
            case "inkclearall":
                if (this.ink != null)
                    this.ink.clear();
                break;
            case "inkclear":
                if (this.ink != null)
                    this.ink.clearLastOne();
                break;
            case "center":
                this.pushundo();
                this.fitToWindow();
                this.redraw();
                break;
            case "zoomin":
                this.pushundo();
                this.scale(1.25, new JSDraw2.Point(this.dimension.x / 2, this.dimension.y / 2));
                this.redraw();
                useonce = false;
                break;
            case "zoomout":
                this.pushundo();
                this.scale(0.75, new JSDraw2.Point(this.dimension.x / 2, this.dimension.y / 2));
                this.redraw();
                useonce = false;
                break;
            case "new":
                if (!this.m.isEmpty()) {
                    var me = this;
                    scil.Utils.confirmYes("Clear all contents?", function () {
                        me.pushundo();
                        me.clear(null, true);
                        me.refresh(true);
                        if (me.options.filenew != null)
                            me.options.filenew(me);
                    }, this);
                }
                else {
                    if (this.ink != null)
                        this.ink.clear();
                }
                break;
            case "save":
                if (this.options.filesave != null)
                    this.options.filesave(this);
                else if (scil.Utils.serviceAvailable())
                    JSDraw2.JSDrawIO.jsdFileSave(this);
                else
                    this.onShowSaveFileDlg();
                break;
            case "open":
                if (this.options.fileopen != null)
                    this.options.fileopen(this);
                else if (scil.Utils.serviceAvailable())
                    JSDraw2.JSDrawIO.jsdFileOpen(this);
                else
                    this.onShowOpenFileDlg();
                break;
            case "undo":
                if (this.undo())
                    this.refresh(true);
                useonce = true;
                break;
            case "redo":
                if (this.redo())
                    this.refresh(true);
                useonce = true;
                break;
            case "rxn":
                var cloned = this.clone();
                if (this.cleanupRxn(this.bondlength)) {
                    this.pushundo(cloned);
                    this.refresh(true);
                }
                break;
            case "copyprod":
                var rxn = this.m.parseRxn(true);
                if (rxn != null && rxn.reactants.length > 0 && rxn.products.length == 0) {
                    this.pushundo();
                    for (var i = 0; i < rxn.reactants.length; ++i) {
                        rxn.products.push(rxn.reactants[i].clone());
                    }
                    this.setRxn(rxn, false);
                    this.refresh(true);
                }
                else {
                    scil.Utils.alert("It's already a reaction");
                }
                break;
            case "rxnmap2":
                var cloned = this.clone();
                if (this.m.clearAtomMap() > 0) {
                    this.pushundo(cloned);
                    this.refresh(true);
                }
                else {
                    scil.Utils.alert("No reaction map found");
                }
                break;
            case "seq":
                JSDraw2.SequenceBuilder.show(this, JSDraw2.BIO.AA, "Peptide");
                break;
            case "helix":
                JSDraw2.SequenceBuilder.show(this, JSDraw2.BIO.BASE_DNA, "DNA");
                break;
            case "rna":
                JSDraw2.SequenceBuilder.show(this, JSDraw2.BIO.BASE_RNA, "RNA");
                break;
            case "n2s":
                JSDraw2.JSDrawIO.name2structure(this);
                break;
            case "cleanup":
                JSDraw2.JSDrawIO.cleanup(this);
                break;
            case "selectall":
                if (this.selectAll())
                    this.redraw();
                break;
            case "copy":
                this.copy();
                break;
            case "cut":
                if (this.cut())
                    this.redraw();
                break;
            case "paste":
                if (this.paste())
                    this.redraw();
                break;
            case "fliph":
                this.flip("hori");
                break;
            case "flipv":
                this.flip("vert");
                break;
            case "reaxys":
            case "scifinder":
            case "pubchem":
            case "chemspider":
                this.sendQuery(cmd);
                useonce = true;
                break;
            case "chemdraw":
                JSDraw2.ChemdrawPopup.show(this);
                useonce = true;
                break;
            case "eraser":
                if (!this.onDel())
                    useonce = false;
                break;
            case "...":
            case "more":
                this.showPT();
                useonce = false;
                break;
            case "pastechemdraw":
                JSDraw2.ChemDraw.paste(this);
                break;
            case "copychemdraw":
                JSDraw2.ChemDraw.copy(this);
                break;
            case "symbol":
                this.showSymbolDlg();
                break;
            case "template.[custom]":
                this.showTemplatesDlg();
                useonce = false;
                break;
            case "tlctemplate":
                JSDraw2.TLCTemplates.show(true, this);
                break;
            case "tlcnumber":
                this.numberTlcPlates();
                break;
            case "fullscreen":
            case "fullscreen2":
                if (JSDraw2.Fullscreen != null)
                    JSDraw2.Fullscreen.show(this);
                useonce = true;
                break;
            case "helm_import":
                if (this.helm != null)
                    this.helm.showImportDlg();
                useonce = true;
                break;
            case "helm_find":
                if (this.helm != null)
                    this.helm.showFindReplaceDlg();
                useonce = true;
                break;
            case "helm_mex":
                if (this.helm != null)
                    scil.helm.MonomerExplorer.showDlg(this);
                useonce = true;
                break;
            case "helm_layout":
                if (this.helm != null)
                    this.helm.clean(null, true);
                useonce = true;
                break;
            default:
                useonce = false;
                break;
        }

        if (!useonce)
            this.onCmd2(td);
    },

    onCmd2: function (td) {
        var cmd = this.getCmd(td);
        if (cmd == "rxnmap") {
            var rxn = this.m.parseRxn();
            if (rxn == null || rxn.reactants.length == 0 || rxn.products.length == 0) {
                scil.Utils.alert("Please draw a completed reaction first.");
                return;
            }
        }
        var pid = dojo.attr(td, "parent");
        var parent = pid == null ? null : dojo.byId(pid);
        if (parent != null) {
            this.toolbar.exchangeButton(parent, td);
            td = parent;
        }
        if (this.curButton != td) {
            if (this.options.skin == "w8") {
                var me = this;
                if (this.curButton != null) {
                    dojo.style(this.curButton, { backgroundImage: scil.Utils.imgSrc("w8/" + me.options.buttonshape + ".png", true) });
                    this.curButton.removeAttribute("pushed");
                }
                td.setAttribute("pushed", 1);
                dojo.style(td, { backgroundImage: scil.Utils.imgSrc("w8/" + me.options.buttonshape + "0.png", true) });
            }
            else if (this.options.skin == "si") {
                if (this.curButton != null) {
                    dojo.style(this.curButton, { background: "" });
                    this.curButton.removeAttribute("pushed");
                }
                td.setAttribute("pushed", 1);
                dojo.style(td, { background: JSDraw2.Skin.jsdraw.btnselcolor });
            }
            else {
                if (this.curButton != null) {
                    dojo.style(this.curButton, { border: "none", padding: "2px" });
                    //this.curButton.removeAttribute("pushed");
                }
                //td.setAttribute("pushed", 1);
                dojo.style(td, { border: "solid 1px", borderColor: "#c0c0c0 #f5f5f5 #f5f5f5 #c0c0c0", padding: "1px" });
            }
            this.curButton = td;
        }
    },

    flip: function (dir) {
        if (this.m.isEmpty())
            return;

        var list = [];
        var atoms = this.m.atoms;
        for (var i = 0; i < atoms.length; ++i) {
            if (atoms[i].selected)
                list.push(atoms[i]);
        }

        if (list.length == 0) {
            var graphics = this.m.graphics;
            for (var i = 0; i < graphics.length; ++i) {
                if (graphics[i].selected && JSDraw2.Curve.cast(graphics[i]) != null)
                    list.push(graphics[i]);
            }

            if (list.length != 0) {
                this.pushundo();
                for (var i = 0; i < list.length; ++i)
                    list[i].flip();
                this.refresh(true);
                return;
            }
        }

        var flipBond = null;
        var flipaxis = null;
        var center = null;
        if (list.length == 0) {
            center = this.getCenter();
            list = atoms;
        }
        else if (list.length == 1) {
            center = list[0].p.clone();

            var frag = this.getFragment(list[0]);
            if (frag != null)
                list = frag.atoms;
        }
        else {
            if (list.length == 2 && (flipBond = this.m.findBond(list[0], list[1])) != null) {
                center = flipBond.center();

                var frag = this.getFragment(list[0]);
                if (frag != null)
                    list = frag.atoms;
            }
            else {
                var links = this.getConnectingAtomBonds(list);
                if (links.length == 1) {
                    flipBond = links[0].b;
                    center = (flipBond.a1.f ? flipBond.a1 : flipBond.a2).p.clone();
                }
                else if (links.length == 2) {
                    flipaxis = { a1: links[0].a, a2: links[1].a };
                }
                else {
                    center = this.getCenter(list);
                }
            }
        }

        if (flipBond != null)
            flipaxis = { a1: flipBond.a1, a2: flipBond.a2 };

        this.pushundo();
        if (flipaxis != null) {
            var deg = flipaxis.a2.p.angleTo(flipaxis.a1.p);
            center = flipaxis.a1.p.clone();
            this.rotate(list, center, -deg);
            for (var i = 0; i < list.length; ++i) {
                var p = list[i].p;
                p.y = center.y - (p.y - center.y);
            }
            this.rotate(list, center, deg);
        }
        else {
            if (dir == "vert") {
                for (var i = 0; i < list.length; ++i) {
                    var p = list[i].p;
                    p.y = center.y - (p.y - center.y);
                }
            }
            else {
                for (var i = 0; i < list.length; ++i) {
                    var p = list[i].p;
                    p.x = center.x - (p.x - center.x);
                }
            }
        }
        this._invertStereoBonds(list);

        this.refresh(true);
    },

    _invertStereoBonds: function (list) {
        var all = list.length == this.m.atoms.length;
        for (var i = 0; i < this.m.bonds.length; ++i) {
            var b = this.m.bonds[i];
            if (b.type == JSDraw2.BONDTYPES.WEDGE || b.type == JSDraw2.BONDTYPES.HASH) {
                if (scil.Utils.indexOf(list, b.a1) >= 0 || scil.Utils.indexOf(list, b.a2) >= 0) {
                    b.type = b.type == JSDraw2.BONDTYPES.WEDGE ? JSDraw2.BONDTYPES.HASH : JSDraw2.BONDTYPES.WEDGE;
                }
            }
        }
    },

    sendQuery: function (cmd) {
        var smiles = this.getSmiles();
        if (smiles == null || smiles == "") {
            scil.Utils.alert("No query structure drawn");
            return;
        }
        var url;
        switch (cmd.toLowerCase()) {
            case "pubchem":
                url = "http://pubchem.ncbi.nlm.nih.gov/search/search.cgi?cmd=search&q_type=dt&simp_schtp=fs&q_data=";
                break;
            case "chemspider":
                url = "http://www.chemspider.com/Search.aspx?q=";
                break;
            case "reaxys":
                url = "https://www.reaxys.com/reaxys/secured/hopinto.do?context=S&query=";
                break;
            case "scifinder":
                url = "https://www.reaxys.com/reaxys/secured/hopinto.do?context=S&query=";
                break;
            default:
                return;
        }
        url += escape(smiles);
        window.open(url, "_blank");
    },

    onShowOpenFileDlg: function () {
        var me = JSDraw2.Editor;
        if (me.openfiledlg == null) {
            var fileformats = null;
            if (JSDraw2.Security.kEdition == "Lite") {
                if (this.options.helmtoolbar)
                    fileformats = { helm: "HELM", xhelm: "xHELM" };
                else
                    fileformats = { mol: "Mol File", smiles: "SMILES" };
            }
            else if (jsd.options.tlcplate)
                fileformats = JSDraw2.JSDrawIO.jsdFiles2;
            else
                fileformats = JSDraw2.JSDrawIO.jsdFiles;

            var fields = { filetype: { label: "File Type", type: "select", items: fileformats }, contents: { label: "Contents", type: "textarea", width: 800, height: 400} };
            me.openfiledlg = scil.Form.createDlgForm("Import File", fields, { label: "Import", onclick: function () { me.onOpenFile(); } });
        }
        me.openfiledlg.show();
        me.openfiledlg.form.setData({});
        me.openfiledlg.jsd = this;
    },

    onShowSaveFileDlg: function () {
        var me = JSDraw2.Editor;
        if (me.savefiledlg == null) {
            var fileformats = null;
            if (JSDraw2.Security.kEdition == "Lite") {
                if (this.options.helmtoolbar)
                    fileformats = { helm: "HELM", xhelm: "xHELM" };
                else
                    fileformats = { mol: "Mol File", smiles: "SMILES" };
            }
            else if (jsd.options.tlcplate)
                fileformats = JSDraw2.JSDrawIO.jsdFiles2;
            else
                fileformats = JSDraw2.JSDrawIO.jsdFiles;

            var fields = { filetype: { label: "File Type", type: "select", items: fileformats }, contents: { label: "Contents", type: "textarea", width: 800, height: 400} };
            me.savefiledlg = scil.Form.createDlgForm("Export File", fields, null, { onchange: function (field) {
                if (field == me.savefiledlg.form.fields.filetype) me.onSaveFile();
            }
            });
        }
        me.savefiledlg.show();
        me.savefiledlg.form.setData({});
        me.savefiledlg.jsd = this;
    },

    onPT: function (elem) {
        JSDraw2.Editor.periodictable.hide();
        if (elem != null)
            this.ptElement = elem;
    },

    showPT: function (callback) {
        JSDraw2.needPro();
    },

    showAtomDlg: function (a) {
        JSDraw2.needPro();
    },

    setAtomProps: function (a) {
        JSDraw2.needPro();
    },

    showBondDlg: function (b) {
        JSDraw2.needPro();
    },

    setBondProps: function (b) {
        JSDraw2.needPro();
    },

    /**
    * Set Secptrum JDX data
    * @function setJdx
    * @param {string} data - JDX string
    */
    setJdx: function (data) {
        var m = new JSDraw2.Mol();
        m.setJdx(data, this.bondlength);

        this.setMol(m);
    },

    getData: function (format) {
        if (format == "mol")
            return this.getMolfile();
        else if (format == "mol3000")
            return this.getMolfile(true);
        else if (format == "rxn")
            return this.getRxnfile();
        else if (format == "rxn3000")
            return this.getRxnfile(null, true);
        else if (format == "xml")
            return this.getXml();
        else if (format == "helm")
            return this.getHelm();
        else if (format == "xhelm")
            return this.getXHelm();
        else if (format == "smiles")
            return this.m.getSmiles();
        else if (format == "helm")
            return this.getHelm();
        else if (format == "xhelm")
            return this.getXHelm();
        else
            return null;
    },

    setData: function (data, format) {
        this.setFile(data, format);
    },

    /**
    * Load file data
    * @function setFile
    * @param {string} data - the file contents
    * @param {string} filetype - the file type: mol, rxn, xml.  Other file types can be loaded with JSDraw.WebServices
    * @returns the Mol object loaded
    */
    setFile: function (data, filetype) {
        var m = null;
        if (filetype == "mol")
            m = this.m.setMolfile(data);
        else if (filetype == "rxn")
            m = this.m.setRxnfile(data);
        else if (filetype == "xml")
            m = this.m.setXml(data);
        else if (filetype == "helm") {
            this.setHelm(data);
            return;
        }
        else if (filetype == "xhelm") {
            this.setXHelm(data);
            return;
        }
        else if (filetype == "jdx")
            m = this.m.setJdx(data, this.bondlength);
        else
            return;

        if (m == null) {
            this.clear(true);
            return;
        }

        this.setMol(m);
        return this.m;
    },

    /**
    * Load a Mol object
    * @function setMol
    * @param {Mol} mol - the Mol object to be loaded
    * @returns true or false
    */
    setMol: function (mol) {
        if (mol != null && typeof (mol) == "object" && mol.T == "MOL") {
            this.m = mol;
            this.m.showimplicithydrogens = this.options.showimplicithydrogens;
            if (this.options.removehydrogens)
                this.m.removeHydrogens();
            this.m.calcHCount();
            this.m.toScreen(this.bondlength);
            this.fitToWindow();
            this._setmol(this.m);
            this.refresh(true);
            return true;
        }
        return false;
    },

    /**
    * Load a molfile
    * @function setMolFile
    * @param {string} molfile - the mol file contents
    * @returns null
    */
    setMolfile: function (molfile) {
        this.setFile(molfile, "mol");
    },

    /**
    * Load a rxnfile
    * @function setRxnFile
    * @param {string} rxnfile - the rxn file contents
    * @returns null
    */
    setRxnfile: function (rxnfile) {
        this.setFile(rxnfile, "rxn");
    },

    /**
    * Get molfile data
    * @function getMolfile
    * @param {bool} v3000 - indicate if rendering it in mol v3000 format
    * @returns the molfile string
    */
    getMolfile: function (v3000, excludeDummyBonds) {
        this.m.bondlength = this.bondlength;
        return this.m.getMolfile(false, v3000, excludeDummyBonds);
    },

    /**
    * Get SVG data
    * @function getSvg
    * @returns the svg string
    */
    getSvg: function () {
        var g = dojox.gfx;
        if (g.renderer != "svg")
            return null;

        var r = this.m.rect();
        r.inflate(20, 20);
        var gu = dojox.gfx.utils;
        this.m.offset(-r.left, -r.top);
        this.redraw();
        var xml = gu._cleanSvg(gu._innerXML(this.surface.rawNode));
        this.m.offset(r.left, r.top);
        this.redraw();
        xml = xml.replace(/ width="[0-9]+"/, " width=\"" + Math.round(r.width) + "\"");
        xml = xml.replace(/ height="[0-9]+"/, " height=\"" + Math.round(r.height) + "\"");
        return xml;
    },

    /**
    * Get JSDraw Xml data
    * @function getXml
    * @param {number} width - the view width
    * @param {number} height - the view height
    * @param {bool} viewonly - indicate if it is viewonly mode
    * @returns a string
    */
    getXml: function (width, height, viewonly, withsvg) {
        var svg = null;
        try {
            svg = withsvg ? this.getSvg() : null;
        }
        catch (e) {
        }

        this.m.bondlength = this.bondlength;
        return this.m.getXml(width > 0 ? width : this.dimension.x, height > 0 ? height : this.dimension.y, viewonly, svg, this.bondlength);
    },

    getHtml: function (width, height, viewonly, withsvg) {
        return this.getXml(width, height, viewonly, withsvg);
    },

    getSequence: function (highlightselection) {
        return this.helm == null ? null : this.helm.getSequence(highlightselection);
    },

    getHelm: function (highlightselection) {
        return this.helm == null ? null : this.helm.getHelm(highlightselection);
    },

    setHelm: function (s) {
        return this.helm == null ? null : this.helm.setHelm(s);
    },

    getXHelm: function () {
        return this.helm == null ? null : this.helm.getXHelm();
    },

    setXHelm: function (s) {
        return this.helm == null ? null : this.helm.setXHelm(s);
    },

    /**
    * Set JSDraw Xml data
    * @function setXml
    * @param {string} xml - the JSDraw Xml string
    * @returns the Mol object loaded
    */
    setXml: function (xml, setmodified) {
        var doc = typeof (xml) == "string" ? scil.Utils.parseXml(xml) : xml;
        if (doc == null) {
            if (typeof (xml) == "string" && xml.indexOf("M  END") > 0)
                return this.setMolfile(xml);
            return;
        }

        if (this.helm != null && this.helm.isXHelm(doc)) {
            this.setXHelm(doc);
            return;
        }

        this.clear();
        var root = null;
        if (typeof (xml) == "string")
            root = doc == null ? null : (doc.documentElement || doc.firstElementChild);
        else
            root = xml;
        this.m.setXml(root);

        this.m.calcHCount();
        if (this.m.bondlength > 0) {
            this.m.scale(JSDraw2.Editor.BONDLENGTH / this.m.bondlength);
            this.resetScale();
        }
        else {
            this.m.toScreen(this.bondlength);
        }
        this.fitToWindow();
        this._setmol(this.m);
        this.refresh(setmodified == null ? true : setmodified);
        return this.m;
    },

    setHtml: function (xml) {
        return this.setXml(xml);
    },

    /**
    * Get Rxnfile
    * @function getRxnfile
    * @param {bool} groupbyplus - indicate if grouping reactants/products based on explicit plus signs
    * @param {bool} v3000 - indicate if rendering in v3000 format
    * @returns a string
    */
    getRxnfile: function (groupbyplus, v3000) {
        return this.m.getRxnfile(groupbyplus, v3000);
    },

    /**
    * Get SMILES
    * @function getSmiles
    * @returns a string
    */
    getSmiles: function () {
        return this.m.getSmiles();
    },

    setMolbase64: function (molfile) {
        var s = JSDraw2.Base64.decode(molfile);
        this.setMolfile(s);
    },

    setRxnbase64: function (rxnfile) {
        var s = JSDraw2.Base64.decode(rxnfile);
        this.setRxnfile(s);
    },

    getMolbase64: function () {
        var s = this.m.getMolfile();
        return JSDraw2.Base64.encode(s);
    },

    hasHelmNodes: function () {
        if (this.helm == null)
            return false;

        for (var i = 0; i < this.m.atoms.length; ++i) {
            if (scil.helm.isHelmNode(this.m.atoms[i]))
                return true;
        }

        return false;
    },

    /**
    * Get Formula
    * @function getFormula
    * @param {bool} html - indicate if rendering Formula in HTML format
    * @returns a string
    */
    getFormula: function (html) {
        if (this.hasHelmNodes())
            return this.helm.getMF(html);
        else
            return this.m.getFormula(html);
    },

    /**
    * Get molecular weight
    * @function getMolWeight
    * @returns a number
    */
    getMolWeight: function () {
        if (this.hasHelmNodes())
            return this.helm.getMW();
        else
            return this.m.getMolWeight();
    },

    /**
    * Get Extinction Coefficient
    * @function getExtinctionCoefficient
    * @returns a number
    */
    getExtinctionCoefficient: function () {
        if (this.hasHelmNodes())
            return this.helm.getExtinctionCoefficient();
        else
            return null;
    },

    /**
    * Get exact mass
    * @function getExactMass
    * @returns a number
    */
    getExactMass: function () {
        return this.m.getExactMass();
    },

    setAny: function (s, fmt) {
        if (!scil.Utils.serviceAvailable() || s == null || s.length == 0)
            return;

        var me = this;
        var xhrArgs = {
            url: scil.Utils.scriptUrl() + "Service.aspx?cmd=tomolfile",
            postData: "input=" + escape(s) + "&fmt=" + escape(fmt),
            handleAs: "json",
            load: function (ret) {
                if (ret.success) {
                    me.pushundo(me.clone());
                    me.setMolfile(ret.result);
                }
                else {
                    scil.Utils.alert(ret.error);
                }
            },
            error: function (ret) {
                scil.Utils.alert(ret.message);
            }
        };

        var deferred = dojo.rawXhrPost(xhrArgs);
    },

    /**
    * Highlight a query structure
    * @function highlight
    * @param {string or Mol} query - the query structure
    * @returns true or false
    */
    highlight: function (query) {
        var q = null;
        if (typeof query == "string")
            q = new JSDraw2.Mol(this.options.showimplicithydrogens).setMolfile(query);
        else
            q = query.T == "MOL" ? query : query.m;
        if (q == null)
            return false;

        var target = this;
        var map = q.aamap(target.m, false, true);
        target.redraw();
        return map != null;
    },

    /**
    * Perform a sub-structure search using this molecule as the query
    * @function highlight
    * @param {Editor} target - the target structure
    * @returns true or false
    */
    sss: function (target) {
        return target.highlight(this);
    },

    res: function (s) {
        return JSDraw2.Language.res(s);
    },

    isSkinW8: function () {
        return this.options.skin == "w8" || this.options.skin == "si";
    },

    download: function (url, filetype) {
        var me = this;
        var callback = function (data) {
            if (data.ret != null)
                me.setFile(data.ret.molfile, filetype);
            else
                me.setFile(data, filetype);
        };
        scil.Utils.download(url, callback);
    },

    /**
    * Write the current structure into a cookie, so it can be reloaded next time
    * @function writeCookie
    * @param {string} name - cookie name
    * @param {number} days - cookie valid days
    * @returns null
    */
    writeCookie: function (name, days) {
        if (name == null || name.length == 0)
            name = "__jsdraw_cookie_structure";
        if (!(days > 0))
            days = 30;
        var html = this.getXml();
        scil.Utils.createCookie(name, html, days);
    },

    /**
    * Read the structure from a saved cookie
    * @function readCookie
    * @param {string} name - cookie name
    * @returns null
    */
    readCookie: function (name) {
        if (name == null || name.length == 0)
            name = "__jsdraw_cookie_structure";
        var html = scil.Utils.readCookie(name);
        this.setXml(html);
    },

    /**
    * Destory the editor
    * @returns null
    */
    destroy: function () {
        this.div = null;
        this.curObject = null;
        this.curButton = null;
        this.texteditor = { input: null, text: null, atom: null };
        this.maintable = null;
        if (this.toolbar != null) {
            this.toolbar.destroy();
            this.toolbar = null;
        }
        if (this.surface != null) {
            try {
                this.surface.destroy();
            }
            catch (e) {
            }
            this.surface = null;
        }
        for (var i = 0; i < this.connectHandlers.length; ++i)
            dojo.disconnect(this.connectHandlers[i]);
        this.connectHandlers = null;
    },

    bodyMouseDown: function (e) {
        var src = e.target || e.srcElement;
        if (this.texteditor.ed != null && this.texteditor.ed.isVisible() && !(this.texteditor.ed.isChildOf(src) || JSDraw2.Symbol != null && JSDraw2.Symbol.isFrom(src))) {
            this.hideTextEditor();
            return;
        }

        if (this.texteditor.ed != null && this.texteditor.ed.isChildOf(src) || this.contextmenu != null && this.contextmenu.isFrom(src))
            return;

        var dlg = scil.Dialog.getDialog(src);
        if (dlg != null && dlg.owner == this)
            return;

        if (this._testdeactivation != null) {
            if (this._testdeactivation(e, this))
                return;
        }

        var f = scil.Utils.hasAnsestor(src, this.surface.children[0].rawNode) || this.isFromSvgGroup(src) || scil.Utils.hasAnsestor(src, this.maintable);
        //var f = src.__gfxObject__ != null || scil.Utils.hasAnsestor(src, this.maintable);
        if (this.activated) {
            if (!f)
                this.activate(false);
        }
        else {
            if (f)
                this.activate(true);
        }
    },

    isFromSvgGroup: function (src) {
        if (dojox.gfx.renderer != "svg")
            return false;
        var g = scil.Utils.getParent(src, "g");
        return g != null && g.getAttribute("__surface_parentid") == this.id;
    },

    bodyTouchStart: function (e) {
        if (this.activated && e.touches.length > 0) {
            var te = e.touches[0];
            var src = te.target || te.srcElement;
            if (!scil.Utils.hasAnsestor(src, this.maintable))
                this.activate(false);
        }
        this.bodyMouseDown(e);
    },

    //    bodyClick: function (e) {
    //    },

    touchClick: function (e) {
        if (!this.activated) {
            this.activate(true);
            e.preventDefault();
            return false;
        }
    },

    touch: {
        reset: function (jsd) {
            if (this.cloned != null) {
                jsd.pushundo(this.cloned);
                jsd.setModified(true);
            }
            this.center = null;
            this.start1 = null;
            this.start2 = null;
            this.end1 = null;
            this.end2 = null;
            this.gesture = null;
            this.deg = null;
            this.scale = null;
            this.cloned = null;
        }
    },

    resetGesture: function () {
        this.touch.reset(this);
    },

    holding: {
        delay: 1000,
        tor: 2,
        e: null,
        tm: null,
        timer: null,
        jsd: null,

        start: function (e, jsd) {
            if (!scil.Utils.isTouch && !window.navigator.msPointerEnabled)
                return;
            this.end();
            this.e = { clientX: e.clientX, clientY: e.clientY };
            this.tm = new Date().getTime();
            this.jsd = jsd;
            var me = this;
            this.timer = setTimeout(function () { me.timeout(); }, this.delay);
        },

        end: function () {
            if (this.timer == null)
                return;
            this.e = null;
            this.tm = null;
            clearTimeout(this.timer);
            this.timer = null;
        },

        timeout: function () {
            if (this.e != null) {
                this.jsd.start = null;
                this.jsd.showContextMenu(this.e, this.jsd.options.viewonly);
            }
            this.end();
        },

        move: function (e) {
            if (this.e != null && (Math.abs(e.clientX - this.e.clientX) > this.tor || Math.abs(e.clientY - this.e.clientY) > this.tor))
                this.end();
        }
    },

    touchStart: function (e) {
        if (!this.activated)
            return;

        if (JSDraw2.Menu.isOpen()) {
            JSDraw2.Menu.close();
            e.preventDefault();
            return false;
        }

        if (e.touches.length == 1) {
            this.mousedown(e.touches[0]);
            e.preventDefault();
            return false;
        }
        else if (e.touches.length == 2) {
            this.lastmove = null;
            this.resetGesture();

            this.touch.start1 = this.eventPoint(e.touches[0]);
            this.touch.start2 = this.eventPoint(e.touches[1]);
            this.touch.center = new JSDraw2.Point((this.touch.start1.x + this.touch.start2.x) / 2, (this.touch.start1.y + this.touch.start2.y) / 2);

            e.preventDefault();
            return false;
        }
    },

    touchMove: function (e) {
        if (!this.activated)
            return;

        if (e.touches.length == 1) {
            this.mousemove(e.touches[0]);
            e.preventDefault();
            this.resetGesture();
            return false;
        }

        this.holding.end();
        if (this.ink != null)
            this.ink.cancel();

        this.start = null;
        if (e.touches.length == 2) {
            var p1 = this.eventPoint(e.touches[0]);
            var p2 = this.eventPoint(e.touches[1]);
            if (this.touch.start1 == null) {
                this.touch.start1 = p1;
                this.touch.start2 = p2;
                return;
            }

            if (p1.equalsTo(this.touch.end1) && p2.equalsTo(this.touch.end2))
                return;
            this.touch.end1 = p1;
            this.touch.end2 = p2;

            if (this.touch.gesture == null && this.touch.start1 != null && this.touch.start2 != null) {
                var d1 = this.touch.end1.distTo(this.touch.start1);
                var d2 = this.touch.end2.distTo(this.touch.start2);
                if (d1 > 25 || d2 > 25) {
                    var a1 = this.touch.end1.angleTo(this.touch.start1);
                    var a2 = this.touch.end2.angleTo(this.touch.start2);
                    var da = Math.abs(a1 - a2);
                    if (d1 > 8 && d2 > 8 && (da < 30 || Math.abs(da - 360) < 30)) {
                        this.touch.gesture = "moving";
                    }
                    else {
                        var a3 = d1 > 25 ? this.touch.start1.angleAsOrigin(this.touch.end1, this.touch.start2) : this.touch.start2.angleAsOrigin(this.touch.end2, this.touch.start1);
                        if (Math.abs(a3 - 180) < 45 || Math.abs(a3 - 360) < 45)
                            this.touch.gesture = "zooming";
                        else
                            this.touch.gesture = "rotating";
                    }
                    //dojo.byId("Textarea1").value += "d1=" + d1 + ", d2=" + d2 + ", " + a1 + ", " + a2 + ", " + a3 + "\r\n";
                }
            }

            if (this.touch.gesture != null && (!this.touch.end1.equalsTo(this.touch.start1) || !this.touch.end2.equalsTo(this.touch.start2))) {
                if (this.touch.gesture == "zooming") {
                    var dx = this.touch.end1.x - this.touch.start1.x;
                    var dy = this.touch.end2.y - this.touch.start1.y;
                    if (Math.abs(dx) >= this.movingresolution || Math.abs(dy) >= this.movingresolution) {
                        this.touch.scale = this.touch.end1.distTo(this.touch.end2) / this.touch.start1.distTo(this.touch.start2);
                        if (this.touch.cloned == null)
                            this.touch.cloned = this.clone();
                        this.scale(this.touch.scale, this.touch.center);
                        this.touch.start1 = this.touch.end1;
                        this.touch.start2 = this.touch.end2;
                        this.redraw();
                        //this.surface.rootgroup.setTransform([dojox.gfx.matrix.scaleAt(this.touch.scale, this.touch.scale, this.touch.center.x, this.touch.center.y)]);
                    }
                }
                else if (this.touch.gesture == "moving") {
                    var dx = this.touch.end1.x - this.touch.start1.x;
                    var dy = this.touch.end1.y - this.touch.start1.y;
                    if (Math.abs(dx) >= this.movingresolution || Math.abs(dy) >= this.movingresolution) {
                        if (this.touch.cloned == null)
                            this.touch.cloned = this.clone();
                        this.m.offset(dx, dy);
                        this.touch.start1 = this.touch.end1;
                        this.redraw();
                        //this.surface.rootgroup.setTransform([dojox.gfx.matrix.translate(this.touch.end1.x - this.touch.start1.x, this.touch.end1.y - this.touch.start1.y)]);
                    }
                }
                else if (this.touch.gesture == "rotating") {
                    var a1 = this.touch.start2.angleAsOrigin(this.touch.start1, this.touch.end1);
                    var a2 = this.touch.start1.angleAsOrigin(this.touch.start2, this.touch.end2);
                    if (a1 > 180)
                        a1 -= 360;
                    if (a2 > 180)
                        a2 -= 360;
                    if ((Math.abs(a1) >= 1 || Math.abs(a2) >= 1) && Math.abs(a1) < 30 && Math.abs(a2) < 30) {
                        var s = Math.abs(a2) / (Math.abs(a1) + Math.abs(a2));
                        var x = this.touch.start1.x + (this.touch.start2.x - this.touch.start1.x) * s;
                        var y = this.touch.start1.y + (this.touch.start2.y - this.touch.start1.y) * s;
                        this.m.rotate(new JSDraw2.Point(x, y), Math.abs(a1) > Math.abs(a2) ? a1 : a2);
                        this.touch.start1 = this.touch.end1;
                        this.touch.start2 = this.touch.end2;
                        this.redraw();
                    }
                }
            }
            e.preventDefault();
            return false;
        }

        this.resetGesture();
    },

    touchEnd: function (e) {
        if (!this.activated)
            return;

        this.resetGesture();
        this.mouseup(e);
        return false;
    },

    /**
    * Activate the editor and set focus
    * @function activate
    * @param {bool} f - indicate setting focus or name
    * @param {bool} show - indicate if redrawing the structure
    * @returns null
    */
    activate: function (f, show) {
        if (this.activated == f || this.maintable == null)
            return;

        this.activated = f;
        if (f) {
            if (JSDraw2.__currentactived != this && JSDraw2.__currentactived != null)
                JSDraw2.__currentactived.activate(false);
            JSDraw2._currentactived = this;
        }

        if (window.navigator.msPointerEnabled) {
            if (f) {
                if (document.body.style.overflow != "hidden") {
                    this._msContentZooming = document.body.style.msContentZooming;
                    this._overflow = document.body.style.overflow;
                    document.body.style.msContentZooming = "none";
                    document.body.style.overflow = "hidden";
                }
            }
            else {
                if (document.body.style.overflow != this._overflow) {
                    document.body.style.msContentZooming = this._msContentZooming;
                    document.body.style.overflow = this._overflow;
                }
            }
        }

        if (!f && this.contextmenu != null)
            this.contextmenu.hide();

        if (show == false)
            return;

        if (this.options.focusbox != false)
            this.maintable.style.borderColor = f ? (this.options.focuscolor == null ? "#5555ff" : this.options.focuscolor) : "#cccccc";
        if (!f && this.curObject != null) {
            this.curObject = null;
            this.redraw();
        }

        if (this.options.onfocus != null)
            this.options.onfocus(f);
    }
});

scilligence.apply(JSDraw2.Editor, {
    __xcode: 91,
    undoGestureTime: 300,
    dblclickdelay: 300,
    BONDLENGTH: 30.0,
    ANGLESTOP: 30.0,
    LINEWIDTH: 2.0,
    TOR: 10.0,
    FONTSIZE: 14.0,

    /**
    * Get the Editor object by its ID
    * @function {static} get
    * @param {string} id - the Editor ID
    * @returns the Editor object
    */
    get: function (id) {
        if (JSDraw2.Editor._allitems == null)
            JSDraw2.Editor._allitems = {};
        return id == null ? null : JSDraw2.Editor._allitems[id];
    },

    getClipboard: function () {
        var data = scil.Utils.readCookie("__jsdrawclipboard");
        if (data == null || data == "")
            return null;

        data = JSDraw2.Base64.decode(data);
        var m = new JSDraw2.Mol();
        if (m.setXml(data) == null || m.isEmpty())
            return null;

        //scil.Utils.createCookie("__jsdrawclipboard", "");
        return m;
    },

    setClipboard: function (m, bondlength) {
        if (m != null && !m.isEmpty()) {
            scil.Utils.createCookie("__jsdrawclipboard", JSDraw2.Base64.encode(m.getXml(null, null, null, null, bondlength)));
            return true;
        }

        scil.Utils.alert("Nothing placed on clipboard.");
        return false;
    },

    /**
    * Show JSDraw About box
    * @function {static} showAbout
    * @returns null
    */
    showAbout: function () {
        if (JSDraw2.Editor.about == null) {
            var div = scil.Utils.createElement(null, "div", null, { width: "430px", color: "black" });
            scil.Utils.createElement(div, "img", null, null, { src: scil.Utils.imgSrc("img/jsdraw2.jpg") });

            var lic;
            if (JSDraw2.Security.kEdition == "Lite") {
                lic = "<span style='color:red'>JSDraw Lite for HELM</span>";
            }
            else {
                var exp = JSDraw2.Security.lic == null ? null : JSDraw2.Security.lic.expiration;
                lic = JSDraw2.Security.error != null ? JSDraw2.Security.error : "Licensed to <b>" + JSDraw2.Security.lic.licensor + "</b>, expires on " + exp.getFullYear() + "-" + (exp.getMonth() + 1) + "-" + exp.getDate();
                if (!JSDraw2.Security.valid)
                    lic = "<span style='color:red'>" + lic + "</span>";
            }

            scil.Utils.createElement(div, "div", lic, { textAlign: "right" });
            var tbody = scil.Utils.createTable(div, null, null, { borderTop: "solid 1px gray", width: "100%" });
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", JSDraw2.version);
            scil.Utils.createElement(tr, "td", "<a target='_blank' href='http://www.jsdraw.com'>http://www.jsdraw.com</a>", { textAlign: "right" });
            var btn = scil.Utils.createElement(scil.Utils.createElement(div, "div", null, { textAlign: "center" }), "button", "OK", { width: scil.Utils.buttonWidth + "px" });

            JSDraw2.Editor.about = new JSDraw2.Dialog(JSDraw2.Language.res("About JSDraw"), div);
            scil.connect(btn, "onclick", function (e) { JSDraw2.Editor.about.hide(); e.preventDefault(); });
        }
        JSDraw2.Editor.about.show();
    },

    onClickPT: function (elem, id) {
        JSDraw2.Editor.get(id).onPT(elem);
    },

    onSaveFile: function () {
        var fields = JSDraw2.Editor.savefiledlg.form.fields;
        var fmt = fields.filetype.value;
        var txt = fields.contents;
        txt.value = JSDraw2.Editor.savefiledlg.jsd.getData(fmt);
        txt.select();
        txt.focus();
    },

    onOpenFile: function () {
        var fields = JSDraw2.Editor.openfiledlg.form.fields;

        var s = fields.contents.value;
        var fmt = fields.filetype.value;
        JSDraw2.Editor.openfiledlg.jsd.setData(s, fmt);
        JSDraw2.Editor.openfiledlg.hide();
    },

    initNoDelay: function () {
        var list = document.getElementsByTagName("div");
        for (var i = 0; i < list.length; i++) {
            var e = list[i];
            if (dojo.hasClass(e, 'JSDraw')) {
                new JSDraw2.Editor(e);
                dojo.removeClass(e, 'JSDraw');
            }
        }
    },

    /**
    * Initialize all DIV HTML elements and their class marked as JSDraw, and convert all of them into JSDraw Editor<br>
    * This function can be called before document.onload().<br>
    * new JSDraw2.Editor() can only be used in or after document.onload().
    * @function {static} init
    */
    init: function () {
        scil.onload(function () {
            JSDraw2.Editor.initNoDelay();
        });
    },

    /**
    * Create a JSDraw Editor<br>
    * This function can be called before document.onload().<br>
    * new JSDraw2.Editor() can only be used in or after document.onload().
    * @function {static} create
    * @param {string or DOM} id - the ID of DIV placehold, or the DIV DOM object
    * @param {dictonary} options - creating options. Please check Editor contructor for details
    */
    create: function (id, options) {
        dojo.ready(function () { new JSDraw2.Editor(id, options); });
    },

    write: function (id, options) {
        document.writeln("<div id='" + id + "'></div>");
        scil.onload(function () { new JSDraw2.Editor(id, options) });
    },

    showPopupIframe: function (title, btnText, btnFn, value) {
        var newcreated = false;
        var parentWindow = scil.Utils.getTopWindow();
        parentWindow.JSDraw2.Editor.showPopup(title, btnText, btnFn, value);
    },

    getPopupSize: function (win) {
        var args = { width: 800, height: 400 };
        if (JSDraw2.defaultoptions != null) {
            var w = JSDraw2.defaultoptions.popupwidth || JSDraw2.defaultoptions.popupWidth;
            var h = JSDraw2.defaultoptions.popupheight || JSDraw2.defaultoptions.popupHeight;
            var d = scil.Utils.getScreenSize(win); // dojo.window.getBox();
            if (typeof (w) == "string" && w.substr(w.length - 1, 1) == "%")
                args.width = d.w * parseInt(w.substr(0, w.length - 1)) / 100;
            else if (w > 0)
                args.width = s;
            if (typeof (h) == "string" && w.substr(h.length - 1, 1) == "%")
                args.height = d.h * parseInt(h.substr(0, h.length - 1)) / 100;
            else if (h > 0)
                args.height = h;
        }
        return args;
    },

    /**
    * Show JSDraw Poup Editor<br>
    * @function {static} showPopup
    * @param {string} title - the title of the Popup dialog
    * @param {string} btnText - the button text of the Popup dialog
    * @param {function(editor)} btnFn - the callback function when user clicks on the button
    * @param {number} zindex - the zIndex of the dialog DOM
    */
    showPopup: function (title, btnText, btnFn, value, zindex) {
        var args = null;
        if (JSDraw2.Editor.popupdlg == null) {
            args = this.getPopupSize();
            var tbody = scil.Utils.createTable();
            var tr = scil.Utils.createElement(tbody, 'tr');
            var td = scil.Utils.createElement(tr, 'td');
            args.div = scil.Utils.createElement(td, "div", null, { width: args.width + "px", height: args.height + "px" });

            tr = scil.Utils.createElement(tbody, 'tr');
            td = scil.Utils.createElement(tr, 'td', null, { textAlign: "center" });
            var button = scil.Utils.createElement(td, "button", null, { width: scil.Utils.buttonWidth + "px" });
            //var cancel = scil.Utils.createElement(td, "button", scil.Utils.imgTag('cancel.gif', "Cancel", { width: scil.Utils.buttonWidth + "px" });

            JSDraw2.Editor.popupdlg = new JSDraw2.Dialog(title, tbody.parentNode);
            JSDraw2.Editor.popupdlg.button = button;
            //JSDraw2.Editor.popupdlg.cancel = cancel;
        }

        JSDraw2.Editor.popupdlg.show(title, zindex);
        if (args != null) {
            if (JSDraw2.defaultoptions.popupxdraw/* && scil.Utils.isIE */) {
                args.height -= 40;
                args.value = value;
                JSDraw2.Editor.popupdlg.jsd = new scilligence.XDraw(args.div, args);
            }
            else {
                args.div.style.border = "solid 1px #ddd";
                JSDraw2.Editor.popupdlg.jsd = new JSDraw2.Editor(args.div);
                this._loadPopupData(value);
            }

            if (!scil.Utils.isIE || scil.Utils.isIE > 8)
                JSDraw2.Editor.popupdlg.updateWidth();
            //div = null;
            var fn = function (e) {
                var f = true;
                if (JSDraw2.Editor.popupdlg.callback != null) {
                    f = JSDraw2.Editor.popupdlg.callback(JSDraw2.Editor.popupdlg.jsd);
                    JSDraw2.Editor.popupdlg.callback = null;
                }
                if (f != false)
                    JSDraw2.Editor.popupdlg.hide();
                e.preventDefault();
            };
            dojo.connect(JSDraw2.Editor.popupdlg.button, "onclick", fn);
            //var fn2 = function (e) { JSDraw2.Editor.popupdlg.hide(); e.prevendDefault(); };
            //dojo.connect(JSDraw2.Editor.popupdlg.cancel, "onclick", fn2);
        }
        else {
            this._loadPopupData(value);
        }

        JSDraw2.Editor.popupdlg.button.innerHTML = scil.Utils.imgTag("tick.gif", btnText);
        JSDraw2.Editor.popupdlg.callback = btnFn;

        return JSDraw2.Editor.popupdlg.jsd;
    },

    _loadPopupData: function (value) {
        if (value == null) {
            JSDraw2.Editor.popupdlg.jsd.clear(true);
            return;
        }

        if (value.format == "jsdraw" || value.format == "html" || value.format == "xml")
            JSDraw2.Editor.popupdlg.jsd.setXml(value.value);
        else if (value.format == "mol" || value.format == "molfile")
            JSDraw2.Editor.popupdlg.jsd.setMolfile(value.value);
        else if (value.format == "jdx")
            JSDraw2.Editor.popupdlg.jsd.setJdx(value.value);
        else if (value.format == "clone") {
            JSDraw2.Editor.popupdlg.jsd.restoreClone(value.value);
            JSDraw2.Editor.popupdlg.jsd.fitToWindow();
        }
        else
            JSDraw2.Editor.popupdlg.jsd.clear(true);

        JSDraw2.Editor.popupdlg.jsd.refresh();
    }
});

scilligence.mstouch = {
    pointers: {},

    down: function (e) {
        this.pointers[e.pointerId] = { clientX: e.clientX, clientY: e.clientY, target: e.target, button: e.button, pointerId: e.pointerId, _tm: new Date().getTime() };
        e.touches = this.toTouches();
        //dojo.byId("DEBUG").value = "down: " + e.touches.length + "\r\n";
        return e;
    },

    move: function (e) {
        var t = this.pointers[e.pointerId];
        if (t == null)
            return;
        t.clientX = e.clientX;
        t.clientY = e.clientY;
        t._tm = new Date().getTime();
        e.touches = this.toTouches();
        //dojo.byId("DEBUG").value += "move: " + e.touches.length + "\r\n";
        return e;
    },

    up: function (e) {
        delete this.pointers[e.pointerId];
        e.touches = this.toTouches();
        //dojo.byId("DEBUG").value += "up: " + e.touches.length + "\r\n";
        return e;
    },

    toTouches: function () {
        var touches = [];
        var tm = new Date().getTime();
        var list = [];
        for (var k in this.pointers) {
            if (this.pointers[k]._tm > tm - 5000)
                touches.push(this.pointers[k]);
            else
                list.push(k);
        }
        for (var i = 0; i < list.length; ++i)
            delete this.pointers[list[i]];
        touches.sort(function (a, b) { return a.pointerId - b.pointerId; });
        return touches;
    }
};


JSDraw = JSDraw2.Editor;
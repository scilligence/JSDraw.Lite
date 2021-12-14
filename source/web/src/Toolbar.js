//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.Toolbar = scil.extend(scil._base, {
    constructor: function (editor) {
        this.toolbar = null;
        this.editor = editor;
        this.options = editor.options;
        this.toptoolbarTbody = null;
        this.BORDERSTYLE = "solid 1px #ccc";
        this.toolbarbkcolor = "#fcfcfc";
    },

    destroy: function () {
    },

    getButtons: function () {
        return this.toolbar.getElementsByTagName("img");
    },

    show: function (f) {
        this.toolbarrow.style.display = f ? "" : "none";
    },

    createToolbars: function (div) {
        var elems = ["H", "C", "N", "O", "S", "P", "F", "Cl", "Br", "..."];
        if (this.options.query)
            elems.push("&#9679;");

        var style = { border: this.BORDERSTYLE, background: JSDraw2.Skin.jsdraw.bkcolor };

        var me = this.editor;
        var mainbody = scil.Utils.createTable(null, 0, 0, style);
        this.toolbar = mainbody;
        dojo.connect(mainbody.parentNode, "onclick", function (e) { me.onSelBtn(e == null ? window.event : e); e.preventDefault(); });
        scil.Utils.unselectable(mainbody.parentNode);

        var background = JSDraw2.Skin.jsdraw.bkcolor;
        if (this.options.skin == "si")
            background += " url(" + JSDraw2.Skin.jsdraw.toolbarbk + ") repeat-x ";
        else if (JSDraw2.Skin.jsdraw.bkimg != null)
            background += " url(" + JSDraw2.Skin.jsdraw.bkimg + ") repeat-x ";
        var tr = scilligence.Utils.createElement(mainbody, "tr", null, { background: background });
        this.toolbarrow = tr;

        var s = scilligence.Utils.imgTag("jsdraw.gif", null, "title='" + this.res("About JSDraw") + "' style='width:" + this.options.btnsize + "px;height:" + this.options.btnsize + "px;' cmd='jsdraw'");
        if (!this.isSkinW8())
            scilligence.Utils.createElement(tr, "td", s, { paddingLeft: "3px" });

        var tbody = scilligence.Utils.createTable(scilligence.Utils.createElement(tr, "td"), 0, 0, { marginTop: (this.options.skin == "si" ? "8px" : "2px"), marginBottom: "1px" });
        if (scilligence.Utils.isTouch && !scilligence.Utils.isIE)
            dojo.connect(tbody.parentNode, "ontouchmove", function (e) { e.preventDefault(); });
        if (this.isSkinW8()) {
            tbody.parentNode.align = this.options.toolbaralign == null ? 'center' : this.options.toolbaralign;
            if (this.options.toolbarleftmargin != null)
                tbody.parentNode.style.marginLeft = this.options.toolbarleftmargin;
        }
        this.toptoolbarTbody = tbody;
        this.recreateTopToolbar();

        tr = scilligence.Utils.createElement(mainbody, 'tr');
        if (!this.isSkinW8()) {
            td = scilligence.Utils.createElement(tr, 'td', null, { verticalAlign: "top", backgroundPosition: "left" });
            tbody = scilligence.Utils.createTable(td, 1, null, { color: "#000" });
            var style = { width: this.options.btnsize + "px", height: this.options.btnsize + "px", fontWeight: "bold", cursor: 'default', textAlign: 'center', verticalAlign: 'middle', padding: "2px" };
            if (this.options.scale != 1)
                style.fontSize = (this.options.scale * 100) + "%";
            for (var i = 0; i < elems.length; ++i) {
                var r = scilligence.Utils.createElement(tbody, 'tr');
                var d = scilligence.Utils.createElement(r, 'td', elems[i], style, { cmd: elems[i] });
                if (elems[i] == "...")
                    d.setAttribute('title', this.res("Element Periodic Table"));
                else if (elems[i] == "&#9679;")
                    d.setAttribute('title', this.res("Atom Properties"));
                this.editor.connectHandlers.push(dojo.connect(d, "onmouseover", function () { this.style.backgroundColor = JSDraw2.Skin.jsdraw.hovercolor; }));
                this.editor.connectHandlers.push(dojo.connect(d, "onmouseout", function () { this.style.backgroundColor = ''; }));
            }
        }
        td = scilligence.Utils.createElement(tr, "td", null, { borderTop: this.BORDERSTYLE, borderLeft: this.BORDERSTYLE });
        if (this.isSkinW8()) {
            td.colSpan = 2;
            td.style.borderLeft = "";
        }

        div.parentNode.insertBefore(mainbody.parentNode, div);
        td.appendChild(div);
        div.style.border = "";

        this.editor.maintable = mainbody.parentNode;
    },

    _makePluginFun: function (fn) {
        var me = this.editor;
        return function (e) {
            fn(me);
            (e.srcElement || e.target).setAttribute("jsdrawactivate", "false");
            e.preventDefault();
        }
    },

    recreateTopToolbar: function () {
        var width = this.editor.dimension.x;
        var tbody = this.toptoolbarTbody;
        var buttons = this.createButtons(width);
        var jsdtb = "__jsd_tb_" + this.editor.id;
        var me = this;

        scilligence.Utils.removeAll(tbody);

        var tr = scilligence.Utils.createElement(tbody, "tr");
        var tr2 = null;
        if (this.isSkinW8())
            tr2 = scilligence.Utils.createElement(tbody, "tr", null, { height: "6px", fontsize: "1px" });

        for (var i = 0; i < buttons.length; ++i) {
            var b = buttons[i];
            this.createButton(tr, tr2, b, jsdtb);
        }

        var plugins = JSDraw2.defaultoptions.plugins;
        if (this.options.plugins != null) {
            if (plugins == null)
                plugins = this.options.plugins;
            else
                plugins = plugins.concat(this.options.plugins);
        }
        if (plugins != null) {
            var w = Math.round(2 * this.options.btnsize / 20);
            var nleft = 0;
            var nright = 0;
            for (var i = 0; i < plugins.length; ++i) {
                var plugin = plugins[i];
                if (plugin.location == "left") {
                    if (nleft++ == 0) {
                        td = scilligence.Utils.createElement(null, "td", "<img src='" + scil.Utils.imgSrc("img/sep.gif") + "' alt='separator' style='margin:0 " + w + "px 0 " + w + "px;'>");
                        tr.insertBefore(td, tr.firstChild);
                        tr2.insertBefore(scilligence.Utils.createElement(null, "td"), tr2.firstChild);
                    }
                    td = scilligence.Utils.createElement(null, "td");
                    tr.insertBefore(td, tr.firstChild);
                    tr2.insertBefore(scilligence.Utils.createElement(null, "td"), tr2.firstChild);
                }
                else {
                    if (nleft++ == 0) {
                        td = scilligence.Utils.createElement(tr, "td", "<img src='" + scil.Utils.imgSrc("img/sep.gif") + "' alt='separator' style='margin:0 " + w + "px 0 " + w + "px;'>");
                        scilligence.Utils.createElement(tr2, "td");
                    }
                    td = scilligence.Utils.createElement(tr, "td");
                    scilligence.Utils.createElement(tr2, "td");
                }
                this.createBtnImg(td, plugins[i].iconurl, null, null, plugins[i].tooltips, null, plugins[i].width, plugins[i].label);
                this.editor.connectHandlers.push(dojo.connect(td, "onclick", this._makePluginFun(plugins[i].onclick)));
            }
        }
    },

    createButtons: function (width) {
        var buttons = [];

        var bonds = [{ c: "triple", t: "Triple bond", label: "Triple" },
                { c: "up", t: "Wedge bond", label: "Up" }, { c: "down", t: "Hash bond", label: "Down" }, { c: "wiggly", t: "Wiggle bond", label: "Wiggle" },
                { c: "delocalized", t: "Delocalized bond", label: "Delocalized" }, { c: "either", t: "Either double bond", label: "Either" },
                { c: "boldhash", t: "Hashed bond", label: "Hashed" }, { c: "bold", t: "Bold bond", label: "Bold" },
                { c: "dummy", t: "Ionic bond", label: "Ionic" }, { c: "unknown", t: "Dotted bond", label: "Dotted"}];
        if (this.options.query)
            bonds.concat([{ c: "singledouble", t: "Single or Double", label: "Single" }, { c: "singlearomatic", t: "Single or Aromatic" }, { c: "doublearomatic", t: "Double or Aromatic"}]);

        var smallscreen = this.isSkinW8() && width <= 400;

        var filesubmenus = [];
        if (this.options.showfilemenu != false) {
            filesubmenus.push({ c: "save", t: "Export", label: "Export" });
            filesubmenus.push({ c: "open", t: "Import", label: "Import" });
        }

        var selecttools = [{ c: "lasso", t: "Lasso Selection", label: "Lasso" },
            { c: "selfrag", t: "Select Fragment", label: "Fragment" }, { c: "selectall", t: "Select All", label: "All"}];

        var addabout = false;
        if (this.options.tlcplate) {
            buttons.push({ c: "new", t: "New", label: "New", sub: filesubmenus });
            buttons.push({ c: "tlctemplate", t: "Template", label: "Template" });
            buttons.push({ c: "|" });
            buttons.push({
                c: "spot-circle", t: "Circle Spot", label: "Circle", sub: [
                    { c: "spot-hellipse", t: "Horizontal Ellipse Spot", label: "Ellipse" },
                    { c: "spot-vellipse", t: "Vertical Ellipse Spot", label: "Ellipse" },
                    { c: "spot-halfellipseup", t: "Half-Ellipse Spot", label: "Ellipse" },
                    { c: "spot-halfellipsedown", t: "Half-Ellipse Spot", label: "Ellipse" },
                    { c: "spot-blowingup", t: "Blowing-up Spot", label: "Blowing" },
                    { c: "spot-blowingdown", t: "Blowing-down Spot", label: "Blowing" },
                    { c: "spot-crescentup", t: "Crescent Spot", label: "Crescent" },
                    { c: "spot-crescentdown", t: "Crescent Spot", label: "Crescent" }
                ]
            });
            buttons.push({ c: "eraser", t: "Eraser", label: "Eraser" });
            buttons.push({ c: "|" });
            buttons.push({ c: "tlc", t: "TLC Plate", label: "TLC" });
            buttons.push({ c: "tlcnumber", t: "Number Plate", label: "Number" });
            buttons.push({ c: "electrophoresis", t: "Electrophoresis Gel Plate", label: "Electrophoresis" });
            buttons.push({ c: "|" });
            buttons.push({ c: "text", t: "Text/Atom Label", label: "Text" });
            buttons.push({ c: "|" });
            buttons.push({ c: "undo", t: "Undo", label: "Undo" });
            buttons.push({ c: "redo", t: "Redo", label: "Redo" });
            buttons.push({ c: "|" });
            buttons.push({ c: "center", t: "Move to center", label: "Center" });
            buttons.push({ c: "zoomin", t: "Zoom in", label: "Zoom" });
            buttons.push({ c: "zoomout", t: "Zoom out", label: "Zoom" });

            addabout = true;
        }
        else if (this.options.workflow) {
            buttons.push({ c: "new", t: "New", label: "New", sub: filesubmenus });
            buttons.push({ c: "|" });
            buttons.push({ c: "select", t: "Box Selection", label: "Box", sub: selecttools });
            buttons.push({ c: "moveview", t: "Move/View", label: "Move" });
            buttons.push({ c: "zoombox", t: "Zoom Box", label: "Zoom" });
            buttons.push({ c: "|" });
            buttons.push({ c: "rectangle", t: "Rectangle", label: "Rectangle" });
            buttons.push({ c: "diamond", t: "Diamond", label: "Diamond" });
            buttons.push({ c: "ellipse", t: "Ellipse", label: "Ellipse" });
            buttons.push({ c: "dreversed", t: "D Reversed", label: "D Reversed" });
            buttons.push({ c: "dshape", t: "D Shapre", label: "D Shapre" });
            buttons.push({ c: "|" });
            buttons.push({ c: "arrow", t: "Reaction arrow", label: "Reaction" });
            buttons.push({ c: "text", t: "Text/Atom Label", label: "Text" });
            buttons.push({ c: "|" });
            buttons.push({ c: "eraser", t: "Eraser", label: "Eraser" });
            buttons.push({ c: "|" });
            buttons.push({ c: "undo", t: "Undo", label: "Undo" });
            buttons.push({ c: "redo", t: "Redo", label: "Redo" });
            buttons.push({ c: "|" });
            buttons.push({ c: "center", t: "Move to center", label: "Center" });
            buttons.push({ c: "zoomin", t: "Zoom in", label: "Zoom" });
            buttons.push({ c: "zoomout", t: "Zoom out", label: "Zoom" });

            addabout = true;
        }
        else if (this.options.helmtoolbar) {
            org.helm.webeditor.Interface.getHelmToolbar(buttons, filesubmenus, selecttools, this.options);
            if (this.options.showabout != false)
                addabout = true;
        }
        else {
            if (this.options.pastechemdraw) {
                filesubmenus.push({ c: "pastechemdraw", t: "Paste ChemDraw, ISIS/Draw...", label: "Paste" });
                filesubmenus.push({ c: "copychemdraw", t: "Copy ChemDraw, ISIS/Draw, Word...", label: "Copy" });
            }

            if (this.isSkinW8()) {
                filesubmenus.push({ c: "about", t: "About JSDraw", label: "About" });
                buttons.push({ c: "new", t: "New", label: "New", sub: filesubmenus });
            }
            else {
                buttons.push({ c: "new", t: "New", sub: filesubmenus, label: "New" });
            }

            if (scilligence.Utils.serviceAvailable() && JSDraw2.Security.kEdition != "Lite")
                buttons.push({ c: "n2s", t: "Name to Structure", label: "N2S", sub: [{ c: "cleanup", t: "Clean up", label: "Clean"}] });
            if (buttons.length > 0)
                buttons.push({ c: "|" });

            if (!this.options.appmode) {
                selecttools.push({ c: "copy", t: "Copy", label: "Copy" });
                selecttools.push({ c: "cut", t: "Cut", label: "Cut" });
                selecttools.push({ c: "paste", t: "Paste", label: "Paste" });
            }

            buttons.push({ c: "select", t: "Box Selection", label: "Box", sub: selecttools });
            buttons.push({ c: "center", t: "Move to center", label: "Center", sub: smallscreen ? null : [{ c: "zoomin", t: "Zoom in", label: "Zoom" }, { c: "zoomout", t: "Zoom out", label: "Zoom" }, { c: "rotate", t: "Rotate", label: "Rotate" }, { c: "fliph", t: "Flip Horizontal", label: "Flip" }, { c: "flipv", t: "Flip Vertical", label: "Flip"}] });
            buttons.push({ c: "moveview", t: "Move/View", label: "Move", sub: [{ c: "zoombox", t: "Zoom Box", label: "Zoom"}] });
            buttons.push({ c: "|" });

            buttons.push({ c: "eraser", t: "Eraser", label: "Eraser" });
            if (!this.options.appmode)
                buttons.push({ c: "undo", t: "Undo", label: "Undo", sub: [{ c: "redo", t: "Redo", label: "Redo"}] });
            buttons.push({ c: "|" });
            buttons.push({ c: "single", t: "Single bond", label: "Single" });
            buttons.push({ c: "double", t: "Double bond", label: "Double", sub: bonds });
            buttons.push({ c: "chain", t: "Chain Tool", label: "Chain" });
            buttons.push({ c: "|" });

            var i = 0;
            var last = null;
            JSDraw2.SuperAtoms.read();
            var templateicons = { benzene: 1, hexane: 1, pentane: 1, propane: 1, butane: 1, heptane: 1, octane: 1 };
            for (var k in JSDraw2.SuperAtoms.templates) {
                ++i;
                var name = k;
                var c = templateicons[k.toLowerCase()] ? k.toLowerCase() : "template";
                if (i <= 3) {
                    last = { c: c, cmd: "template." + k, label: name, t: name };
                    buttons.push(last);
                }
                else {
                    if (last.sub == null)
                        last.sub = [];
                    last.sub.push({ c: c, cmd: "template." + k, label: name, t: name });
                }
            }

            if (JSDraw2.SuperAtoms.hasCustomTemplates() && this.options.showcustomtemplates != false)
                last.sub.push({ c: "templates", cmd: "template.[custom]", label: "Templates", t: "Custom Templates" });

            buttons.push({ c: "|" });
            if (this.isSkinW8()) {
                var elements = [{ c: "e-H", t: "Element H", label: "Hydrogen" },
                    { c: "e-O", t: "Element O", label: "Oxygen" }, { c: "e-N", t: "Element N", label: "Nitrogen" }, { c: "e-S", t: "Element S", label: "Sulfur" },
                    { c: "e-P", t: "Element P", label: "Phosphorus" }, { c: "e-F", t: "Element F", label: "Fluorine" }, { c: "e-Cl", t: "Element Cl", label: "Chlorine" },
                    { c: "e-Br", t: "Element Br", label: "Bromine" }, { c: "e-more", t: "Element Periodic Table", label: "P.T."}];
                buttons.push({ c: "e-C", t: "Element C", label: "Carbon", sub: elements });
            }

            if (JSDraw2.Security.kEdition != "Lite") {
                buttons.push({
                    c: "text", t: "Text/Atom Label", label: "Text", sub: smallscreen ? null : [{ c: "sgroup", t: "SGroup - Tag Atom/Bond/Bracket", label: "SGroup" },
                        { c: "bracket", t: "Bracket", label: "Bracket" }, { c: "symbol", t: "Symbol", label: "Symbol"}]
                });
                buttons.push({
                    c: "rectangle", t: "Rectangle", label: "Rectangle", sub: [{ c: "diamond", t: "Diamond", label: "Diamond" }, { c: "ellipse", t: "Ellipse", label: "Ellipse" },
                        { c: "dreversed", t: "D Reversed", label: "D Reversed" }, { c: "dshape", t: "D Shapre", label: "D Shapre" },
                        { c: "curve", t: "Curve", label: "Curve" }, { c: "tlc", t: "TLC Plate", label: "TLC" }, { c: "tlctemplate", t: "Template", label: "Template" },
                        { c: "electrophoresis", t: "Electrophoresis Gel Plate", label: "Electrophoresis" }, { c: "assaycurve", t: "Assay Curve", label: "Assay" }, { c: "spectrum", t: "Spectrum", label: "Spectrum"}]
                });
            }

            buttons.push({ c: "chargep", t: "Increase charges", label: "Charge", sub: [{ c: "chargen", t: "Decrease charges", label: "Charge"}] });

            if (this.options.rxn && JSDraw2.Security.kEdition != "Lite") {
                buttons.push({ c: "|" });
                buttons.push({
                    c: "arrow", t: "Reaction arrow", label: "Reaction", sub: [{ c: "plus", t: "Reaction Plus", label: "Plus" }, { c: "rxn", t: "Clean up reaction", label: "Clean" },
                { c: "copyprod", t: "Copy reactants to products", label: "R->P" }, { c: "rxnmap", t: "Map reaction", label: "Map" }, { c: "rxnmap2", t: "Clear reaction map", label: "Clear"}]
                });
            }
            if (this.options.biology && JSDraw2.Security.kEdition != "Lite") {
                if (this.editor.helm != null)
                    org.helm.webeditor.Interface.addToolbar(buttons, null, null, this.options);
                buttons.push({ c: "seq", t: "Peptide Sequence", label: "Peptide", sub: [{ c: "helix", t: "DNA Sequence", label: "DNA" }, { c: "rna", t: "RNA Sequence", label: "RNA" }, { c: "antibody", t: "Antibody", label: "Antibody" }, { c: "protein", t: "Protein", label: "Protein" }, { c: "gene", t: "Gene", label: "Gene"}] });
            }

            if (this.isSkinW8() && this.options.inktools && !smallscreen) {
                buttons.push({ c: "|" });
                buttons.push({ c: "inkred", t: "Ink - Red", label: "Ink", sub: [{ c: "inkblue", t: "Ink - Blue", label: "Ink" }, { c: "inkgreen", t: "Ink - Green", label: "Ink" }, { c: "inkclear", t: "Clear Ink", label: "Clear1" }, { c: "inkclearall", t: "Clear All Inks", label: "Clear"}] });
            }

            if (JSDraw2.Security.kEdition != "Lite") {
                if (this.options.sendquery) {
                    buttons.push({ c: "|" });
                    var list = [{ c: "chemspider", t: "Search ChemSpider", label: "ChemSpider"}];
                    if (JSDraw2.defaultoptions.reaxys != false)
                        list.push({ c: "reaxys", t: "Search Reaxys", label: "Reaxys" });
                    buttons.push({ c: "pubchem", t: "Search PubChem", label: "PubChem", sub: list });
                }
            }

            if (this.options.usechemdraw)
                buttons.push({ c: "chemdraw", t: "ChemDraw Editor", label: "ChemDraw" });
        }

        if (JSDraw2.Fullscreen != null) {
            if (this.options.exitfullscreen) {
                buttons.push({ c: "|" });
                buttons.push({ c: "fullscreen2", t: "Regular Size", label: "Fullscreen" });
            }
            else if (this.options.fullscreen) {
                buttons.push({ c: "|" });
                buttons.push({ c: "fullscreen", t: "Fullscreen Size", label: "Fullscreen" });
            }
        }

        if (addabout) {
            buttons.push({ c: "|" });
            buttons.push({ c: "about", t: "About JSDraw", label: "About" });
        }

        if (this.isSkinW8())
            this.relayoutButtonsByWidth(buttons, width, this.options.plugins == null ? 0 : this.options.plugins.length);
        return buttons;
    },

    relayoutButtonsByWidth: function (buttons, width, nplugins) {
        var n = Math.round(width / (this.options.skin == "w8" ? 50 : 60)) - buttons.length - nplugins;
        if (n < 0 && n < -8) {
            for (var i = buttons.length - 1; i >= 0; --i) {
                if (buttons[i].c == "|")
                    buttons.splice(i, 1);
            }
            n = Math.round(width / (this.options.skin == "w8" ? 50 : 60)) - buttons.length - nplugins;
        }
        if (n == 0)
            return;

        if (n > 0) {
            for (var i = 0; i < buttons.length; ++i) {
                if (buttons[i].c == "ring5") {
                    var sub = buttons[i].sub;
                    for (var j = 0; j < n; ++j) {
                        buttons.splice(i + j + 1, 0, sub[0]);
                        sub.splice(0, 1);
                        buttons[i + j].sub = null;
                        if (sub.length == 0)
                            break;
                        else
                            buttons[i + j + 1].sub = sub;
                    }
                    break;
                }
            }
        }
        else if (n < 0) {
            n = -n;
            var ranks;
            if (this.options.workflow)
                ranks = ["zoomout", "zoombox", "redo", "zoomin", "eraser", "moveview"];
            else if (this.options.helmtoolbar)
                ranks = ["zoombox", "zoomout", "zoomin", "redo", "eraser"];
            else
                ranks = ["double", "chain", "pubchem", "pentane", "hexane", "zoombox", "moveview", "zoomout", "zoomin", "redo", "n2s", "eraser", "seq", "chemdraw", "chargep", "rectangle", "arrow", "text"];

            for (var i = buttons.length - 1; i > 0; --i) {
                if (width < 500 && buttons[i].c == "|") {
                    buttons.splice(i, 1);
                    continue;
                }
                var rank = scil.Utils.indexOf(ranks, buttons[i].c);
                if (rank >= 0 && rank + 1 <= n) {
                    while (i > 0 && buttons[i - 1].c == "|") {
                        buttons.splice(i - 1, 1);
                        --i;
                    }
                    if (buttons[i - 1].sub == null)
                        buttons[i - 1].sub = [];
                    var sub = buttons[i - 1].sub;
                    if (this.options.skin == "si" && sub.length > 0)
                        sub.push("|");
                    sub.push(buttons[i]);
                    var list = buttons[i].sub;
                    buttons[i].sub = null;
                    if (list != null) {
                        for (var k = 0; k < list.length; ++k)
                            sub.push(list[k]);
                    }
                    buttons.splice(i, 1);
                }
            }
        }
    },

    res: function (s) {
        return JSDraw2.Language.res(s);
    },

    isSkinW8: function () {
        return this.options.skin == "w8" || this.options.skin == "si";
    },

    setHoverable: function (e) {
        this.editor.connectHandlers.push(dojo.connect(e, "onmouseover", function () { this.style.background = JSDraw2.Skin.jsdraw.hovercolor; }));
        this.editor.connectHandlers.push(dojo.connect(e, "onmouseout", function () { this.style.background = this.getAttribute("pushed") == null ? "" : JSDraw2.Skin.jsdraw.btnselcolor; }));
    },

    exchangeButton: function (parent, td) {
        if (this.options.skin == "si") {
            //parent.innerHTML
            //"<img style="margin-top: -5px;" src="src/../w8/Pentane.png"><div style="width: 42px; text-align: center; color: gray; overflow: hidden; font-size: 9px; margin-top: -11px; white-space: nowrap;">Pentane</div>"
            //td.innerHTML
            //"<table cellspacing="0" cellpadding="0"><tbody><tr><td><img style="margin-top: -5px;" src="src/../w8/Butane.png"></td><td><div style="width: 42px; text-align: center; color: gray; overflow: hidden; font-size: 9px; margin-top: -11px; white-space: nowrap;">Butane</div></td></tr></tbody></table>"
            var img1 = parent.childNodes[0];
            var txt1 = img1.nextSibling;

            var tds = td.childNodes[0].getElementsByTagName("td");
            var img2 = tds[0].childNodes[0];
            var txt2 = tds[1].childNodes[0];

            var src = img1.src;
            var subtitle = txt1.innerHTML;
            var cmd = dojo.attr(parent, "cmd");
            var title = dojo.attr(parent, "title");

            img1.src = img2.src;
            txt1.innerHTML = txt2.innerHTML;
            dojo.attr(parent, "cmd", dojo.attr(td, "cmd"));
            dojo.attr(parent, "title", dojo.attr(td, "title"));

            img2.src = src;
            txt2.innerHTML = subtitle;
            dojo.attr(td, "cmd", cmd);
            dojo.attr(td, "title", title);

        }
        else {
            var src = parent.src;
            var cmd = dojo.attr(parent, "cmd");
            var title = dojo.attr(parent, "title");
            var subtitle = parent.nextSibling != null ? parent.nextSibling.innerHTML : null;

            parent.src = td.src;
            dojo.attr(parent, "cmd", dojo.attr(td, "cmd"));
            dojo.attr(parent, "title", dojo.attr(td, "title"));
            if (td.nextSibling != null)
                parent.nextSibling.innerHTML = td.nextSibling.innerHTML;

            td.src = src;
            dojo.attr(td, "cmd", cmd);
            dojo.attr(td, "title", title);
            if (td.nextSibling != null)
                td.nextSibling.innerHTML = subtitle;
        }
    },

    createButton: function (tr, tr2, b, jsdtb) {
        var td;
        var img;
        var w = Math.round(2 * this.options.btnsize / 20);
        var tbid = jsdtb + "_" + b.c;
        if (b.c == "|") {
            td = scilligence.Utils.createElement(tr, "td", "<img src='" + scil.Utils.imgSrc("img/sep.gif") + "' style='margin:0 " + 2 * w + "px 0 " + 2 * w + "px;width:" + w + "px;vertical-align:middle;'>");
        }
        else {
            td = scilligence.Utils.createElement(tr, "td");
            var src = null;
            if (this.isSkinW8())
                src = "w8/" + b.c + ".png";
            else
                src = "img/" + b.c + ".gif";
            img = this.createBtnImg(td, (b.img != null ? b.img : scil.Utils.imgSrc(src)), tbid, b.cmd != null ? b.cmd : b.c, this.res(b.t), null, null, this.res(b.label));
        }

        if (b.hidden)
            td.style.display = "none";

        if (b.sub == null) {
            if (tr2 != null)
                scilligence.Utils.createElement(tr2, "td");
            return td;
        }

        var td1;
        if (this.options.skin == "si") {
            td1 = scil.Utils.createElement(img.parentNode.parentNode, "td", "&#9660;", { fontSize: "10px", color: "gray", borderTop: "solid 1px #ccc", borderRight: "solid 1px #ccc", borderBottom: "solid 1px #ccc" });
            this.setHoverable(td1);
        }
        else {
            if (tr2 == null)
                td1 = scilligence.Utils.createElement(tr, "td", "&#9660;", { fontSize: (this.options.btnsize / 2) + "px", verticalAlign: "bottom", color: "gray" });
            else
                td1 = scilligence.Utils.createElement(tr2, "td", null, { height: "10px", background: scil.Utils.imgSrc("w8/handle.png", true) + " no-repeat center center" });
        }

        if (b.hidden)
            td1.style.display = "none";

        if (scilligence.Utils.isTouch) {
            dojo.connect(td, "ontouchmove", function () { JSDraw2.Menu.open(tbid + "_sub"); });
            dojo.connect(td1, "onclick", function () { JSDraw2.Menu.open(tbid + "_sub"); });
        }
        else {
            if (window.navigator.msPointerEnabled) {
                dojo.connect(td, "onMSPointerMove", function (e) {
                    if (e.buttons == 1)
                        JSDraw2.Menu.open(tbid + "_sub");
                }, false);
            }
            if (this.isSkinW8()) {
                dojo.connect(td1, "onclick", function () {
                    JSDraw2.Menu.open(tbid + "_sub");
                });
                //if (!scilligence.Utils.isIE)
                //    dojo.connect(td, "onclick", function () { JSDraw2.Menu.close(); });
                td1.setAttribute("title", this.res("click to expand"));
                dojo.connect(td1, "onmouseover", function (e) { (e.target || e.srcElement).style.backgroundImage = scil.Utils.imgSrc("w8/handle2.png", true); });
                dojo.connect(td1, "onmouseout", function (e) { (e.target || e.srcElement).style.backgroundImage = scil.Utils.imgSrc("w8/handle.png", true); });
            }
            else {
                dojo.connect(td1, "onmouseover", function () { JSDraw2.Menu.open(tbid + "_sub"); });
                dojo.connect(td1, "onmouseout", function () { JSDraw2.Menu.closetime(); });
                dojo.connect(td1, "onclick", function () { JSDraw2.Menu.close(); });
            }
        }

        var tbody = scil.Utils.createTable(td, 0, 0,
            {
                display: "none", zIndex: 99999999, borderRadius: Math.round((this.options.skin == "si" ? 3 : 4) * this.options.btnsize / 40) + "px",
                position: "absolute", backgroundColor: this.options.skin == "si" ? this.toolbarbkcolor : JSDraw2.Skin.jsdraw.bkcolor, border: this.BORDERSTYLE, padding: "2px"
            });
        //if (this.options.skin == "w8" && !scilligence.Utils.isIE)
        //    tbody.parentNode.style.border = null;
        var table = tbody.parentNode;
        table.id = tbid + "_sub";
        table.onmouseover = JSDraw2.Menu.cancelclosetime;
        table.onmouseout = JSDraw2.Menu.closetime;

        var bs = b.sub;
        var leftmargin = 0;
        var singlerow = this.options.skin != "w8" || bs.length <= 5;
        if (!singlerow) {
            leftmargin = -(this.options.btnsize / 2 + 4);
            table.style.marginLeft = leftmargin + 'px';
        }
        if (scilligence.Utils.isIE && scilligence.Utils.isIE < 8 && !this.isSkinW8())
            table.style.margin = (this.options.btnsize + 4) + 'px 0 0 ' + (leftmargin - this.options.btnsize - 2) + 'px';

        var tr = null;
        for (var j = 0; j < bs.length; ++j) {
            var bn = bs[j];
            if (singlerow || j % 2 == 0)
                tr = scilligence.Utils.createElement(tbody, 'tr');
            td = scilligence.Utils.createElement(tr, "td");
            if (bn == "|") {
                scil.Utils.createElement(td, "hr", null, { margin: "5px 0 0 0", padding: 0 });
                continue;
            }
            if (j > 0 && this.isSkinW8())
                td.style.paddingTop = w + "px";
            var src = null;
            if (this.isSkinW8())
                src = "w8/" + bn.c + ".png";
            else
                src = "img/" + bn.c + ".gif";
            this.createBtnImg(td, (bn.img != null ? bn.img : scil.Utils.imgSrc(src)), null, bn.cmd != null ? bn.cmd : bn.c, this.res(bn.t), tbid, null, this.res(bn.label), true);
        }

        return td;
    },

    createBtnImg: function (td, src, tbid, cmd, title, parent, width, label, sub) {
        if (width == null)
            width = this.options.btnsize;
        var w = Math.round(2 * width / 20);
        if (this.options.skin == "si") {
            if (sub)
                td = scil.Utils.createElement(td, "div", null, { height: "32px" });
            var table = scil.Utils.createTable(td, 0, 0, sub ? null : { margin: "0 2px 0 2px", backgroundColor: this.toolbarbkcolor });
            var tr = scil.Utils.createElement(table, "tr");
            var td1 = scil.Utils.createElement(tr, "td", null, sub ? null : { border: "solid 1px " + JSDraw2.Skin.jsdraw.bkcolor });
            var td2 = null;
            var img = scilligence.Utils.createElement(td1, "img", null, { marginTop: "-5px" }, { src: src, alt: title });
            var styles = { marginTop: "-11px", width: width + "px", fontSize: "9px", textAlign: "center", color: "gray", whiteSpace: "nowrap", overflow: "hidden" };
            if (sub) {
                var td2 = scil.Utils.createElement(tr, "td");
                if (scil.Utils.isIE && scil.Utils.isIE < 8)
                    styles.fontSize = styles.marginTop = styles.width = null;
                styles.textAlign = "left";
                scil.Utils.createElement(td2, "div", label == null || label == "" ? "&nbsp;" : label, styles);
            }
            else {
                scil.Utils.createElement(td1, "div", label == null || label == "" ? "&nbsp;" : label, styles);
            }

            this.setHoverable(sub ? td : td1);
            if (title != null)
                (sub ? td : td1).setAttribute('title', title);
            if (cmd != null)
                (sub ? td : td1).setAttribute('cmd', cmd);
            if (parent != null)
                (sub ? td : td1).setAttribute('parent', parent);
            if (tbid != null)
                (sub ? td : td1).id = tbid;
            return img;
        }

        var style = { textAlign: "center", padding: this.isSkinW8() ? "2px 2px 0 2px" : "2px", verticalAlign: "middle", width: width + "px", height: this.options.btnsize + "px" };
        var img;
        if (this.isSkinW8()) {
            var button = this.options.buttonshape + ".png";
            style.background = "url(" + scil.Utils.imgSrc("w8/" + button) + ") center center no-repeat";
            img = scilligence.Utils.createElement(td, "img", null, style, { src: src, alt: title });
            scil.Utils.createElement(td, "div", label == null || label == "" ? "&nbsp;" : label, { width: width + "px", fontSize: "9px", textAlign: "center", color: "gray", whiteSpace: "nowrap", overflow: "hidden" });
        }
        else {
            img = scilligence.Utils.createElement(td, "img", null, style, { src: src, alt: title });
        }

        if (cmd != null)
            img.setAttribute('cmd', cmd);
        if (title != null)
            img.setAttribute('title', title);
        if (parent != null)
            img.setAttribute('parent', parent);
        if (tbid != null)
            img.id = tbid;
        if (this.isSkinW8()) {
            var me = this;
            this.editor.connectHandlers.push(dojo.connect(img, "onmouseover", function () { this.style.backgroundImage = scil.Utils.imgSrc("w8/" + me.options.buttonshape + "1.png", true); }));
            this.editor.connectHandlers.push(dojo.connect(img, "onmouseout", function () {
                this.style.backgroundImage = scil.Utils.imgSrc("w8/" + me.options.buttonshape + (this.getAttribute("pushed") == null ? "" : "0") + ".png", true);
            }));
        }
        else {
            this.setHoverable(img);
        }
        return img;
    }
});
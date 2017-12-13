//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.JSDrawIO = {
    downloaddlg: null,
    jsdsavedlg: null,
    jsdFiles: { jsdraw: "JSDraw2 XML", mol: "Mol File", rxn: "Reaction File", inchi: "InChI", helm: "HELM", xhelm: "xHELM", smiles: "SMILES", cml: "Chemical Markup Language", cdxml: "ChemDraw CDXML", cdx: "ChemDraw CDX", png: "PNG Picture" },
    jsdFiles2: { jsd: "JSDraw XML", png: "PNG Picture" },
    jsdFiles3: { helm: "HELM", xhelm: "xHELM" },
    jsssavedlg: null,
    jssFiles: { sdf: "SDF File", csv: "CSV File", jssdf: "Xml File", json: "Json File" },

    callWebservice: function (cmd, data, callback) {
        if (JSDrawServices.url == null || JSDrawServices.url == "")
            scil.Utils.alert("JSDraw web service is not available");
        else
            scil.Utils.ajax(JSDrawServices.url + "?cmd=" + cmd, callback, data);
    },

    needCrossdomain: function () {
        if (JSDrawServices.xdomain) {
            var s = window.location + "";
            var p = s.indexOf("://");
            var p2 = s.indexOf("/", p + 3);
            var host = s.substr(0, p2 + 1);
            if (!scil.Utils.startswith(JSDrawServices.url.toLowerCase(), host.toLowerCase()))
                return true;
        }
        return false;
    },

    jsdFileOpen: function (jsd) {
        var msg;
        if (JSDraw2.Security.kEdition == "Lite")
            msg = this.res("Please select a HELM file") + " (*.helm, *.xhelm):";
        else
            msg = this.res("Please select a chemistry file") + " (*.mol, *.rxn, *.cdx, *.skc, *.helm, *.xhelm, *.smiles etc.):";

        if (this.needCrossdomain()) {
            var url = JSDrawServices.url + "?cmd=";
            scil.Utils.uploadFile("<img src='" + scil.App.imgSmall("open.png") + "'>" + this.res("Import File"),
                msg, url + "xdomain.post", function (xfilename) {
                    scil.Utils.jsonp(url + "openjsd", function (ret) { JSDraw2.JSDrawIO.jsdFileOpen2(jsd, ret); },
                    { _xfilename: xfilename });
                }, null, null, null, null, true);
        }
        else {
            if (this.jsdFileOpenDlg == null) {
                var fields = {
                    note: { type: "html", template: "<div style='white-space:nowrap'>" + msg + "</div>" },
                    file: { type: "postfile", attributes: { name: "file"} },
                    importas: JSDraw2.Security.kEdition == "Lite" ? null : { type: "select", items: { "": "", "reactant": "Import as Reactant", "product": "Import as Product"} }
                };
                var me = this;
                this.jsdFileOpenDlg = scil.Form.createDlgForm("Load File", fields,
                    { src: scil.App.imgSmall("open.png"), label: "Load File", onclick: function () { me.jsdFileOpen1(); } },
                    { usepostform: true, hidelabel: true });
            }

            this.jsdFileOpenDlg.show();
            this.jsdFileOpenDlg.jsd = jsd;
            this.jsdFileOpenDlg.form.postform.reset();
            /*
            scil.Utils.uploadFile("<img src='" + scil.Utils.imgSrc("img/open.gif") + "'>" + this.res("Import File"),
            this.res("Please select a chemistry file") + " (*.mol, *.rxn, *.cdx, *.skc, *.smiles etc.):",
            JSDrawServices.url + "?cmd=openjsd",
            function (ret) { JSDraw2.JSDrawIO.jsdFileOpen2(jsd, ret); });
            */
        }
    },

    jsdFileOpen1: function () {
        var me = this;
        this.jsdFileOpenDlg.form.post(JSDrawServices.url + "?cmd=openjsd", null, function (ret) {
            var importas = me.jsdFileOpenDlg.form.fields.importas == null ? null : me.jsdFileOpenDlg.form.fields.importas.value;
            me.jsdFileOpen2(me.jsdFileOpenDlg.jsd, ret, importas);
            me.jsdFileOpenDlg.hide();
        });
    },

    jsdFileOpen2: function (jsd, ret, importas) {
        var data = ret.base64 != null ? JSDraw2.Base64.decode(ret.base64) : ret.contents;
        if (importas == "reactant" || importas == "product") {
            var m = new JSDraw2.Mol();
            if (ret.format == "molfile")
                m.setMolfile(data);
            else if (ret.format == "rxn")
                m.setRxnfile(data);
            else
                m.setXml(data);

            if (m.atoms.length > 0) {
                var rxn = m.parseRxn(true);
                var f = false;
                if (rxn == null) {
                    if (jsd.pasteMol(m, null, importas))
                        f = true;
                }
                else if (rxn.arrow == null && rxn.products.length == 0) {
                    for (var i = 0; i < rxn.reactants.length; ++i)
                        if (jsd.pasteMol(rxn.reactants[i], null, importas))
                            f = true;
                }
                else {
                    if (importas == "reactant" && rxn.reactants != null) {
                        for (var i = 0; i < rxn.reactants.length; ++i)
                            if (jsd.pasteMol(rxn.reactants[i], null, importas))
                                f = true;
                    }
                    else if (importas == "product" && rxn.products != null) {
                        for (var i = 0; i < rxn.products.length; ++i)
                            if (jsd.pasteMol(rxn.products[i], null, importas))
                                f = true;
                    }
                }

                if (f)
                    jsd.refresh(true);
                else
                    scil.Utils.alert("No structure imported");
            }
        }
        else {
            if (ret.format == "molfile" || scil.Utils.endswith(ret.filename, ".mol"))
                jsd.setMolfile(data);
            else if (ret.format == "rxn" || scil.Utils.endswith(ret.filename, ".rxn"))
                jsd.setRxnfile(data);
            else if (ret.format == "xhelm" || scil.Utils.endswith(ret.filename, ".xhelm"))
                jsd.setXHelm(data);
            else if (ret.format == "helm" || scil.Utils.endswith(ret.filename, ".helm"))
                jsd.setHelm(data);
            else
                jsd.setXml(data);
        }
    },

    jsdFileSave: function (jsd) {
        if (JSDraw2.JSDrawIO.jsdsavedlg == null) {
            var div = scil.Utils.createElement(null, "div", this.res("Please select the file format to be saved: "), { width: "420px", margin: "10px" });
            var sel = scil.Utils.createElement(div, "select");
            scil.Utils.createElement(sel, "option");
            if (JSDraw2.Security.kEdition == "Lite") {
                if (jsd.options.helmtoolbar)
                    scil.Utils.listOptions(sel, JSDraw2.JSDrawIO.jsdFiles3, null, false);
                else
                    scil.Utils.listOptions(sel, JSDraw2.JSDrawIO.jsdFiles, null, false);
            }
            else if (jsd.options.tlcplate)
                scil.Utils.listOptions(sel, JSDraw2.JSDrawIO.jsdFiles2, null, false);
            else
                scil.Utils.listOptions(sel, JSDraw2.JSDrawIO.jsdFiles, null, false);

            var s = scil.Utils.createElement(div, "div", null, { marginTop: "20px", textAlign: "center" });
            scil.Utils.createButton(s, { src: scil.App.imgSmall("submit.png"), label: "Save File", onclick: function (e) { JSDraw2.JSDrawIO.jsdFileSave2(); e.preventDefault(); } });
            scil.Utils.createButton(s, "&nbsp;");
            scil.Utils.createButton(s, { src: scil.App.imgSmall("cancel.png"), label: "Cancel", onclick: function (e) { JSDraw2.JSDrawIO.jsdsavedlg.hide(); e.preventDefault(); } });

            JSDraw2.JSDrawIO.jsdsavedlg = new JSDraw2.Dialog("<img src='" + scil.App.imgSmall("save.png") + "'>" + this.res("Save File"), div);
            JSDraw2.JSDrawIO.jsdsavedlg.sel = sel;
        }
        JSDraw2.JSDrawIO.jsdsavedlg.jsd = jsd;
        JSDraw2.JSDrawIO.jsdsavedlg.show();
        JSDraw2.JSDrawIO.jsdsavedlg.sel.selectedIndex = 0;
    },

    jsdFileSave2: function () {
        this.jsdFileSave3(JSDraw2.JSDrawIO.jsdsavedlg.sel.value, JSDraw2.JSDrawIO.jsdsavedlg.jsd);
        this.jsdsavedlg.hide();
    },

    jsdFileSave3: function (ext, jsd) {
        var s;
        if (ext == "helm")
            s = jsd.getHelm();
        else if (ext == "xhelm")
            s = jsd.getXHelm();
        else
            s = jsd.getXml();

        var dt = new Date();
        var prefix = JSDraw2.Security.kEdition == "Lite" && jsd.options.helmtoolbar ? "HELM" : "JSDraw";
        var filename = prefix + dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + "." + ext;
        var args = { client: "jsdraw", wrapper: "none", filename: filename, contents: s };
        scil.Utils.post(JSDrawServices.url + "?cmd=savefile", args, "_blank");
    },

    cleanup: function (jsd) {
        var selected = jsd.m.clone(true);
        if (selected != null && selected.atoms.length == 0)
            selected = null;
        var smiles = selected != null ? selected.getSmiles() : jsd.getSmiles();
        if (smiles == null || smiles == "")
            return;

        var url = JSDrawServices.url;
        if (url == null) {
            scil.Utils.alert("JSDraw Web Service is not configured yet.");
            return;
        }

        var l = window.location;
        var s = l.protocol + "//" + l.host + "/";

        var fun = null;
        if (scil.Utils.startswith(url.toLowerCase(), s.toLowerCase())) {
            fun = scil.Utils.ajax;
            smiles = selected != null ? selected.getXml() : jsd.getXml();
        }
        else {
            fun = scil.Utils.jsonp;
        }

        var openbonds = [];
        if (selected != null) {
            for (var i = 0; i < jsd.m.bonds.length; ++i) {
                var b = jsd.m.bonds[i];
                if (b.a1.selected != b.a2.selected)
                    openbonds.push(b);
            }
        }

        var me = this;
        fun(url + "?cmd=cleanup", function (data) {
            if (selected != null) {
                var m = me._data2Mol(data);
                if (m != null && !m.isEmpty()) {
                    m.setBondLength(jsd.bondlength);

                    if (!me._connectOpenBonds(jsd.m, m, openbonds, jsd.bondlength)) {
                        var center = selected.rect().center();
                        var center2 = m.rect().center();
                        m.offset(center.x - center2.x, center.y - center2.y);
                    }

                    jsd.pushundo();
                    jsd.delSelected();

                    m.setSelected(true);
                    jsd.m.mergeMol(m);
                    jsd.refresh(true);

                }
            }
            else {
                me._setMolData(jsd, data, null, true);
            }
        }, { input: smiles, inputformat: "jsdraw" });
    },

    _connectOpenBonds: function (host, m, bonds, bondlength) {
        if (bonds.length == 0)
            return false;

        if (bonds.length > 1) {
            for (var i = 0; i < bonds.length; ++i) {
                var bond = bonds[i];
                var move = bond.a1.selected ? bond.a1 : bond.a2;
                var fix = bond.a1.selected ? bond.a2 : bond.a1;
                var a = m.getObjectById(move.id);
                if (a == null)
                    continue;

                var nb = bond.clone();
                nb.replaceAtom(move, a);
                m.addBond(nb);
            }
            return false;
        }

        var bond = bonds[0];
        var move = bond.a1.selected ? bond.a1 : bond.a2;
        var fix = bond.a1.selected ? bond.a2 : bond.a1;

        var a = m.getObjectById(move.id);
        if (a == null)
            return false;

        // translate
        var p;
        if (bond.selected) {
            var i = scil.Utils.indexOf(host.bonds, bond);
            host.bonds.splice(i, 1);
            p = host.guessBond(fix, bondlength);
            host.bonds.splice(i, 0, bond);
        }
        else {
            p = move.p;
        }
        m.offset(p.x - a.p.x, p.y - a.p.y);

        // rotate
        var p2 = m.guessBond(a, bondlength);
        var ang1 = fix.p.angleTo(p);
        var ang2 = p2.angleTo(p);
        m.rotate(p, ang1 - ang2);

        var nb = bond.clone();
        nb.replaceAtom(move, a);
        m.addBond(nb);
        return true;
    },

    _data2Mol: function (data) {
        var m = new JSDraw2.Mol();
        if (typeof (data) == "string")
            m = m.setXml(data);
        else
            m = m.setXml(data.output);
        return m;
    },

    _setMolData: function (jsd, data, q, clear) {
        var m = this._data2Mol(data);
        if (m == null || m.isEmpty())
            return;

        jsd.pushundo();
        if (jsd.setXml(m.getXml()) != null)
            jsd.refresh(true);
    },

    name2structure: function (jsd) {
        var fn = function (q) {
            var url;
            if (JSDrawServices.id2s != null && JSDrawServices.id2s.url != null && JSDrawServices.id2s.regex != null && q.match(JSDrawServices.id2s.regex) != null)
                url = JSDrawServices.id2s.url;
            else if (JSDrawServices.n2s != null && JSDrawServices.n2s.url != null)
                url = JSDrawServices.n2s.url;

            if (url == null) {
                scil.Utils.alert("Name-to-structure is not configured yet.");
                return;
            }

            scil.Utils.jsonp(url, function (data) { JSDraw2.JSDrawIO._setMolData(jsd, data, q); }, { q: q, fmt: "jsdraw" }, { showprogress: true });
        };

        // caption, message, defaultval, btn, callback,
        var msg = JSDrawServices.n2s != null && JSDrawServices.url.msg != null ? JSDrawServices.n2s.msg : this.res("Please type chemical name, CAS, SMILES etc.") + ":";
        scil.Utils.prompt2({
            caption: "<img src='" + scil.Utils.imgSrc("img/n2s.gif") + "'>" + this.res("Name to Structure"),
            message: msg,
            button: this.res("Convert"),
            callback: fn,
            autosuggesturl: (JSDrawServices.n2s != null ? JSDrawServices.n2s.suggest : null),
            iconurl: scil.Utils.imgSrc("img/name2s.gif"),
            owner: jsd
        });
    },

    res: function (s) {
        return JSDraw2.Language.res(s);
    },

    jssFileOpen: function (jss) {
        var check = { msg: "Appending Mode" };
        if (jss.options.appendingmode) {
            check.checked = true;
            check.disabled = true;
        }
        var structurecolumn = jss.options.structurecolumn == null ? "" : jss.options.structurecolumn;
        scil.Utils.uploadFile("<img src='" + scil.Utils.imgSrc("img/open.gif") + "'>" + this.res("Open File"),
            this.res("Please select a file") + " (*.sdf,*.rdf,*.xls,*.csv,*.smiles):", JSDrawServices.url + "?cmd=openjss",
            function (ret) { JSDraw2.JSDrawIO.jssFileOpen2(jss, ret); }, { structurecolumn: structurecolumn }, check);

        if (this.needCrossdomain()) {
            var url = JSDrawServices.url + "?cmd=";
            scil.Utils.uploadFile("<img src='" + scil.Utils.imgSrc("img/open.gif") + "'>" + this.res("Open File"),
                this.res("Please select a file") + " (*.sdf,*.rdf,*.xls,*.csv,*.smiles)",
                url + "xdomain.post", function (xfilename) {
                    scil.Utils.jsonp(url + "openjss", function (ret) { JSDraw2.JSDrawIO.jssFileOpen2(jsd, ret); },
                    { _xfilename: xfilename, structurecolumn: structurecolumn });
                }, null, null, null, null, true);
        }
        else {
            scil.Utils.uploadFile("<img src='" + scil.Utils.imgSrc("img/open.gif") + "'>" + this.res("Open File"),
                this.res("Please select a file") + " (*.sdf,*.rdf,*.xls,*.csv,*.smiles):", JSDrawServices.url + "?cmd=openjss",
                function (ret) { JSDraw2.JSDrawIO.jssFileOpen2(jss, ret); }, { structurecolumn: structurecolumn }, check);
        }
    },

    jssFileOpen2: function (jss, ret, check) {
        var appendingmode = scil.Utils.uploadfileDlg.check.checked;
        if (scil.Utils.endswith(ret.filename, ".rdf"))
            jss.setRdf(ret.base64 != null ? JSDraw2.Base64.decode(ret.base64) : ret.contents, null, null, !appendingmode);
        //else if (scil.Utils.endswith(ret.filename, ".sdf"))
        //    jss.setSdf(ret.base64 != null ? JSDraw2.Base64.decode(ret.base64) : ret.contents, null, null, !appendingmode);
        else
            jss.setXml(ret.base64 != null ? JSDraw2.Base64.decode(ret.base64) : ret.contents, null, !appendingmode, appendingmode);
    },

    jssFileSave: function (jss) {
        if (JSDraw2.JSDrawIO.jsssavedlg == null) {
            var div = scil.Utils.createElement(null, "div", this.res("Please select a file type") + ":", { width: "350px", margin: "10px" });
            var sel = scil.Utils.createElement(div, "select");
            scil.Utils.createElement(sel, "option");
            scil.Utils.listOptions(sel, JSDraw2.JSDrawIO.jssFiles, null, false);

            var s = scil.Utils.createElement(div, "div", null, { marginTop: "20px", textAlign: "center" });
            var btn = scil.Utils.createElement(s, "button", "<img src='" + scil.App.imgSmall("submit.png") + "'>" + this.res("Save"));
            dojo.connect(btn, "onclick", function (e) { JSDraw2.JSDrawIO.jssFileSave2(); e.preventDefault(); });
            JSDraw2.JSDrawIO.jsssavedlg = new JSDraw2.Dialog("<img src='" + scil.App.imgSmall("save.png") + "'>" + this.res("Save File"), div);
            JSDraw2.JSDrawIO.jsssavedlg.sel = sel;
        }
        JSDraw2.JSDrawIO.jsssavedlg.jss = jss;
        JSDraw2.JSDrawIO.jsssavedlg.show();
        JSDraw2.JSDrawIO.jsssavedlg.sel.selectedIndex = 0;
    },

    jssFileSave2: function () {
        var ext = JSDraw2.JSDrawIO.jsssavedlg.sel.value;
        var dt = new Date();
        var filename = "JSDrawTable" + dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + "." + ext;
        var args = { client: "jssdf", wrapper: "none", filename: filename };
        switch (ext) {
            case "sdf":
                args.contents = JSDraw2.JSDrawIO.jsssavedlg.jss.getSdf();
                break;
            case "jssdf":
                args.contents = JSDraw2.JSDrawIO.jsssavedlg.jss.getXml();
                break;
            case "json":
                args.contents = scil.Utils.json2str(JSDraw2.JSDrawIO.jsssavedlg.jss.getJson());
                break;
            case "csv":
                args.contents = JSDraw2.JSDrawIO.jsssavedlg.jss.getCsv();
                break;
        }
        scil.Utils.post(JSDrawServices.url + "?cmd=savefile", args, "_blank");
        JSDraw2.JSDrawIO.jsssavedlg.hide();
    }
};
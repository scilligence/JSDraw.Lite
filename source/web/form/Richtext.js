//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Richtext class - Richtext Control
* @class scilligence.Richtext
*/

scil.Richtext = {
    __id: 0,
    __buttonid: 0,
    defaultbuttons: "fullscreen | bold italic underline forecolor backcolor | alignleft aligncenter  | numlist bullist outdent indent | fontselect fontsizeselect lineheightselect | subscript superscript",
    defaultplugins: "fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern code lineheight",

    generateId: function () {
        return "__richtext_" + (++this.__id);
    },

    saveBookmark: function (ed) {
        if (tinymce.isIE) {
            ed.focus();
            ed.oln_bookmark = ed.selection.getBookmark();
        }
    },

    restoreBookmark: function (ed, html) {
        ed.focus();
        if (tinymce.isIE)
            ed.selection.moveToBookmark(ed.oln_bookmark);
        if (html != null)
            ed.execCommand('mceInsertContent'/*mceInsertRawHTML*/, false, html);
    },

    initTinyMCE: function (obj, args) {
        if (JsUtils.isAndroid && JsUtils.isAndroid < 3 || JsUtils.isIpad && JsUtils.isIpad < 5)
            return null;

        if (args == null)
            args = {};

        var id;
        if (typeof (obj) == "string") {
            id = obj;
        }
        else {
            if (obj.id == null || obj.id == "")
                obj.id = this.generateId();
            id = obj.id;
        }

        var options = { selector: "#" + id };
        if (args.css != null)
            options.conent_css = args.css;
        options.plugins = this.defaultplugins;
        if (args.fonts != null)
            options.font_formats = args.fonts; // "Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;AkrutiKndPadmini=Akpdmi-n;宋体=SimSun;黑体=SimHei";

        var buttons = args.buttons;
        if (buttons == null)
            buttons = [];
        buttons.push({
            tooltips: 'Insert Symbol', iconurl: scil.Utils.imgSrc("img/symbol.gif"),
            onclick: function (ed) {
                scil.Richtext.saveBookmark(ed);
                JSDraw2.Symbol.show(true, function (ret) {
                    JSDraw2.Symbol.hide();
                    scil.Richtext.restoreBookmark(ed, ret);
                });
            }
        });

        var btns = this.scanButtons(buttons);
        if (args.buttons1 != null)
            options.toolbar1 = args.buttons1.replace("*", this.defaultbuttons) + " " + btns;
        else
            options.toolbar1 = this.defaultbuttons + " " + btns;
        options.toolbar2 = args.buttons2 == null ? "" : args.buttons2;
        options.toolbar3 = args.buttons3 == null ? "" : args.buttons3;
        options.toolbar4 = args.buttons4 == null ? "" : args.buttons4;

        var me = this;
        options.setup = function (ed) { me.onSetup(ed, buttons, args.onchange, args.oninit); };
        options.menubar = (args.mode == "full" || args.menubar == true) ? true : false;
        options.statusbar = false;
        options.branding = false;
        options.width = args.width;
        options.height = args.height;

        if (args.autoresize) {
            options.plugins += " autoresize";
            options.autoresize_on_init = true;
            options.autoresize_bottom_margin = 10;
            options.autoresize_min_height = args.autoresizemin > 0 ? args.autoresizemin : 100;
            if (args.autoresizemax > 0)
                options.autoresize_max_height = args.autoresizemax;
        }

        this.setLang(options);

        if (args.renderlater) {
            // Creates a new editor instance
            options.selector = null;
            var ed = new tinymce.Editor(id, options, tinymce.EditorManager);
            tinymce.EditorManager.add(ed);
            return ed;
        }
        else {
            tinymce.init(options);
            return tinymce.get(id);
        }
    },

    setLang: function (options) {
        if (scil.Lang.language == "cn")
            options.language = 'zh_CN';
    },

    scanButtons: function (buttons) {
        var ret = "";
        if (buttons == null)
            return ret;

        for (var i = 0; i < buttons.length; ++i) {
            var b = buttons[i];
            if (typeof (b) == "string") {
                ret += b;
                continue;
            }

            if (b.id != null)
                continue;

            b.id = "rte" + (++this.__buttonid);
            if (ret == "")
                ret = " | ";
            else
                ret += " ";
            ret += b.id;
        }

        return ret;
    },

    onSetup: function (ed, buttons, onchange, oninit) {
        if (buttons != null) {
            for (var i = 0; i < buttons.length; ++i)
                this.addButton(ed, buttons[i]);
        }

        // I#11986
        ed.on('BeforeSetContent', function (e) {
            var key = "<table id=\"__mce\">";
            if (e != null && e.selection && e.format == "html" && scil.Utils.startswith(e.content, key)) {
                e.content = e.content.substr(0, key.length - 1) + " border='1' style='border-collapse:collapse;width:800px;'>" + e.content.substr(key.length);
            }
        });

        ed.on("paste", function (e) { scil.Richtext.onPaste(ed, e); });
        if (onchange != null)
            ed.on("change", function () { onchange(ed); });
        if (oninit != null)
            ed.on("init", function () { oninit(ed); });

        ed.addMenuItem('importword', {
            text: scil.Lang.res("Import Word"),
            context: 'file',
            onclick: function () { scil.Richtext.importWord(ed); }
        });
    },

    importWord: function (ed) {
        scil.Utils.uploadFile("Import Word", "Select a Word file", JSDrawServices.url + "?cmd=office.importword", function (ret) { ed.setContent(ret.html); });
    },

    addButton: function (editor, b) {
        if (b.items != null) {
            var menu = [];
            for (var i = 0; i < b.items.length; ++i)
                menu.push(this.addMenuItems(editor, b.items[i], b, b.onclick, b.onclick2));

            editor.addButton(b.id, { type: 'menubutton', icon: false, text: b.label || b.text || b.tooltips, title: b.title || b.tooltips, menu: menu });
        }
        else {
            editor.addButton(b.id, {
                title: b.title || b.tooltips,
                image: b.iconurl || b.image || b.img || b.src,
                context: b.context,
                onclick: function () { b.onclick(editor, b); }
            });
        }
    },

    addMenuItems: function (ed, item, b, onclick, onclick2) {
        if (onclick != null)
            return { text: item, onclick: function () { onclick(item); } };
        else
            return { text: item, onclick: function () { onclick2(ed, b, item); } };
    },

    onPaste: function (ed, e) {
        if (e == null || e.clipboardData == null || JSDrawServices == null || JSDrawServices.url == null)
            return;

        var html = e.clipboardData.getData("text/html");
        var rtf = e.clipboardData.getData("text/rtf");
        if (!scil.Utils.isNullOrEmpty(html) || !scil.Utils.isNullOrEmpty(html)) {
            e.preventDefault();
            scil.Richtext.saveBookmark(ed);
            scil.Utils.ajax(JSDrawServices.url + "?cmd=paste.cleanhtml", function (ret) {
                if (ret != null) {
                    scil.Richtext.restoreBookmark(ed, ret);
                }
            }, { html: html, rtf: rtf });
            return;
        }

        for (var i = 0; i < e.clipboardData.items.length; i++) {
            var item = e.clipboardData.items[i];
            var file = item == null ? null : item.getAsFile();
            if (file == null || !scil.Utils.startswith(item.type, "image/"))
                continue;

            e.preventDefault();
            scil.Richtext.saveBookmark(ed);
            scil.Richtext.postFile(JSDrawServices.url + "?cmd=paste.tohtmltag", function (ret) {
                if (ret != null) {
                    scil.Richtext.restoreBookmark(ed, ret);
                }
            }, file);
            return;
        }
    },

    showDlg: function (args) {
        if (!this.createDlg(args.text)) {
            this.dlg.show();
            tinyMCE.get(this.kEdId).setContent(args.text == null ? "" : args.text);
        }

        this.dlg.args = args;
    },

    kEdId: "__scil_form_richtext_ed",
    createDlg: function (text) {
        if (this.dlg != null)
            return false;

        var me = this;
        var items = { ed: { type: "textarea", value: text, width: 700, height: 400} };
        this.dlg = scil.Form.createDlgForm("Richtext Editor", items, { label: "Save", src: scil.App.imgSmall("submit.png"), onclick: function () { me._onsave(); } }, { hidelabel: true });
        this.dlg.form.fields.ed.id = this.kEdId;
        this.initTinyMCE(this.dlg.form.fields.ed);
        return true;
    },

    _onsave: function () {
        s = this.getHtml(tinyMCE.get(this.kEdId));
        this.dlg.hide();
        if (this.dlg.args.callback != null)
            this.dlg.args.callback(s);
    },

    // https://mobiarch.wordpress.com/2013/09/25/upload-image-by-copy-and-paste/
    postFile: function (url, callback, file, opts) {
        if (file == null)
            return;

        if (opts == null)
            opts = {};
        var xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function (e) {
            var percentComplete = (e.loaded / e.total) * 100;
            console.log("Uploaded" + percentComplete + "%");
        };

        xhr.onload = function () {
            if (xhr.status == 200) {
                var data = xhr.response;
                scil.Utils.ajaxCallback(data, callback, opts.onError, opts.ignoresucceedcheck);
            } else {
                if (opts.onError != null)
                    opts.onError("Error");
            }
            if (opts.showprogress)
                scil.Progress.hide();
        };

        xhr.onerror = function () {
            if (opts.onError != null)
                opts.onError("Error");
            if (opts.showprogress)
                scil.Progress.hide();
        };

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", file.type);

        if (opts.showprogress)
            scil.Progress.show((opts.caption == null ? "Loading ..." : opts.caption), false, (opts.message == null ? "Communicating with the server ..." : opts.message), false);

        xhr.send(file);
    },

    getImageUrl: function () {
        var url = JSDraw2.defaultoptions.imageserviceurl;
        if (url == null || url == "")
            url = "./HelpService.aspx";
        return url;
    },

    insertImage: function (ed) {
        var url = this.getImageUrl();
        scil.Richtext.saveBookmark(ed);
        scil.Utils.uploadFile("Insert Image", 'Choose a picture file:', url + "?cmd=help.uploadimage", function (ret) {
            var html = "<img src='" + url + "?imageid=" + ret.imageid + "'>";
            scil.Richtext.restoreBookmark(ed, html);
        });
    },

    insertStructure: function (ed) {
        scil.Richtext.saveBookmark(ed);
        var structureid = scil.Richtext.getStructureID(ed.selection.getNode());
        scil.Richtext.showStructure(structureid, ed);
    },

    getStructureID: function (obj) {
        if (obj == null || obj.tagName != 'IMG')
            return null;

        var structureid = null;
        var key = "?structureid=";
        var p = obj.src.indexOf(key);

        if (p > 0) {
            var s = obj.src.substr(p + key.length);
            p = s.indexOf('/');
            if (p >= 0) {
                s = s.substr(0, p);
                if (!isNaN(s))
                    structureid = parseInt(s);
            }
        }
        return structureid;
    },

    saveStructure: function (jsd) {
        var jsdraw = jsd.getHtml();
        var url = this.getImageUrl();
        scil.Utils.ajax(url + "?cmd=help.uploadstructure", function (ret) {
            if (ret != null) {
                var html = "<img src='" + url + "?structureid=" + ret.structureid + "'>";
                scil.Richtext.restoreBookmark(jsd.caller, html);
            }
        }, { jsdraw: jsdraw, structureid: jsd.structureid });
    },

    showStructure2: function (ret, ed) {
        var jsd = JSDraw.showPopup("JSDraw Editor", ed != null ? "Save" : "Dismiss", ed != null ? function (jsd) { scil.Richtext.saveStructure(jsd); } : null);
        jsd.clear();
        jsd.caller = ed;
        jsd.structureid = ret.structureid;
        jsd.setHtml(ret.jsdraw);
    },

    showStructure: function (structureid, ed) {
        if (structureid == null)
            this.showStructure2({}, ed);
        else
            scil.Utils.ajax(this.getImageUrl() + "?cmd=help.getstructure", function (ret) { scil.Richtext.showStructure2(ret, ed); }, { structureid: structureid });
    },

    viewStructure: function (e) {
        if (e.button != 2)
            return;

        var structureid = scil.Richtext.getStructureID(e.srcElement || e.target);
        if (structureid != null) {
            var menu = new scil.ContextMenu(["View Large Structure"], function () { scil.Richtext.showStructure(structureid) });
            menu.show(e.clientX, e.clientY);
            e.preventDefault();
            tinymce.dom.Event.cancel(e);
        }
    },

    getHtml: function (ed, format) {
        var s = format == null ? ed.getContent() : ed.getContent({ format: format });
        return this.getHtmlBody(s);
    },

    getHtmlBody: function (s) {
        if (scil.Utils.startswith(s, "<!DOCTYPE")) {
            var p = s.indexOf("<body>");
            if (p > 0)
                p += 6;
            var p2 = s.lastIndexOf("</body>");
            if (p2 > 0)
                s = scil.Utils.trim(s.substr(p, p2 - p));
        }

        return s;
    }
};

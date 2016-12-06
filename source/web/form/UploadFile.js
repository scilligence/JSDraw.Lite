//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

scil.UploadFile = {
    dlg: null,
    form: null,
    msg: null,
    files: [],
    filetypes: [],
    kIframe: "__scil_uploadfile_iframe",

    show: function (options) {
        this.create();
        this.dlg.show();
        this.form.reset();
        this.options = options == null ? {} : options;

        if (options.msg != null)
            this.msg.innerHTML = options.msg;

        for (var i = 0; i < this.files.length; ++i)
            this.files[i].value = "";
        for (var i = 0; i < this.filetypes.length; ++i) {
            scil.Utils.removeAll(this.filetypes[i]);
            this.filetypes[i].style.display = this.options.filetypes != null ? "" : "none";
            if (this.options.filetypes != null)
                scil.Utils.listOptions(this.filetypes[i], this.options.filetypes);
        }
    },

    upload: function () {
        var me = this;
        var params = this.options.params;
        scil.Utils.ajaxUploadFile(this.form, this.options.url, params == null ? {} : params, function (ret) { me.dlg.hide(); me.options.callback(ret); });
    },

    create: function (parent) {
        if (this.dlg != null)
            return;

        var me = this;
        // form method='post' id='__newfile' enctype=''
        var div = JsUtils.createElement(null, "div", "<form method='post' enctype='multipart/form-data'></form>", { padding: "15px" });
        this.form = div.firstChild;
        this.msg = scil.Utils.createElement(this.form, "div", "Please specify files to be uploaded");
        var tbody = scil.Utils.createTable(this.form);
        for (var i = 0; i < 5; ++i) {
            var tr = scil.Utils.createElement(tbody, "tr");
            var td = scil.Utils.createElement(tr, "td");
            var file = scil.Utils.createElement(td, "file", null, null, { name: "f" + i });

            td = scil.Utils.createElement(tr, "td");
            var type = scil.Utils.createElement(td, "select", null, null, { name: "filetype.f" + i });

            this.files.push(file);
            this.filetypes.push(type);
        }

        var tr = scil.Utils.createElement(tbody, "tr");
        var td = scil.Utils.createElement(tr, "td", null, { paddingTop: "10px", textAlign: "center" }, { colSpan: 2 });
        scil.Utils.createButton(td, { src: scil.App.imgSmall("submit.png"), label: "Upload", onclick: function () { me.upload(); } });

        this.dlg = new scil.Dialog("Upload File", div);
    }
};
//////////////////////////////////////////////////////////////////////////////////
//
// Scilligence JSDraw
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////


// To enable session time out feature: JSDraw2.defaultoptions.sessiontimeout=30
scil.User = {
    form: null,
    medlg: null,
    _timer: null,
    backgroundimages: 30,
    backgrounditems: {},
    fields: {
        email: { label: "Email", width: 200, style: { padding: "6px", textAlign: "left" }, labelstyle: { color: "white", background: "", border: "", verticalAlign: "middle"} },
        password: { label: "Password", type: "password", width: 200, style: { padding: "6px", textAlign: "left" }, labelstyle: { color: "white", background: "", border: "", verticalAlign: "middle"} }
    },

    onSetLoginData: null,
    onlogin: null,

    options: {
        kAjax: "ajax.ashx?cmd=",
        kCookieKey: "__scil_login_email",
        loginpage: "Login.aspx",
        homepage: "Home.aspx",
        object: "user",
        timeout: 0,
        roles: null,
        findpassword: true,
        logindlgdisabled: false,
    },

    init: function (parent, cmd, email, token, options) {
        scil.ready(function () {
            var d = scil.byId("__scil_main");
            d.setAttribute("width", "");
            d.setAttribute("align", "center");
            scil.User.init2(parent, cmd, email, token, options);
        });

        if (this.backgroundimages > 0 && this.canusebackground()) {
            var dt = new Date();
            var img;
            var item = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
            if (this.backgrounditems[item] != null)
                img = this.backgrounditems[item];
            else
                img = (dt.getDate() % this.backgroundimages) + ".jpg";
            document.body.style.backgroundImage = "url(background/" + img + ")";
            document.body.style.backgroundSize = "100%";
        }
    },

    canusebackground: function() {
        return true;
        //return !scil.Utils.isNullOrEmpty(this.getSavedEmail());
    },

    init2: function (parent, cmd, email, token, options) {
        if (typeof parent == "string")
            parent = dojo.byId(parent);

        if (options != null)
            scil.apply(this.options, options);

        var me = this;

        var tbody = scil.Utils.createTable(parent, 0, 0, { background: scil.App.config.background, border: "solid 1px " + scil.App.config.frame, borderRadius: "5px", margin: "50px 0 0 0" });
        var td = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td");
        scil.Utils.createElement(td, "img", null, { width: 450, height: 225 }, { src: scil.App.imgBig(scil.App.config.logo) });

        td = scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", null, { borderTop: "solid 1px " + scil.App.config.frame, padding: "10px 0 40px 0" });

        this.form = new scil.Form();
        this.form.render(td, this.fields, { buttons: this.getLoginButtons(), align: "center" });
        dojo.connect(this.form.fields.password, "onkeydown", function (e) { if (e.keyCode == 13 && me.form.fields.email.value != "") { me.login(); e.preventDefault(); } });

        var args = { email: this.getSavedEmail() };
        if (this.onSetLoginData != null)
            this.onSetLoginData(args, this.form);

        this.form.setData(args);
        if (args.email == null || args.email == "")
            this.form.fields.email.focus();
        else
            this.form.fields.password.focus();
    },

    getSavedEmail: function() {
        return JsUtils.readCookie(this.options.kCookieKey);
    },

    getLoginButtons: function (dialog) {
        var me = this;
        var list = [{ src: scil.App.imgSmall("key.png"), label: "Login", width: 216, style: { padding: "8px" }, onclick: function () { me.login(null); } }];
        if (this.options.findpassword) {
            list.push("<br><br>");
            list.push({ label: "Find Password", type: "a", color: dialog ? "" : "white", onclick: function () { me.showFindpassword(); } });
        }

        if (this.onLoginButtons != null)
            this.onLoginButtons(list);

        return list;
    },

    showFindpassword: function () {
        if (this.findpasswordDlg == null) {
            var me = this;
            var fields = { email: { label: "Email", width: 260} };
            this.findpasswordDlg = scil.Form.createDlgForm("Find Password", fields,
                { src: scil.App.imgSmall("email.png"), label: "Send Me Email", onclick: function () { me.findpassword() } });
        }

        this.findpasswordDlg.show();
    },

    showResetPassword: function () {
        if (this.resetpasswordDlg == null) {
            var me = this;
            var fields = {
                email: { label: "Email", width: 260 },
                data: { type: "hidden" },
                password: { label: "Password", type: "password", width: 260 },
                password2: { label: "Confirm Password", type: "password", width: 260 }
            };
            this.resetpasswordDlg = scil.Form.createDlgForm("Find Password", fields,
                { src: scil.App.imgSmall("submit.png"), label: "Change Password", onclick: function () { me.resetPassword() } });
        }

        var s = window.location + "";
        var i = s.indexOf('?');
        s = s.substr(i + 1);

        var p = s.indexOf(',');
        this.resetpasswordDlg.show();
        this.resetpasswordDlg.form.setData({ email: s.substr(0, p), data: s.substr(p + 1) });
    },

    findpassword: function () {
        var me = this;
        var email = this.findpasswordDlg.form.fields.email.value;
        if (email.length > 0)
            scil.Utils.ajax(this.options.kAjax + "user.findpassword", function (ret) { me.findpasswordDlg.hide(); alert("A verification email has been sent to your email box:\n\n" + email + "\n\nIt will lead you to set a new password."); }, { email: email });
    },

    resetPassword: function () {
        var data = this.resetpasswordDlg.form.getData();
        if (data.password != data.password2) {
            alert("Password not matches confirmed password");
            return;
        }

        var me = this;
        scil.Utils.ajax(this.options.kAjax + "user.resetpassword", function (ret) {
            me.resetpasswordDlg.hide();
            scil.Utils.alert("Password is set successfully.");
            window.location = me.options.loginpage;
        }, data);
    },

    needLogin: function (ret) {
        if (ret != null && ret.errcode == "NeedLogin") {
            scil.Utils.alert("Your session has timed out. Please log in.");
            this.showLoginDlg();
            return true;
        }
        return false;
    },

    onAjax: function () {
        if (this.form == null)
            this.resetTimeout();
    },

    resetTimeout: function () {
        if (this._timer != null) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        if (JSDraw2.defaultoptions.sessiontimeout > 0)
            this._timer = setTimeout(function () { scil.User.timeout(); }, JSDraw2.defaultoptions.sessiontimeout * 60 * 1000);
    },

    timeout: function () {
        if (this._timer != null) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this.showLoginDlg();
    },

    getEditFields: function (forme) {
        var fields = this.getListFields(true);
        if (forme) {
            if (fields.manager != null)
                fields.manager.type = "html";
            if (fields.roles != null)
                fields.roles.type = "html";
            if (fields.isadmin != null)
                fields.isadmin.viewonly = true;
            if (fields.employeeno != null)
                fields.employeeno.viewonly = true;
            if (fields.site != null) {
                fields.site.viewonly = true;
                fields.site.type = null;
            }
            if (fields.expiry != null)
                fields.expiry.viewonly = true;
            fields.active = null;
            fields.email.viewonly = true;
        }
        return fields;
    },

    getListFields: function (includepasswords) {
        var fields = {
            userid: { type: "hidden", iskey: true },
            email: { label: "Email", required: true, width: 250 },
            firstname: { label: "First Name", required: true, width: 200 },
            lastname: { label: "Last Name", required: true, width: 200 },
            phone: { label: "Phone", width: 200 },
            employeeno: { label: "Employee No", width: 200 },
            site: { label: "Site", width: 200, type: "select", items: scil.UserManager.sites },
            manager: { label: "Manager", width: 200, autosuggesturl: this.options.kAjax + "user.suggest" },
            dept: { label: "Dept.", width: 200, type: "select", items: scil.UserManager.departments },
            active: { label: "Active", type: "checkbox" },
            isadmin: { label: "Admin", type: "checkbox" },
            roles: this.options.roles == null ? null : { label: "User Roles", type: "dropdowncheck", items: this.options.roles },
            expiry: { label: "Expiration", type: "date" }
        };

        if (includepasswords) {
            fields.passwordexpiration = { label: "Password Expiration", type: "html", render: function (v) { if (v == null) return ""; if (v <= 0) return "<span style='color:red'>Expired</span>"; return "<span style='color:" + (v <= 10 ? "red" : "") + "'>In " + v + " day(s)"; } };
            fields.password = { label: "Password", width: 150, type: "password", inTable: false };
            fields.password2 = { label: "Confirm Password", width: 150, type: "password", inTable: false };
        };

        if (this.onGetListFields != null)
            this.onGetListFields(fields);
        return fields;
    },

    manageUsers: function (parent, category, extrafields) {
        var me = this;
        var fields = this.getListFields(true);
        scil.apply(fields, extrafields);
        fields.userid = null;
        return new scil.EditableTable(parent, fields, "User", { category: category, onSave: function (data) { return me.onSaveUser(data); } });
    },

    onSaveUser: function (data) {
        if (data != null && data.password != data.password2) {
            scil.Utils.alert("Password not matched");
            return false;
        }
        return true;
    },

    showMe: function () {
        var me = this;
        scil.Utils.ajax(this.options.kAjax + this.options.object + ".loadme", function (ret) { me.showMe2(ret); });
    },

    showMe2: function (ret) {
        if (this.medlg == null) {
            var me = this;
            var buttons = [{ src: scil.App.imgSmall("submit.png"), label: "Save", onclick: function () { me.saveMe(); } }];
            this.medlg = scil.Form.createDlgForm("Me", this.getEditFields(true), buttons);
        }

        if (this.onShowMe != null)
            this.onShowMe(ret);

        this.medlg.show();
        this.medlg.form.setData(ret);
    },

    saveMe: function () {
        var args = this.medlg.form.getData();
        if (args.password != args.password2) {
            scil.Utils.alert("Password not matched");
            return;
        }

        if (this.onSaveMe != null)
            this.onSaveMe(args);

        var me = this;
        scil.Utils.ajax(this.options.kAjax + this.options.object + ".saveme", function (ret) { me.medlg.hide(); }, args);
    },

    showLicenseMsg: function (licexpdays, callback) {
        var msg = null;
        if (licexpdays < 0)
            msg = "Your software license expired.";
        else
            msg = "Your software license will expire in " + licexpdays + " " + (licexpdays < 2 ? "day" : "days") + ". (Since we usually add one month grace period, your actual license might have already expired.)";
        scil.Utils.alert2(msg + "<br>Please contact <a href='mailto:support@scilligence.com'>SUPPORT@SCILLIGENCE.COM</a>", "License Expiring", callback);
    },

    login: function (onlogin, from) {
        var form = null;
        if (this.form != null)
            form = this.form;
        else if (this.dlg != null)
            form = this.dlg.form;
        else
            return null;

        var me = this;
        var data = form.getData();
        scil.Utils.ajax(this.options.kAjax + this.options.object + ".login", function (ret) {
            if (me.onAjaxCall != null && me.onAjaxCall(ret, form))
                return;
            me.login2(ret, data);
        }, data);
    },

    login2: function (ret, data) {
        JsUtils.createCookie(this.options.kCookieKey, data.email, 365);

        var me = this;
        if (ret != null && ret.passwordexpiration > 0) {
            scil.Utils.confirm("Your password is going to expire in " + ret.passwordexpiration + " day(s).  Change it now?", function (f) {
                if (f)
                    me.showMe();
                else
                    me.login3();
            });
        }
        else {
            if (ret != null && ret.licexpdays != null)
                this.showLicenseMsg(ret.licexpdays, function () { me.login3(); });
            else
                this.login3();
        }
    },

    login3: function () {
        if (this.onlogin != null) {
            this.onlogin();
        }
        else if (this.dlg != null) {
            this.dlg.hide();
        }
        else {
            var s = window.location + "";
            var p = s.indexOf("?");
            if (p > 0)
                window.location = s.substr(p + 1);
            else
                window.location = this.options.homepage;
        }
    },

    logout: function () {
        var me = this;
        scil.Utils.confirmYes("Log out?", function () {
            scil.Utils.ajax(me.options.kAjax + me.options.object + ".logout", function () { me.logout2(); });
        });
    },

    logout2: function () {
        window.location = this.options.loginpage;
    },

    showLogin: function () {
        window.location = this.options.loginpage;
    },

    showLoginDlg: function () {
        if (this.options.logindlgdisabled) {
            window.open(this.options.loginpage, "_blank");
            return true;
        }

        if (this.form != null)
            return;

        var fields = scil.clone(this.fields);
        for (var k in fields)
            fields[k].labelstyle = null;

        if (this.dlg == null)
            this.dlg = scil.Form.createDlgForm("Login", fields, this.getLoginButtons(true), { onenter: function () { scil.User.login(null); } });

        if (this.dlg.form.fields.email.value == "") {
            var s = JsUtils.readCookie(this.options.kCookieKey);
            if (s != null)
                this.dlg.form.fields.email.value = s;
        }

        this.dlg.form.fields.password.value = "";
        this.dlg.show();
        if (this.dlg.form.fields.email.value == "")
            this.dlg.form.fields.email.focus();
        else
            this.dlg.form.fields.password.focus();
    }
};

scil.Login = scil.User;
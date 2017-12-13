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
* Lang class - translate web page into other lanagues
* @class scilligence.Lang
* <pre>
* <b>Example:</b>
*    scil.Lang.use('cn');
*    var s = scil.Lang.res("Print");
* </pre>
*/
scil.Lang = {
    token: "translate",
    key: "scil_lang",
    current: null,
    language: null,
    en: {},
    cn: {},

    add: function (dict, lang) {
        if (dict == null)
            return;

        var dest = lang == null ? this.en : scil.Lang[lang];
        if (dest == null)
            scil.Lang[lang] = {};

        scil.apply(dest, dict);
    },

    setLang: function (lang, reload) {
        if (lang == null || lang == "")
            scil.Utils.createCookie(this.key, "", -1, true);
        else
            scil.Utils.createCookie(this.key, lang, 180, true);
        if (reload)
            window.location.reload()
    },

    use: function (lang) {
        if (lang == null)
            return;
        lang = lang.toLowerCase();
        if (lang == "zh")
            lang = "cn";

        this.language = lang;
        this.current = this[lang];
        if (this.current == null) {
            this.current = this.en;
            this.language = null;
        }

        JSDraw2.Language.use(lang);
    },

    res: function (s, lang) {
        if (scil.Utils.isNullOrEmpty(s) || typeof (s) != "string")
            return s;

        if (lang != null) {
            var dict = this[lang];
            return dict == null || dict[s] == null ? s : dict[s];
        }

        if (this.current == null) {
            var lang = scil.Utils.readCookie(this.key, true);
            if (lang != null && lang != "")
                this.use(lang);

            if (this.current == null && this.lang != null)
                this.use(this.lang);

            if (this.current == null) {
                var lang = window.navigator.userLanguage;
                if (lang != null && lang.length > 2)
                    this.use(lang.substr(0, 2));
                if (this.current == null)
                    this.current = this.en;
            }
        }

        var ret = this.current == null ? null : this.current[s];
        if (ret == null || ret == "")
            ret = JSDraw2.Language.res(s);
        return ret;
    },

    translate: function (parent, tags) {
        if (tags == null || tag == "") {
            this.translate(parent, "span");
        }
        else {
            var ss = tags.split(',');
            for (var i = 0; i < ss.length; ++i)
                this.translate(parent, ss[i]);
        }
    },

    translate2: function (parent, tag) {
        if (tag == null || tag == "")
            return;

        var list = (parent == null ? document : parent).getElementsByTagName(tag);
        if (list == null)
            return;

        for (var i = 0; i < list.length; ++i) {
            var e = list[i];
            if (e.getAttribute(this.token) == null)
                continue;

            var s = this.reg(e.innerHTML);
            if (scil.Utils.isNullOrEmpty(s))
                continue;

            e.innerHTML = s;
        }
    }
};
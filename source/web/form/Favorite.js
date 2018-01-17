//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

scil.Favorite = scil.extend(scil._base, {
    constructor: function (key, onAddFavorite) {
        this.key = key;
        this.items = null;
        this.onAddFavorite = onAddFavorite;
        this.changed = false;
    },

    getList: function(type) {
        this._load();
        return this.items[type];
    },

    contains: function (name, type) {
        this._load();

        var list = this.items[type];
        return list == null ? false : scil.Utils.indexOf(list, name) >= 0;
    },

    add: function (name, f, type) {
        this._load();

        var list = this.items[type];
        if (list == null) {
            if (f) {
                this.items[type] = [name];
                this.changed = true;
            }
        }
        else {
            var p = scil.Utils.indexOf(list, name);
            if (p < 0 && f) {
                list.push(name);
                this.changed = true;
            }
            else if (p >= 0 && !f) {
                list.splice(p, 1);
                this.changed = true;
            }
        }

        if (this.onAddFavorite != null)
            this.onAddFavorite(name, f, type);

        if (this.changed)
            this._save();
    },

    _save: function () {
        if (this.items == null)
            return;

        var s = scil.Utils.json2str(this.items);
        scil.Utils.createCookie("scil_helm_favorites_" + this.key, s);
    },

    _load: function () {
        if (this.items != null)
            return;

        var s = scil.Utils.readCookie("scil_helm_favorites_" + this.key);
        var v = scil.Utils.eval(s);
        this.items = v == null ? {} : v;
    }
});
//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.IDGenerator = scil.extend(scil._base, {
    constructor: function (start) {
        this.i = start > 0 ? start : 0;
        this.used = this.i == 0 ? null : {};
    },

    next: function (id) {
        if (this.used == null)
            return ++this.i;

        if (id > 0 && !this.used[id]) {
            this.used[id] = true;
            return id;
        }

        id = ++this.i;
        while (this.used[id])
            id = ++this.i;
        this.used[id] = true;
        return id;
    }
});
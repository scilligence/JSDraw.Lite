//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

scil.Clipboard = {
    copy: function (text) {
        if (scil.Utils.isNullOrEmpty(text))
            return false;

        var e = scil.Utils.createElement(document.body, "textarea", null, { position: 'fixed', top: 0, left: 0, width: '2px', height: '2px', padding: 0, border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent' });
        e.value = text;
        e.select();

        var ret = false;
        try {
            ret = document.execCommand('copy');
        } catch (err) {
        }

        document.body.removeChild(e);
        return ret;
    }
};
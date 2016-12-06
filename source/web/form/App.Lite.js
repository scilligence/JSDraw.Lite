//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

scil.App = {
    imgSmall: function (name, wrapasurl) {
        var s = "small/" + name;
        if (wrapasurl)
            s = "url(" + s + ")";
        return s;
    }
};
//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.needPro = function () {
    scil.Utils.alert("This is a JSDraw Pro feature.");
};

JSDraw2.Security = {
    kEdition: "Lite",
    error: null,
    valid: true,

    _check: function () {
    }
};


scil.apply(JSDraw2, {
    Text: { cast: function (a) { return null; } },
    Shape: { cast: function (a) { return null; } },
    Bracket: { cast: function (a) { return null; } },
    AssayCurve: { cast: function (a) { return null; } },
    Arrow: { cast: function (a) { return null; } },
    TLC: { cast: function (a) { return null; } },
    Spectrum: { cast: function (a) { return null; } },
    Plus: { cast: function (a) { return null; } },
    Group: { cast: function (a) { return null; } },
    RGroup: { cast: function (a) { return null; } }
});


//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.Skin = {
    jsdraw: null,
    jssdf: null,
    dialog: null,

    reset: function () {
        this.jsdraw = { bkcolor: "#e1e1e1", bkimg: scil.Utils.imgSrc("img/hbg.gif"), toolbarbk: scil.Utils.imgSrc("img/toolbarbk.jpg"), hovercolor: "#eef", btnselcolor: "#bbf" };
        this.jssdf = { bgcolor: "#eee", headerimg: scil.Utils.imgSrc("img/header-bg.gif"), headercolor: "#eee", rowcolor: "#f96", oddcolor: "", evencolor: "#eee", border: "solid 1px #ccc" };
        scilligence.apply(this.jssdf, this.jsdraw);
        this.dialog = { bkimg: scil.Utils.imgSrc("img/dlgheader.gif"), bkcolor: "#6badf6", border: "1px solid #4f6d81" };
    },

    red: function () {
        this.jsdraw = { bkcolor: "#ECCDDC", bkimg: scil.Utils.imgSrc("img/hbg-red.gif"), toolbarbk: scil.Utils.imgSrc("img/toolbarbk-red.jpg"), hovercolor: "#fCdDeC" };
        this.jssdf = { bgcolor: "#F8CEE8", headerimg: scil.Utils.imgSrc("img/header-bgred.gif"), headercolor: "#F8CEE8", rowcolor: "#FfeEf8", oddcolor: "", evencolor: "#eee", border: "solid 1px #ccc" };
        scilligence.apply(this.jssdf, this.jsdraw);
        this.dialog = { bkimg: scil.Utils.imgSrc("img/dlgheader-red.gif"), bkcolor: "#E7A6DF", border: "1px solid #4f6d81" };
    },

    green: function () {
        this.jsdraw = { bkcolor: "#C7EEDF", bkimg: scil.Utils.imgSrc("img/hbg-green.gif"), toolbarbk: scil.Utils.imgSrc("img/toolbarbk-green.jpg"), hovercolor: "#d7fEeF" };
        this.jssdf = { bgcolor: "#CCF8E8", headerimg: scil.Utils.imgSrc("img/header-bggreen.gif"), headercolor: "#CCF8E8", rowcolor: "#dCFff8", oddcolor: "", evencolor: "#eee", border: "solid 1px #ccc" };
        scilligence.apply(this.jssdf, this.jsdraw);
        this.dialog = { bkimg: scil.Utils.imgSrc("img/dlgheader-green.gif"), bkcolor: "#95D09C", border: "1px solid #4f6d81" };
    },

    blue: function () {
        this.jsdraw = { bkcolor: "#CDD0EC", bkimg: scil.Utils.imgSrc("img/hbg-blue.gif"), toolbarbk: scil.Utils.imgSrc("img/toolbarbk-blue.jpg"), hovercolor: "#dDe0fC" };
        this.jssdf = { bgcolor: "#DCDFF6", headerimg: scil.Utils.imgSrc("img/header-bgblue.gif"), headercolor: "#DCDFF6", rowcolor: "#eCeFFf", oddcolor: "", evencolor: "#eee", border: "solid 1px #ccc" };
        scilligence.apply(this.jssdf, this.jsdraw);
        this.dialog = { bkimg: scil.Utils.imgSrc("img/dlgheader-blue.gif"), bkcolor: "#8BB6CC", border: "1px solid #4f6d81" };
    },

    yellow: function () {
        this.jsdraw = { bkcolor: "#ECECCD", bkimg: scil.Utils.imgSrc("img/hbg-yellow.gif"), toolbarbk: scil.Utils.imgSrc("img/toolbarbk-yellow.jpg"), hovercolor: "#fCfCdD" };
        this.jssdf = { bgcolor: "#F4F4E1", headerimg: scil.Utils.imgSrc("img/header-bgyellow.gif"), headercolor: "#F4F4E1", rowcolor: "#F4F4B8", oddcolor: "", evencolor: "#eee", border: "solid 1px #ccc" };
        scilligence.apply(this.jssdf, this.jsdraw);
        this.dialog = { bkimg: scil.Utils.imgSrc("img/dlgheader-yellow.gif"), bkcolor: "#C8BA8F", border: "1px solid #4f6d81" };
    },

    menu: { highlightcolor: "#c60", color: "blue" },
    form: {
        labelstyles: { backgroundColor: "#eef", border: "solid 1px #dde", textAlign: "left", verticalAlign: "top", whiteSpace: "nowrap" },
        fieldcolor: "blue",
        rowselectcolor: "#aaf"
    }
};

JSDraw2.Skin.reset();

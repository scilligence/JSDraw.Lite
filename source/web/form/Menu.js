//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2018 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Menu class - Menu Control
* @class scilligence.Menu
*/
scil.Menu = {
    timeout: scilligence.Utils.isTouch || window.navigator.msPointerEnabled ? 2000 : 500,
    closetimer: 0,
    menuitem: null,

    isOpen: function () {
        return scil.Menu.menuitem != null && scil.Menu.menuitem.style.display != "none";
    },

    open: function (id) {
        scil.Menu.cancelclosetime();
        if (scil.Menu.menuitem)
            scil.Menu.menuitem.style.display = 'none';
        scil.Menu.menuitem = document.getElementById(id);
        scil.Menu.menuitem.style.display = '';
    },

    close: function () {
        if (scil.Menu.menuitem)
            scil.Menu.menuitem.style.display = 'none';
    },

    openOrClose: function (id) {
        if (scil.Menu.menuitem == null || scil.Menu.menuitem.style.display == "none")
            this.open(id);
        else
            this.close();
    },

    closetime: function () {
        scil.Menu.closetimer = window.setTimeout(scil.Menu.close, scil.Menu.timeout);
    },

    cancelclosetime: function () {
        if (scil.Menu.closetimer) {
            window.clearTimeout(scil.Menu.closetimer);
            scil.Menu.closetimer = null;
        }
    }
};


JSDraw2.Menu = scil.Menu;

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
* Popup class
* @class scilligence.Popup
* <pre>
* <b>Example:</b>
* &lt;span id='k'&gt;Test&lt;/span&gt; More words
* &lt;span id='Span1'&gt;Test2&lt;/span&gt;
* &lt;script type="text/javascript"&gt;
*     scil.onload(function () {
*         new scil.Popup('k', { html: "Hello, World!", caption: "Hellow" });
*         new scil.Popup('Span1', { html: "&lt;img src='face.gif'&gt;", caption: "Picture" });
*     });
* &lt;/script&gt;
* </pre>
*/
scil.Popup = scil.extend(scil._base, {
    /**
    * @constructor Popup
    * @param {string or DOM} element - the INPUT element to be converted
    * @param {dictionary} options - { caption, html, ongethtml: function() {} }
    */
    constructor: function (a, options) {
        if (typeof (a) == "string")
            this.a = scil.byId(a);
        else
            this.a = a;

        if (options == null)
            this.options = {};
        else
            this.options = options;

        if (this.a != null) {
            var me = this;
            dojo.connect(this.a, "onmouseout", function () { scil.Popup.hide(); });
            dojo.connect(this.a, "onmouseover", function (e) {
                scil.Popup.show(me, e);
            });
        }

        scil.Popup.init();
    },

    getHtml: function (e) {
        if (this.options.ongethtml2 != null)
            return this.options.ongethtml2(this, e);

        if (this.options.html == null) {
            if (this.options.ongethtml != null)
                this.options.html = this.options.ongethtml(this);
        }
        return this.options.html;
    },

    getCaption: function (e) {
        if (this.options.ongetcaption2 != null)
            return this.options.ongetcaption2(this, e);

        return this.options.caption;
    }
});

scil.apply(scil.Popup, {
    current: null,
    inited: null,

    show: function (popup, e2) {
        this.hide();
        this.current = popup;
        e = new scil.Popup.Event(e2);

        var caption = this.current.getCaption(e2);
        var html = this.current.getHtml(e2);

        if (scil.Utils.isNullOrEmpty(html)) {
            this.hide();
            return;
        }

        this.create();
        this.area.innerHTML = "";
        this.title.innerHTML = "";
        this.div.style.display = "";

        this.title.innerHTML = caption == null ? "" : caption;
        this.area.innerHTML = html;

        if (e != null)
            this.move(e);
    },

    hide: function () {
        this.current = null;
        if (this.div != null) {
            this.title.innerHTML = "";
            this.area.innerHTML = "";
            this.div.style.display = 'none';
        }
    },

    move: function (e) {
        if (this.current == null)
            return;

        if (this.div == null || this.div.style.display == "none")
            return;

        var obj = e.srcElement == null ? e.target : e.srcElement;
        if (this.current.a == obj || this.isChildOf(obj, this.current.a)) {
            this.moveto(e);
            return;
        }

        if (this.isChildOf(obj, this.div))
            return;

        this.hide();
    },

    moveto: function (e) {
        this.create();
        var scrollLeft = this.scrollLeft();
        var scrollTop = this.scrollTop();

        var winWidth = 0;
        var winHeight = 0;

        if (document.all == null) {
            winWidth = window.innerWidth;
            winHeight = window.innerHeight;
        }
        else {
            winWidth = document.documentElement.clientWidth;
            winHeight = document.documentElement.clientHeight;
        }

        var w = this.div.offsetWidth;
        var h = this.div.offsetHeight;

        var x = e.clientX + scrollLeft + 10;
        var y = e.clientY + scrollTop + 20;
        if (x - scrollLeft + w > winWidth && x - scrollLeft - w > 0)
            x -= w + 15;
        if (y - scrollTop + h > winHeight && y - scrollTop - h > 0)
            y -= h + 25;

        this.div.style.left = x + "px";
        this.div.style.top = y + "px";
    },

    isChildOf: function (obj, parent) {
        while (obj != null) {
            if (obj == parent)
                return true;
            obj = obj.parentNode;
        }

        return false;
    },

    scrollLeft: function (e) {
        return this.filterResults(
		    window.pageXOffset ? window.pageXOffset : 0,
		    document.documentElement ? document.documentElement.scrollLeft : 0,
		    document.body ? document.body.scrollLeft : 0
	    );
    },

    scrollTop: function (e) {
        return this.filterResults(
		    window.pageYOffset ? window.pageYOffset : 0,
		    document.documentElement ? document.documentElement.scrollTop : 0,
		    document.body ? document.body.scrollTop : 0
	    );
    },

    filterResults: function (n_win, n_docel, n_body) {
        var n_result = n_win ? n_win : 0;
        if (n_docel && (!n_result || (n_result > n_docel)))
            n_result = n_docel;
        return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
    },

    init: function () {
        if (this.inited == true)
            return;
        this.inited = true;

        dojo.connect(document, "onmousemove", function (e) { scil.Popup.move(e); });
    },

    create: function () {
        if (this.div != null)
            return;

        this.div = document.createElement("div");
        this.div.style.display = "none";
        this.div.style.whiteSpace = "nowrap";
        this.div.style.backgroundColor = "white";
        this.div.style.borderStyle = "solid";
        this.div.style.borderColor = "#f0f0f0 #a0a0a0 #a0a0a0 #f0f0f0";
        this.div.style.borderWidth = "2px";
        this.div.style.position = "absolute";
        this.div.style.zIndex = "99999";
        this.div.style.textAlign = "left";
        document.body.appendChild(this.div);

        var div = document.createElement("div");
        div.style.border = "1px solid highlight";
        div.style.padding = "1px";
        this.div.appendChild(div);

        this.title = document.createElement("div");
        this.title.style.textAlign = "center";
        this.title.style.border = "1px solid blue";
        this.title.style.backgroundColor = "blue";
        this.title.style.color = "white";
        div.appendChild(this.title);

        this.area = document.createElement("div");
        this.area.style.padding = "2px";
        this.area.style.backgroundColor = "white";
        div.appendChild(this.area);
    }
});


scil.Popup.Event = scil.extend(scil._base, {
    constructor: function (e) {
        this.clientX = e.clientX;
        this.clientY = e.clientY;
        this.srcElement = e.target || e.srcElement;
    }
});

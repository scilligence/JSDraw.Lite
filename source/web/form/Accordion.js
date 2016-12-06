//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

if (typeof (__JSDraw2_TouchMol) == "undefined") {
    dojo.require("dijit.layout.AccordionContainer");
    dojo.require("dijit.layout.ContentPane");
}

scil.Accordion = scil.extend(scil._base, {
    constructor: function (parent, options) {
        scil.Accordion.addStylesheet();

        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.options = options == null ? {} : options;

        var style = "";
        if (this.options.width > 0)
            style += "width:" + this.options.width + "px;";
        if (this.options.height > 0)
            style += "height:" + this.options.height + "px;";

        this.container = new dijit.layout.AccordionContainer({ style: style }, parent);
        for (var i = 0; i < this.options.items.length; ++i) {
            var item = this.options.items[i];
            this.container.addChild(new dijit.layout.ContentPane({
                title: item.title,
                content: item.html
            }));
        }
        this.container.startup();

        if (this.options.onafterrender != null)
            this.options.onafterrender(this);
    }
});

scil.apply(scil.Accordion, {
    stylesheetAdded: false,

    addStylesheet: function () {
        if (this.stylesheetAdded)
            return;

        this.stylesheetAdded = true;
        scil.Utils.addCss(this.getCss());
    },

    getCss: function () {
        var code = ".dijitAccordionInnerContainer{background-color: #efefef;border: solid 1px #b5bcc7;}\r\n" +
            ".dijitAccordionContainer .dijitAccordionChildWrapper{background-color: #ffffff;border: 1px solid #759dc0;margin: 0 2px 2px;}\r\n" +
            ".dijitAccordionTitle .arrowTextUp, .dijitAccordionTitle .arrowTextDown {display: none;font-size: 0.65em;font-weight: normal !important;}\r\n" +
            ".dijitAccordionTitle{padding: 5px 7px 2px 7px;min-height: 17px;}\r\n";

        return code;
    }
});

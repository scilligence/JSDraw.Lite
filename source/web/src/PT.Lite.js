//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw.Lite
// Copyright (C) 2016 Scilligence Corporation
// http://www.scilligence.com/
//
// (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
//
//////////////////////////////////////////////////////////////////////////////////

JSDraw2.PT = {
    commonUsed: { C: "C", N: "N", O: "O", S: "S", P: "P", F: "F", Cl: "L", Br: "B", I: "I", H: "H,D,T", Si: null, R: "R" },

    getCommonUsedElements: function (forwhat) {
        var list = [];
        if (forwhat == "menu") {
            for (var e in JSDraw2.PT.commonUsed)
                list.push({ caption: e, shortcut: JSDraw2.PT.commonUsed[e] });
            list.push("-");
        }
        else {
            for (var e in this.commonUsed)
                list.push(e);
        }

        //list.push("...");
        return list;
    },

    '*': { a: 0 },
    'X': { a: 0 }, // halogen
    'R': { a: 0 },

    H: { a: 1, c: '909090', m: 1.0079, em: 1.0078, e: 1, v: [1], iso: { 1: 1.0078, 2: 2.0141, 3: 3.0161} },
    // JSDraw.Pro
    Be: { a: 4, c: 'C2FF00', m: 9.0122, em: 9.0122, v: [0, 2], iso: { 9: 9.0122} },
    B: { a: 5, c: 'FFB5B5', m: 10.811, em: 11.0093, e: 3, v: [3], iso: { 10: 10.0129, 11: 11.0093} },
    C: { a: 6, c: '000000', m: 12.0107, em: 12, e: 4, v: [4], iso: { 12: 12, 13: 13.0034} },
    N: { a: 7, c: '3050F8', m: 14.0067, em: 14.0031, e: 5, v: [3], iso: { 14: 14.0031, 15: 15.0001} },
    O: { a: 8, c: 'FF0D0D', m: 15.9994, em: 15.9949, e: 6, v: [2], iso: { 16: 15.9949, 17: 16.9991, 18: 17.9992} },
    F: { a: 9, c: '90E050', m: 18.9984, em: 18.9984, e: 7, v: [1], iso: { 19: 18.9984} },
    // JSDraw.Pro
    Na: { a: 11, c: 'AB5CF2', m: 22.9898, em: 22.9898, v: [0, 1], iso: { 23: 22.9898} },
    // JSDraw.Pro
    Si: { a: 14, c: 'F0C8A0', m: 28.0855, em: 27.9769, e: 4, v: [4], iso: { 28: 27.9769, 29: 28.9765, 30: 29.9738} },
    P: { a: 15, c: 'FF8000', m: 30.9738, em: 30.9738, e: 5, v: [3, 5], iso: { 31: 30.9738} },
    S: { a: 16, c: 'C0C000', m: 32.065, em: 31.9721, e: 6, v: [2, 4, 6], iso: { 32: 31.9721, 33: 32.9715, 34: 33.9679, 36: 35.9671} },
    Cl: { a: 17, c: '1FF01F', m: 35.453, em: 34.9689, e: 7, v: [1, 3, 5, 7], iso: { 35: 34.9689, 37: 36.9659} },
    // JSDraw.Pro
    K: { a: 19, c: '8F40D4', m: 39.0983, em: 38.9637, v: [0, 1], iso: { 39: 38.9637, 40: 39.964, 41: 40.9618} },
    Ca: { a: 20, c: '3DFF00', m: 40.078, em: 39.9626, v: [0, 2], iso: { 40: 39.9626, 42: 41.9586, 43: 42.9588, 44: 43.9555, 46: 45.9537, 48: 47.9525} },
    // JSDraw.Pro
    Ge: { a: 32, c: '668F8F', m: 72.64, em: 73.9212, v: [4, 2], iso: { 70: 69.9243, 72: 71.9221, 73: 72.9235, 74: 73.9212, 76: 75.9214} },
    As: { a: 33, c: 'BD80E3', m: 74.9216, em: 74.9216, e: 5, v: [3, 5], iso: { 75: 74.9216} },
    Se: { a: 34, c: 'FFA100', m: 78.96, em: 79.9165, e: 6, v: [2, 4, 6], iso: { 74: 73.9225, 76: 75.9192, 77: 76.9199, 78: 77.9173, 80: 79.9165, 82: 81.9167} },
    Br: { a: 35, c: 'A62929', m: 79.904, em: 78.9183, e: 7, v: [1, 3, 5, 7], iso: { 79: 78.9183, 81: 80.9163} },
    // JSDraw.Pro
    I: { a: 53, c: '940094', m: 126.904, em: 126.904, e: 7, v: [1, 3, 5, 7], iso: { 127: 126.904} },
    // JSDraw.Pro

    isElectronAcceptor: function (e) {
        var an = e.a;
        return an >= 6 && an <= 9 || // Element.C && atomicno <= Element.F ||
                an >= 15 && an <= 17 || // atomicno > Element.P && atomicno <= Element.Cl ||
                an >= 33 && an <= 35 || // atomicno >= Element.As && atomicno <= Element.Br ||
                an >= 50 && an <= 53 || // atomicno >= Element.Sb && atomicno <= Element.I ||
                an >= 83 && an <= 85; // atomicno >= Element.Bi && atomicno <= Element.At;
    },

    showQueryAtoms: function (parent, f) {
        var buttons = parent.getElementsByTagName("button");
        for (var i = 0; i < buttons.length; ++i) {
            if (buttons[i].getAttribute("r") == "1")
                buttons[i].style.display = f ? "" : "none";
        }
    },

    makeAtomList: function (list, f) {
        if (list == null || list == "")
            return null;

        var atoms = [];
        var ss = list.split(",");
        for (var i = 0; i < ss.length; ++i) {
            var s = scilligence.Utils.trim(ss[i]);
            if (this.isValidAtomList(s))
                atoms.push(s);
        }

        return atoms.length == 0 ? null : { atoms: atoms, t: !scilligence.Utils.isFalse(f) };
    },

    isMetal: function (atomicno) {
        return false;
    },

    isValidAtomList: function (s) {
        var e = JSDraw2.PT[s];
        return e != null && e.a > 0 || s == "*" || s == "A" || s == "a" || s == "c" || this.isArAtom(s.toUpperCase());
    },

    isArAtom: function (s) {
        return s == "C" || s == "N" || s == "S" || s == "P" || s == "O";
    }
};
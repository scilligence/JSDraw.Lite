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
* Stack class - define Stack data structure
* @class scilligence.JSDraw2.Stack
* <pre>
* <b>Example:</b>
*    var stack = JSDraw2.Stack(50);
*    stack.push("Hydrogen");
*    stack.push("Exygen");
*
*    var item = stack.pop();
* </pre>
*/
JSDraw2.Stack = scilligence.extend(scilligence._base, {
    /**
    * @constructor Stack
    * @param {number} capacity
    */
    constructor: function (capacity) {
        this._items = [];
        this._capacity = capacity;
    },

    /**
    * Get an item by its index
    * @function item
    * @param {number} i - the index
    * @returns the item
    */
    item: function (i) {
        return this._items[i];
    },

    /**
    * Clear all items
    * @returns null
    */
    clear: function () {
        this._items = [];
    },

    /**
    * Get item count
    * @function length
    * @returns a number
    */
    length: function () {
        return this._items.length;
    },

    isEmpty: function () {
        return this._items.length == 0;
    },

    /**
    * Push a new item at the end of stack
    * @function push
    * @param {object} i - the item
    * @returns null
    */
    push: function (i) {
        if (this._items.length > this._capacity)
            this._items.splice(0, 1);
        this._items.push(i);
    },

    /**
    * Pop out the top item in the stack
    * @function pop
    * @returns the item
    */
    pop: function () {
        if (this._items.length == 0)
            return null;
        return this._items.pop();
    },

    popHead: function () {
        if (this._items.length == 0)
            return null;
        var i = this._items[0];
        this._items.splice(0, 1);
        return i;
    }
});

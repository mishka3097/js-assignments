'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
    this.getArea = () => this.height * this.width;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);    
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    throw new Error('Not implemented');
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */


function MySimpleSelector() {
    this.data = {
        element: null,
        id: null,
        class: [],
        attr: [],
        pseudoClass: [],
        pseudoElement: null
    };

    this.currentStage = 0;
    this.unChangeableFieldes = [1, 2, 6];
}

MySimpleSelector.prototype = {
    checkSequence: function (index) {
        if (this.unChangeableFieldes.indexOf(index) != -1 && this.currentStage == index)
            throw new Error("Element, id and pseudo-element should not occur more then one time inside the selector");

        if (index < this.currentStage)
            throw new Error("Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element");

        this.currentStage = index;
    },

    element: function (value) {
        this.checkSequence(1);
        this.data.element = value;

        return this;
    },

    id: function (value) {
        this.checkSequence(2);
        this.data.id = value;

        return this;
    },

    class: function (value) {
        this.checkSequence(3);
        this.data.class.push(value);

        return this;
    },

    attr: function (value) {
        this.checkSequence(4);
        this.data.attr.push(value);

        return this;
    },

    pseudoClass: function (value) {
        this.checkSequence(5);
        this.data.pseudoClass.push(value);

        return this;
    },

    pseudoElement: function (value) {
        this.checkSequence(6);
        this.data.pseudoElement = value;

        return this;
    },

    stringifyItem: function (items, before, after) {
        items = items || [];

        if (!Array.isArray(items) && items != null)
            items = [items];

        return items.reduce((prev, curr) => prev + before + curr + after, "");
    },

    stringify: function () {
        let d = this.data;

        return this.stringifyItem(d.element, "", "") +
            this.stringifyItem(d.id, "#", "") +
            this.stringifyItem(d.class, ".", "") +
            this.stringifyItem(d.attr, "[", "]") +
            this.stringifyItem(d.pseudoClass, ":", "") +
            this.stringifyItem(d.pseudoElement, "::", "");
    }
};

function MyCombinedSelector(selector1, combinator, selector2) {
    this.data = {
        selector1: selector1,
        combinator: combinator,
        selector2: selector2
    }
}

MyCombinedSelector.prototype = {
    stringify: function () {
        return this.data.selector1.stringify() + " " + this.data.combinator + " " + this.data.selector2.stringify();
    }
};

const cssSelectorBuilder = {
    element: function (value) {
        return new MySimpleSelector().element(value);
    },

    id: function (value) {
        return new MySimpleSelector().id(value);
    },

    class: function (value) {
        return new MySimpleSelector().class(value);
    },

    attr: function (value) {
        return new MySimpleSelector().attr(value);
    },

    pseudoClass: function (value) {
        return new MySimpleSelector().pseudoClass(value);
    },

    pseudoElement: function (value) {
        return new MySimpleSelector().pseudoElement(value);
    },

    combine: function (selector1, combinator, selector2) {
        return new MyCombinedSelector(selector1, combinator, selector2);
    }
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};

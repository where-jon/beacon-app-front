/**
 * @fileoverview RequestAnimFrame
 * @author NHN FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

import * as util from '../wcutil'
var requestFn,
    cancelFn;

/**
 * Get name with vendor prefix
 * @param {string} name - name to prepend prefix
 * @returns {string} vendor prefixed name
 */
function getPrefixed(name) {
    return global['webkit' + name] || global['moz' + name] || global['ms' + name];
}

requestFn = global.requestAnimationFrame ||
    getPrefixed('RequestAnimationFrame') ||
    function(fn, context) {
        fn.call(context);
    };

cancelFn = global.cancelAnimationFrame ||
    getPrefixed('CancelAnimationFrame') ||
    getPrefixed('CancelRequestAnimationFrame') ||
    function() {};

/**
 * @module module:reqAnimFrame
 */

export const reqAnimFrame = {
// module.exports = {
    /**
     * Shim of requestAnimationFrame
     * @param {function} fn callback function
     * @param {*} context context for callback
     * @returns {number} Unique id
     */
    requestAnimFrame: function(fn, context) {
        return requestFn.call(global, util.bind(fn, context));
    },

    /**
     * Shim of cancelAnimationFrame
     * @param {number} id requestAnimationFrame id
     */
    cancelAnimFrame: function(id) {
        if (!id) {
            return;
        }

        cancelFn.call(global, id);
    }
};

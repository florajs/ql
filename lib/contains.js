'use strict';

var util = require('util');

/**
 * Check deeply if second object is contained within the first
 * provided object and the values are strictly equal. First object
 * can have additional parameters.
 *
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */

function contains(a, b) {
    var i, l;

    if (typeof a !== typeof b) { return false; }

    if (util.isArray(a)) {
        if (!util.isArray(b)) { return false; }
        if (a.length !== b.length) { return false; }
        for (i = 0, l = a.length; i < l; i++) {
            if (!contains(a[i], b[i])) { return false; }
        }

    } else if (typeof a === 'object') {
        for (i in b) {
            if (!b.hasOwnProperty(i)) { continue; }
            if (!a.hasOwnProperty(i)) { return false; }
            if (!contains(a[i], b[i])) { return false; }
        }

    } else if (a !== b) { return false; }

    return true;
}

module.exports = contains;

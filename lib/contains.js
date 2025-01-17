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
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0, l = a.length; i < l; i++) {
            if (!contains(a[i], b[i])) return false;
        }
    } else if (typeof a === 'object') {
        for (let i in b) {
            if (!Object.prototype.hasOwnProperty.call(b, i)) continue;
            if (!Object.prototype.hasOwnProperty.call(a, i)) return false;
            if (!contains(a[i], b[i])) return false;
        }
    } else if (a !== b) return false;

    return true;
}

module.exports = contains;

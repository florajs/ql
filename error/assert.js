const ArgumentError = require('./ArgumentError');

/**
 * Custom assertion method, to throw own ArgumentError objects.
 *
 * @param {boolean} bool
 * @param {number} code
 * @param {object} [data]
 */
function assert(bool, code, data) {
    if (!bool) {
        throw new ArgumentError(code, data);
    }
}

module.exports = assert;

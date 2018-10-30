const util = require('util');

const assert = require('../error/assert');

/**
 * Validate a provided object, and return true,
 * if it corresponds with a query object.
 *
 * @param {Array} object
 */
function validateQuery(object) {
    assert(util.isArray(object) && object.length === 2, 2100);
    assert(typeof object[0] === 'string', 2100);
    assert(typeof object[1] === 'object', 2100);
    assert(!util.isArray(object[1]), 2100);
}

module.exports = validateQuery;

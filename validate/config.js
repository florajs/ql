const assert = require('../error/assert');

/**
 * Validate a provided object, and return true,
 * if it corresponds with a config object.
 *
 * @param {object} config
 */
function validateConfig(config) {
    assert(Array.isArray(config['operators']) && config['operators'].length > 0, 2102);
    assert(typeof config['glue'] === 'string', 2103);
    assert(typeof config['and'] === 'string', 2104);
    assert(typeof config['or'] === 'string', 2105);
    assert(typeof config['relate'] === 'string', 2106);
    assert(typeof config['string'] === 'string', 2107);
    assert(
        typeof config['lookDelimiter'] === 'string' ||
            (Array.isArray(config['lookDelimiter']) && config['lookDelimiter'].length > 0),
        2108
    );
    assert(Array.isArray(config['roundBracket']) && config['roundBracket'].length > 0, 2109);
    assert(Array.isArray(config['squareBracket']) && config['squareBracket'].length > 0, 2110);
}

module.exports = validateConfig;

const extend = require('./extend')();
const validateConfig = require('../validate/config');
const defaults = require('./default');

/**
 * @typedef {{
 *     operators:       Array,
 *     glue:            string,
 *     and:             string,
 *     or:              string,
 *     relate:          string,
 *     string:          string,
 *     lookDelimiter:   string|Array,
 *     setDelimiter:    string,
 *     rangeDelimiter:  string,
 *     roundBracket:    Array,
 *     squareBracket:   Array
 * }} Config
 */

/**
 * Retrieve a config from a .json file located under /config by its
 * name or extend the default config with custom settings.
 *
 * @param {Config|string} config
 * @returns {Config}
 */
function config(config) {
    let cfg;

    if (typeof config === 'string') {
        try {
            cfg = require('./' + config);
        } catch {
            cfg = defaults;
        }
    } else {
        cfg = defaults;
    }

    cfg = extend({}, cfg);
    if (typeof config !== 'string') {
        cfg = extend(cfg, config);
    }

    validateConfig(cfg);

    cfg.operators = cfg.operators.sort(function (a, b) {
        return a.length < b.length;
    });

    return cfg;
}

module.exports = config;

var extend          = require('./extend')(),
    validateConfig  = require('../validate/config'),
    defaults        = require('./default');

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
    var cfg;
    
    if (typeof config === 'string') {
        try {
            cfg = require('./'+config);
        } catch(e) {
            cfg = defaults;
        }
    } else {
        cfg = defaults;
    }
    
    cfg = extend({}, cfg);
    cfg = extend(cfg, config);
    
    validateConfig(cfg);
    
    cfg.operators = cfg.operators.sort(function(a, b) {
        return a.length < b.length;
    });
    
    return cfg;
}

module.exports = config;
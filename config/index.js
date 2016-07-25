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

function config() {
    var configs = [].slice.call(arguments);
    var cfg, current;
    
    if (typeof configs[0] === 'string') {
        try {
            cfg = require('./'+configs[0]);
        } catch(e) {
            cfg = defaults;
        }
    } else {
        cfg = defaults;
    }
    
    cfg = extend({}, cfg);

    while(current = configs.shift()) {
        if (typeof current === 'string') { continue; }
        cfg = extend(cfg, current);
    }

    validateConfig(cfg);
    
    cfg.operators = cfg.operators.sort(function(a, b) {
        return a.length < b.length;
    });
    
    return cfg;
}

module.exports = config;
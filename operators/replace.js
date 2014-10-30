var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    escape          = require('../lib/escape');

/**
 * 
 * @param {Config} cfg
 * @returns {replaceOperators}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    /**
     * Replace AND and OR operators with a new config. Makes future 
     * calculations easier if the logical connectives are single characters.
     * 
     * @param {Query} query
     * @param {Config} replacement
     * @returns {Query}
     */

    function replaceOperators(query, replacement) {
        validateQuery(query);
        
        query[0] = query[0].replace(new RegExp(escape(cfg.and), 'g'), replacement.and);
        query[0] = query[0].replace(new RegExp(escape(cfg.or), 'g'), replacement.or);
        
        return query;
    }
    
    return replaceOperators;
};
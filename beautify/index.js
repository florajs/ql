var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    assert          = require('../error/assert'),
    ArgumentError   = require('../error/ArgumentError');

/**
 * 
 * @param {Config} cfg
 * @returns {beautify}
 */

module.exports = function factory(cfg) {

    /**
     * Take an internal Query object and generate a two-dimensional 
     * array with the parsed statements.
     * 
     * @param {Query} query
     * @param {Config} [config]
     * @returns {Array}
     * @throws {ArgumentError}
     */
    
    function beautify(query, config) {
        validateQuery(query);
        config = config || cfg;
        validateConfig(config);
        
        var sentence, result, i, l, 
            conjunction, term, j, lj;
        
        result = [];
        
        sentence = query[0].split(cfg.or);
        for (i=0, l=sentence.length; i<l; i++) {
            conjunction = sentence[i].split(cfg.and);
            result.push([]);
            
            for (j=0, lj=conjunction.length; j<lj; j++) {
                if (conjunction[j] in query[1]) {
                    term = query[1][conjunction[j]];
                    
                    if (cfg.validateStatements) {
                        assert(term.attribute !== null && term.attribute !== '', 2215, { stmnt: term.toString() });
                        assert(term.operator !== null && term.operator !== '', 2216, { stmnt: term.toString() });
                        assert(term.value !== null && term.value !== '', 2217, { stmnt: term.toString() });
                    }
                    
                    result[result.length-1].push({
                        attribute: (term.attribute||'').split(config.glue),
                        operator: term.operator,
                        value: term.value
                    });
                } else {
                    throw new ArgumentError(2202);
                }
            }
        }
        
        return result;
    }
    
    return beautify;
};
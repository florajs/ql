var assert          = require('../error/assert'),
    config          = require('../config'),
    escape          = require('../lib/escape'),
    validateConfig  = require('../validate/config'),
    simplifyF       = require('../simplify');

/**
 * 
 * @param {Config} cfg
 * @returns {relation}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    /*
     * We can reuse the methods available under /simplify with 
     * different configurations to help resolving square brackets.
     */
    
    var regexp = new RegExp(escape(cfg.relate), 'g'),
        first = simplifyF(config({
            and: cfg.relate,
            or: cfg.or,
            roundBracket: cfg.roundBracket
        })),
        second = simplifyF(config({
            and: cfg.relate,
            or: cfg.and,
            roundBracket: cfg.roundBracket
        }));

    /**
     * Create relations between statements created by square 
     * brackets and remove them. 
     * 
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    
    function relation(a, b) {
        assert(typeof a === 'string', 2206);
        assert(typeof b === 'string', 2207);
        
        var terms, i, l, parsed, tmp;
            
        a = a.replace(regexp, ';');
        b = b.replace(regexp, ';');
        
        terms = first('('+a+')'+cfg.relate+'('+b+')')[0];
        terms = terms.replace(new RegExp('([a-zA-Z_0-9'+escape(cfg.and)+';]+)', 'g'), '($1)');
        
        terms = terms.split(cfg.or);
        parsed = [];
        
        for (i=0, l=terms.length; i<l; i++) {
            tmp = second(terms[i])[0];
            parsed.push(tmp);
        }
        
        var s = parsed.join(cfg.or); 
        
        return s.replace(/;/g, cfg.relate);
    }
    
    return relation;
};
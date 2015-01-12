var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    assert          = require('../error/assert'),
    config          = require('../config'),
    replace         = require('../simplify/replace')(),
    simplifyF       = require('../simplify'),
    resolveF        = require('./resolve'),
    relationF       = require('./relation'),
    identifyF       = require('../simplify/identify'),
    lookAheadF      = require('../simplify/lookAhead'),
    lookBehindF     = require('../simplify/lookBehind');

/**
 * 
 * @param {Config} cfg
 * @returns {clearSquare}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    /*
     * We can reuse the methods available under /simplify with 
     * different configurations to help resolving square brackets.  
     */
    
    var relation = relationF(cfg),
        resolve = resolveF(cfg),
        simplify = simplifyF(cfg),
        identify = identifyF(config({
            roundBracket: cfg.squareBracket
        })),
        lookAhead = lookAheadF(config({
            and: '',
            roundBracket: cfg.squareBracket,
            lookDelimiter: [cfg.or, cfg.and].concat(cfg.roundBracket)
        })),
        lookBehind = lookBehindF(config({
            and: '',
            roundBracket: cfg.squareBracket,
            lookDelimiter: [cfg.or, cfg.and].concat(cfg.roundBracket)
        }));
    
    /**
     * Resolve any square brackets in the query. Creates relations between 
     * statements and merges them afterwards.
     * 
     * @param {Query|string} query
     * @param {Config} [config]
     * @returns {Query}
     */
    
    function clearSquare(query, config) {
        var sentence;

        if (typeof query === 'string') {
            sentence = query;
        } else {
            validateQuery(query);
            sentence = query[0];
        }
        
        sentence = identify(sentence, function(sentence, bracket, pos) {
            assert(typeof bracket !== 'undefined', 2210, { position: '' });
            
            var origin = bracket,
                ahead = lookAhead(sentence, pos+1),
                behind = lookBehind(sentence, pos+1);
            
            bracket = simplify(bracket)[0];
            
            if (ahead && ahead[0] !== '') {
                bracket = relation(bracket, ahead[1].join(cfg.or));
            }
            if (behind && behind[0] !== '') {
                if (config && config.elemMatch) {
                    (function (behind) {
                        for (var i = 0, l = behind.length; i < l; i++) {
                            if (behind[i] in query[1]) {
                                query[1][behind[i]].elemMatch();
                            }
                        }
                    })([].concat.apply([], behind[1].map(function (e) {
                        return e.match(/e[0-9]+/g);
                    })));
                }

                bracket = relation(behind[1].join(cfg.or), bracket);
            }
 
            if (behind[0] || ahead[0]) {
                bracket = cfg.squareBracket[0]+bracket+cfg.squareBracket[1];
            } else {
                bracket = cfg.roundBracket[0]+bracket+cfg.roundBracket[1];
            }
            
            return replace(
                sentence,
                pos-origin.length-1-behind[0].length,
                pos+1+ahead[0].length,
                bracket
            );
        });
        
        return resolve([sentence, query[1]]);
    }
    
    return clearSquare;
};
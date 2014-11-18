var escape          = require('../lib/escape'),
    validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    replaceF        = require('./replace'),
    identifyF       = require('./identify'),
    expandF         = require('./expand'),
    lookAheadF      = require('./lookAhead'),
    lookBehindF     = require('./lookBehind'),
    assert          = require('../error/assert');

/**
 * 
 * @param {Config} cfg
 * @returns {simplify}
 */

module.exports = function factory(cfg) {
    var replace    =    replaceF(cfg),
        identify   =   identifyF(cfg),
        expand     =     expandF(cfg),
        lookAhead  =  lookAheadF(cfg),
        lookBehind = lookBehindF(cfg);

    /**
     * Resolve a sentence with any amount of terms connected 
     * by AND and OR connectives and any amount of round brackets.
     * Return the sentence in disjunctive normal form.
     * 
     * @param {Query} query
     * @returns {Query}
     */

    function simplify(query) {
        var sentence;
        
        if (typeof query === 'string') {
            sentence = query;
        } else {
            validateQuery(query);
            sentence = query[0];
        }

        var bOpen = escape(cfg.roundBracket[0]+cfg.squareBracket[0]),
            bClose = escape(cfg.roundBracket[1]+cfg.squareBracket[1]),
            operator = escape(cfg.or+cfg.and),
            s;

        assert(!new RegExp('['+bOpen+']['+operator+'][a-z0-9]|^['+operator+'][a-z0-9]').exec(sentence), 2208, { position: '' });
        assert(!(s = new RegExp('[a-z0-9]['+operator+']['+bClose+']|[a-z0-9]['+operator+']$').exec(sentence)), 2209, { position: ''});
    
        sentence = identify(sentence, function(sentence, bracket, pos) {
            assert(typeof bracket !== 'undefined', 2210, { position: '' });
            
            var i, l, expanded, 
                origin = bracket,
                behind = lookBehind(sentence, pos+1), 
                ahead = lookAhead(sentence, pos+1);
            
            expanded = [];
            for (i=0, l=behind[1].length; i<l; i++) {
                expanded.push(expand(behind[1][i], bracket));
            }
            bracket = expanded.join(cfg.or);
    
            expanded = [];
            for (i=0, l=ahead[1].length; i<l; i++) {
                expanded.push(expand(ahead[1][i], bracket, true));
            }
            bracket = expanded.join(cfg.or);
            
            if (behind[0] || ahead[0]) {
                bracket = cfg.roundBracket[0]+bracket+cfg.roundBracket[1];
            }
    
            return replace(
                sentence, 
                pos-origin.length-1-behind[0].length-(behind[0]?1:0),
                pos+1+ahead[0].length+(ahead[0]?1:0),
                bracket
            );
        });
    
        return [sentence, query[1]];
    }
    
    return simplify;
};
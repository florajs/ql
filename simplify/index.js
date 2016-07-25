var escape          = require('../lib/escape'),
    config          = require('../config'),
    validateQuery   = require('../validate/query'),
    replaceF        = require('./replace'),
    identifyF       = require('./identify'),
    expandF         = require('./expand'),
    relateF         = require('./relate'),
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
        relate     =     relateF(cfg),
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
            operator = escape(cfg.or+cfg.and);

        assert(!new RegExp('['+bOpen+']['+operator+'][a-z0-9]|^['+operator+'][a-z0-9]').exec(sentence), 2208, { position: '' });
        assert(!new RegExp('[a-z0-9]['+operator+']['+bClose+']|[a-z0-9]['+operator+']$').exec(sentence), 2209, { position: ''});

        sentence = sentence.replace(new RegExp('([a-z0-9])'+escape(cfg.relate)+'([a-z0-9])', 'g'), '$1:$2');
    
        sentence = identify(sentence, function(sentence, bracket, pos) {
            assert(typeof bracket !== 'undefined', 2210, { position: '' });
            
            var origin = bracket,
                behind = lookBehind(sentence, pos-bracket.length-2),
                ahead = lookAhead(sentence, pos+1);

            if (behind[2] === cfg.and) {
                bracket = expand(behind[0], bracket);
            }
            if (ahead[2] === cfg.and) {
                bracket = expand(ahead[0], bracket, true);
            }
            if (behind[2] === cfg.relate) {
                bracket = relate(behind[0], bracket);
            }
            if (ahead[2] === cfg.relate) {
                bracket = relate(ahead[0], bracket, true);
            }

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

        sentence = sentence.replace(/:/g, '~');

        return [sentence, query[1]];
    }
    
    return simplify;
};
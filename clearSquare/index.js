var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    assert          = require('../error/assert'),
    config          = require('../config'),
    replace         = require('../simplify/replace')(),
    simplifyF       = require('../simplify'),
    resolveF        = require('./resolve'),
    identifyF       = require('../simplify/identify');

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
    
    var resolve = resolveF(cfg),
        simplify = simplifyF(cfg),
        identify = identifyF(config({
            roundBracket: cfg.squareBracket
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

        // Find square brackets, wrap the content and any expressions before and after them in round brackets
        // Create identifers for expressions before the bracket (Square Bracket Index Hack)
        sentence = identify(sentence, function(sentence, bracket, pos) {
            var wrapped = cfg.roundBracket[0]+bracket+cfg.roundBracket[1];
            var entries, substr;
            var offsetBehind = 0;
            var offsetAhead = 0;

            for (var i=pos-bracket.length-2, bracketLevel=0; i>=0; i--) {
                if (sentence[i] === cfg.squareBracket[1]) { bracketLevel++; }
                else if (bracketLevel !== 0 && sentence[i] === cfg.squareBracket[0]) { bracketLevel--; }
                else if (bracketLevel === 0 && !/[a-z_0-9]/.test(sentence[i]||'')) { break; }
                offsetBehind++;
            }
            if (offsetBehind) {
                /* -- Square Bracket Index Hack --
                 * every statement in front of square brackets will get a
                 * unique, numerical identifier appended to their attribute, e.g.
                 * a[b OR c] -> a~0[b OR c]
                 */
                substr = sentence.substr(pos-bracket.length-1-offsetBehind, offsetBehind);
                entries = substr.split(/\(|\)|]|\[|\+|\*| AND | OR /g);
                for (i=entries.length; i--;) {
                    if (!entries[i]) { continue; }
                    if (entries[i] in query[1]) {
                        query[1][entries[i]].elemMatch();
                    }
                }
                // -- Square Bracket Index Hack End --

                wrapped = cfg.roundBracket[0]+substr+cfg.relate+wrapped+cfg.roundBracket[1];
            }

            for (i=pos+1, bracketLevel=0; i<sentence.length; i++) {
                if (sentence[i] === cfg.squareBracket[0]) { bracketLevel++; }
                else if (bracketLevel !== 0 && sentence[i] === cfg.squareBracket[1]) { bracketLevel--; }
                else if (bracketLevel === 0 && !/[e0-9]/.test(sentence[i]||'')) { break; }
                offsetAhead++;
            }
            if (offsetAhead) {
                wrapped = cfg.roundBracket[0]+wrapped+cfg.relate+sentence.substr(pos+1, offsetAhead)+cfg.roundBracket[1];
            }

            return replace(
                sentence,
                pos-bracket.length-1-offsetBehind,
                pos+1+offsetAhead,
                wrapped
            );
        });

        // Clear square brackets with simplify()
        sentence = simplify(sentence)[0];

        return resolve([sentence, query[1]]);
    }
    
    return clearSquare;
};
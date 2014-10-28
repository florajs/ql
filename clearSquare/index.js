var replace = require('../simplify/replace')(),
    simplifyF = require('../simplify'),
    resolveF = require('./resolve'),
    relationF = require('./relation'),
    identifyF = require('../simplify/identify'),
    lookAheadF = require('../simplify/lookAhead'),
    lookBehindF = require('../simplify/lookBehind');

module.exports = function factory(config) {
    var relation = relationF(config),
        resolve = resolveF(config),
        simplify = simplifyF(config),
        identify = identifyF({
            roundBracket: config.squareBracket
        }),
        lookAhead = lookAheadF({
            roundBracket: config.squareBracket,
            lookDelimiter: [config.or, config.and].concat(config.roundBracket)
        }),
        lookBehind = lookBehindF({
            roundBracket: config.squareBracket,
            lookDelimiter: [config.or, config.and].concat(config.roundBracket)
        })
        ;
    
    /**
     * 
     * @param {string} query
     * @returns {string}
     */
    
    function clearSquare(query) {
        var sentence = query[0];
        
        console.log('<', sentence);
        
        sentence = identify(sentence, function(sentence, bracket, pos) {
            var origin = bracket,
                ahead = lookAhead(sentence, pos+1),
                behind = lookBehind(sentence, pos+1);
            
            bracket = simplify([bracket])[0];
            
            console.log(sentence, bracket, 'ahead:', ahead, 'behind:', behind);
            
            if (ahead) {
                bracket = relation(bracket, ahead[1].join(config.or));
            }
            if (behind) {
                bracket = relation(behind[1].join(config.or), bracket);
            }
 
            if (behind[0] || ahead[0]) {
                bracket = config.squareBracket[0]+bracket+config.squareBracket[1];
            } else {
                bracket = config.roundBracket[0]+bracket+config.roundBracket[1];
            }
            
            console.log('!', bracket);
            
            console.log('>', replace(
                sentence,
                pos-origin.length-1-behind[0].length,
                pos+1+ahead[0].length,
                bracket
            ));
            
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
var replace = require('./replace'),
    identify = require('./identify'),
    expand = require('./expand'),
    lookAhead = require('./lookAhead'),
    lookBehind = require('./lookBehind');

/**
 * 
 * @param {object} config
 * @param {Array} query
 * @returns {Array}
 */

function simplify(config, query) {
    var sentence = query[0];
    
    sentence = sentence.replace(/\*/g, '');

    sentence = identify(sentence, function(sentence, bracket, pos) {
        var i, l, expanded, 
            origin = bracket,
            behind = lookBehind(sentence, pos+1), 
            ahead = lookAhead(sentence, pos+1);
        
        expanded = [];
        for (i=0, l=behind[1].length; i<l; i++) {
            expanded.push(expand(behind[1][i], bracket));
        }
        bracket = expanded.join('+');

        expanded = [];
        for (i=0, l=ahead[1].length; i<l; i++) {
            expanded.push(expand(ahead[1][i], bracket, true));
        }
        bracket = expanded.join('+');
        
        if (behind[0] || ahead[0]) {
            bracket = '('+bracket+')';
        }

        return replace(
            sentence, 
            pos-origin.length-1-behind[0].length,
            pos+1+ahead[0].length,
            bracket
        );
    });
    
    sentence = sentence.replace(/(e[0-9]+)(e[0-9]+)/g, '$1*$2');
    sentence = sentence.replace(/(e[0-9]+)(e[0-9]+)/g, '$1*$2');
    sentence = sentence.replace(/(e[0-9]+)\(/g, '$1*(');
    sentence = sentence.replace(/\)(e[0-9]+)/g, ')*$1');
    sentence = sentence.replace(/\)\(/g, ')*(');

    return [sentence, query[1]];
}

module.exports = simplify;
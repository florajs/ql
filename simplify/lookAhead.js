var util            = require('util'),
    validateConfig  = require('../validate/config');

/**
 * 
 * @param {Config} cfg
 * @returns {lookAhead}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var delimiter = util.isArray(cfg.lookDelimiter)? cfg.lookDelimiter : [cfg.lookDelimiter];

    /**
     * Find any terms ahead of the provided position. Stops if 
     * delimiter (like OR connective) is found. If a bracket 
     * ahead contains any more brackets itself, ignore the term.
     * 
     * @param {string} str
     * @param {number} pos
     * @returns {[string, Array]}
     */

    function lookAhead(str, pos) {
        var i, l, j, isDelimiter,
            tmp = '', state = 'stmnt';
        
        for (i=pos, l=str.length; i<l; i++) {
            isDelimiter = false;
            
            if (state === 'brckt') {
                if (str[i] === cfg.roundBracket[0]) { tmp = '';      break; }
                if (str[i] === cfg.roundBracket[1]) { tmp += str[i]; break; }
            }
            if (state === 'stmnt') {
                if (str[i] === cfg.and) { continue; }
                for (j=delimiter.length; j--;) {
                    if (str[i] === delimiter[j]) {
                        isDelimiter = true;
                        break;
                    }
                }
                if (isDelimiter) { break; }
                if (str[i] === cfg.roundBracket[1]) { break; }
                if (str[i] === cfg.roundBracket[0]) { state = 'brckt'; }
            }
            tmp += str[i];
        }
    
        if (tmp[0] === cfg.roundBracket[0]) {
            return [tmp, tmp.substr(1, tmp.length-2).split(cfg.or)];
        } else {
            return [tmp, [tmp]];
        }
    }
    
    return lookAhead;
}
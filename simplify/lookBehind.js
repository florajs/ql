var util            = require('util'),
    validateConfig  = require('../validate/config');

/**
 * 
 * @param {Config} cfg
 * @returns {lookBehind}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var delimiter = util.isArray(cfg.lookDelimiter)? cfg.lookDelimiter : [cfg.lookDelimiter];

    /**
     * Find any terms behind of the provided position. Stops if
     * delimiter (like OR connective) is found. If a bracket
     * ahead contains any more brackets itself, ignore the term.
     * 
     * @param {string} str
     * @param {number} pos
     * @returns {[string, Array]}
     */
    
    function lookBehind(str, pos) {
        var i, j, isDelimiter,
            firstOpFound = false,
            tmp = '', state = 'start';
        
        for (i=pos-1; i>=0; i--) {
            isDelimiter = false;
            
            if (state === 'brckt') {
                if (str[i] === cfg.roundBracket[1]) { tmp = '';         break; }
                if (str[i] === cfg.roundBracket[0]) { tmp = str[i]+tmp; break; }
            }
            if (state === 'stmnt') {
                if (!firstOpFound && str[i] === cfg.and) {
                    firstOpFound = true;
                    continue;
                }
                for (j=delimiter.length; j--;) {
                    if (str[i] === delimiter[j]) {
                        isDelimiter = true;
                        break;
                    }
                }
                if (isDelimiter) { break; }
                if (str[i] === cfg.roundBracket[0]) { break; }
                if (str[i] === cfg.roundBracket[1]) { state = 'brckt'; }
            }
            if (state === 'start') {
                if (str[i] === cfg.roundBracket[0]) { state = 'stmnt'; }
            } else {
                tmp = str[i]+tmp;
            }
        }
        
        if (tmp[0] === cfg.roundBracket[0]) {
            return [tmp, tmp.substr(1, tmp.length-2).split(cfg.or)];
        } else {
            return [tmp, [tmp]];
        }
    }
    
    return lookBehind;
}
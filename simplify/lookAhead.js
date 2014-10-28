var util = require('util');

module.exports = function factory(config) {
    var delimiter = util.isArray(config.lookDelimiter)? config.lookDelimiter : [config.lookDelimiter];

    /**
     * 
     * @param str
     * @param pos
     * @returns {*[]}
     */

    function lookAhead(str, pos) {
        var i, l, j, isDelimiter,
            tmp = '', state = 'stmnt';
        
        for (i=pos, l=str.length; i<l; i++) {
            isDelimiter = false;
            
            if (state === 'brckt') {
                if (str[i] === config.roundBracket[0]) { tmp = '';      break; }
                if (str[i] === config.roundBracket[1]) { tmp += str[i]; break; }
            }
            if (state === 'stmnt') {
                if (str[i] === config.and) { continue; }
                for (j=delimiter.length; j--;) {
                    if (str[i] === delimiter[j]) {
                        isDelimiter = true;
                        break;
                    }
                }
                if (isDelimiter) { break; }
                if (str[i] === config.roundBracket[1]) { break; }
                if (str[i] === config.roundBracket[0]) { state = 'brckt'; }
            }
            tmp += str[i];
        }
    
        if (tmp[0] === config.roundBracket[0]) {
            return [tmp, tmp.substr(1, tmp.length-2).split(config.or)];
        } else {
            return [tmp, [tmp]];
        }
    }
    
    return lookAhead;
}
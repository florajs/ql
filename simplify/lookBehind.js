var util = require('util');

module.exports = function factory(config) {
    var delimiter = util.isArray(config.lookDelimiter)? config.lookDelimiter : [config.lookDelimiter];

    /**
     * 
     * @param str
     * @param pos
     * @returns {*[]}
     */
    
    function lookBehind(str, pos) {
        var i, j, isDelimiter,
            tmp = '', state = 'start';
        
        for (i=pos-1; i>=0; i--) {
            isDelimiter = false;
            
            if (state === 'brckt') {
                if (str[i] === config.roundBracket[1]) { tmp = '';         break; }
                if (str[i] === config.roundBracket[0]) { tmp = str[i]+tmp; break; }
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
                if (str[i] === config.roundBracket[0]) { break; }
                if (str[i] === config.roundBracket[1]) { state = 'brckt'; }
            }
            if (state === 'start') {
                if (str[i] === config.roundBracket[0]) { state = 'stmnt'; }
            } else {
                tmp = str[i]+tmp;
            }
        }
        
        if (tmp[0] === config.roundBracket[0]) {
            return [tmp, tmp.substr(1, tmp.length-2).split(config.or)];
        } else {
            return [tmp, [tmp]];
        }
    }
    
    return lookBehind;
}
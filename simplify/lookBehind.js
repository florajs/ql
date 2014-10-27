module.exports = function factory(config) {

    /**
     * 
     * @param str
     * @param pos
     * @returns {*[]}
     */
    
    function lookBehind(str, pos) {
        var tmp = '', state = 'start';
        for (var i=pos-1; i>=0; i--) {
            if (state === 'brckt') {
                if (str[i] === ')') { tmp = '';         break; }
                if (str[i] === '(') { tmp = str[i]+tmp; break; }
            }
            if (state === 'stmnt') {
                if (str[i] === config.or) { break; }
                if (str[i] === '(') { break; }
                if (str[i] === ')') { state = 'brckt'; }
            }
            if (state === 'start') {
                if (str[i] === '(') { state = 'stmnt'; }
            } else {
                tmp = str[i]+tmp;
            }
        }
        
        if (tmp[0] === '(') {
            return [tmp, tmp.substr(1, tmp.length-2).split(config.or)];
        } else {
            return [tmp, [tmp]];
        }
    }
    
    return lookBehind;
}
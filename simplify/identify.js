module.exports = function factory(config) {

    /**
     * 
     * @param str
     * @param action
     * @returns {*}
     */

    function identify(str, action) {
        
        function findDeepest(str) {
            var level = -1, tmp, brackets = [], store;
            
            for(var i=0, l=str.length; i<l; i++) {
                if (str[i] === config.roundBracket[0]) {
                    level++;
                    if (!brackets[level]) { brackets[level] = []; }
                    store = brackets[level];
                    tmp = '';
                    continue;
                }
                
                if (str[i] === config.roundBracket[1]) {
                    if (tmp) { store.push([tmp, i, level]); }
                    level--;
                    store = brackets[level];
                    tmp = '';
                    continue;
                }
                
                tmp += str[i];
            }
            
            return brackets;
        }
        
        var brackets, i=0, max=20;
        while(brackets = findDeepest(str).pop()) {
            str = action.apply(this, [str].concat(brackets.pop()));
            
            if (i++ >= max) { break; }
        }
        
        return str;
    }
    
    return identify;
};
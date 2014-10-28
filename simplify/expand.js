var replace = require('./replace')();

module.exports = function factory(config) {

    /**
     * 
     * @param exp
     * @param str
     * @param isBackwards
     * @returns {*}
     */
    
    function expand(exp, str, isBackwards) {
        if (!exp) { return str; }
        var term = '', i, l;
        
        for (i=0, l=str.length; i<l; i++) {
            if (str[i] === config.or) {
                str = replace(str, i-term.length, i, isBackwards? term+config.and+exp : exp+config.and+term);
                i += exp.length+config.and.length;
                l += exp.length+config.and.length;
                term = '';
            } else {
                term += str[i];
            }
        }
        str = replace(str, i-term.length, i, isBackwards? term+config.and+exp : exp+config.and+term);
        
        return str;
    }
    
    return expand;
};
var replace = require('./replace');

function expand(exp, str, isBackwards) {
    if (!exp) { return str; }
    var term = '', i, l;
    
    for (i=0, l=str.length; i<l; i++) {
        if (str[i] === '+') {
            str = replace(str, i-term.length, i, isBackwards? term+exp : exp+term);
            i += exp.length;
            l += exp.length;
            term = '';
        } else {
            term += str[i];
        }
    }
    str = replace(str, i-term.length, i, isBackwards? term+exp : exp+term);
    
    return str;
}

module.exports = expand;
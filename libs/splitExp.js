/**
 * 
 * @param {object} exp
 * @returns {object}
 */

module.exports = function splitExp(exp) {
    var k, s;
    
    for (k in exp) {
        if(!exp.hasOwnProperty(k)) { continue; }
        
        s = /(.*):([^:]+)$/.exec(exp[k]);
        if (!s) {
            exp[k] = [undefined, exp[k]];
        } else {
            exp[k] = [s[1], s[2]];
        }
    }
    
    return exp;
};
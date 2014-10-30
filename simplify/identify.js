var validateConfig  = require('../validate/config'),
    ArgumentError   = require('../error/ArgumentError');

/**
 * 
 * @param {Config} cfg
 * @returns {identify}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    /**
     * Find the brackets on the deepest level and call the provided 
     * action method with their content. The function must return a 
     * string to be replaced with the sentence. Stops iteration after 
     * 20 brackets to prevent continuous loops. 
     * 
     * @param {string} str
     * @param {function} action
     * @returns {string}
     */

    function identify(str, action) {
        
        function findDeepest(str) {
            var level = -1, tmp, brackets = [], store;
            
            for(var i=0, l=str.length; i<l; i++) {
                if (str[i] === cfg.roundBracket[0]) {
                    level++;
                    if (!brackets[level]) { brackets[level] = []; }
                    store = brackets[level];
                    tmp = '';
                    continue;
                }
                
                if (str[i] === cfg.roundBracket[1]) {

                    // unmatched closing bracket
                    if (level === -1) {
                        throw new ArgumentError(2204, {
                            bracket: cfg.roundBracket[1]
                        });
                    }
                    
                    if (tmp) { store.push([tmp, i, level]); }
                    level--;
                    store = brackets[level];
                    tmp = '';
                    continue;
                }
                
                tmp += str[i];
            }
            
            // unmatched opening bracket
            if (level !== -1) { 
                throw new ArgumentError(2203, {
                    bracket: cfg.roundBracket[0]
                }); 
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
var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    escape          = require('../lib/escape'),
    StmntF          = require('./Stmnt'),
    ArgumentError   = require('../error/ArgumentError');

/**
 * 
 * @param {Config} cfg
 * @returns {tokenizer}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var Stmnt = StmntF(cfg);

    /**
     * Replace any statements from a query string with an 
     * identifier and store them as instances of Stmnt in 
     * the second part of the query object.
     * 
     * @param {Query} query
     * @returns {Query}
     */
 
    function tokenizer(query) {
        validateQuery(query);
        
        var i, l, j, found, lastQuotationMark, char,
            stack = '',
            state = 'stmnt',
            string = query[0],
            stmnts = {};
        
        var ii = 0;
        function getIdentifier() {
            return 'e'+ii++;
        }
        
        function resolve() {
            if (!stack) { return; }
            
            var id = getIdentifier();
            string = string.substr(0, i-stack.length)+id+string.substr(i, string.length);
            i -= l - string.length;
            l = string.length;
    
            stmnts[id] = new Stmnt(stack);
            
            stack = '';
        }
        
        for (i=0, l=string.length; i<l; i++) {
            if (state === 'stmnt') {
                if ([].concat(cfg.roundBracket).concat(cfg.squareBracket).indexOf(string[i]) !== -1) {
                    
                    // Empty round bracket
                    if (string[i] === cfg.roundBracket[0] &&
                        string[i+1] === cfg.roundBracket[1]) {
                        throw new ArgumentError(2210, {
                            position: ' at pos:'+(query[0].search(new RegExp(escape(cfg.roundBracket.join(''))))+1)
                        });
                    }

                    // Empty square bracket
                    if (string[i] === cfg.squareBracket[0] &&
                        string[i+1] === cfg.squareBracket[1]) {
                        throw new ArgumentError(2210, {
                            position: ' at pos:'+(query[0].search(new RegExp(escape(cfg.squareBracket.join(''))))+1)
                        });
                    }
                    
                    // Missing connective ahead of a bracket
                    if (string[i] === cfg.roundBracket[0] &&
                        typeof string[i-1] !== 'undefined' &&
                        string[i-1] !== cfg.roundBracket[0] &&
                        string[i-1] !== cfg.squareBracket[0] &&
                        string.substr(i-cfg.and.length, cfg.and.length) !== cfg.and &&
                        string.substr(i-cfg.or.length, cfg.or.length) !== cfg.or) { 
                        throw new ArgumentError(2211, {
                            context: string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1, i-3>=0?7:i-2>=0?6:5),
                            index: i
                        }); 
                    }

                    // Missing connective after closing bracket
                    if (string[i] === cfg.roundBracket[1] &&
                        typeof string[i+1] !== 'undefined' &&
                        string[i+1] !== cfg.roundBracket[1] &&
                        string[i+1] !== cfg.squareBracket[1] &&
                        string.substr(i+1, cfg.and.length) !== cfg.and &&
                        string.substr(i+1, cfg.or.length) !== cfg.or) { 
                        throw new ArgumentError(2211, {
                            context: string.substr(i-3, 7),
                            index: i+2
                        }); 
                    }
                    
                    resolve();
                    continue;
                }
                
                if (string[i] === cfg.string) {
                    
                    // Missing opening string quotation mark
                    for (j=cfg.operators.length; j--;) {
                        if (string.substr(i-cfg.operators[j].length, cfg.operators[j].length) === cfg.operators[j]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) { 
                        throw new ArgumentError(2212, {
                            context: string.substr(i-3, 7),
                            index: i+1
                        }); 
                    }

                    lastQuotationMark = i;
                    state = 'string';
                    stack += string[i];
                    continue;
                }
                
                if (string[i] === cfg.and[0] && string.substr(i, cfg.and.length) === cfg.and) {
                    
                    // Missing right-hand side
                    char = string[i+cfg.and.length];
                    if (!(typeof char !== 'undefined' &&
                        char !== cfg.roundBracket[1][0] &&
                        char !== cfg.squareBracket[1][0])) {
                        throw new ArgumentError(2209, {
                            position: ' at \''+string.substr(i+cfg.and.length-3, 7)+'\' (pos: '+(i+cfg.and.length)+')'
                        });
                    }

                    // Missing left-hand side
                    char = string[i-1];
                    if (!(typeof char !== 'undefined' &&
                        char !== cfg.roundBracket[0][0] &&
                        char !== cfg.squareBracket[0][0])) {
                        throw new ArgumentError(2208, {
                            position: ' at \''+string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1>=0?i-1:i, i-3>=0?7:i-2>=0?6:5)+'\' (pos: '+(i)+')'
                        });
                    }
                    
                    resolve();
                    i += cfg.and.length - 1;
                    continue;
                }
                
                if(string[i] === cfg.or[0] && string.substr(i, cfg.or.length) === cfg.or) {

                    // Missing right-hand side
                    char = string[i+cfg.or.length];
                    if (!(typeof char !== 'undefined' &&
                        char !== cfg.roundBracket[1][0] &&
                        char !== cfg.squareBracket[1][0])) {
                        throw new ArgumentError(2209, {
                            position: ' at \''+string.substr(i+cfg.or.length-3, 7)+'\' (pos: '+(i+cfg.or.length)+')'
                        });
                    }

                    // Missing left-hand side
                    char = string[i-1];
                    if (!(typeof char !== 'undefined' &&
                        char !== cfg.roundBracket[0][0] &&
                        char !== cfg.squareBracket[0][0])) {
                        throw new ArgumentError(2208, {
                            position: ' at \''+string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1>=0?i-1:i, i-3>=0?7:i-2>=0?6:5)+'\' (pos: '+(i)+')'
                        });
                    }
                    
                    resolve();
                    i += cfg.or.length - 1;
                    continue;
                }
                
                stack += string[i];
                continue;
            }
    
            if (state === 'string') {
                stack += string[i];
                
                if (string[i] === cfg.string && string[i-1] !== '\\') {
                    state = 'stmnt';
                }
            }
        }
        
        // Missing closing quotation mark
        if (state === 'string') { 
            throw new ArgumentError(2213, {
                context: string.substr(lastQuotationMark-3, 7),
                index: lastQuotationMark+1
            }); 
        }
        
        resolve();
        
        return [string, stmnts];
    }
    
    return tokenizer;
};
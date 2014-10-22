var util = require('util'),
    Stmnt = require('./Stmnt');

function tokenizer(config, query) {
    var i, l,
        stack = '',
        state = 'stmnt',
        string = util.isArray(query)? query[0] : query,
        stmnts = {};
    
    if (typeof string !== 'string') {
        throw new Error('you suck');
    }
    
    var ii = 0;
    function getIdentifier() {
        return 'e'+ii++;
    }
    
    function resolve() {
        if (!stack) { return; }
        
        var id = getIdentifier();
        string = string.replace(stack, id);
        i -= l - string.length;
        l = string.length;

        stmnts[id] = new Stmnt(config, stack);
        
        stack = '';
    }
    
    for (i=0, l=string.length; i<l; i++) {
        if (state === 'stmnt') {
            if (['[', ']', '(', ')'].indexOf(string[i]) !== -1) {
                resolve();
                continue;
            }
            
            if (string[i] === config.string) {
                state = 'string';
                stack += string[i];
                continue;
            }
            
            if (string[i] === config.and[0] && string.substr(i, config.and.length) === config.and) { 
                resolve();
                i += config.and.length - 1;
                continue;
            }
            
            if(string[i] === config.or[0] && string.substr(i, config.or.length) === config.or) {
                resolve();
                i += config.or.length - 1;
                continue;
            }
            
            stack += string[i];
            continue;
        }

        if (state === 'string') {
            stack += string[i];
            
            if (string[i] === config.string && string[i-1] !== '\\') {
                state = 'stmnt';
                resolve();
            }
        }
    }
    resolve();
    
    return [string, stmnts];
}

module.exports = tokenizer;
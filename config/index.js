var extend = require('./extend');

function config(cfg) {
    cfg = extend({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: ':',
        and: '&',
        or: '|',
        string: '"'
    }, cfg);
    
    cfg.operators = cfg.operators.sort(function(a, b) {
        return a.length < b.length;
    });
    
    return cfg;
}

module.exports = config;
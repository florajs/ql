var extend = require('./extend'),
    defaults = require('./default');

function config(config) {
    var cfg;
    
    if (typeof config === 'string') {
        try {
            cfg = require('./'+config);
        } catch(e) {
            cfg = defaults;
        }
    } else {
        cfg = defaults;
    }

    cfg = extend({}, cfg);
    
    if (typeof config === 'object') {
        cfg = extend(cfg, config);
        
        cfg.operators = cfg.operators.sort(function(a, b) {
            return a.length < b.length;
        });
    }
    
    return cfg;
}

module.exports = config;
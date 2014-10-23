var extend = require('./extend'),
    defaults = require('./default');

function config(config) {
    var cfg;

    cfg = extend({}, defaults);
    cfg = extend(cfg, config);
    
    cfg.operators = cfg.operators.sort(function(a, b) {
        return a.length < b.length;
    });
    
    return cfg;
}

module.exports = config;
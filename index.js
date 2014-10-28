var tokenizer           = require('./tokenizer'),
    config              = require('./config'),
    replaceOperators    = require('./operators/replace'),
    clearSquare         = require('./clearSquare'),
    simplify            = require('./simplify'),
    beautify            = require('./beautify');


module.exports = {
    config: config(),
    
    setConfig: function(cfg) {
        this.config = config(cfg);
    },
    
    parse: function parse(query) {
        var _config = config({
            and: '*',
            or: '+',
            lookDelimiter: '+'
        });
        
        query = [query];
        query = tokenizer(this.config)(query);
        query = replaceOperators(this.config)(query, _config);
        query = clearSquare(_config)(query);
        query = simplify(_config)(query);
        query = beautify(_config)(query, this.config);
        
        return query;
    }
};
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
        query = beautify(_config)(query, config);
        
        return query;
    }
};

var floraQL = module.exports;
floraQL.setConfig('api');
console.log('(x=2 OR a=1 AND aA.hhasdhhXx[(b_=1 OR c0[d_0=" OR " AND e=1]) AND (f=1;5 OR g=")\\"(")]) AND h=1');
console.log(floraQL.parse('(x=2 OR a=1 AND aA.hhasdhhXx[(b_=1 OR c0[d_0=" OR " AND e=1]) AND (f=1;5 OR g=")\\"(")]) AND h=1'));
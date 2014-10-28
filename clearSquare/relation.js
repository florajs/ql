var escape = require('../lib/escape')(),
    simplifyF = require('../simplify');

module.exports = function factory(config) {
    var regexp = new RegExp(escape(config.relate), 'g'),
        first = simplifyF({
            and: config.relate,
            or: config.or,
            roundBracket: config.roundBracket
        }),
        second = simplifyF({
            and: config.relate,
            or: config.and,
            roundBracket: config.roundBracket
        });
    
    function relation(a, b) {
        var terms, i, l, parsed, tmp;
            
        a = a.replace(regexp, ';');
        b = b.replace(regexp, ';');
        
        terms = first(['('+a+')'+config.relate+'('+b+')'])[0];
        terms = terms.replace(new RegExp('([a-zA-Z0-9'+escape(config.and)+';]+)', 'g'), '($1)');
        
        terms = terms.split(config.or);
        parsed = [];
        
        for (i=0, l=terms.length; i<l; i++) {
            tmp = second([terms[i]])[0];
            parsed.push(tmp);
        }
        
        var s = parsed.join(config.or); 
        
        return s.replace(/;/g, config.relate);
    }
    
    return relation;
};
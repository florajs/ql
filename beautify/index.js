module.exports = function factory(cfg) {
    
    
    function beautify(query) {
        var sentence, result, i, l, conjunction, term, j, lj;
        
        result = [];
        
        sentence = query[0].split(cfg.or);
        for (i=0, l=sentence.length; i<l; i++) {
            conjunction = sentence[i].split(cfg.and);
            result.push([]);
            
            for (j=0, lj=conjunction.length; j<lj; j++) {
                if (conjunction[j] in query[1]) {
                    term = query[1][conjunction[j]];
                    
                    result[result.length-1].push({
                        attribute: term.attribute.split(cfg.glue),
                        operator: term.operator,
                        value: term.value
                    });
                }
            }
        }
        
        return result;
    }
    
    return beautify;
};
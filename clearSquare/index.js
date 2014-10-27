var simplifyF = require('../simplify');

module.exports = function factory(config) {
    var simplify = simplifyF(config);
    
    /**
     * 
     * @param {string} query
     * @returns {string}
     */
    
    function clearSquare(query) {
        var s, i, attr, keys, term;
        
        while(s = /([^*+\(\)\[\]]+)\[([^\[\]]+)\]/g.exec(query[0])) {
            attr = null;
            term = simplify([s[2]])[0];
            
            if (s[1] in query[1]) {
                attr = query[1][s[1]].attribute;
                delete query[1][s[1]];
            }
            
            if (attr) {
                keys = s[2].match(/(e[0-9]+)/g);
                for (i=keys.length; i--;) {
                    query[1][keys[i]].attribute = attr+config.glue+query[1][keys[i]].attribute;
                }
            }
            
            query[0] = query[0].replace(s[0], '('+s[2]+')');
        }
    
        return query;
    }
    
    return clearSquare;
};
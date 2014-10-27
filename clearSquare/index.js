var simplify = require('../simplify');

/**
 * 
 * @param {object} config
 * @param {string} query
 * @returns {string}
 */

function clearSquare(config, query) {
    var s, i, attr, keys,
        term,
        withOps;
    
    while(s = /([^*+\(\)\[\]]+)\[([^\[\]]+)\]/g.exec(query[0])) {
        attr = null;
        term = simplify(undefined, [s[2]])[0];
        //term = s[2];
        withOps = s[2].indexOf('*') !== -1 || s[2].indexOf('+') !== -1;
        
        //console.log(s[2], term, '--------------');
        
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
        
        query[0] = query[0].replace(s[0], withOps? '('+s[2]+')' : s[2]);
    }

    return query;
}

module.exports = clearSquare;
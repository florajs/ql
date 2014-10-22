/**
 * 
 * @param {object} config
 * @param {string} query
 * @returns {string}
 */

function clearSubtypes(config, query) {
    var s, i, attr, keys;
    
    while(s = /([^*+\(\)]+)\[([^\[\]]+)\]/g.exec(query[0])) {
        attr = null;
        
        if (s[1] in query[1]) {
            attr = query[1][s[1]].attribute;
            delete query[1][s[1]];
        }
        
        if (attr) {
            keys = "(e3+e4*e5)*(e6+e7)".match(/(e[0-9]+)/g);
            for (i=keys.length; i--;) {
                query[1][keys[i]].attribute = attr+config.glue+query[1][keys[i]].attribute;
            }
        }
        
        query[0] = query[0].replace(s[0], s[2]);
    }

    return query;
}

module.exports = clearSubtypes;
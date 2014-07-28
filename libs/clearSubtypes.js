/**
 * 
 * @param {string} query
 * @returns {string}
 */

module.exports = function clearSubtypes(query) {
    var s, term, i, l, s2;
    while(s = /([^&|\(\)]+)\[([^\[\]]+)\]/g.exec(query)) {
        term = s[2].split(/([&|]+)/);
        for (i=0, l=term.length; i<l; i++) {
            if (term[i][0] === '&' || term[i][0] === '|') { continue; }
            
            if (s2 = /^(\(+)(.*)/.exec(term[i])) {
                term[i] = s2[1]+s[1]+':'+s2[2];
            } else {
                term[i] = s[1]+':'+term[i];
            }
        }
        query = query.replace(s[0], term.join(''));
    }

    return query;
};
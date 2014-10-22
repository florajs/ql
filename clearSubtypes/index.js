/**
 * 
 * @param {object} config
 * @param {string} query
 * @returns {string}
 */

function clearSubtypes(config, query) {
    var s, term, i, l, s2,
        //splitter = new RegExp('([('+config.and+')('+config.or+')]+)');
        splitter = /'(\*|\+)'/;
    
    while(s = /'([^*+\\(\\)]+)\\[([^\\[\\]]+)\\]'/g.exec(query[0])) {
        term = s[2].split(splitter);
        console.log('!!', s, new RegExp('([^('+config.and+')('+config.or+')\\(\\)]+)\\[([^\\[\\]]+)\\]', 'g'), term, splitter, '--------------------- ');
        for (i=0, l=term.length; i<l; i++) {
            if (term[i] === config.and || term[i] === config.or) { continue; }
            
            if (s2 = /^(\(+)(.*)/.exec(term[i])) {
                term[i] = s2[1]+s[1]+config.glue+s2[2];
            } else {
                term[i] = s[1]+config.glue+term[i];
            }
        }
        query[0] = query[0].replace(s[0], term.join(''));
    }

    return query;
}

module.exports = clearSubtypes;
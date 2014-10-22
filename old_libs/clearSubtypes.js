var extend = require('./extend'); 

/**
 * 
 * @param {object} config
 * @param {string} query
 * @returns {string}
 */

function clearSubtypes(config, query) {
    config = extend({
        glue: ':',
        and: '&',
        or: '|'
    }, config);
    
    var s, term, i, l, s2,
        //splitter = new RegExp('([('+config.and+')('+config.or+')]+)');
        splitter = new RegExp('('+config.and.replace('|', '\\|')+'|'+config.or.replace('|', '\\|')+')');
    
    while(s = new RegExp('([^('+config.and+')('+config.or+')\\(\\)]+)\\[([^\\[\\]]+)\\]', 'g').exec(query)) {
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
        query = query.replace(s[0], term.join(''));
    }

    return query;
}

module.exports = clearSubtypes;
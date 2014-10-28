var escape = require('../lib/escape')();

module.exports = function factory(config) {

    /**
     * 
     * @param query
     * @param replacement
     * @returns {*}
     */

    function replaceOperators(query, replacement) {
        query[0] = query[0].replace(new RegExp(escape(config.and), 'g'), replacement.and);
        query[0] = query[0].replace(new RegExp(escape(config.or), 'g'), replacement.or);
        
        return query;
    }
    
    return replaceOperators;
};
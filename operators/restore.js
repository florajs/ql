var escape = require('../lib/escape')();

module.exports = function factory(config) {
    
    
    /**
     * 
     * @param query
     * @param replacement
     * @returns {*}
     */
    
    function operatorsRestore(query, replacement) {
        query[0] = query[0].replace(new RegExp(escape(replacement.and), 'g'), config.and);
        query[0] = query[0].replace(new RegExp(escape(replacement.or), 'g'), config.or);
        
        return query;
    }
    
    return operatorsRestore;
};
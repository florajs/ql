var escape = require('../lib/escape')();

module.exports = function factory() {

    /**
     * 
     * @param query
     * @returns {*}
     */

    function replaceOperators(query) {
        query[0] = query[0].replace(new RegExp(escape(config.and), 'g'), '*');
        query[0] = query[0].replace(new RegExp(escape(config.or), 'g'), '+');
        
        return query;
    }
    
    return replaceOperators;
};
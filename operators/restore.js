module.exports = function factory(config) {
    
    /**
     * 
     * @param query
     * @returns {*}
     */
    
    function operatorsRestore(query) {
        query[0] = query[0].replace(/\*/g, config.and);
        query[0] = query[0].replace(/\+/g, config.or);
        
        return query;
    }
    
    return operatorsRestore;
};
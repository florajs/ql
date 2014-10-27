module.exports = function factory() {

    /**
     * 
     * @param source
     * @param from
     * @param to
     * @param newPart
     * @returns {string}
     */
    
    function replace(source, from, to, newPart) {
        return source.substr(0, from) + newPart + source.substr(to, source.length);
    }
    
    return replace;
};
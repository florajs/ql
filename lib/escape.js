module.exports = function factory() {

    /**
     * 
     * @param s
     * @returns {*|XML|string|void}
     * @source http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
     */
    
    function escape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    
    return escape;
};

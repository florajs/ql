/**
 * @returns {extend}
 */
module.exports = function factory() {
    /**
     *
     * @param {object} target
     * @param {object} source
     * @returns {object}
     * @source http://stackoverflow.com/questions/12317003/something-like-jquery-extend-but-standalone
     */
    function extend(target, source) {
        target = target || {};
        for (let prop in source) {
            if (Array.isArray(source[prop])) {
                target[prop] = source[prop] || target[prop];
            } else if (typeof source[prop] === 'object') {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    return extend;
};

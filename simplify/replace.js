/**
 * @returns {replace}
 */
module.exports = function factory() {
    /**
     * Replace any parts of the source string with a new part.
     * Provide the position with from and to.
     *
     * @param {string} source
     * @param {number} from
     * @param {number} to
     * @param {string} newPart
     * @returns {string}
     */
    function replace(source, from, to, newPart) {
        return source.substr(0, from) + newPart + source.substr(to, source.length);
    }

    return replace;
};

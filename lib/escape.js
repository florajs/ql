/**
 * 
 * @param {string} s
 * @returns {string}
 * @source http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
 */

function escape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = escape;
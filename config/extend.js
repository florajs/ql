var util = require('util');

/** 
 * 
 * @param target
 * @param source
 * @returns {{}}
 * @source http://stackoverflow.com/questions/12317003/something-like-jquery-extend-but-standalone
 */

function extend (target, source) {
    target = target || {};
    for (var prop in source) {
        if (util.isArray(source[prop])) {
            target[prop] = source[prop] || target[prop];
        } else if (typeof source[prop] === 'object') {
            target[prop] = extend(target[prop], source[prop]);
        } else {
            target[prop] = source[prop];
        }
    }
    return target;
}

module.exports = extend;
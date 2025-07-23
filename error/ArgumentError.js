const codes = require('./codes');

/**
 * Custom error object to replace internal error codes with
 * a declarative error message. Pass additional information
 * to the message with the second argument.
 *
 * @param {number} code
 * @param {object} [data]
 * @constructor
 * @source http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */
function ArgumentError(code, data) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code || 1001;
    this.message = codes[code in codes ? code : 1001];
    this.info = {};

    if (typeof data === 'object') {
        for (let k in data) {
            if (!Object.prototype.hasOwnProperty.call(data, k)) {
                continue;
            }
            this.info[k] = data[k];
            this.message = this.message.replace(new RegExp(':' + k, 'g'), data[k] + '');
        }
    }
}

module.exports = ArgumentError;

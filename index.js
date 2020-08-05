const assert = require('./error/assert');
const extend = require('./config/extend');
const tokenizer = require('./tokenizer');
const config = require('./config');
const replaceOperators = require('./operators/replace');
const clearSquare = require('./clearSquare');
const simplify = require('./simplify');
const beautify = require('./beautify');

/**
 * @typedef {[
 *     string, object
 * ]} Query
 */

module.exports = {
    /**
     * Current configuration of the parser.
     *
     * @type Config
     */
    config: config(),

    /**
     * Change the configuration of the parser. Accepts objects with single attributes by
     * extending the default values or the name of a .json config file located under
     * /config.
     *
     * @param {Config|string} cfg
     */

    setConfig: function (cfg) {
        this.config = extend()(this.config, typeof cfg === 'string' ? config(cfg) : cfg);
    },

    /**
     * Insert string to be parsed here. Returns a two-dimensional array containing the
     * parsed statements. Throws ArgumentErrors if anything goes wrong.
     *
     * @param {string} query
     * @returns {Array}
     * @throws {ArgumentError}
     */

    parse: function parse(query) {
        assert(typeof query === 'string' && query !== '', 2000);

        const _config = config({
            and: '*',
            or: '+',
            lookDelimiter: '+'
        });

        query = [query, {}];
        query = tokenizer(this.config)(query);
        query = replaceOperators(this.config)(query, _config);
        query = clearSquare(_config)(query, this.config);
        query = simplify(_config)(query);
        query = beautify(_config)(query, this.config);

        return query;
    }
};

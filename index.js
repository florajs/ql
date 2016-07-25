'use strict';

var assert              = require('./error/assert'),
    extend              = require('./config/extend'),
    tokenizer           = require('./tokenizer'),
    config              = require('./config'),
    replaceOperators    = require('./operators/replace'),
    clearSquare         = require('./clearSquare'),
    simplify            = require('./simplify'),
    beautify            = require('./beautify');

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
        this.config = extend()(this.config, typeof cfg === 'string'? config(cfg) : cfg);
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

        var _config = config({
            and: '*',
            or: '+',
            lookDelimiter: '+'
        });

        query = [query, {}];
        query = tokenizer(this.config)(query);
        //console.log('[tokenizer]', query);
        query = replaceOperators(this.config)(query, _config);
        //console.log('[replaceOperators]', query);
        if (true || this.config.flatten) {
            query = clearSquare(_config)(query, this.config);
            //console.log('[clearSquare]', query);
            query = simplify(_config)(query);
            //console.log('[simplify]', query);
        }
        query = beautify(_config)(query, this.config);
        //console.log('[beautify]', query);

        return query;
    }
};

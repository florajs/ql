const assert = require('../error/assert');
const config = require('../config');
const escape = require('../lib/escape');
const validateConfig = require('../validate/config');
const simplifyF = require('../simplify');

/**
 *
 * @param {Config} cfg
 * @returns {relation}
 */
module.exports = function factory(cfg) {
    validateConfig(cfg);

    /*
     * We can reuse the methods available under /simplify with
     * different configurations to help resolving square brackets.
     */

    const regexp = new RegExp(escape(cfg.relate), 'g'),
        first = simplifyF(
            config({
                and: cfg.relate,
                or: cfg.or,
                roundBracket: cfg.roundBracket
            })
        ),
        second = simplifyF(
            config({
                and: cfg.relate,
                or: cfg.and,
                roundBracket: cfg.roundBracket
            })
        );

    /**
     * Create relations between statements created by square
     * brackets and remove them.
     *
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    function relation(a, b) {
        assert(typeof a === 'string', 2206);
        assert(typeof b === 'string', 2207);

        a = a.replace(regexp, ';');
        b = b.replace(regexp, ';');

        let terms = first('(' + a + ')' + cfg.relate + '(' + b + ')')[0];
        terms = terms.replace(new RegExp('([a-zA-Z_0-9' + escape(cfg.and) + ';]+)', 'g'), '($1)');

        terms = terms.split(cfg.or);
        const parsed = [];

        for (let i = 0, l = terms.length; i < l; i++) {
            parsed.push(second(terms[i])[0]);
        }

        return parsed.join(cfg.or).replace(/;/g, cfg.relate);
    }

    return relation;
};

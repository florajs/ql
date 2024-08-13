const replace = require('./replace')();
const validateConfig = require('../validate/config');

/**
 * @param {Config} cfg
 * @returns {expand}
 */
module.exports = function factory(cfg) {
    validateConfig(cfg);

    /**
     * Mathematically expand the provided expression to the content of a bracket.
     *
     * For example:
     * - a*(b+c) = a*b+a*c
     * - (a+b)*(c*d) = a*c+a*b+b*c+b*d
     *
     * @param {string} exp
     * @param {string} bracket
     * @param {boolean} isBackwards
     * @returns {string}
     */
    function expand(exp, bracket, isBackwards) {
        if (!exp) {
            return bracket;
        }

        let term = '';
        let i;
        let l;

        for (i = 0, l = bracket.length; i < l; i++) {
            if (bracket[i] === cfg.or) {
                bracket = replace(
                    bracket,
                    i - term.length,
                    i,
                    isBackwards ? term + cfg.and + exp : exp + cfg.and + term
                );
                i += exp.length + cfg.and.length;
                l += exp.length + cfg.and.length;
                term = '';
            } else {
                term += bracket[i];
            }
        }
        bracket = replace(bracket, i - term.length, i, isBackwards ? term + cfg.and + exp : exp + cfg.and + term);

        return bracket;
    }

    return expand;
};

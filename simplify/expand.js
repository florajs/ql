var replace         = require('./replace')(),
    validateConfig  = require('../validate/config');

/**
 * 
 * @param {Config} cfg
 * @returns {expand}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    function split(a) {
        var i, li, level = 0, tmp = '', terms = [];

        for (i = 0, li = a.length; i < li; i++) {
            if (a[i] === cfg.roundBracket[0]) {
                level++;
            }
            if (a[i] === cfg.roundBracket[1]) {
                level--;
            }

            if (level === 0 && a[i] === cfg.or) {
                terms.push(tmp);
                tmp = '';
            } else {
                tmp += a[i];
            }
        }

        terms.push(tmp);

        return terms;
    }

    /**
     * Mathematically expand the provided expressions.
     * 
     * For example:
     * - (a)*(b+c) = a*b+a*c
     * - (a)*(b*c) = a*b*c
     * - (a+b)*(c) = a*c+b*c
     * - (a*b)*(c*d) = a*b*c*d
     * - (a+b)*(c+d) = a*c+a*d+b*c+b*d
     * - (a+b)*(c*d) = a*c*d+b*c*d
     * - (a*b)*(c+d) = a*b*c+a*b*d
     *
     * @param {string} a
     * @param {string} b
     * @param {boolean} isBackwards
     * @returns {string}
     */
    
    function expand(a, b, isBackwards) {
        if (!a) { return b; }

        var i, li, j, lj;
        var termsA = split(isBackwards? b:a);
        var termsB = split(isBackwards? a:b);
        var res = new Array(termsA.length*termsB.length);

        for (i=0, li=termsA.length; i<li; i++) {
            for (j=0, lj=termsB.length; j<lj; j++) {
                res[i*lj+j] = termsA[i]+cfg.and+termsB[j];
            }
        }

        return res.join(cfg.or);
    }
    
    return expand;
};
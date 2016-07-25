var replace         = require('./replace')(),
    validateConfig  = require('../validate/config');

/**
 * 
 * @param {Config} cfg
 * @returns {expand}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    function split(a, delimiter) {
        var i, li, level = 0, tmp = '', terms = [];

        for (i = 0, li = a.length; i < li; i++) {
            if (a[i] === cfg.roundBracket[0]) {
                level++;
            }
            if (a[i] === cfg.roundBracket[1]) {
                level--;
            }

            if (level === 0 && a[i] === delimiter) {
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
     * Expand the provided expressions.
     *
     * - (a)~(b+c) = a~b + a~c
     * - (a)~(b*c) = a~b*a~c
     * - (a+b)~(c) = a~c + b~c
     * - (a*b)~(c) = a~c*b~c
     * - (a*b)~(c*d) = a~c*a~d*b~c*b~d
     * - (a+b)~(c+d) = a~c + a~d + b~c + b~d
     * - (a*b)~(c+d) = (a*b)~c + (a*b)~d = a~c*b~c + a~d*b~d
     * - (a+b)~(c*d) = a~(c*d) + b~(c*d) = a~c*a~d + b~c*b~d
     * - (a*b+c)~(d*e+f) = (a*b)~(d*e) + (a*b)~f + c~(d*e) + c~f = a~c*a~d*b~c*b~d + a~f*b~f + c~d*c~e + c~f
     *
     * @param {string} a
     * @param {string} b
     * @param {boolean} isBackwards
     * @returns {string}
     */
    
    function relate(a, b, isBackwards) {
        if (!a) { return b; }

        var level;

        // first level of brackets must be removed for relate only
        // (a*(b+c))~(x+(y*z)) -> a*(b+c) ~ x+(y*z)
        if (a[0] === cfg.roundBracket[0] && a[a.length-1] === cfg.roundBracket[1]) {
            level = 1;
            for (i=1, li=a.length-1; i<li; i++) {
                if (a[i] === cfg.roundBracket[0]) { level++; }
                if (a[i] === cfg.roundBracket[1]) { level--; }
                if (level === 0) { break; }
            }
            if (level !== 0) {
                a = a.substr(1, a.length-2);
            }
        }
        if (b[0] === cfg.roundBracket[0] && b[b.length-1] === cfg.roundBracket[1]) {
            level = 1;
            for (i=1, li=b.length-1; i<li; i++) {
                if (b[i] === cfg.roundBracket[0]) { level++; }
                if (b[i] === cfg.roundBracket[1]) { level--; }
                if (level === 0) { break; }
            }
            if (level !== 0) {
                b = b.substr(1, b.length-2);
            }
        }

        // a*(b+c) ~ x+(y*z) -> a*(b+c) ~ x,(y*z)
        var i, li, j, lj, k, lk;
        var term;
        var termsA = split(isBackwards? b:a, cfg.or);
        var termsB = split(isBackwards? a:b, cfg.or);
        var res = new Array(termsA.length*termsB.length);

        // a*(b+c) ~ x,(y*z) -> a*(b+c)~x  a*(b+c)~(y*z)
        for (i=0, li=termsA.length; i<li; i++) {
            for (j=0, lj=termsB.length; j<lj; j++) {
                res[i*lj+j] = [termsA[i], termsB[j]];
            }
        }

        // Split by *, Merge *
        for (i=0, li=res.length; i<li; i++) {
            // a*(b+c)~x  a*(b+c)~(y*z) -> a,(b+c)~x  a,(b+c)~(y*z)
            termsA = split(res[i][0], cfg.and);
            termsB = split(res[i][1], cfg.and);

            // a,(b+c)~x  a,(b+c)~(y*z) -> a~x  (b+c)~x  a~(y*z) (b+c)~(y*z)
            term = new Array(termsA.length*termsB.length);
            for (j=0, lj=termsA.length; j<lj; j++) {
                for (k=0, lk=termsB.length; k<lk; k++) {
                    term[j*lk+k] = termsA[j]+cfg.relate+termsB[k];
                }
            }
            // a~x  (b+c)~x  a~(y*z) (b+c)~(y*z) -> a~x*(b+c)~x  a~(y*z)*(b+c)~(y*z)
            res[i] = term.join(cfg.and);
        }

        // Merge +
        // a~x*(b+c)~x  a~(y*z)*(b+c)~(y*z) -> a~x*(b+c)~x + a~(y*z)*(b+c)~(y*z)
        return res.join(cfg.or);
    }
    
    return relate;
};
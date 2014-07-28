/**
 * 
 * @param {string} sentence
 * @returns {string}
 */

module.exports = function simplify(sentence) {

    /*
     * Replace AND and OR symbols:
     * a&a -> a*a
     * a&&a -> a*a
     * a|a -> a+a
     * a||a -> a+a
     */

    sentence = sentence.replace(/[&]+/g, '*');
    sentence = sentence.replace(/[|]+/g, '+');

    /*
     * Remove empty brackets:
     * a*() -> a
     * a+() -> a
     * ()*a -> a
     * ()+a -> a
     */

    sentence = sentence.replace(/[\*\+]?\(\)[\*\+]?/g, '');

    /*
     * Expand:
     * (a+b)*c -> a*c+b*c
     * a*(b+c) -> a*b+a*c
     * (a+b)*(c+d) -> a*c+a*d+b*c+b*d
     * a*(b+c*d) -> a*b+a*c*d
     * a*(b*(c+d)) -> a*b*c+a*b*d
     */

    function expand(s) {
        var i, l, f, t, j, lj, k, lk, p, m, rgx;

        rgx = /\(([a-z0-9\+\*]+)\)\*([a-z0-9]+)|([a-z0-9]+)\*\(([a-z0-9\+\*]+)\)|\(([a-z0-9\+\*]+)\)\*\(([a-z0-9\+\*]+)\)/;
        while(f = rgx.exec(s)) {
            t = f.shift();
            for (i=0, l=f.length; i<l; i+=2) {
                if (typeof f[i] === 'undefined') { continue; }
                p = [];
                m = [
                    f[i].match(/[a-z0-9\*]+/g),
                    f[i+1].match(/[a-z0-9\*]+/g)
                ];
                for (j=0, lj=m[0].length; j<lj; j++) {
                    for (k=0, lk=m[1].length; k<lk; k++) {
                        p.push(m[0][j]+'*'+m[1][k]);
                    }
                }
                break;
            }

            s = s.replace(t, '('+p.join('+')+')');
            s = clearBrackets(s);
        }
        return s;
    }

    sentence = expand(sentence);

    /*
     * Clear brackets:
     * a+(b+c*d) -> a+b+c*d
     * (b+c*d)+a -> b+c*d+a
     * a+(b+c*d)+a -> a+b+c*d+a
     * (b+c*d) -> a+b+c*d+a
     */
    
    function clearBrackets(s) {
        s = s.replace(/\({2}([a-z0-9\+\*]+)\){2}/g, '($1)');
        s = s.replace(/\({2}([a-z0-9\+\*]+)\){2}/g, '($1)');
        
        s = s.replace(/\+\(([a-z0-9\+\*]+)\)\+/, '+$1+');
        s = s.replace(/\(\(([a-z0-9\+\*]+)\)\+/, '($1+');
        s = s.replace(/\+\(([a-z0-9\+\*]+)\)\)/, '+$1)');
        s = s.replace(/\+\(([a-z0-9\+\*]+)\)$/, '+$1');
        s = s.replace(/^\(([a-z0-9\+\*]+)\)\+/, '$1+');
        s = s.replace(/^\(([a-z0-9\+\*]+)\)$/, '$1');
        return s;
    }
    
    sentence = clearBrackets(sentence);

    return sentence;
}
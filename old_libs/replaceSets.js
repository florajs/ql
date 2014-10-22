/**
 * 
 * @param {string} sentence
 * @returns {string}
 */

module.exports = function replaceSets(sentence) {
    var s, d1, d2, t, o;
    while (s = /([\d\.]+);([\d\.]+)/.exec(sentence)) {
        d1 = parseFloat(s[1].replace(',', '.'));
        d2 = parseFloat(s[2].replace(',', '.'));
        
        if (d2 < d1) {
            t = d1;
            d1 = d2;
            d2 = t;
        }
        
        o = [d1];
        t = d1;
        while(t < d2) {
            t = t+1;
            if (t < d2) {
                o.push(t);
            }
        }
        o.push(d2);
        
        sentence = sentence.replace(s[0], o.join(','));
    }
    return sentence;
};
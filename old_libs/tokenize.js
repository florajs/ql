/**
 *
 * @param {string} sentence
 * @returns {[string, object]}
 */

module.exports = function tokenize(sentence) {
    var exp, i, l, map = {}, k = 0;

    exp = sentence.match(/[^&|()]+/g);
    for (i=0, l=exp.length; i<l; i++) {
        k++;
        sentence = sentence.replace(exp[i], 'e'+k);
        map['e'+k] = exp[i];
    }

    return [sentence, map];
};
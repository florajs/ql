var assert = require('assert'),
    replaceSets = require('../libs/replaceSets');

describe('replaceSets()', function() {
    var terms, i, l;

    terms = [
        ['1;5',                             '1,2,3,4,5'],
        ['{1;5}',                           '{1,2,3,4,5}'],
        ['9;12',                            '9,10,11,12'],
        ['12;9',                            '9,10,11,12'],
        ['1.5;3.6',                         '1.5,2.5,3.5,3.6'],
        ['1,5;3,6',                         '1,3,4,5,6']
    ];

    function factory(term, ex) {
        return function() {
            var res = replaceSets(term);
            assert(res === ex, 'Input: '+term+'  Result: '+res+'  Expected: '+ex);  
        }
    }

    for (i=0, l=terms.length; i<l; i++) {
        it('should expand set #'+(i+1), factory(terms[i][0], terms[i][1]));
    }
});
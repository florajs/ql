var assert = require('assert'),
    fn = require('../../simplify/expand');

describe('simplify/expand()', function() {
    var i, l,
        tests = [
            [['e', 'a+b'],                  'ea+eb'],
            [['e', 'a+b', true],            'ae+be'],
            [['eee', 'a+b'],                'eeea+eeeb'],
            [['eee', 'aaa+bbb'],            'eeeaaa+eeebbb'],
            [['ee', 'aa+bb+cc+dd'],         'eeaa+eebb+eecc+eedd'],
            [['ee', 'aa+bb+cc+dd', true],   'aaee+bbee+ccee+ddee'],
        ];

    function factory(input, output) {
        return function() {
            assert.equal(fn.apply(this, input), output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should expand '+tests[i][0].join(', '), factory(
            tests[i][0],
            tests[i][1]
        ));
    }
});
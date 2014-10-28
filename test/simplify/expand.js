var assert = require('assert'),
    config = require('../../config'),
    fn = require('../../simplify/expand');

describe('simplify/expand()', function() {
    var i, l,
        tests = [
            [['e', 'a+b'],                  'e*a+e*b'],
            [['e', 'a+b', true],            'a*e+b*e'],
            [['eee', 'a+b'],                'eee*a+eee*b'],
            [['eee', 'aaa+bbb'],            'eee*aaa+eee*bbb'],
            [['ee', 'aa+bb+cc+dd'],         'ee*aa+ee*bb+ee*cc+ee*dd'],
            [['ee', 'aa+bb+cc+dd', true],   'aa*ee+bb*ee+cc*ee+dd*ee'],
        ],
        fails = [];

    function factory(config, input, output) {
        return function() {
            assert.equal(fn(config).apply(this, input), output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should expand '+tests[i][0].join(', '), factory(
            config(),
            tests[i][0],
            tests[i][1]
        ));
    }
});
var assert = require('assert'),
    fn = require('../../simplify/expand')({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    });

describe('simplify/expand()', function() {
    var i, l,
        tests = [
            [['e', 'a+b'],                  'e*a+e*b'],
            [['e', 'a+b', true],            'a*e+b*e'],
            [['eee', 'a+b'],                'eee*a+eee*b'],
            [['eee', 'aaa+bbb'],            'eee*aaa+eee*bbb'],
            [['ee', 'aa+bb+cc+dd'],         'ee*aa+ee*bb+ee*cc+ee*dd'],
            [['ee', 'aa+bb+cc+dd', true],   'aa*ee+bb*ee+cc*ee+dd*ee'],
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
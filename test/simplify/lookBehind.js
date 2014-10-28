var assert = require('assert'),
    lookBehind = require('../../simplify/lookBehind')({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    });

describe('simplify/lookBehind()', function() {
    var i, l,
        tests = [
            [['e*(e1+e2)', 9],                ['e']],
            [['eee*(e1+e2)', 11],             ['eee']],
            [['aaa+eee*(e1+e2)', 16],         ['eee']],
            [['(aaa+eee)*(e1+e2)', 18],       ['aaa', 'eee']],
            [['(aaa*aaa+eee)*(e1+e2)', 21],   ['aaa*aaa', 'eee']],
            [['a+(aaa*aaa+eee)*(e1+e2)', 23], ['aaa*aaa', 'eee']],
            [['((aaa*aaa)+eee)*(e1+e2)', 23], ['']],
            [['eee+(e1+e2)', 11],            ['']]
        ];

    function factory(input, output) {
        return function() {
            var res = lookBehind.apply(this, input)[1];
            
            assert.equal(res.length, output.length);
            for (var i=0, l=res.length; i<l; i++) {
                assert.equal(res[i], output[i]);
            }
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should look behind '+tests[i][0], factory(
            tests[i][0],
            tests[i][1]
        ));
    }
});
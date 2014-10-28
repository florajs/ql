var assert = require('assert'),
    lookAhead = require('../../simplify/lookAhead')({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    });

describe('simplify/lookAhead()', function() {
    var i, l,
        tests = [
            [['(e1+e2)*e', 7],               ['e']],
            [['(e1+e2)*eee', 7],             ['eee']],
            [['(e1+e2)*aaa+eee', 7],         ['aaa']],
            [['(e1+e2)*(aaa+eee)', 7],       ['aaa', 'eee']],
            [['(e1+e2)*(aaa*aaa+eee)', 7],   ['aaa*aaa', 'eee']],
            [['(e1+e2)*(aaa*aaa+eee)+a', 7], ['aaa*aaa', 'eee']],
            [['(e1+e2)*((aaa*aaa)+eee)', 7], ['']],
            [['(e1+e2)+aaa', 7],            ['']]
        ];

    function factory(input, output) {
        return function() {
            var res = lookAhead.apply(this, input)[1];

            assert.equal(res.length, output.length);
            for (var i=0, l=res.length; i<l; i++) {
                assert.equal(res[i], output[i]);
            }
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should look ahead '+tests[i][0], factory(
            tests[i][0],
            tests[i][1]
        ));
    }
});
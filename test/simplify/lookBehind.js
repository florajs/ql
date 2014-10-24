var assert = require('assert'),
    lookBehind = require('../../simplify/lookBehind');

describe('simplify/lookBehind()', function() {
    var i, l,
        tests = [
            [['e(e1+e2)', 8],                ['e']],
            [['eee(e1+e2)', 10],             ['eee']],
            [['aaa+eee(e1+e2)', 15],         ['eee']],
            [['(aaa+eee)(e1+e2)', 17],       ['aaa', 'eee']],
            [['(aaa*aaa+eee)(e1+e2)', 20],   ['aaa*aaa', 'eee']],
            [['a+(aaa*aaa+eee)(e1+e2)', 22], ['aaa*aaa', 'eee']],
            [['((aaa*aaa)+eee)(e1+e2)', 22], ['']],
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
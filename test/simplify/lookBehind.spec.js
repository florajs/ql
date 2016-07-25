var assert = require('assert'),
    contains = require('../../lib/contains'),
    config = require('../../config'),
    fn = require('../../simplify/lookBehind');

describe('simplify/lookBehind()', function() {
    var i, l,
        tests = [
            [['(e1)', 0],                           ['', [''], '']],
            [['e+(e1+e2)', 1],                      ['', [''], '+']],
            [['e*(e1+e2)', 1],                      ['e', ['e'], '*']],
            [['eee+(e1+e2)', 3],                    ['', [''], '+']],
            [['eee*(e1+e2)', 3],                    ['eee', ['eee'], '*']],
            [['e*e*(e1+e2)', 3],                    ['e*e', ['e', 'e'], '*']],
            [['eee*eee*(e1+e2)', 7],                ['eee*eee', ['eee', 'eee'], '*']],
            [['aaa+eee*(e1+e2)', 7],                ['eee', ['eee'], '*']],
            [['(aaa+eee)*(e1+e2)', 9],              ['(aaa+eee)', ['(aaa+eee)'], '*']],
            [['(aaa+eee)*(aaa+eee)*(e1+e2)', 19],   ['(aaa+eee)*(aaa+eee)', ['(aaa+eee)', '(aaa+eee)'], '*']],
            [['(aaa+eee)*eee*(e1+e2)', 13],         ['(aaa+eee)*eee', ['(aaa+eee)', 'eee'], '*']],
            [['eee*(aaa+eee)*(e1+e2)', 13],         ['eee*(aaa+eee)', ['eee', '(aaa+eee)'], '*']],
            [['eee+(aaa+eee)*(e1+e2)', 13],         ['(aaa+eee)', ['(aaa+eee)'], '*']],
            [['eee*(aaa+eee)+(e1+e2)', 13],         ['', [''], '+']],
            [['(aaa*aaa+eee)*(e1+e2)', 13],         ['(aaa*aaa+eee)', ['(aaa*aaa+eee)'], '*']],
            [['((aaa*aaa)+eee)*(e1+e2)', 15],       ['((aaa*aaa)+eee)', ['((aaa*aaa)+eee)'], '*']],
            [['e3~e4*e3~e5*(e1+e2)', 11],            ['e3~e4*e3~e5', ['e3', 'e4', 'e3', 'e5'], '*']]
        ];

    function factory(config, input, output) {
        return function() {
            var isEqual = contains(fn(config).apply(this, input), output);
            if (!isEqual) { // for diff
                assert.deepEqual(fn(config).apply(this, input), output);
            }
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should look behind '+tests[i][0], factory(
            config(),
            tests[i][0],
            tests[i][1]
        ));
    }
});
/* global describe, it */

const assert = require('assert');

const contains = require('../lib/contains');
const config = require('../config');
const fn = require('../simplify/lookBehind');

describe('simplify/lookBehind()', function () {
    var i,
        l,
        tests = [
            [
                ['e*(e1+e2)', 9],
                ['e', ['e']]
            ],
            [
                ['eee*(e1+e2)', 11],
                ['eee', ['eee']]
            ],
            [
                ['aaa+eee*(e1+e2)', 16],
                ['eee', ['eee']]
            ],
            [
                ['(aaa+eee)*(e1+e2)', 18],
                ['(aaa+eee)', ['aaa', 'eee']]
            ],
            [
                ['(aaa*aaa+eee)*(e1+e2)', 21],
                ['(aaa*aaa+eee)', ['aaa*aaa', 'eee']]
            ],
            [
                ['a+(aaa*aaa+eee)*(e1+e2)', 23],
                ['(aaa*aaa+eee)', ['aaa*aaa', 'eee']]
            ],
            [
                ['((aaa*aaa)+eee)*(e1+e2)', 23],
                ['', ['']]
            ],
            [
                ['eee+(e1+e2)', 11],
                ['', ['']]
            ]
        ];

    function factory(config, input, output) {
        return function () {
            var isEqual = contains(fn(config).apply(this, input), output);
            if (!isEqual) {
                // for diff
                assert.deepEqual(fn(config).apply(this, input), output);
            }
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should look behind ' + tests[i][0], factory(config(), tests[i][0], tests[i][1]));
    }
});

/* global describe, it */

const assert = require('assert');

const contains = require('../lib/contains');
const config = require('../config');
const fn = require('../simplify/lookAhead');

describe('simplify/lookAhead()', function () {
    var i,
        l,
        tests = [
            [
                ['(e1+e2)*e', 7],
                ['e', ['e']]
            ],
            [
                ['(e1+e2)*eee', 7],
                ['eee', ['eee']]
            ],
            [
                ['(e1+e2)*aaa+eee', 7],
                ['aaa', ['aaa']]
            ],
            [
                ['(e1+e2)*(aaa+eee)', 7],
                ['(aaa+eee)', ['aaa', 'eee']]
            ],
            [
                ['(e1+e2)*(aaa*aaa+eee)', 7],
                ['(aaa*aaa+eee)', ['aaa*aaa', 'eee']]
            ],
            [
                ['(e1+e2)*(aaa*aaa+eee)+a', 7],
                ['(aaa*aaa+eee)', ['aaa*aaa', 'eee']]
            ],
            [
                ['(e1+e2)*((aaa*aaa)+eee)', 7],
                ['', ['']]
            ],
            [
                ['(e1+e2)+aaa', 7],
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
        it('should look ahead ' + tests[i][0], factory(config(), tests[i][0], tests[i][1]));
    }
});

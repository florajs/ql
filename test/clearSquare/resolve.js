/* global describe, it */

const assert = require('assert');

const contains = require('../../lib/contains');
const config = require('../../config');
const Stmnt = require('../../tokenizer/Stmnt')(config());
const fn = require('../../clearSquare/resolve');

describe('clearSquare/resolve()', function () {
    const tests = [
        [
            ['e0~e1', { e0: new Stmnt('a'), e1: new Stmnt('b', '>', '1') }],
            ['e0_1', { e0_1: { attribute: 'a.b', operator: '>', value: 1 } }]
        ],
        [
            ['e00~e11', { e00: new Stmnt('aaa'), e11: new Stmnt('bbb', '>', '1') }],
            ['e00_11', { e00_11: { attribute: 'aaa.bbb', operator: '>', value: 1 } }]
        ],
        [
            ['e0~e1~e2', { e0: new Stmnt('a'), e1: new Stmnt('b'), e2: new Stmnt('c', '>', '1') }],
            ['e0_1_2', { e0_1_2: { attribute: 'a.b.c', operator: '>', value: 1 } }]
        ],
        [
            ['e0*e1~e2~e3+e4', { e1: new Stmnt('a'), e2: new Stmnt('b'), e3: new Stmnt('c', '>', '1') }],
            ['e0*e1_2_3+e4', { e1_2_3: { attribute: 'a.b.c', operator: '>', value: 1 } }]
        ],
        [
            ['(e0+(e1~e2~e3*e4))', { e1: new Stmnt('a'), e2: new Stmnt('b'), e3: new Stmnt('c', '>', '1') }],
            ['(e0+(e1_2_3*e4))', { e1_2_3: { attribute: 'a.b.c', operator: '>', value: 1 } }]
        ]
    ];

    function factory(config, input, output) {
        return function () {
            var isEqual = contains(fn(config)(input), output);
            if (!isEqual) {
                // for diff
                assert.deepEqual(fn(config)(input), output);
            }
        };
    }

    for (let i = 0; i < tests.length; i++) {
        it('should resolve relations from ' + tests[i][0][0], factory(config(), tests[i][0], tests[i][1]));
    }
});

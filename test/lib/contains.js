/* global describe, it */

const assert = require('assert');

const fn = require('../../lib/contains');

describe('lib/contains()', function () {
    var i,
        l,
        tests = [
            [{ a: true }, { a: true }],
            [{ a: false }, { a: false }],
            [{ a: 'string' }, { a: 'string' }],
            [{ a: 0 }, { a: 0 }],
            [{ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } }],
            [
                [1, 2, 3],
                [1, 2, 3]
            ],
            [{ a: 0, b: 1 }, { a: 0 }],
            [{ a: 0, b: 1 }, { b: 1 }]
        ];

    function factory(input) {
        return function () {
            assert.ok(fn.apply(this, input));
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should indicate correct containment of objects #' + (i + 1), factory(tests[i]));
    }
});

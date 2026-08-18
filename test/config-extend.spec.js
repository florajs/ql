const { describe, it } = require('node:test');
const assert = require('node:assert');
const fn = require('../config/extend')();

describe('config/extend()', function () {
    var i,
        l,
        tests = [
            [[{}, { a: true }], { a: true }],
            [[{}, { a: false }], { a: false }],
            [[{ a: true }, {}], { a: true }],
            [[{ a: false }, {}], { a: false }],
            [[{ a: false }, { a: true }], { a: true }],
            [[{ a: true }, { a: false }], { a: false }],
            [[{ a: 'hello' }, { a: 'world' }], { a: 'world' }],
            [[{ a: 0 }, { a: 1 }], { a: 1 }],
            [[{ a: { b: 0 } }, { a: { b: 1 } }], { a: { b: 1 } }],
            [[{ a: { b: 0 } }, { a: { b: [1, 2] } }], { a: { b: [1, 2] } }],
            [[{ a: { b: [1] } }, { a: { b: [1, 2] } }], { a: { b: [1, 2] } }],
            [[{ a: { b: [1] } }, { a: { b: [2] } }], { a: { b: [2] } }],
            [
                [
                    [1, 2, 3],
                    [2, 3, 4]
                ],
                [2, 3, 4]
            ]
        ];

    function factory(input, output) {
        return function () {
            assert.deepEqual(fn.apply(this, input), output);
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should extend object #' + (i + 1), factory(tests[i][0], tests[i][1]));
    }

    Object.entries({
        'nested constructor property': { constructor: { prototype: { polluted: 'yes' } } },
        'own proto property': JSON.parse('{"__proto__":{"polluted":"yes"}}')
    }).forEach(function ([description, payload]) {
        it('should not pollute Object.prototype via ' + description, function () {
            fn({}, payload);

            assert.strictEqual(Object.hasOwn(Object.prototype, 'polluted'), false);
            assert.strictEqual({}.polluted, undefined);
        });
    });

    it('should ignore inherited (non-own) properties of the source', function () {
        const base = { a: 'from-prototype' };
        const source = Object.create(base);
        source.b = 'own';

        assert.deepEqual(fn({}, source), { b: 'own' });
    });
});

/* global describe, it */

const assert = require('assert');

const config = require('../../config');
const fn = require('../../simplify/identify');

describe('simplify/identify()', function () {
    var i,
        l,
        tests = [
            ['(b)', ['(b)', 'b', 2, 0]],
            ['((b))', ['((b))', 'b', 3, 1]],
            ['(((b)))', ['(((b)))', 'b', 4, 2]],
            ['a(b)', ['a(b)', 'b', 3, 0]],
            ['aaa(bb+cc*dd)eee', ['aaa(bb+cc*dd)eee', 'bb+cc*dd', 12, 0]],
            ['aaa(bb+(cc*dd))eee+(ff*gg)', ['aaa(bb+(cc*dd))eee+(ff*gg)', 'cc*dd', 13, 1]],
            ['aaa(bb+(cc*dd))eee+(ff*(gg))', ['aaa(bb+(cc*dd))eee+(ff*(gg))', 'gg', 26, 1]]
        ];

    function factory(config, input, output) {
        return function () {
            fn(config)(input, function () {
                assert.deepEqual(Array.prototype.slice.call(arguments), output);
                return '';
            });
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should identify deepest bracket from ' + tests[i][0], factory(config(), tests[i][0], tests[i][1]));
    }
});

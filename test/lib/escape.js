/* global describe, it */

const assert = require('assert');

const fn = require('../../lib/escape');

describe('lib/escape()', function () {
    var i,
        l,
        tests = [['abc-/\\^$*abc+?.()|[]{}abc', 'abc\\-\\/\\\\\\^\\$\\*abc\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}abc']];

    function factory(input, output) {
        return function () {
            assert.equal(fn(input), output);
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should escape special characters for regexp ', factory(tests[i][0], tests[i][1]));
    }
});

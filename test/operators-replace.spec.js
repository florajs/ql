const assert = require('assert');

const config = require('../config');
const fn = require('../operators/replace');

describe('operators/replace()', function () {
    var i,
        l,
        tests = [
            [[['a AND b', {}], config()], 'a*b'],
            [[['a OR b', {}], config()], 'a+b'],
            [[['a AND b OR (c AND d)', {}], config()], 'a*b+(c*d)'],
            [[['(a AND b) OR c AND d', {}], config()], '(a*b)+c*d'],
            [[['(a AND b OR c AND d)', {}], config()], '(a*b+c*d)'],
            [[['b[(c AND d) OR e]', {}], config()], 'b[(c*d)+e]'],
            [[['a AND b[(c AND d) OR e] OR f', {}], config()], 'a*b[(c*d)+e]+f']
        ];

    function factory(config, input, output) {
        return function () {
            assert.equal(fn(config).apply(this, input)[0], output);
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should replace ' + tests[i][0], factory(config('api'), tests[i][0], tests[i][1]));
    }
});

/* global describe, it */

const assert = require('assert');

const config = require('../../config');
const fn = require('../../clearSquare/relation');

describe('clearSquare/relation()', function () {
    var i,
        l,
        tests = [
            // basic

            [['e0', 'e1'], 'e0~e1'],
            [['e0', 'e1+e2'], 'e0~e1+e0~e2'],
            [['e0', 'e1*e2'], 'e0~e1*e0~e2'],
            [['e0', 'e1+e2*e3'], 'e0~e1+e0~e2*e0~e3'],
            [['e0', 'e1*e2+e3'], 'e0~e1*e0~e2+e0~e3'],
            [['e0+e1', 'e2'], 'e0~e2+e1~e2'],
            [['e0*e1', 'e2'], 'e0~e2*e1~e2'],
            [['e0+e1*e2', 'e3'], 'e0~e3+e1~e3*e2~e3'],
            [['e0*e1+e2', 'e3'], 'e0~e3*e1~e3+e2~e3'],

            // double terms

            [['e0*e1', 'e2*e3'], 'e0~e2*e0~e3*e1~e2*e1~e3'],
            [['e0+e1', 'e2+e3'], 'e0~e2+e0~e3+e1~e2+e1~e3'],
            [['e0*e1', 'e2+e3'], 'e0~e2*e1~e2+e0~e3*e1~e3'],
            [['e0+e1', 'e2*e3'], 'e0~e2*e0~e3+e1~e2*e1~e3'],

            // multiple terms

            [['e0+e1*e2', 'e3*e4'], 'e0~e3*e0~e4+e1~e3*e1~e4*e2~e3*e2~e4'],
            [['e0*e1+e2', 'e3*e4'], 'e0~e3*e0~e4*e1~e3*e1~e4+e2~e3*e2~e4'],
            [['e0+e1*e2', 'e3+e4'], 'e0~e3+e0~e4+e1~e3*e2~e3+e1~e4*e2~e4'],
            [['e0*e1+e2', 'e3+e4'], 'e0~e3*e1~e3+e0~e4*e1~e4+e2~e3+e2~e4'],
            [['e0*e1', 'e2+e3*e4'], 'e0~e2*e1~e2+e0~e3*e0~e4*e1~e3*e1~e4'],
            [['e0*e1', 'e2*e3+e4'], 'e0~e2*e0~e3*e1~e2*e1~e3+e0~e4*e1~e4'],
            [['e0+e1', 'e2+e3*e4'], 'e0~e2+e0~e3*e0~e4+e1~e2+e1~e3*e1~e4'],
            [['e0+e1', 'e2*e3+e4'], 'e0~e2*e0~e3+e0~e4+e1~e2*e1~e3+e1~e4'],

            // more complex terms

            [['e0*e1*e2', 'e3*e4*e5'], 'e0~e3*e0~e4*e0~e5*' + 'e1~e3*e1~e4*e1~e5*' + 'e2~e3*e2~e4*e2~e5'],
            [
                ['e0*e1+e2*e3', 'e4*e5+e6*e7'],
                'e0~e4*e0~e5*e1~e4*e1~e5+' +
                    'e0~e6*e0~e7*e1~e6*e1~e7+' +
                    'e2~e4*e2~e5*e3~e4*e3~e5+' +
                    'e2~e6*e2~e7*e3~e6*e3~e7'
            ],

            // recursive relation

            [['e0', 'e1~e2'], 'e0~e1~e2'],
            [['e0', 'e1*e2~e3'], 'e0~e1*e0~e2~e3'],
            [['e0', 'e1~e2*e3'], 'e0~e1~e2*e0~e3'],
            [['e0', 'e1~e2*e3~e4'], 'e0~e1~e2*e0~e3~e4'],
            [['e0~e1', 'e2~e3'], 'e0~e1~e2~e3'],
            [['e0~e1*e2~e3', 'e4~e5*e6~e7'], 'e0~e1~e4~e5*e0~e1~e6~e7*e2~e3~e4~e5*e2~e3~e6~e7'],
            [['e0~e1+e2~e3', 'e4~e5+e6~e7'], 'e0~e1~e4~e5+e0~e1~e6~e7+e2~e3~e4~e5+e2~e3~e6~e7']
        ],
        fails = [
            [[], 2206],
            [[''], 2207]
        ];

    function factory(config, input, output) {
        return function () {
            assert.equal(fn(config).apply(this, input), output);
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should expand relation ' + tests[i][0], factory(config(), tests[i][0], tests[i][1]));
    }

    function failFactory(config, input, code) {
        return function () {
            try {
                fn(config).apply(this, input);
            } catch (e) {
                assert.equal(e.code, code);
                return;
            }

            throw new Error('Test failed, error not thrown');
        };
    }

    for (i = 0, l = fails.length; i < l; i++) {
        it('should throw error ' + fails[i][0], failFactory(config(), fails[i][0], fails[i][1]));
    }
});

var assert = require('assert'),
    fn = require('../../simplify/replace')();

describe('simplify/replace()', function() {
    var i, l,
        tests = [
            [['abcd', 0, 1, 'x'],   'xbcd'      ],
            [['abcd', 0, 1, 'xxx'], 'xxxbcd'    ],
            [['abcd', 3, 4, 'xxx'], 'abcxxx'    ],
            [['abcd', 0, 0, 'xxx'], 'xxxabcd'   ],
            [['abcd', 3, 3, 'xxx'], 'abcxxxd'   ],
            [['abcd', 4, 4, 'xxx'], 'abcdxxx'   ],
            [['abcd', 7, 7, 'xxx'], 'abcdxxx'   ],
        ],
        fails = [];

    function factory(input, output) {
        return function() {
            assert.equal(fn.apply(this, input), output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should replace occurrence in string '+tests[i][0][0], factory(
            tests[i][0],
            tests[i][1]
        ));
    }
});
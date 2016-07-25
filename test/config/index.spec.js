var assert = require('assert'),
    config = require('../../config'),
    fn = require('../../config'),
    defaults = require('../../config/default.json');

describe('config()', function() {
    it('should serve default config', function() {
        assert.deepEqual(fn(), defaults);
    });

    var copy1 = JSON.parse(JSON.stringify(defaults));
    copy1['a'] = true;
    copy1['b'] = false;

    var copy2 = JSON.parse(JSON.stringify(defaults));
    copy2['a'] = false;
    copy2['b'] = false;

    var i, l,
        tests = [
            [[{a: true, b: false}], copy1],
            [[{a: true, b: false}, {a: false}], copy2]
        ];

    function factory(input, output) {
        return function() {
            assert.deepEqual(fn.apply(this, input), output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should extend object #'+(i+1), factory(
            tests[i][0],
            tests[i][1]
        ));
    }
});
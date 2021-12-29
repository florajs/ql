const assert = require('assert');

const fn = require('../config');

describe('config()', function () {
    it('should serve default config', function () {
        assert.deepEqual(fn(), require('../config/default.json'));
    });
});

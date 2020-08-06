/* global describe, it */

const assert = require('assert');

const contains = require('../lib/contains');
const config = require('../config');
const fn = require('../beautify');

describe('beautify()', function () {
    var i,
        l,
        tests = [
            [
                [['e0', { e0: { attribute: 'a', operator: '=', value: '1' } }]],
                [[{ attribute: ['a'], operator: '=', value: '1' }]]
            ],
            [
                [
                    [
                        'e0+e1',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' }
                        }
                    ]
                ],
                [[{ attribute: ['a'], operator: '=', value: '1' }], [{ attribute: ['b'], operator: '>', value: '2' }]]
            ],
            [
                [
                    [
                        'e0+e1+e2',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' },
                            e2: { attribute: 'c', operator: '<', value: '3' }
                        }
                    ]
                ],
                [
                    [{ attribute: ['a'], operator: '=', value: '1' }],
                    [{ attribute: ['b'], operator: '>', value: '2' }],
                    [{ attribute: ['c'], operator: '<', value: '3' }]
                ]
            ],
            [
                [
                    [
                        'e0*e1',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' }
                        }
                    ]
                ],
                [
                    [
                        { attribute: ['a'], operator: '=', value: '1' },
                        { attribute: ['b'], operator: '>', value: '2' }
                    ]
                ]
            ],
            [
                [
                    [
                        'e0*e1*e2',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' },
                            e2: { attribute: 'c', operator: '<', value: '3' }
                        }
                    ]
                ],
                [
                    [
                        { attribute: ['a'], operator: '=', value: '1' },
                        { attribute: ['b'], operator: '>', value: '2' },
                        { attribute: ['c'], operator: '<', value: '3' }
                    ]
                ]
            ],
            [
                [
                    [
                        'e0*e1+e2',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' },
                            e2: { attribute: 'c', operator: '<', value: '3' }
                        }
                    ]
                ],
                [
                    [
                        { attribute: ['a'], operator: '=', value: '1' },
                        { attribute: ['b'], operator: '>', value: '2' }
                    ],
                    [{ attribute: ['c'], operator: '<', value: '3' }]
                ]
            ],
            [
                [
                    [
                        'e0+e1*e2',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' },
                            e2: { attribute: 'c', operator: '<', value: '3' }
                        }
                    ]
                ],
                [
                    [{ attribute: ['a'], operator: '=', value: '1' }],
                    [
                        { attribute: ['b'], operator: '>', value: '2' },
                        { attribute: ['c'], operator: '<', value: '3' }
                    ]
                ]
            ],
            [
                [
                    [
                        'e0*e1+e2*e3',
                        {
                            e0: { attribute: 'a', operator: '=', value: '1' },
                            e1: { attribute: 'b', operator: '>', value: '2' },
                            e2: { attribute: 'c', operator: '<', value: '3' },
                            e3: { attribute: 'd', operator: '!=', value: '4' }
                        }
                    ]
                ],
                [
                    [
                        { attribute: ['a'], operator: '=', value: '1' },
                        { attribute: ['b'], operator: '>', value: '2' }
                    ],
                    [
                        { attribute: ['c'], operator: '<', value: '3' },
                        { attribute: ['d'], operator: '!=', value: '4' }
                    ]
                ]
            ]
        ],
        fails = [
            [[], 2100],
            [['e0'], 2100],
            [['e0', {}], 2202],
            [['e0', { e1: { attribute: '', operator: '', value: '' } }], 2202],
            [['e0', { e0: { attribute: null, operator: 'a', value: 'a' } }], 2215],
            [['e0', { e0: { attribute: 'a', operator: null, value: 'a' } }], 2216]
        ];

    function factory(config, input, output) {
        return function () {
            var isEqual = contains(fn(config).apply(this, input), output);
            if (!isEqual) {
                // for diff
                assert.deepEqual(fn(config).apply(this, input), output);
            }
        };
    }

    for (i = 0, l = tests.length; i < l; i++) {
        it('should beautify ' + tests[i][0][0][0], factory(config(), tests[i][0], tests[i][1]));
    }

    function failFactory(config, input, code) {
        return function () {
            try {
                fn(config)(input);
            } catch (e) {
                //throw e;
                assert.equal(e.code, code);
                return;
            }

            throw new Error('Test failed, error not thrown');
        };
    }

    for (i = 0, l = fails.length; i < l; i++) {
        it('should throw error ' + fails[i][0][0], failFactory(config(), fails[i][0], fails[i][1]));
    }
});

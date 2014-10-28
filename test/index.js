var assert = require('assert'),
    contains = require('../lib/contains')(),
    config = require('../config'),
    floraQL = require('../');

describe('parse()', function() {
    var i, l,
        tests = [
            ['a=1',
                [   [   { attribute: ['a'], operator: '=', value: 1}  ]   ]
            ],
            ['a=1 AND b=2',
                [   [   { attribute: ['a'], operator: '=', value: 1},
                        { attribute: ['b'], operator: '=', value: 2}  ]   ]
            ],
            ['a=1 OR b=2',
                [   [   { attribute: ['a'], operator: '=', value: 1}  ],
                    [   { attribute: ['b'], operator: '=', value: 2}  ]   ]
            ],
            ['a=1 AND b=2 OR c=3',
                [   [   { attribute: ['a'], operator: '=', value: 1},
                        { attribute: ['b'], operator: '=', value: 2}  ],
                    [   { attribute: ['c'], operator: '=', value: 3}  ]   ]
            ],
            ['a=1 AND (b=2 OR c=3)',
                [   [   { attribute: ['a'], operator: '=', value: 1},
                        { attribute: ['b'], operator: '=', value: 2}  ],
                    [   { attribute: ['a'], operator: '=', value: 1},
                        { attribute: ['c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (b=2 OR c=3)]',
                [   [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND zxy[(b=2 OR c=3)]]',
                [   [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (zxy[b=2 OR c=3])]',
                [   [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (zxy[e AND f][b=2 OR c=3])]',
                [   [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'e', 'b'], operator: '=', value: 2},
                        { attribute: ['xyz', 'zxy', 'f', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'e', 'c'], operator: '=', value: 3},
                        { attribute: ['xyz', 'zxy', 'f', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (zxy[e AND f][b="hel lo" OR c=true])]',
                [   [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'e', 'b'], operator: '=', value: 'hel lo'},
                        { attribute: ['xyz', 'zxy', 'f', 'b'], operator: '=', value: 'hel lo'}  ],
                    [   { attribute: ['xyz', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz', 'zxy', 'e', 'c'], operator: '=', value: true},
                        { attribute: ['xyz', 'zxy', 'f', 'c'], operator: '=', value: true}  ]   ]
            ],
            ['(x=2 OR a=1 AND aA.hhasdhhXx[(b_=1 OR c0[d_0=" OR " AND e=1]) AND (f=1;5 OR g=")\\"(")]) AND h=1',
                [   [   { attribute: ['x'], operator: '=', value: 2 },
                        { attribute: ['h'], operator: '=', value: 1 } 
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'b_'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'f'], operator: '=', value: 1 },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'b_'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'g'], operator: '=', value: ')"(' },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'c0', 'd_0'], operator: '=', value: ' OR ' },
                        { attribute: ['aA', 'hhasdhhXx', 'c0', 'e'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'f'], operator: '=', value: 1 },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'c0', 'd_0'], operator: '=', value: ' OR ' },
                        { attribute: ['aA', 'hhasdhhXx', 'c0', 'e'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx', 'g'], operator: '=', value: ')"(' },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ]
                ]
            ],
        ],
        fails = [];

    function factory(config, input, output) {
        return function() {
            floraQL.setConfig(config);
            var isEqual = contains(floraQL.parse(input), output);
            if (!isEqual) {
                assert.deepEqual(floraQL.parse(input), output);
                // catch strict equality errors, deepEqual does only test for loose equality
                throw new Error('Unmatched data types');
            }
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should parse '+tests[i][0], factory(
            config('api'),
            tests[i][0],
            tests[i][1]
        ));
    }
});



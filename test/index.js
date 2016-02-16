var assert = require('assert'),
    contains = require('../lib/contains'),
    config = require('../config'),
    floraQL = require('../');

describe('parse()', function() {
    var i, l, cfg,
        tests = [
            ['a=1',
                [   [   { attribute: ['a'], operator: '=', value: 1}  ]   ]
            ],
            ['a=true',
                [   [   { attribute: ['a'], operator: '=', value: true}  ]   ]
            ],
            ['a=false',
                [   [   { attribute: ['a'], operator: '=', value: false}  ]   ]
            ],
            ['foo=null',
                [   [   { attribute: ['foo'], operator: '=', value: null}  ]   ]
            ],
            ['foo=""',
                [   [   { attribute: ['foo'], operator: '=', value: ''}  ]   ]
            ],
            ['a.b[c]=1',
                [   [   { attribute: ['a', 'b~0', 'c'], operator: '=', value: 1}  ]   ]
            ],
            ['a[b OR c].d=42',
                [   [   { attribute: ['a~0', 'b', 'd'], operator: '=', value: 42}  ],
                    [   { attribute: ['a~0', 'c', 'd'], operator: '=', value: 42}  ]  ]
            ],
            ['type.id=1,2,3',
                [   [   { attribute: ['type', 'id'], operator: '=', value: [1, 2, 3]}  ]   ]
            ],
            ['type.name="a","b","c"',
                [   [   { attribute: ['type', 'name'], operator: '=', value: ["a", "b", "c"]}  ]   ]
            ],
            ['type.name="a",2,null',
                [   [   { attribute: ['type', 'name'], operator: '=', value: ["a", 2, null]}  ]   ]
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
                [   [   { attribute: ['xyz~0', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~0', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz~0', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~0', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND zxy[(b=2 OR c=3)]]',
                [   [   { attribute: ['xyz~1', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~1', 'zxy~0', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz~1', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~1', 'zxy~0', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (zxy[b=2 OR c=3])]',
                [   [   { attribute: ['xyz~1', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~1', 'zxy~0', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz~1', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~1', 'zxy~0', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (zxy[e AND f][b=2 OR c=3])]',
                [   [   { attribute: ['xyz~3', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~3', 'zxy~2', 'e~0', 'b'], operator: '=', value: 2},
                        { attribute: ['xyz~3', 'zxy~2', 'f~1', 'b'], operator: '=', value: 2}  ],
                    [   { attribute: ['xyz~3', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~3', 'zxy~2', 'e~0', 'c'], operator: '=', value: 3},
                        { attribute: ['xyz~3', 'zxy~2', 'f~1', 'c'], operator: '=', value: 3}  ]   ]
            ],
            ['xyz[a=1 AND (zxy[e AND f][b="hel lo" OR c=true])]',
                [   [   { attribute: ['xyz~3', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~3', 'zxy~2', 'e~0', 'b'], operator: '=', value: 'hel lo'},
                        { attribute: ['xyz~3', 'zxy~2', 'f~1', 'b'], operator: '=', value: 'hel lo'}  ],
                    [   { attribute: ['xyz~3', 'a'], operator: '=', value: 1},
                        { attribute: ['xyz~3', 'zxy~2', 'e~0', 'c'], operator: '=', value: true},
                        { attribute: ['xyz~3', 'zxy~2', 'f~1', 'c'], operator: '=', value: true}  ]   ]
            ],
            ['(x=2 OR a=1 AND aA.hhasdhhXx[(b_=1 OR c0[d_0=" OR " AND e=1]) AND (f=1;5 OR g=")\\"(")]) AND h=1',
                [   [   { attribute: ['x'], operator: '=', value: 2 },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'b_'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'f'], operator: '=', value: 1 },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'b_'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'g'], operator: '=', value: ')"(' },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'c0~0', 'd_0'], operator: '=', value: ' OR ' },
                        { attribute: ['aA', 'hhasdhhXx~1', 'c0~0', 'e'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'f'], operator: '=', value: 1 },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ],
                    [   { attribute: ['a'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'c0~0', 'd_0'], operator: '=', value: ' OR ' },
                        { attribute: ['aA', 'hhasdhhXx~1', 'c0~0', 'e'], operator: '=', value: 1 },
                        { attribute: ['aA', 'hhasdhhXx~1', 'g'], operator: '=', value: ')"(' },
                        { attribute: ['h'], operator: '=', value: 1 }
                    ]
                ]
            ],
            ['user[(memberships OR groups)][id=4 AND type=3]',
                [   [   { attribute: ['user~2', 'memberships~0', 'id'], operator: '=', value: 4 },
                        { attribute: ['user~2', 'memberships~0', 'type'], operator: '=', value: 3 }
                    ],
                    [   { attribute: ['user~2', 'groups~1', 'id'], operator: '=', value: 4 },
                        { attribute: ['user~2', 'groups~1', 'type'], operator: '=', value: 3 }
                    ]
                ]
            ],
            ['categories.id=2241 AND (instruments.assetClass.id=2,4 OR tags.id=1637) AND sectors.id=1,9 AND date<="2016-01-07T10:58:27.000Z"',
                [   [   { "attribute": [ "categories", "id" ], "operator": "=", "value": 2241 },
                        { "attribute": [ "instruments", "assetClass", "id" ], "operator": "=", "value": [ 2, 4 ] },
                        { "attribute": [ "sectors", "id" ], "operator": "=", "value": [ 1, 9 ] },
                        { "attribute": [ "date" ],  "operator": "<=",  "value": "2016-01-07T10:58:27.000Z" }
                    ],
                    [   { "attribute": [ "categories", "id" ], "operator": "=", "value": 2241 },
                        { "attribute": [ "tags", "id" ], "operator": "=", "value": 1637 },
                        { "attribute": [ "sectors", "id" ], "operator": "=", "value": [ 1, 9 ] },
                        { "attribute": [ "date" ], "operator": "<=", "value": "2016-01-07T10:58:27.000Z" }
                    ]
                ]
            ]
        ],
        fails = [
            [false,                 2000],
            [4,                     2000],
            ['',                    2000],
            ['(',                   2203],
            ['(aaa',                2203],
            ['[',                   2203],
            ['[aaa',                2203],
            [')',                   2204],
            ['aaa)',                2204],
            [']',                   2204],
            ['aaa]',                2204],
            [' AND aaa',            2208],
            ['( AND aaa) OR bbb',   2208],
            ['[ AND aaa] OR bbb',   2208],
            ['aaa AND ',            2209],
            ['(aaa AND ) OR bbb',   2209],
            ['[aaa AND ] OR bbb',   2209],
            [' OR aaa',             2208],
            ['( OR aaa) OR bbb',    2208],
            ['[ OR aaa] OR bbb',    2208],
            ['aaa OR ',             2209],
            ['(aaa OR ) OR bbb',    2209],
            ['[aaa OR ] OR bbb',    2209],
            ['()',                  2210],
            ['[]',                  2210],
            ['[()]',                2210],
            ['aaa OR ()',           2210],
            ['aaa OR []',           2210],
            ['() OR aaa',           2210],
            ['[] OR aaa',           2210],
            ['(bbb AND ccc)aaa',    2211],
            ['aaa(bbb AND ccc)',    2216],
            ['aaa=string"',         2212],
            ['aaa="string',         2213],
            ['aaa=string',          2214],
            ['aaa=hello world',     2214],
            ['=123',                2215],
            ['aaa123',              2216],
            ['aaa=',                2217],
            ['(memberships OR groups)[id=4 AND type=3]', 2211],
            ['[memberships OR groups](id=4 AND type=3)', 2211]
        ];

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
        cfg = config('api');
        cfg.elemMatch = true;
        it('should parse '+tests[i][0], factory(
            cfg,
            tests[i][0],
            tests[i][1]
        ));
    }

    function failFactory(config, input, code) {
        return function() {
            try {
                floraQL.setConfig(config);
                floraQL.parse(input);
            } catch(e) {
                assert.equal(e.code, code);
                return;
            }

            throw new Error('Test failed, error not thrown');
        }
    }

    for (i=0, l=fails.length; i<l; i++) {
        cfg = config('api');
        cfg.elemMatch = true;
        it('should throw error '+fails[i][0], failFactory(
            cfg,
            fails[i][0],
            fails[i][1]
        ));
    }
});



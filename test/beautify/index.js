var assert = require('assert'),
    contains = require('../../lib/contains')(),
    config = require('../../config'),
    fn = require('../../beautify');

describe('beautify()', function() {
    var i, l,
        tests = [
            [   [['e0',             {   e0: { attribute:'a', operator:'=', value:'1' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' } ]    ]],
            [   [['e0+e1',          {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' } ],
                                                                                                    [   { attribute:['b'], operator:'>', value:'2' } ]    ]],
            [   [['e0+e1+e2',       {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' },
                                        e2: { attribute:'c', operator:'<', value:'3' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' } ],
                                                                                                    [   { attribute:['b'], operator:'>', value:'2' } ],
                                                                                                    [   { attribute:['c'], operator:'<', value:'3' } ]    ]],
            [   [['e0*e1',          {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' }, 
                                                                                                        { attribute:['b'], operator:'>', value:'2' } ]    ]],
            [   [['e0*e1*e2',       {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' },
                                        e2: { attribute:'c', operator:'<', value:'3' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' }, 
                                                                                                        { attribute:['b'], operator:'>', value:'2' }, 
                                                                                                        { attribute:['c'], operator:'<', value:'3' } ]    ]],
            [   [['e0*e1+e2',       {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' },
                                        e2: { attribute:'c', operator:'<', value:'3' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' }, 
                                                                                                        { attribute:['b'], operator:'>', value:'2' } ],
                                                                                                    [   { attribute:['c'], operator:'<', value:'3' } ]    ]],
            [   [['e0+e1*e2',       {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' },
                                        e2: { attribute:'c', operator:'<', value:'3' }  }]],    [   [   { attribute:['a'], operator:'=', value:'1' } ], 
                                                                                                    [   { attribute:['b'], operator:'>', value:'2' }, 
                                                                                                        { attribute:['c'], operator:'<', value:'3' } ]    ]],
            [   [['e0*e1+e2*e3',    {   e0: { attribute:'a', operator:'=', value:'1' },
                                        e1: { attribute:'b', operator:'>', value:'2' },
                                        e2: { attribute:'c', operator:'<', value:'3' },
                                        e3: { attribute:'d', operator:'!=', value:'4' } }]],    [   [   { attribute:['a'], operator:'=', value:'1' },
                                                                                                        { attribute:['b'], operator:'>', value:'2' } ],
                                                                                                    [   { attribute:['c'], operator:'<', value:'3' }, 
                                                                                                        { attribute:['d'], operator:'!=', value:'4'} ]    ]],
        ],
        fails = [
        ];

    function factory(config, input, output) {
        return function() {
            var isEqual = contains(fn(config).apply(this, input), output);
            if (!isEqual) { // for diff
                assert.deepEqual(fn(config).apply(this, input), output);
            }
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should beautify '+tests[i][0], factory(
            config(),
            tests[i][0],
            tests[i][1]
        ));
    }
});
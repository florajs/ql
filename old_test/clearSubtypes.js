var assert = require('assert'),
    clearSubtypes = require('../libs/clearSubtypes');

describe('clearSubtypes()', function() {
    var i, l, j, lj,
        configs = [{
            glue: ':',
            and: '&',
            or: '|'
        }, {
            glue: '.',
            and: ' AND ',
            or: ' OR '
        }],
        terms = [[
            // basic
            
            ['a[b:1]',                      'a:b:1'],
            ['a:b[c:1]',                    'a:b:c:1'],
            ['a[b[c:1]]',                   'a:b:c:1'],
            
            // AND and OR connections
            
            ['a[b:1&c:1]',                  'a:b:1&a:c:1'],
            ['a[b:1&c:1&d:1]',              'a:b:1&a:c:1&a:d:1'],
            ['a:1&b[c:1]',                  'a:1&b:c:1'],
            ['a[b:1]&c:1',                  'a:b:1&c:1'],
            ['a[b:1&c[d:1]]',               'a:b:1&a:c:d:1'],
            ['a[b[c:1]&d:1]',               'a:b:c:1&a:d:1'],
            ['a[b:1&c[d:1&e:1]]',           'a:b:1&a:c:d:1&a:c:e:1'],
            ['a[b:1&c[d:1&e:1]&f:1]',       'a:b:1&a:c:d:1&a:c:e:1&a:f:1'],
            ['a[b:1&c[d:1&e:1]&f:1]&g:1',   'a:b:1&a:c:d:1&a:c:e:1&a:f:1&g:1'],
            
            ['a[b:1|c:1]',                  'a:b:1|a:c:1'],
            ['a[b:1|c:1|d:1]',              'a:b:1|a:c:1|a:d:1'],
            ['a:1|b[c:1]',                  'a:1|b:c:1'],
            ['a[b:1]|c:1',                  'a:b:1|c:1'],
            ['a[b:1|c[d:1]]',               'a:b:1|a:c:d:1'],
            ['a[b[c:1]|d:1]',               'a:b:c:1|a:d:1'],
            ['a[b:1|c[d:1|e:1]]',           'a:b:1|a:c:d:1|a:c:e:1'],
            ['a[b:1|c[d:1|e:1]|f:1]',       'a:b:1|a:c:d:1|a:c:e:1|a:f:1'],
            ['a[b:1|c[d:1|e:1]|f:1]|g:1',   'a:b:1|a:c:d:1|a:c:e:1|a:f:1|g:1'],
            
            // support for brackets
            
            ['a[(b:1|c:1)&d:1]',                '(a:b:1|a:c:1)&a:d:1'],
            ['a[b:1&(c:1|d:1)]',                'a:b:1&(a:c:1|a:d:1)'],
            ['a[(b:1|c:1)&(d:1|e:1)]',          '(a:b:1|a:c:1)&(a:d:1|a:e:1)'],
            ['a[(b:1|c[d:1&e:1])&(f:1|g:1)]',   '(a:b:1|a:c:d:1&a:c:e:1)&(a:f:1|a:g:1)'],
            ['a:x[(b:1|c[d:1&e:1])&(f:1|g:1)]', '(a:x:b:1|a:x:c:d:1&a:x:c:e:1)&(a:x:f:1|a:x:g:1)'],
            
            // more complex values with operators
            
            ['a[b:1,2]', 'a:b:1,2'],
            ['a[b:1;2]', 'a:b:1;2'],
            ['a[b:!1]', 'a:b:!1'],
            ['a[b:>1]', 'a:b:>1'],
            ['a[b:<1]', 'a:b:<1'],
            ['a[b:>=1]', 'a:b:>=1'],
            ['a[b:<=1]', 'a:b:<=1'],
            ['a[b:{<1111}]',  'a:b:{<1111}'],
            
            ['a:x[(b:1|c[d:1,2&e:1])&(f:1,2|g:1)]', '(a:x:b:1|a:x:c:d:1,2&a:x:c:e:1)&(a:x:f:1,2|a:x:g:1)'],
            ['a:x[(b:1|c[d:1;2&e:1])&(f:1;2|g:1)]', '(a:x:b:1|a:x:c:d:1;2&a:x:c:e:1)&(a:x:f:1;2|a:x:g:1)'],
            ['a:x[(b:1|c[d:!1&e:1])&(f:!1|g:1)]', '(a:x:b:1|a:x:c:d:!1&a:x:c:e:1)&(a:x:f:!1|a:x:g:1)'],
            ['a:x[(b:1|c[d:>1&e:1])&(f:>1|g:1)]', '(a:x:b:1|a:x:c:d:>1&a:x:c:e:1)&(a:x:f:>1|a:x:g:1)'],
            ['a:x[(b:1|c[d:<1&e:1])&(f:<1|g:1)]', '(a:x:b:1|a:x:c:d:<1&a:x:c:e:1)&(a:x:f:<1|a:x:g:1)'],
            ['a:x[(b:1|c[d:>=1&e:1])&(f:>=1|g:1)]', '(a:x:b:1|a:x:c:d:>=1&a:x:c:e:1)&(a:x:f:>=1|a:x:g:1)'],
            ['a:x[(b:1|c[d:<=1&e:1])&(f:<=1|g:1)]', '(a:x:b:1|a:x:c:d:<=1&a:x:c:e:1)&(a:x:f:<=1|a:x:g:1)'],
            ['a:x[(b:1|c[d:{<1111}&e:1])&(f:{<1111}|g:1)]', '(a:x:b:1|a:x:c:d:{<1111}&a:x:c:e:1)&(a:x:f:{<1111}|a:x:g:1)'],
            
            // more complex attribute names
    
            ['a_0[b_0:1]', 'a_0:b_0:1'],
            ['a_0:b_0[c_0:1]', 'a_0:b_0:c_0:1'],
            ['a_0[b_0[c_0:1]]', 'a_0:b_0:c_0:1'],
            ['a_0[b_0[c_0:{<1111}]]', 'a_0:b_0:c_0:{<1111}'],
            ['aA:Xx[(b_:1|c0[d_0:{<1111}&e:1])&(f:1;5|g:1)]', '(aA:Xx:b_:1|aA:Xx:c0:d_0:{<1111}&aA:Xx:c0:e:1)&(aA:Xx:f:1;5|aA:Xx:g:1)']
            
        ], [
            // basic

            ['a[b=1]',                      'a.b=1'],
            ['a.b[c=1]',                    'a.b.c=1'],
            ['a[b[c=1]]',                   'a.b.c=1'],

            // AND and OR connections

            ['a[b=1 AND c=1]',                  'a.b=1 AND a.c=1'],
            ['a[b=1 AND c=1 AND d=1]',              'a.b=1 AND a.c=1 AND a.d=1'],
            ['a=1 AND b[c=1]',                  'a=1 AND b.c=1'],
            ['a[b=1] AND c=1',                  'a.b=1 AND c=1'],
            ['a[b=1 AND c[d=1]]',               'a.b=1 AND a.c.d=1'],
            ['a[b[c=1] AND d=1]',               'a.b.c=1 AND a.d=1'],
            ['a[b=1 AND c[d=1 AND e=1]]',           'a.b=1 AND a.c.d=1 AND a.c.e=1'],
            ['a[b=1 AND c[d=1 AND e=1] AND f=1]',       'a.b=1 AND a.c.d=1 AND a.c.e=1 AND a.f=1'],
            ['a[b=1 AND c[d=1 AND e=1] AND f=1] AND g=1',   'a.b=1 AND a.c.d=1 AND a.c.e=1 AND a.f=1 AND g=1'],

            ['a[b=1 OR c=1]',                  'a.b=1 OR a.c=1'],
            ['a[b=1 OR c=1 OR d=1]',              'a.b=1 OR a.c=1 OR a.d=1'],
            ['a=1 OR b[c=1]',                  'a=1 OR b.c=1'],
            ['a[b=1] OR c=1',                  'a.b=1 OR c=1'],
            ['a[b=1 OR c[d=1]]',               'a.b=1 OR a.c.d=1'],
            ['a[b[c=1] OR d=1]',               'a.b.c=1 OR a.d=1'],
            ['a[b=1 OR c[d=1 OR e=1]]',           'a.b=1 OR a.c.d=1 OR a.c.e=1'],
            ['a[b=1 OR c[d=1 OR e=1] OR f=1]',       'a.b=1 OR a.c.d=1 OR a.c.e=1 OR a.f=1'],
            ['a[b=1 OR c[d=1 OR e=1] OR f=1] OR g=1',   'a.b=1 OR a.c.d=1 OR a.c.e=1 OR a.f=1 OR g=1'],

            // support for brackets

            ['a[(b=1 OR c=1) AND d=1]',                '(a.b=1 OR a.c=1) AND a.d=1'],
            ['a[b=1 AND (c=1 OR d=1)]',                'a.b=1 AND (a.c=1 OR a.d=1)'],
            ['a[(b=1 OR c=1) AND (d=1 OR e=1)]',          '(a.b=1 OR a.c=1) AND (a.d=1 OR a.e=1)'],
            ['a[(b=1 OR c[d=1 AND e=1]) AND (f=1 OR g=1)]',   '(a.b=1 OR a.c.d=1 AND a.c.e=1) AND (a.f=1 OR a.g=1)'],
            ['a.x[(b=1 OR c[d=1 AND e=1]) AND (f=1 OR g=1)]', '(a.x.b=1 OR a.x.c.d=1 AND a.x.c.e=1) AND (a.x.f=1 OR a.x.g=1)'],

            // more complex values with operators

            ['a[b=1,2]', 'a.b=1,2'],
            ['a[b=1;2]', 'a.b=1;2'],
            ['a[b!=1]', 'a.b!=1'],
            ['a[b>1]', 'a.b>1'],
            ['a[b<1]', 'a.b<1'],
            ['a[b>=1]', 'a.b>=1'],
            ['a[b<=1]', 'a.b<=1'],

            ['a.x[(b=1 OR c[d=1,2 AND e=1]) AND (f=1,2 OR g=1)]', '(a.x.b=1 OR a.x.c.d=1,2 AND a.x.c.e=1) AND (a.x.f=1,2 OR a.x.g=1)'],
            ['a.x[(b=1 OR c[d=1;2 AND e=1]) AND (f=1;2 OR g=1)]', '(a.x.b=1 OR a.x.c.d=1;2 AND a.x.c.e=1) AND (a.x.f=1;2 OR a.x.g=1)'],
            ['a.x[(b=1 OR c[d!=1 AND e=1]) AND (f!=1 OR g=1)]', '(a.x.b=1 OR a.x.c.d!=1 AND a.x.c.e=1) AND (a.x.f!=1 OR a.x.g=1)'],
            ['a.x[(b=1 OR c[d>1 AND e=1]) AND (f>1 OR g=1)]', '(a.x.b=1 OR a.x.c.d>1 AND a.x.c.e=1) AND (a.x.f>1 OR a.x.g=1)'],
            ['a.x[(b=1 OR c[d<1 AND e=1]) AND (f<1 OR g=1)]', '(a.x.b=1 OR a.x.c.d<1 AND a.x.c.e=1) AND (a.x.f<1 OR a.x.g=1)'],
            ['a.x[(b=1 OR c[d>=1 AND e=1]) AND (f>=1 OR g=1)]', '(a.x.b=1 OR a.x.c.d>=1 AND a.x.c.e=1) AND (a.x.f>=1 OR a.x.g=1)'],
            ['a.x[(b=1 OR c[d<=1 AND e=1]) AND (f<=1 OR g=1)]', '(a.x.b=1 OR a.x.c.d<=1 AND a.x.c.e=1) AND (a.x.f<=1 OR a.x.g=1)'],

            // more complex attribute names

            ['a_0[b_0=1]', 'a_0.b_0=1'],
            ['a_0.b_0[c_0=1]', 'a_0.b_0.c_0=1'],
            ['a_0[b_0[c_0=1]]', 'a_0.b_0.c_0=1'],
            ['a_0[b_0[c_0=1,2]]', 'a_0.b_0.c_0=1,2'],
            ['aA.Xx[(b_=1 OR c0[d_0=1,2 AND e=1]) AND (f=1;5 OR g=1)]', '(aA.Xx.b_=1 OR aA.Xx.c0.d_0=1,2 AND aA.Xx.c0.e=1) AND (aA.Xx.f=1;5 OR aA.Xx.g=1)']
        ]],
        fails = [
            ['0[0=1]',              '0.0=1'],
            ['0_0.0_0[0_0=1]',      '0_0.0_0.0_0=1']
        ];

    function factory(config, term, res) {
        return function() {
            assert.equal(clearSubtypes(config, term), res);  
        }
    }

    for (j=0, lj=configs.length; j<lj; j++) {
        for (i=0, l=terms[j].length; i<l; i++) {
            it('should expand set #'+(i+1)+' with alerting config', factory(configs[j], terms[j][i][0], terms[j][i][1]));
        }
    }
});
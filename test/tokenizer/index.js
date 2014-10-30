var assert = require('assert'),
    config = require('../../config'),
    fn = require('../../tokenizer');

describe('tokenizer()', function() {
    var i, l,
        tests = [
            // basic
            
            ['a=1',                                 'e0'],
            ['a=1*b=1',                             'e0*e1'],
            ['a=1*b=1*c=1',                         'e0*e1*e2'],
            ['a=1+b=1',                             'e0+e1'],
            ['a=1+b=1+c=1',                         'e0+e1+e2'],
            ['a=1+b=1*c=1',                         'e0+e1*e2'],
            ['a=1*b=1+c=1',                         'e0*e1+e2'],
            
            // complex values and operators

            ['a=1*b=0',                             'e0*e1'],
            ['a=0*b=1000',                          'e0*e1'],
            ['a=1000*b=1,2',                        'e0*e1'],
            ['a=1,2*b=1;2',                         'e0*e1'],
            ['a=1;2*b=1.2',                         'e0*e1'],
            ['a=1.2*b=true',                        'e0*e1'],
            ['a=true*b=false',                      'e0*e1'],
            ['a=false*b=null',                      'e0*e1'],
            ['a=null*b=undefined',                  'e0*e1'],
            ['a=undefined*b="hello world"',         'e0*e1'],
            ['a="hello world"*b="hällö wôrld"',     'e0*e1'],
            ['a="hällö wôrld"*b="\\")(()][[].,"',   'e0*e1'],
            
            // round brackets
            
            ['(b=1)',                               '(e0)'],
            ['((b=1))',                             '((e0))'],
            ['(((b=1)))',                           '(((e0)))'],
            ['a=1*(b=1)',                           'e0*(e1)'],
            ['(a=1)*b=1',                           '(e0)*e1'],
            ['(a=1*b=1)',                           '(e0*e1)'],
            ['(a=1*b=1)*c=1',                       '(e0*e1)*e2'],
            ['(a=1*b=1)*(c=1*d=1)',                 '(e0*e1)*(e2*e3)'],
            ['(a=1*b=1*(c=1*d=1))',                 '(e0*e1*(e2*e3))'],
            ['((a=1*b=1)*c=1*d=1)',                 '((e0*e1)*e2*e3)'],
            ['((a=1*b=1)*(c=1*d=1))',               '((e0*e1)*(e2*e3))'],
            ['((a=1*b=1)*(c=1*d=1)*(c=1*d=1))',     '((e0*e1)*(e2*e3)*(e4*e5))'],
            
            // square brackets
            
            ['a[b=1]',                              'e0[e1]'],
            ['a[b[c=1]]',                           'e0[e1[e2]]'],
            ['a[b=1*c=1]',                          'e0[e1*e2]'],
            ['a[b=1*c=1*d=1]',                      'e0[e1*e2*e3]'],
            ['a[b]=1',                              'e0[e1]e2'],
            ['a[b*c]=1',                            'e0[e1*e2]e3'],
            ['a[b]c=1',                             'e0[e1]e2'],
            ['a[b*c]d=1',                           'e0[e1*e2]e3'],
            ['a[b][c]=1',                           'e0[e1][e2]e3'],
            ['a[b][c]d=1',                          'e0[e1][e2]e3'],
            ['a[b*c][d]e=1',                        'e0[e1*e2][e3]e4'],
            ['a[b][d*e]f=1',                        'e0[e1][e2*e3]e4'],
            ['a[b*c][d*e]f=1',                      'e0[e1*e2][e3*e4]e5'],
            ['a[b][c][d]=1',                        'e0[e1][e2][e3]e4'],
            ['a[b][c][d]e=1',                       'e0[e1][e2][e3]e4'],
            
            // round and square brackets
            
            ['a[(b=1)]',                            'e0[(e1)]'],
            ['a[(b=1)][(c=1)]',                     'e0[(e1)][(e2)]'],
            ['a[(b=1)][(c=1)][(d=1)]',              'e0[(e1)][(e2)][(e3)]'],
            ['a[(b=1*c=1)][(d=1)]',                 'e0[(e1*e2)][(e3)]'],
            ['a[(b=1)][(c=1*d=1)]',                 'e0[(e1)][(e2*e3)]'],
            ['a=1*(b[(c=1)][(d=1*e=1)]+f=1)*g=1',   'e0*(e1[(e2)][(e3*e4)]+e5)*e6'],
            
            // all the things!
            
            ['a=1*(b[(c=1)][(d="\\")(()][[].,"*e=1)]+f!=1)*g=1', 'e0*(e1[(e2)][(e3*e4)]+e5)*e6']
        ],
        alternative = [
            ['a=1 AND b=1 OR c=1',                                              'e0 AND e1 OR e2'],
            ['a=1 AND (b[(c=1)][(d="\\")(()][[].," AND e=1)] OR f!=1) AND g=1', 'e0 AND (e1[(e2)][(e3 AND e4)] OR e5) AND e6']
        ],
        fails = [
            ['(a)b',            2211],
            ['([a])b',          2211],
            ['(a AND b)c',      2211],
            ['a(b)',            2211],
            ['a([b])',          2211],
            ['a(b AND c)',      2211],
            ['a=s"',            2212],
            ['a="s',            2213],
            ['a=s',             2214]
        ];

    function factory(config, input, output) {
        return function() {
            assert.equal(fn(config)([input, {}])[0], output);  
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should tokenize '+tests[i][0], factory(
            config(),
            tests[i][0], 
            tests[i][1]
        ));
    }
    for (i=0, l=alternative.length; i<l; i++) {
        it('should tokenize '+alternative[i][0], factory(
            config('api'),
            alternative[i][0],
            alternative[i][1]
        ));
    }

    function failFactory(config, input, code) {
        return function() {
            try {
                fn(config)([input, {}]);
            } catch(e) {
                assert.equal(e.code, code);
                return;
            }

            throw new Error('Test failed, error not thrown');
        }
    }

    for (i=0, l=fails.length; i<l; i++) {
        it('should throw error '+fails[i][0], failFactory(
            config('api'),
            fails[i][0],
            fails[i][1]
        ));
    }
});




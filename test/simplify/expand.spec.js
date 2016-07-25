var assert = require('assert'),
    config = require('../../config'),
    fn = require('../../simplify/expand');

describe('simplify/expand()', function() {
    var i, l,
        tests = [
            [['e', 'a'],                            'e*a'],
            [['eee', 'aaa'],                        'eee*aaa'],
            [['aaa', 'eee', true],                  'eee*aaa'],
            [['e', 'a+b'],                          'e*a+e*b'],
            [['eee', 'aaa+bbb'],                    'eee*aaa+eee*bbb'],
            [['aaa+bbb', 'eee', true],              'eee*aaa+eee*bbb'],
            [['a+b', 'e'],                          'a*e+b*e'],
            [['aaa+bbb', 'eee'],                    'aaa*eee+bbb*eee'],
            [['eee', 'aaa+bbb', true],              'aaa*eee+bbb*eee'],
            [['e', 'a*b'],                          'e*a*b'],
            [['eee', 'aaa*bbb'],                    'eee*aaa*bbb'],
            [['aaa*bbb', 'eee', true],              'eee*aaa*bbb'],
            [['a*b', 'e'],                          'a*b*e'],
            [['aaa*bbb', 'eee'],                    'aaa*bbb*eee'],
            [['eee', 'aaa*bbb', true],              'aaa*bbb*eee'],
            [['e*f', 'a*b'],                        'e*f*a*b'],
            [['eee*fff', 'aaa*bbb'],                'eee*fff*aaa*bbb'],
            [['aaa*bbb', 'eee*fff', true],          'eee*fff*aaa*bbb'],
            [['e+f', 'a+b'],                        'e*a+e*b+f*a+f*b'],
            [['eee+fff', 'aaa+bbb'],                'eee*aaa+eee*bbb+fff*aaa+fff*bbb'],
            [['aaa+bbb', 'eee+fff', true],          'eee*aaa+eee*bbb+fff*aaa+fff*bbb'],
            [['e*f', 'a+b'],                        'e*f*a+e*f*b'],
            [['eee*fff', 'aaa+bbb'],                'eee*fff*aaa+eee*fff*bbb'],
            [['aaa+bbb', 'eee*fff', true],          'eee*fff*aaa+eee*fff*bbb'],
            [['e+f', 'a*b'],                        'e*a*b+f*a*b'],
            [['eee+fff', 'aaa*bbb'],                'eee*aaa*bbb+fff*aaa*bbb'],
            [['aaa*bbb', 'eee+fff', true],          'eee*aaa*bbb+fff*aaa*bbb'],
            [['e*f+g', 'a*b+c'],                    'e*f*a*b+e*f*c+g*a*b+g*c'],
            [['eee*fff+ggg', 'aaa*bbb+ccc'],        'eee*fff*aaa*bbb+eee*fff*ccc+ggg*aaa*bbb+ggg*ccc'],
            [['aaa*bbb+ccc', 'eee*fff+ggg', true],  'eee*fff*aaa*bbb+eee*fff*ccc+ggg*aaa*bbb+ggg*ccc'],
            [['(a+b)', 'e+f'],                      '(a+b)*e+(a+b)*f'],
            [['a+b', '(e+f)'],                      'a*(e+f)+b*(e+f)'],
            [['(a+b)', '(e+f)'],                    '(a+b)*(e+f)'],
            [['(a+b)*(c+d)', 'e+f'],                '(a+b)*(c+d)*e+(a+b)*(c+d)*f'],
            [['(a+b)*(c+d)', '(e+f)'],              '(a+b)*(c+d)*(e+f)'],
            [['e+f', '(a+b)*(c+d)'],                'e*(a+b)*(c+d)+f*(a+b)*(c+d)'],
            [['(e+f)', '(a+b)*(c+d)'],              '(e+f)*(a+b)*(c+d)'],
            [['(e+f)*(g+h)', '(a+b)*(c+d)'],        '(e+f)*(g+h)*(a+b)*(c+d)'],
            [['(e+f)+(g+h)', '(a+b)+(c+d)'],        '(e+f)*(a+b)+(e+f)*(c+d)+(g+h)*(a+b)+(g+h)*(c+d)'],
            [['(e+f)*(g+h)', '(a+b)+(c+d)'],        '(e+f)*(g+h)*(a+b)+(e+f)*(g+h)*(c+d)'],
            [['(e+f)+(g+h)', '(a+b)*(c+d)'],        '(e+f)*(a+b)*(c+d)+(g+h)*(a+b)*(c+d)'],
            [['e1+e2', 'e3~e4*e3~e5'],              'e1*e3~e4*e3~e5+e2*e3~e4*e3~e5'],
            [['e3~e4*e3~e5', 'e1+e2', true],        'e1*e3~e4*e3~e5+e2*e3~e4*e3~e5']
        ];

    function factory(config, input, output) {
        return function() {
            assert.equal(fn(config).apply(this, input), output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should expand '+tests[i][0].join(', '), factory(
            config(),
            tests[i][0],
            tests[i][1]
        ));
    }
});
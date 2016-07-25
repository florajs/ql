var assert = require('assert'),
    config = require('../../config'),
    fn = require('../../simplify/relate');

describe('simplify/relate()', function() {
    var i, l,
        tests = [
            [['e', 'a'],                            'e~a'],
            [['eee', 'aaa'],                        'eee~aaa'],
            [['aaa', 'eee', true],                  'eee~aaa'],
            [['e', 'a+b'],                          'e~a+e~b'],
            [['eee', 'aaa+bbb'],                    'eee~aaa+eee~bbb'],
            [['aaa+bbb', 'eee', true],              'eee~aaa+eee~bbb'],
            [['a+b', 'e'],                          'a~e+b~e'],
            [['aaa+bbb', 'eee'],                    'aaa~eee+bbb~eee'],
            [['eee', 'aaa+bbb', true],              'aaa~eee+bbb~eee'],
            [['e', 'a*b'],                          'e~a*e~b'],
            [['eee', 'aaa*bbb'],                    'eee~aaa*eee~bbb'],
            [['aaa*bbb', 'eee', true],              'eee~aaa*eee~bbb'],
            [['a*b', 'e'],                          'a~e*b~e'],
            [['aaa*bbb', 'eee'],                    'aaa~eee*bbb~eee'],
            [['eee', 'aaa*bbb', true],              'aaa~eee*bbb~eee'],
            [['e*f', 'a*b'],                        'e~a*e~b*f~a*f~b'],
            [['eee*fff', 'aaa*bbb'],                'eee~aaa*eee~bbb*fff~aaa*fff~bbb'],
            [['aaa*bbb', 'eee*fff', true],          'eee~aaa*eee~bbb*fff~aaa*fff~bbb'],
            [['e+f', 'a+b'],                        'e~a+e~b+f~a+f~b'],
            [['eee+fff', 'aaa+bbb'],                'eee~aaa+eee~bbb+fff~aaa+fff~bbb'],
            [['aaa+bbb', 'eee+fff', true],          'eee~aaa+eee~bbb+fff~aaa+fff~bbb'],
            [['e*f', 'a+b'],                        'e~a*f~a+e~b*f~b'],
            [['eee*fff', 'aaa+bbb'],                'eee~aaa*fff~aaa+eee~bbb*fff~bbb'],
            [['aaa+bbb', 'eee*fff', true],          'eee~aaa*fff~aaa+eee~bbb*fff~bbb'],
            [['e+f', 'a*b'],                        'e~a*e~b+f~a*f~b'],
            [['eee+fff', 'aaa*bbb'],                'eee~aaa*eee~bbb+fff~aaa*fff~bbb'],
            [['aaa*bbb', 'eee+fff', true],          'eee~aaa*eee~bbb+fff~aaa*fff~bbb'],
            [['e*f+g', 'a*b+c'],                    'e~a*e~b*f~a*f~b+e~c*f~c+g~a*g~b+g~c'],
            [['eee*fff+ggg', 'aaa*bbb+ccc'],        'eee~aaa*eee~bbb*fff~aaa*fff~bbb+eee~ccc*fff~ccc+ggg~aaa*ggg~bbb+ggg~ccc'],
            [['aaa*bbb+ccc', 'eee*fff+ggg', true],  'eee~aaa*eee~bbb*fff~aaa*fff~bbb+eee~ccc*fff~ccc+ggg~aaa*ggg~bbb+ggg~ccc'],
            [['(a+b)', 'e+f'],                      'a~e+a~f+b~e+b~f'],
            [['a+b', '(e+f)'],                      'a~e+a~f+b~e+b~f'],
            [['(a+b)', '(e+f)'],                    'a~e+a~f+b~e+b~f'],
            [['(a+b)*(c+d)', 'e+f'],                '(a+b)~e*(c+d)~e+(a+b)~f*(c+d)~f'],
            [['(a+b)*(c+d)', '(e+f)'],              '(a+b)~e*(c+d)~e+(a+b)~f*(c+d)~f'],
            [['e+f', '(a+b)*(c+d)'],                'e~(a+b)*e~(c+d)+f~(a+b)*f~(c+d)'],
            [['(e+f)', '(a+b)*(c+d)'],              'e~(a+b)*e~(c+d)+f~(a+b)*f~(c+d)'],
            [['(e+f)*(g+h)', '(a+b)*(c+d)'],        '(e+f)~(a+b)*(e+f)~(c+d)*(g+h)~(a+b)*(g+h)~(c+d)'],
            [['(e+f)+(g+h)', '(a+b)+(c+d)'],        '(e+f)~(a+b)+(e+f)~(c+d)+(g+h)~(a+b)+(g+h)~(c+d)'],
            [['(e+f)*(g+h)', '(a+b)+(c+d)'],        '(e+f)~(a+b)*(g+h)~(a+b)+(e+f)~(c+d)*(g+h)~(c+d)'],
            [['(e+f)+(g+h)', '(a+b)*(c+d)'],        '(e+f)~(a+b)*(e+f)~(c+d)+(g+h)~(a+b)*(g+h)~(c+d)']
        ];

    function factory(config, input, output) {
        return function() {
            assert.equal(fn(config).apply(this, input), output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should relate '+tests[i][0].join(', '), factory(
            config(),
            tests[i][0],
            tests[i][1]
        ));
    }
});
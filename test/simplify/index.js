var assert = require('assert'),
    config = require('../../config'),
    fn = require('../../simplify')(config({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    }));

describe('simplify()', function() {
    var i, l,
        tests = [
            // clear brackets
            
            [['e1'],                                            'e1'],
            [['(e1)'],                                          'e1'],
            [['(e1+e2)'],                                       'e1+e2'],
            [['e0+(e1+e2)'],                                    'e0+e1+e2'],
            [['(e0+e1)+e2'],                                    'e0+e1+e2'],
            [['e0+(e1*e2)'],                                    'e0+e1*e2'],
            [['(e0*e1)+e2'],                                    'e0*e1+e2'],
            [['(e0+e1)+(e2+e3)'],                               'e0+e1+e2+e3'],
            [['(e0*e1)+(e2*e3)'],                               'e0*e1+e2*e3'],
            [['(e0*e1)+(e2*e3)+(e4*e5)'],                       'e0*e1+e2*e3+e4*e5'],
            
            [['((e0*e1))'],                                     'e0*e1'],
            [['(((e0*e1)))'],                                   'e0*e1'],
            [['((e0*e1)+(e2*e3))'],                             'e0*e1+e2*e3'],
            [['((e0*e1)+((e2*e3)))'],                           'e0*e1+e2*e3'],
            [['(((e0*e1))+(e2*e3))'],                           'e0*e1+e2*e3'],
            [['((e0*e1)+(e2*e3))+((e4*e5)+(e6*e7))'],           'e0*e1+e2*e3+e4*e5+e6*e7'],
            
            // expand simple terms
            
            [['e0*(e1*e2)'],                                    'e0*e1*e2'],
            [['(e0*e1)*e2'],                                    'e0*e1*e2'],
            [['e0*(e1+e2)'],                                    'e0*e1+e0*e2'],
            [['(e0+e1)*e2'],                                    'e0*e2+e1*e2'],
            
            // expand both sides

            [['e0*(e1+e2)*e3'],                                 'e0*e1*e3+e0*e2*e3'],
            [['e0*(e1+e2)+e3'],                                 'e0*e1+e0*e2+e3'],
            [['e0+(e1+e2)*e3'],                                 'e0+e1*e3+e2*e3'],
            
            // expand between multiple brackets

            [['(e0+e1)*(e2+e3)'],                               'e0*e2+e0*e3+e1*e2+e1*e3'],
            [['(e0+e1)*(e2+e3)*(e4+e5)'],                       'e0*e2*e4+e0*e2*e5+e0*e3*e4+e0*e3*e5+' +
                                                                            'e1*e2*e4+e1*e2*e5+e1*e3*e4+e1*e3*e5'],
            
            // multiple brackets, respect clearing order

            [['(e2*e3)*((e8*e9)+(e11*e12))'],                   'e2*e3*e8*e9+e2*e3*e11*e12'],
            [['((e2*e3)+(e5*e6))*(e8*e9)'],                     'e2*e3*e8*e9+e5*e6*e8*e9'],
            [['((e2*e3)+(e5*e6))*((e8*e9)+(e11*e12))'],         'e2*e3*e8*e9+e2*e3*e11*e12+' +
                                                                'e5*e6*e8*e9+e5*e6*e11*e12'],
            [['((e2*e3)+(e5*e6))*((e8*e9+e13)+(e11*e12))'],     'e2*e3*e8*e9+e2*e3*e13+e2*e3*e11*e12+' +
                                                                'e5*e6*e8*e9+e5*e6*e13+e5*e6*e11*e12'],
            [['((e2*e3)+(e5*e6))*((e8*e9+e13)+((e11*e12)))'],   'e2*e3*e8*e9+e2*e3*e13+e2*e3*e11*e12+' +
                                                                'e5*e6*e8*e9+e5*e6*e13+e5*e6*e11*e12'],
            [['(((e2*e3))+(e5*e6))*((e8*e9+e13)+(e11*e12))'],   'e2*e3*e8*e9+e2*e3*e13+e2*e3*e11*e12+' +
                                                                'e5*e6*e8*e9+e5*e6*e13+e5*e6*e11*e12'],
            
            // relate operator
            
            [['e0~e1*e2~e3'],                                   'e0~e1*e2~e3'],
            [['e0*(e1~e2)'],                                    'e0*e1~e2'],
            [['(e0~e1)*e2'],                                    'e0~e1*e2'],
            [['(e0~e1)*(e2~e3)'],                               'e0~e1*e2~e3'],
        ],
        fails = [
            ['a*()',                             'a'],
            ['a+()',                             'a'],
            ['()*a',                             'a'],
            ['()+a',                             'a'],
            ['()*a*()',                          'a'],
            ['()+a+()',                          'a'],
            ['a+()+b',                           'a+b'],
            ['a*()*b',                           'a*b']
        ];
    

    function factory(input, output) {
        return function() {
            assert.equal(fn.apply(this, [input])[0], output);
        }
    }

    for (i=0, l=tests.length; i<l; i++) {
        it('should simplify '+tests[i][0], factory(
            tests[i][0], 
            tests[i][1]
        ));
    }
});
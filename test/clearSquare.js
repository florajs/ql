var assert = require('assert'),
    config = require('../config'),
    clearSquare = require('../clearSquare');

describe('clearSquare()', function() {
    var i, l, 
        terms = [
            // basic
            
            ['e0[e1]',                      'e1'],
            ['e0[e1[e2]]',                  'e2'],

            // replace with round brackets
            
            ['e1[e2*e3]', '(e2*e3)'],
            ['e1[e2+e3]', '(e2+e3)'],
            
            // AND and OR Connections
            
            ['e0*e1[e2]',                   'e0*e2'],
            ['e0[e1]*e2',                   'e1*e2'],
            ['e0[e1*e2*e3]',                '(e1*e2*e3)'],
            ['e0[e1*e2[e3]]',               '(e1*e3)'],
            ['e0[e1[e2]*e3]',               '(e2*e3)'],
            ['e0[e1*e2[e3*e4]]',            '(e1*(e3*e4))'],
            ['e0[e1[e2*e3]*e4]',            '((e2*e3)*e4)'],
            ['e0[e1*e2[e3*e4]*e5]',         '(e1*(e3*e4)*e5)'],
            ['e0[e1*e2[e3*e4]*e5]*e6',      '(e1*(e3*e4)*e5)*e6'],
            ['e0*e1[e2*e3[e4*e5]*e6]',      'e0*(e2*(e4*e5)*e6)'],
            ['e0*e1[e2*e3[e4*e5]*e6]*e7',   'e0*(e2*(e4*e5)*e6)*e7'],

            ['e0+e1[e2]',                   'e0+e2'],
            ['e0[e1]+e2',                   'e1+e2'],
            ['e0[e1+e2+e3]',                '(e1+e2+e3)'],
            ['e0[e1+e2[e3]]',               '(e1+e3)'],
            ['e0[e1[e2]+e3]',               '(e2+e3)'],
            ['e0[e1+e2[e3+e4]]',            '(e1+(e3+e4))'],
            ['e0[e1[e2+e3]+e4]',            '((e2+e3)+e4)'],
            ['e0[e1+e2[e3+e4]+e5]',         '(e1+(e3+e4)+e5)'],
            ['e0[e1+e2[e3+e4]+e5]+e6',      '(e1+(e3+e4)+e5)+e6'],
            ['e0+e1[e2+e3[e4+e5]+e6]',      'e0+(e2+(e4+e5)+e6)'],
            ['e0+e1[e2+e3[e4+e5]+e6]+e7',   'e0+(e2+(e4+e5)+e6)+e7'],
            
            // support for wild, round brackets
            
            ['e0[(e1+e2)*e3]',                                      '((e1+e2)*e3)'],
            ['e0[e1*(e2+e3)]',                                      '(e1*(e2+e3))'],
            ['e0[(e1+e2)*(e3+e4)]',                                 '((e1+e2)*(e3+e4))'],
            ['e0[(e1[e2*e3]+e4)*(e5+e6)]',                          '(((e2*e3)+e4)*(e5+e6))'],
            ['e0[(e1+e2[e3*e4])*(e5+e6)]',                          '((e1+(e3*e4))*(e5+e6))'],
            ['e0[(e1+e2)*(e3[e4*e5]+e6)]',                          '((e1+e2)*((e4*e5)+e6))'],
            ['e0[(e1+e2)*(e3+e4[e5*e6])]',                          '((e1+e2)*(e3+(e5*e6)))'],
            ['e0[(e1[e2*e3]+e4[e5*e6])*(e7[e8*e9]+e10[e11*e12])]',  '(((e2*e3)+(e5*e6))*((e8*e9)+(e11*e12)))'],
            ['e0[(e1+e2)*(e3+e4)*(e5+e6)]',                         '((e1+e2)*(e3+e4)*(e5+e6))'],
            
            // square brackets between attributes
            
            //['e0[e1]e2', 'e1']
            //['e0[e1][e2]', 'e2']
            //['e0[e1][e2]e3', 'e2']
            //['e0[e1][e2][e3]e4', 'e3']
            //['e0[e1*e2]e3', '(e1*e2)']
            //['e0[e1*e2][e3*e4]', '(e1*e2)(e3*e4)']
            
            //['e0[e1+e2][e3*e4]', 'e0[e1[e3*e4]+e2[e3*e4]]', 'e0[(e3*e4)+(e3*e4)]', '((e3*e4)+(e3*e4))']
            //['e0*[e1+e2][e3*e4]', 'e0[e1[e3*e4]+e2[e3*e4]]', 'e0[(e3*e4)+(e3*e4)]', '((e3*e4)+(e3*e4))']
            //['e0[e1+e2][e3*e4]', 'e0[e1][e3*e4]+e0[e2][e3*e4]']
            
            //['e0[e1*e2+e3*e4][e3*e4]', 'e0[e1][e3*e4]+e0[e2][e3*e4]']
        ],
        fails = [
            ['0[0=1]',              '0.0=1'],
            ['0_0.0_0[0_0=1]',      '0_0.0_0.0_0=1']
        ];

    function factory(term, res) {
        return function() {
            assert.equal(clearSquare(config(), [term, {}])[0], res);  
        }
    }

    for (i=0, l=terms.length; i<l; i++) {
        it('should clear square brackets from set #'+(i+1), factory(terms[i][0], terms[i][1]));
    }
});




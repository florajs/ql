var assert = require('assert'),
    simplify = require('../libs/simplify');

describe('simplify()', function() {
    var terms, i, l;

    terms = [
        ['a*()',                             'a'],
        ['a+()',                             'a'],
        ['()*a',                             'a'],
        ['()+a',                             'a'],
        ['()*a*()',                          'a'],
        ['()+a+()',                          'a'],

        ['a*(b+c)',                          'a*b+a*c'],
        ['(b+c)*a',                          'b*a+c*a'],
        ['a*(b+c)*d',                        'a*b*d+a*c*d'],
        ['a*(b+c)+d',                        'a*b+a*c+d'],
        ['a+(b+c)*d',                        'a+b*d+c*d'],

        ['a*b+c*(d+e*f)',                    'a*b+c*d+c*e*f'],
        ['a*b*(c*d*e*(f+g))',                'a*b*c*d*e*f+a*b*c*d*e*g'],
        ['a*b*(c*d*e+c*d*g)',                'a*b*c*d*e+a*b*c*d*g'],
        ['a*(b+c+d*e)',                      'a*b+a*c+a*d*e'],
        ['a*b*(c+d)*(e)',                    'a*b*c*e+a*b*d*e'],
        ['(a+b+c)*(d+e+f)',                  'a*d+a*e+a*f+b*d+b*e+b*f+c*d+c*e+c*f'],
        ['(a)*b+(c*d*(e*f+g)+h*(i+j))*k',    'a*b+c*d*e*f*k+c*d*g*k+h*i*k+h*j*k'],
        ['(a)*(b+c)*(d*e)*(f+g)',            'a*b*d*e*f+a*b*d*e*g+a*c*d*e*f+a*c*d*e*g'],
        ['(e1)*(e2+e3)*(e4*e5)*(e6+e7)',     'e1*e2*e4*e5*e6+e1*e2*e4*e5*e7+e1*e3*e4*e5*e6+e1*e3*e4*e5*e7'],
        
        ['e1&e2|e3|(e4&e5&e6)',              'e1*e2+e3+e4*e5*e6']
    ];

    function factory(term, ex) {
        return function() {
            var res = simplify(term);
            assert(res === ex, 'Input: '+term+'  Result: '+res+'  Expected: '+ex);
        }
    }

    for (i=0, l=terms.length; i<l; i++) {
        it('should simplify term #'+(i+1), factory(terms[i][0], terms[i][1]));
    }
});
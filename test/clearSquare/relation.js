var assert = require('assert'),
    fn = require('../../clearSquare/relation')({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    });

describe('clearSquare/relation()', function() {
    var i, l, 
        terms = [
            // basic
            
            [['e0', 'e1'],                        'e0~e1'],
            [['e0', 'e1+e2'],                     'e0~e1+e0~e2'],
            [['e0', 'e1*e2'],                     'e0~e1*e0~e2'],
            [['e0', 'e1+e2*e3'],                  'e0~e1+e0~e2*e0~e3'],
            [['e0', 'e1*e2+e3'],                  'e0~e1*e0~e2+e0~e3'],
            [['e0+e1', 'e2'],                     'e0~e2+e1~e2'],
            [['e0*e1', 'e2'],                     'e0~e2*e1~e2'],
            [['e0+e1*e2', 'e3'],                  'e0~e3+e1~e3*e2~e3'],
            [['e0*e1+e2', 'e3'],                  'e0~e3*e1~e3+e2~e3'],
            
            // double terms
            
            [['e0*e1', 'e2*e3'],                  'e0~e2*e0~e3*e1~e2*e1~e3'],
            [['e0+e1', 'e2+e3'],                  'e0~e2+e0~e3+e1~e2+e1~e3'],
            [['e0*e1', 'e2+e3'],                  'e0~e2*e1~e2+e0~e3*e1~e3'],
            [['e0+e1', 'e2*e3'],                  'e0~e2*e0~e3+e1~e2*e1~e3'],
            
            // multiple terms
            
            [['e0+e1*e2', 'e3*e4'],               'e0~e3*e0~e4+e1~e3*e1~e4*e2~e3*e2~e4'],
            [['e0*e1+e2', 'e3*e4'],               'e0~e3*e0~e4*e1~e3*e1~e4+e2~e3*e2~e4'],
            [['e0+e1*e2', 'e3+e4'],               'e0~e3+e0~e4+e1~e3*e2~e3+e1~e4*e2~e4'],
            [['e0*e1+e2', 'e3+e4'],               'e0~e3*e1~e3+e0~e4*e1~e4+e2~e3+e2~e4'],
            [['e0*e1', 'e2+e3*e4'],               'e0~e2*e1~e2+e0~e3*e0~e4*e1~e3*e1~e4'],
            [['e0*e1', 'e2*e3+e4'],               'e0~e2*e0~e3*e1~e2*e1~e3+e0~e4*e1~e4'],
            [['e0+e1', 'e2+e3*e4'],               'e0~e2+e0~e3*e0~e4+e1~e2+e1~e3*e1~e4'],
            [['e0+e1', 'e2*e3+e4'],               'e0~e2*e0~e3+e0~e4+e1~e2*e1~e3+e1~e4'],
            
            // more complex terms
            
            [['e0*e1*e2', 'e3*e4*e5'],            'e0~e3*e0~e4*e0~e5*' +
                                                  'e1~e3*e1~e4*e1~e5*' +
                                                  'e2~e3*e2~e4*e2~e5'],
            [['e0*e1+e2*e3', 'e4*e5+e6*e7'],      'e0~e4*e0~e5*e1~e4*e1~e5+' +
                                                  'e0~e6*e0~e7*e1~e6*e1~e7+' +
                                                  'e2~e4*e2~e5*e3~e4*e3~e5+' +
                                                  'e2~e6*e2~e7*e3~e6*e3~e7'],
            
            // recursive relation

            [['e0', 'e1~e2'],                       'e0~e1~e2'],
            [['e0', 'e1*e2~e3'],                    'e0~e1*e0~e2~e3'],
            [['e0', 'e1~e2*e3'],                    'e0~e1~e2*e0~e3'],
            [['e0', 'e1~e2*e3~e4'],                 'e0~e1~e2*e0~e3~e4'],
            [['e0~e1', 'e2~e3'],                    'e0~e1~e2~e3'],
            [['e0~e1*e2~e3', 'e4~e5*e6~e7'],        'e0~e1~e4~e5*e0~e1~e6~e7*e2~e3~e4~e5*e2~e3~e6~e7'],
            [['e0~e1+e2~e3', 'e4~e5+e6~e7'],        'e0~e1~e4~e5+e0~e1~e6~e7+e2~e3~e4~e5+e2~e3~e6~e7'],
        ],
        fails = [
        ];

    function factory(input, output) {
        return function() {
            assert.equal(fn.apply(this, input), output);
        }
    }

    for (i=0, l=terms.length; i<l; i++) {
        it('should expand relation '+terms[i][0], factory(terms[i][0], terms[i][1]));
    }
});









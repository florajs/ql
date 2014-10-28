var assert = require('assert'),
    Stmnt = require('../../tokenizer/Stmnt')({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    }),
    fn = require('../../clearSquare/resolve')({
        operators: ['=', '!=', '<', '<=', '>', '>='],
        glue: '.',
        and: '*',
        or: '+',
        relate: '~',
        lookDelimiter: '+',
        roundBracket: ['(', ')'],
        squareBracket: ['[', ']']
    });

describe('clearSquare/resolve()', function() {
    var i, l, 
        terms = [
            // basic
            
            [['e0~e1',      {e0: new Stmnt('a'),
                             e1: new Stmnt('b>1')}],        ['e0_1',    {e0_1: 'a.b>1'}]],
            [['e00~e11',    {e00: new Stmnt('aaa'),
                             e11: new Stmnt('bbb>1')}],     ['e00_11',  {e00_11: 'aaa.bbb>1'}]],
            [['e0~e1~e2',   {e0: new Stmnt('a'),
                             e1: new Stmnt('b'),
                             e2: new Stmnt('c>1')}],        ['e0_1_2',  {e0_1_2: 'a.b.c>1'}]],
        ],
        fails = [
        ];

    function factory(input, output) {
        return function() {
            var e, res = fn(input);
            
            console.log(">", res);
            
            assert.equal(res[0], output[0]);
            for (e in output[1]) {
                if (!output[1].hasOwnProperty(e)) { continue; }
                assert.equal(res[1][e], output[1][e]);
            }
        }
    }

    for (i=0, l=terms.length; i<l; i++) {
        it('should resolve relations from '+terms[i][0][0], factory(terms[i][0], terms[i][1]));
    }
});




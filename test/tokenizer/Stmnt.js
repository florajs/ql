var assert = require('assert'),
    config = require('../../config'),
    Stmnt = require('../../tokenizer/Stmnt')(config());

describe('tokenizer/Stmnt()', function() {
    var i, l, stmnt,
        tests = [
            [['a', '=', '1'],                 { attribute: 'a', operator: '=', value: 1, serialized: 'a=1'}                               ],
            [['a', '=', '"b=1"'],             { attribute: 'a', operator: '=', value: 'b=1', serialized: 'a="b=1"'}                       ],
            [['aaa', '>=', '100'],            { attribute: 'aaa', operator: '>=', value: 100, serialized: 'aaa>=100'}                     ],
            [['aaa', '=', 'true'],            { attribute: 'aaa', operator: '=', value: true, serialized: 'aaa=true'}                     ],
            [['aaa', '=', 'false'],           { attribute: 'aaa', operator: '=', value: false, serialized: 'aaa=false'}                   ],
            [['a0', '<=', '"hällö wôrld"'],   { attribute: 'a0', operator: '<=', value: "hällö wôrld", serialized: 'a0<="hällö wôrld"'}   ],
            [['a0', '<=', '"\\")(()][[].,"'], { attribute: 'a0', operator: '<=', value: "\")(()][[].,", serialized: 'a0<="\\")(()][[].,"'}]
        ];

    for (i=0, l=tests.length; i<l; i++) {
        (function(test) {
            it('should create stmnt from '+test[0], function() {
                var factory = Stmnt.bind.apply(Stmnt, [null].concat(test[0]));
                stmnt = new factory();
            });
            
            it('should have corresponding parameters', function() {
                assert.strictEqual(stmnt.attribute,   test[1].attribute);
                assert.strictEqual(stmnt.operator,    test[1].operator);
                assert.strictEqual(stmnt.value,       test[1].value);
                
            });
            
            it('should serialize to correct string', function() {
                assert.strictEqual(stmnt.toString(),  test[1].serialized);
                assert.strictEqual(stmnt.toJSON(),    test[1].serialized);
            });
            
        })(tests[i]);
    }
});
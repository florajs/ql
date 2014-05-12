var assert = require('assert');
var Aql = require('../lib/aql.js');

describe('Aql', function() {

    describe('extractExpressions()', function() {

        var alerts = [
            "quote:{133962>7000}&(quote:{133964<6500}|(quote:{1337>9000}&{12345>6789})&(topflop:{1337>9000}&quote:{12345>6789}))",
            "quote:{133962>7000}&&({133964<6500}||({1337>9000}&&{12345>6789})&&({1337>9000}&&{12345>6789}))",
            "quote:{133962>7000}&({133964<6500}|({1337>9000}&{12345>6789})&(portfolio:{1337>9000}&{12345>6789}))",
            "quote:{133962>7000}&&(quote:{133964<6500}||(portfolio:{1337>9000}&&{12345>6789})&&(topflop:{1337>9000}&&quote:{12345>6789}))",
            "quote:{133962>7000}&({133964<6500}|{1337>9000})",
            "quote.133962.4.last:{~7000}"
        ];
        var res;

        it('should replace expressions correctly', function() {
            res = Aql.extractExpressions(alerts[0]);
            assert(res[0] === 'e1&(e2|(e3&e4)&(e5&e6))', 'Unexpected result: '+res[0]);
            assert(res[1]['e1'] === 'quote:{133962>7000}', 'Unexpected result: '+res[1]['e1']);
            assert(res[1]['e2'] === 'quote:{133964<6500}', 'Unexpected result: '+res[1]['e2']);
            assert(res[1]['e3'] === 'quote:{1337>9000}', 'Unexpected result: '+res[1]['e3']);
            assert(res[1]['e4'] === '{12345>6789}', 'Unexpected result: '+res[1]['e4']);
            assert(res[1]['e5'] === 'topflop:{1337>9000}', 'Unexpected result: '+res[1]['e5']);
            assert(res[1]['e6'] === 'quote:{12345>6789}', 'Unexpected result: '+res[1]['e6']);
        });

        it('should replace expressions correctly', function() {
            res = Aql.extractExpressions(alerts[1]);
            assert(res[0] === 'e1&&(e2||(e3&&e4)&&(e5&&e6))', 'Unexpected result: '+res[0]);
            assert(res[1]['e1'] === 'quote:{133962>7000}', 'Unexpected result: '+res[1]['e1']);
            assert(res[1]['e2'] === '{133964<6500}', 'Unexpected result: '+res[1]['e2']);
            assert(res[1]['e3'] === '{1337>9000}', 'Unexpected result: '+res[1]['e3']);
            assert(res[1]['e4'] === '{12345>6789}', 'Unexpected result: '+res[1]['e4']);
            assert(res[1]['e5'] === '{1337>9000}', 'Unexpected result: '+res[1]['e5']);
            assert(res[1]['e6'] === '{12345>6789}', 'Unexpected result: '+res[1]['e6']);
        });

        it('should replace expressions correctly', function() {
            res = Aql.extractExpressions(alerts[2]);
            assert(res[0] === 'e1&(e2|(e3&e4)&(e5&e6))', 'Unexpected result: '+res[0]);
            assert(res[1]['e1'] === 'quote:{133962>7000}', 'Unexpected result: '+res[1]['e1']);
            assert(res[1]['e2'] === '{133964<6500}', 'Unexpected result: '+res[1]['e2']);
            assert(res[1]['e3'] === '{1337>9000}', 'Unexpected result: '+res[1]['e3']);
            assert(res[1]['e4'] === '{12345>6789}', 'Unexpected result: '+res[1]['e4']);
            assert(res[1]['e5'] === 'portfolio:{1337>9000}', 'Unexpected result: '+res[1]['e5']);
            assert(res[1]['e6'] === '{12345>6789}', 'Unexpected result: '+res[1]['e6']);
        });

        it('should replace expressions correctly', function() {
            res = Aql.extractExpressions(alerts[3]);
            assert(res[0] === 'e1&&(e2||(e3&&e4)&&(e5&&e6))', 'Unexpected result: '+res[0]);
            assert(res[1]['e1'] === 'quote:{133962>7000}', 'Unexpected result: '+res[1]['e1']);
            assert(res[1]['e2'] === 'quote:{133964<6500}', 'Unexpected result: '+res[1]['e2']);
            assert(res[1]['e3'] === 'portfolio:{1337>9000}', 'Unexpected result: '+res[1]['e3']);
            assert(res[1]['e4'] === '{12345>6789}', 'Unexpected result: '+res[1]['e4']);
            assert(res[1]['e5'] === 'topflop:{1337>9000}', 'Unexpected result: '+res[1]['e5']);
            assert(res[1]['e6'] === 'quote:{12345>6789}', 'Unexpected result: '+res[1]['e6']);
        });

        it('should replace expressions correctly', function() {
            res = Aql.extractExpressions(alerts[4]);
            assert(res[0] === 'e1&(e2|e3)', 'Unexpected result: '+res[0]);
            assert(res[1]['e1'] === 'quote:{133962>7000}', 'Unexpected result: '+res[1]['e1']);
            assert(res[1]['e2'] === '{133964<6500}', 'Unexpected result: '+res[1]['e2']);
            assert(res[1]['e3'] === '{1337>9000}', 'Unexpected result: '+res[1]['e3']);
        });

        it('should replace expressions correctly', function() {
            res = Aql.extractExpressions(alerts[5]);
            assert(res[0] === 'quote.133962.4.e1', 'Unexpected result: '+res[0]);
            assert(res[1]['e1'] === 'last:{~7000}', 'Unexpected result: '+res[1]['e1']);
        });
    });

    describe('simplify()', function() {
        var terms, keys, i, l, key;
        
        terms = {
            'a*(b+c)':                          ['a*b+a*c'],
            'a*b+c*(d+e*f)':                    ['a*b+c*d+c*e*f'],
            'a*b*(c*d*e*(f+g))':                ['a*b*c*d*e*f+a*b*c*d*e*g'],
            'a*b*(c*d*e+c*d*g)':                ['a*b*c*d*e+a*b*c*d*g'],
            'a*(b+c+d*e)':                      ['a*b+a*c+a*d*e'],
            'a*b*(c+d)*(e)':                    ['a*b*c*e+a*b*d*e'],
            '(a)*b+(c*d*(e*f+g)+h*(i+j))*k':    ['b*a+k*c*d*e*f+k*c*d*g+k*h*i+k*h*j'],
            '(a)*(b+c)*(d*e)*(f+g)':            ['a*b*d*e*f+a*b*d*e*g+a*c*d*e*f+a*c*d*e*g'],
            '(a)&(b|c)&(d&e)&(f|g)':            ['a&b&d&e&f|a&b&d&e&g|a&c&d&e&f|a&c&d&e&g', '|', '&'],
            'a*(b+c)*d':                        ['a*d*b+a*d*c'],
            'a&(b|c)&d':                        ['a&d&b|a&d&c', '|', '&'],
            '(a)&&(b||c)&&(d&&e)&&(f||g)':      ['a&&b&&d&&e&&f||a&&b&&d&&e&&g||a&&c&&d&&e&&f||a&&c&&d&&e&&g', '||', '&&'],
            '(a+b+c)*(d+e+f)':                  ['a*d+a*e+a*f+b*d+b*e+b*f+c*d+c*e+c*f']
        };
        keys = Object.keys(terms);
        
        function factory(term, ex, plus, mul) {
            return function() {
                var res = Aql.simplify(term, plus, mul);
                assert(res === ex, 'Input: '+term+'  Result: '+res+'  Expected: '+ex);
            }
        }
        
        for (i=0, l=keys.length; i<l; i++) {
            key = keys[i];
            it('should simplify term '+(i+1), factory(key, terms[key][0], terms[key][1], terms[key][2]));
        }
    });

    describe('setMissingTypes()', function() {

        var alerts = [
            [['e1&e2', 'e1&e3&e4&e5&e6'],{
                e1: 'quote:{133962>7000}',
                e2: 'quote:{133962>7000}',
                e3: 'quote:{133962>7000}',
                e4: '{12345>6789}',
                e5: 'topflop:{1337>9000}',
                e6: 'quote:{12345>6789}'
            }],
            [['e1&&e2', 'e1&&e3&&e4&&e5&&e6'],{
                e1: 'quote:{133962>7000}',
                e2: '{133964<6500}',
                e3: '{1337>9000}',
                e4: '{12345>6789}',
                e5: '{1337>9000}',
                e6: '{12345>6789}'
            }],
            [['e1&e2', 'e1&e3&e4&e5&e6'],{
                e1: 'quote:{133962>7000}',
                e2: '{133964<6500}',
                e3: '{1337>9000}',
                e4: '{12345>6789}',
                e5: 'portfolio:{1337>9000}',
                e6: '{12345>6789}'
            }],
            [['e1&&e2', 'e1&&e3&&e4&&e5&&e6'],{
                e1: 'quote:{133962>7000}',
                e2: 'quote:{133964<6500}',
                e3: 'portfolio:{1337>9000}',
                e4: '{12345>6789}',
                e5: 'topflop:{1337>9000}',
                e6: 'quote:{12345>6789}'
            }],
            [['e1&e2', 'e1&e3'],{
                e1: 'quote:{133962>7000}',
                e2: '{133964<6500}',
                e3: '{1337>9000}'
            }],
            [['e1&e2', 'e1&e3'],{
                e1: 'quote:{133962~7000}',
                e2: '{133964~6500}',
                e3: '{1337~9000}'
            }]
        ];
        var res;

        it('should set type smart', function() {
            res = Aql.setMissingTypes(alerts[0], '&');
            assert(res[1]['e4'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e4']+'"');
        });

        it('should set type smart', function() {
            res = Aql.setMissingTypes(alerts[1], '&&');
            assert(res[1]['e2'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e2']+'"');
            assert(res[1]['e3'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e3']+'"');
            assert(res[1]['e4'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e4']+'"');
            assert(res[1]['e5'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e5']+'"');
            assert(res[1]['e6'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e6']+'"');
        });

        it('should set type smart', function() {
            res = Aql.setMissingTypes(alerts[2], '&');
            assert(res[1]['e2'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e2']+'"');
            assert(res[1]['e3'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e3']+'"');
            assert(res[1]['e4'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e4']+'"');
            assert(res[1]['e6'].indexOf('portfolio') !== -1, 'Expected "portfolio" type: "'+res[1]['e6']+'"');
        });

        it('should set type smart', function() {
            res = Aql.setMissingTypes(alerts[3], '&&');
            assert(res[1]['e4'].indexOf('portfolio') !== -1, 'Expected "portfolio" type: "'+res[1]['e4']+'"');
        });

        it('should set type smart', function() {
            res = Aql.setMissingTypes(alerts[4], '&');
            assert(res[1]['e2'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e2']+'"');
            assert(res[1]['e3'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e3']+'"');
        });

        it('should set type smart', function() {
            res = Aql.setMissingTypes(alerts[5], '&');
            assert(res[1]['e2'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e2']+'"');
            assert(res[1]['e3'].indexOf('quote') !== -1, 'Expected "quote" type: "'+res[1]['e3']+'"');
        });
    });

    describe('checkForSyntaxErrors()', function() {

        // alerts with syntax errors
        var failerts = [
            '{133962>7000}&({133964<6500}|{1337>9000})',                            // At least one type is required
            'quote:{1339|62>7000}&({133964<6500}|{1337>9000})',                     // Invalid character
            'quote:{133962>7000}&({133964<6500}|{1337>9000}|)&({12345>6789})',      // Missing expression
            'quote:{133962>7000}&(133964<6500}|{1337~9000})&{12345>6789}',          // Missing opening tag
            'quote:{133962>7000}&({133964<6500}|{1337>9000})}',                     // Missing opening tag
            'quote:{133962>7000}&({133964~6500}|{1337>9000})&{12345>6789',          // Missing closing tag
            '(quote:{133962>7000}&({133964<6500}|{1337>9000})))',                   // Missing opening bracket
            '((quote:{133962>7000}&({133964<6500}|({1337>9000})))',                 // Missing closing bracket
            'quote:{133962>7000}&{133964<6500}|{{1337>9000}',                       // Invalid brackets
            'quote:{133962~7000}&{133964<6500}|{1337>9000}}',                       // Invalid brackets
            'status.id:5&4type.id:3',                                               // Missing logical operator
            'status.id:(-1|1|-2)&3',                                                // Type must be followed by value or expression
            'status[]&type:2',                                                      // Invalid subtyping
            'status:[]&type:2',                                                     // Invalid subtyping
            'quote:{133962:4>7000}',                                                // Invalid character in expression
            'quote:{133962%4~7000}',                                                // Invalid character in expression
            'quote:{133962$4>7000}',                                                // Invalid character in expression
            'quote:{133962&4>7000}',                                                // Invalid character in expression
            'quote:{133962\'4>7000}',                                               // Invalid character in expression
            'quote:{133962\\4>7000}',                                               // Invalid character in expression
            'quote:{133962!4>7000}',                                                // Invalid character in expression
            'quote:{133962"4~7000}',                                                // Invalid character in expression
            'quote:{133962?4>7000}',                                                // Invalid character in expression
            'quote:{133962(4~7000}',                                                // Invalid character in expression
            'quote:{133962)4~7000}',                                                // Invalid character in expression
            'quote:{133962#4>7000}',                                                // Invalid character in expression
            'quote:{133962|4~7000}',                                                // Invalid character in expression
            'quote:{133962&4>7000}',                                                // Invalid character in expression
            'quote.:{>7000}',                                                       // Invalid typing
            'quote:{>7000}',                                                        // Invalid typing
            'quote:{>7000}&.133962:{~9000}',                                        // Invalid typing
            'article.boxes:{1;}',                                                   // Invalid set expression
            'article.boxes:{;6}',                                                   // Invalid set expression
            'article.boxes:{;}',                                                    // Invalid set expression
            'instruments.id:{133954,133962~2}'                                      // Can't mix sets and operators
        ];

        it('should recognize missing type', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[0]);
            } catch(err) {
                assert(err.message.indexOf('At least one type is required') !== -1, err.message);
            }
        });

        it('should recognize invalid expression', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[1]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character') !== -1, err.message);
            }
        });

        it('should recognize missing expression', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[2]);
            } catch(err) {
                assert(err.message.indexOf('Missing expression') !== -1, err.message);
            }
        });

        it('should recognize missing opening tag', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[3]);
            } catch(err) {
                assert(err.message.indexOf('Missing opening tag') !== -1, err.message);
            }
        });

        it('should recognize missing opening tag', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[4]);
            } catch(err) {
                assert(err.message.indexOf('Missing opening tag') !== -1, err.message);
            }
        });

        it('should recognize missing closing tag', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[5]);
            } catch(err) {
                assert(err.message.indexOf('Missing closing tag') !== -1, err.message);
            }
        });

        it('should recognize missing opening bracket', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[6]);
            } catch(err) {
                assert(err.message.indexOf('Missing opening bracket') !== -1, err.message);
            }
        });

        it('should recognize missing closing bracket', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[7]);
            } catch(err) {
                assert(err.message.indexOf('Missing closing bracket') !== -1, err.message);
            }
        });

        it('should recognize invalid brackets', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[8]);
            } catch(err) {
                assert(err.message.indexOf('Invalid brackets') !== -1, err.message);
            }
        });

        it('should recognize invalid brackets', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[9]);
            } catch(err) {
                assert(err.message.indexOf('Invalid brackets') !== -1, err.message);
            }
        });

        it('should recognize missing logical operator', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[10]);
            } catch(err) {
                assert(err.message.indexOf('Missing logical operator') !== -1, err.message);
            }
        });

        it('should recognize wrong type syntax', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[11]);
            } catch(err) {
                assert(err.message.indexOf('Type must be followed by value or expression') !== -1, err.message);
            }
        });

        it('should recognize wrong type syntax', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[12]);
            } catch(err) {
                assert(err.message.indexOf('Invalid subtyping') !== -1, err.message);
            }
        });

        it('should recognize wrong type syntax', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[13]);
            } catch(err) {
                assert(err.message.indexOf('Invalid subtyping') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[14]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[15]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[16]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[17]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[18]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[19]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[20]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[21]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[22]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[23]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[24]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[25]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[26]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[27]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
            }
        });

        it('should recognize invalid typing', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[28]);
            } catch(err) {
                assert(err.message.indexOf('Invalid typing') !== -1, err.message);
            }
        });

        it('should recognize invalid typing', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[29]);
            } catch(err) {
                assert(err.message.indexOf('Invalid typing') !== -1, err.message);
            }
        });

        it('should recognize invalid typing', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[30]);
            } catch(err) {
                assert(err.message.indexOf('Invalid typing') !== -1, err.message);
            }
        });

        it('should recognize invalid set expression', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[31]);
            } catch(err) {
                assert(err.message.indexOf('Invalid set expression') !== -1, err.message);
            }
        });

        it('should recognize invalid set expression', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[32]);
            } catch(err) {
                assert(err.message.indexOf('Invalid set expression') !== -1, err.message);
            }
        });

        it('should recognize invalid set expression', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[33]);
            } catch(err) {
                assert(err.message.indexOf('Invalid set expression') !== -1, err.message);
            }
        });

        it('should recognize invalid expression', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[34]);
            } catch(err) {
                assert(err.message.indexOf('Sets and operators') !== -1, err.message);
            }
        });
    });
    
    describe('clearSubtypes()', function() {
        
        var alerts = [
            'quote.133962[4.last:{<7200}]',
            'status[id:1&type[id:2&name:abc]&power:{>9000}]',
            'chartpattern.patternData[(instrumentId:122118|instrumentId:122117|instrumentId:133978)&(patternType:2|patternType:2001|patternType:2012)]'
        ];
        var res, err;

        it('should parse alert successful', function() {
            res = Aql.clearSubtypes(alerts[0]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res === 'quote#133962#4#last:{<7200}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.clearSubtypes(alerts[1]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res === 'status#id:1&status#type#id:2&status#type#name:abc&status#power:{>9000}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.clearSubtypes(alerts[2]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res === '(chartpattern#patternData#instrumentId:122118' +
                '|chartpattern#patternData#instrumentId:122117' +
                '|chartpattern#patternData#instrumentId:133978)' +
                '&(chartpattern#patternData#patternType:2' +
                '|chartpattern#patternData#patternType:2001' +
                '|chartpattern#patternData#patternType:2012)', err);
        });
    });

    describe('parse()', function() {

        var alerts = [
            "quote:{133962>7000}&(quote:{133964<6500}|(quote:{1337>9000}&{12345>6789})&(topflop:{1337>9000}&quote:{12345>6789}))",
            "quote:{133962>7000}&&({133964<6500}||({1337>9000}&&{12345>6789})&&({1337>9000}&&{12345>6789}))",
            "quote:{133962>7000}&({133964<6500}|({1337>9000}&{12345>6789})&(portfolio:{1337>9000}&{12345>6789}))",
            "quote:{133962>7000}&&(quote:{133964<6500}||(portfolio:{1337>9000}&&{12345>6789})&&(topflop:{1337>9000}&&quote:{12345>6789}))",
            "quote:{133962>7000}&({133964<6500}|{1337>9000})",
            "status.id:5&4|type.id:3|(quote:{133962>7000}&{133964<6500}&topflop:{133962<5})",
            "status.id:5&(4|3)",
            "status.id:-1|1|0",
            "patternStatus.id:{>=2}&timeHorizon:2&3&120|(instrumentSort:stock&(index|commodity&currency))",
            "status[id:1&type[id:2]]",
            "status[id:1&type[id:2&name:abc]&power:{>9000}]",
            "status[id:1&(type[id:{>2}|name:abc])]",
            "quote.133962.4.last:{>7000}|{<6500}",
            'quote[133962.4.last:{<7200}]',
            'quote.133962[4.last:{<7200}]',
            'quote.133962.4[last:{<7200}]',
            'quote.133962[4.last:{<7200}&22.last:{>7000}]',
            'article.boxes:{1;10}',
            'article[boxes:{1;6}&id:133962]',
            'instruments.id:{133954,133962}',
            'article.boxes.id:{1;4,9;14}',
            'quote.134000.27.bid:{>1.3240}',
            'article.author.lastname:{Kämmerer}',
            'quote.134000.27.bid:{~1.3240}',
            'chartpattern.patternData[(instrumentId:122118|instrumentId:122117|instrumentId:133978)&(patternType:2|patternType:2001|patternType:2012)]'
        ];
        var res, err;

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[0]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote'][0] === '{133962>7000}', err);
            assert(res[0]['quote'][1] === '{133964<6500}', err);
            assert(res[1]['quote'][0] === '{133962>7000}', err);
            assert(res[1]['quote'][1] === '{1337>9000}', err);
            assert(res[1]['quote'][2] === '{12345>6789}', err);
            assert(res[1]['quote'][3] === '{12345>6789}', err);
            assert(res[1]['topflop'][0] === '{1337>9000}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[1]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote'][0] === '{133962>7000}', err);
            assert(res[0]['quote'][1] === '{133964<6500}', err);
            assert(res[1]['quote'][0] === '{133962>7000}', err);
            assert(res[1]['quote'][1] === '{1337>9000}', err);
            assert(res[1]['quote'][2] === '{12345>6789}', err);
            assert(res[1]['quote'][3] === '{1337>9000}', err);
            assert(res[1]['quote'][4] === '{12345>6789}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[2]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote'][0] === '{133962>7000}', err);
            assert(res[0]['quote'][1] === '{133964<6500}', err);
            assert(res[1]['quote'][0] === '{133962>7000}', err);
            assert(res[1]['quote'][1] === '{1337>9000}', err);
            assert(res[1]['quote'][2] === '{12345>6789}', err);
            assert(res[1]['portfolio'][0] === '{1337>9000}', err);
            assert(res[1]['portfolio'][1] === '{12345>6789}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[3]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote'][0] === '{133962>7000}', err);
            assert(res[0]['quote'][1] === '{133964<6500}', err);
            assert(res[1]['quote'][0] === '{133962>7000}', err);
            assert(res[1]['portfolio'][0] === '{1337>9000}', err);
            assert(res[1]['portfolio'][1] === '{12345>6789}', err);
            assert(res[1]['topflop'][0] === '{1337>9000}', err);
            assert(res[1]['quote'][1] === '{12345>6789}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[4]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote'][0] === '{133962>7000}', err);
            assert(res[0]['quote'][1] === '{133964<6500}', err);
            assert(res[1]['quote'][0] === '{133962>7000}', err);
            assert(res[1]['quote'][1] === '{1337>9000}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[5]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['status#id'][0] === '5', err);
            assert(res[0]['status#id'][1] === '4', err);
            assert(res[1]['type#id'][0] === '3', err);
            assert(res[2]['quote'][0] === '{133962>7000}', err);
            assert(res[2]['quote'][1] === '{133964<6500}', err);
            assert(res[2]['topflop'][0] === '{133962<5}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[6]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['status#id'][0] === '5', err);
            assert(res[0]['status#id'][1] === '4', err);
            assert(res[1]['status#id'][0] === '5', err);
            assert(res[1]['status#id'][1] === '3', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[7]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['status#id'][0] === '-1', err);
            assert(res[1]['status#id'][0] === '1', err);
            assert(res[2]['status#id'][0] === '0', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[8]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['patternStatus#id'][0] === '{>=2}', err);
            assert(res[0]['timeHorizon'][0] === '2', err);
            assert(res[0]['timeHorizon'][1] === '3', err);
            assert(res[0]['timeHorizon'][2] === '120', err);
            assert(res[1]['instrumentSort'][0] === 'stock', err);
            assert(res[1]['instrumentSort'][1] === 'index', err);
            assert(res[2]['instrumentSort'][0] === 'stock', err);
            assert(res[2]['instrumentSort'][1] === 'commodity', err);
            assert(res[2]['instrumentSort'][2] === 'currency', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[9]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['status#id'][0] === '1', err);
            assert(res[0]['status#type#id'][0] === '2', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[10]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['status#id'][0] === '1', err);
            assert(res[0]['status#type#id'][0] === '2', err);
            assert(res[0]['status#type#name'][0] === 'abc', err);
            assert(res[0]['status#power'][0] === '{>9000}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[11]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['status#id'][0] === '1', err);
            assert(res[0]['status#type#id'][0] === '{>2}', err);
            assert(res[1]['status#id'][0] === '1', err);
            assert(res[1]['status#type#name'][0] === 'abc', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[12]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#133962#4#last'][0] === '{>7000}', err);
            assert(res[1]['quote#133962#4#last'][0] === '{<6500}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[13]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#133962#4#last'][0] === '{<7200}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[14]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#133962#4#last'][0] === '{<7200}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[15]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#133962#4#last'][0] === '{<7200}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[16]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#133962#4#last'][0] === '{<7200}', err);
            assert(res[0]['quote#133962#22#last'][0] === '{>7000}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[17]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['article#boxes'][0] === '{1,2,3,4,5,6,7,8,9,10}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[18]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['article#boxes'][0] === '{1,2,3,4,5,6}', err);
            assert(res[0]['article#id'][0] === '133962', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[19]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['instruments#id'][0] === '{133954,133962}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[20]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['article#boxes#id'][0] === '{1,2,3,4,9,10,11,12,13,14}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[21]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#134000#27#bid'][0] === '{>1.3240}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[22]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['article#author#lastname'][0] === '{Kämmerer}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[23]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['quote#134000#27#bid'][0] === '{~1.3240}', err);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[24]);
            err = 'Unexpected result: '+JSON.stringify(res);

            assert(res[0]['chartpattern#patternData#instrumentId'][0] === '122118',     err);
            assert(res[0]['chartpattern#patternData#patternType'][0] === '2',           err);
            assert(res[1]['chartpattern#patternData#instrumentId'][0] === '122118',     err);
            assert(res[1]['chartpattern#patternData#patternType'][0] === '2001',        err);
            assert(res[2]['chartpattern#patternData#instrumentId'][0] === '122118',     err);
            assert(res[2]['chartpattern#patternData#patternType'][0] === '2012',        err);
            assert(res[3]['chartpattern#patternData#instrumentId'][0] === '122117',     err);
            assert(res[3]['chartpattern#patternData#patternType'][0] === '2',           err);
            assert(res[4]['chartpattern#patternData#instrumentId'][0] === '122117',     err);
            assert(res[4]['chartpattern#patternData#patternType'][0] === '2001',        err);
            assert(res[5]['chartpattern#patternData#instrumentId'][0] === '122117',     err);
            assert(res[5]['chartpattern#patternData#patternType'][0] === '2012',        err);
            assert(res[6]['chartpattern#patternData#instrumentId'][0] === '133978',     err);
            assert(res[6]['chartpattern#patternData#patternType'][0] === '2',           err);
            assert(res[7]['chartpattern#patternData#instrumentId'][0] === '133978',     err);
            assert(res[7]['chartpattern#patternData#patternType'][0] === '2001',        err);
            assert(res[8]['chartpattern#patternData#instrumentId'][0] === '133978',     err);
            assert(res[8]['chartpattern#patternData#patternType'][0] === '2012',        err);
        });

    });
});
var assert = require('assert');
var Aql = require('../lib/aql.js');

describe('Aql', function() {

    describe('extractExpressions()', function() {

        var alerts = [
            "quote:{133962>7000}&(quote:{133964<6500}|(quote:{1337>9000}&{12345>6789})&(topflop:{1337>9000}&quote:{12345>6789}))",
            "quote:{133962>7000}&&({133964<6500}||({1337>9000}&&{12345>6789})&&({1337>9000}&&{12345>6789}))",
            "quote:{133962>7000}&({133964<6500}|({1337>9000}&{12345>6789})&(portfolio:{1337>9000}&{12345>6789}))",
            "quote:{133962>7000}&&(quote:{133964<6500}||(portfolio:{1337>9000}&&{12345>6789})&&(topflop:{1337>9000}&&quote:{12345>6789}))",
            "quote:{133962>7000}&({133964<6500}|{1337>9000})"
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
    });

    describe('simplify()', function() {
        
        var terms = [
            'a*(b+c)',                          // a*b + a*c
            'a*b+c*(d+e*f)',                    // a*b + c*d + c*e*f
            'a*b*(c*d*e*(f+g))',                // a*b*c*d*e*f + a*b*c*d*e*g
            'a*b*(c*d*e+c*d*g)',                // a*b*c*d*e + a*b*c*d*g
            'a*(b+c+d*e)',                      // a*b + a*c + a*d*e
            'a*b*(c+d)*(e)',                    // a*b*c*e + a*b*d*e
            '(a)*b+(c*d*(e*f+g)+h*(i+j))*k',    // b*a + k*c*d*e*f + k*c*d*g + k*h*i + k*h*j
            '(a)*(b+c)*(d*e)*(f+g)',            // a*b*d*e*f + a*b*d*e*g + a*c*d*e*f + a*c*d*e*g
            '(a)&(b|c)&(d&e)&(f|g)',            // a&b&d&e&f | a&b&d&e&g | a&c&d&e&f | a&c&d&e&g
            'a*(b+c)*d',                        // a*d*b + a*d*c
            'a&(b|c)&d',                        // a&d&b | a&d&c
            '(a)&&(b||c)&&(d&&e)&&(f||g)'       // a&&b&&d&&e&&f || a&&b&&d&&e&&g || a&&c&&d&&e&&f || a&&c&&d&&e&&g
        ];
        var res;

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[0]);
            assert(res === 'a*b+a*c', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[1]);
            assert(res === 'a*b+c*d+c*e*f', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[2]);
            assert(res === 'a*b*c*d*e*f+a*b*c*d*e*g', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[3]);
            assert(res === 'a*b*c*d*e+a*b*c*d*g', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[4]);
            assert(res === 'a*b+a*c+a*d*e', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[5]);
            assert(res === 'a*b*c*e+a*b*d*e', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[6]);
            assert(res === 'b*a+k*c*d*e*f+k*c*d*g+k*h*i+k*h*j', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[7]);
            assert(res === 'a*b*d*e*f+a*b*d*e*g+a*c*d*e*f+a*c*d*e*g', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[8], '|', '&');
            assert(res === 'a&b&d&e&f|a&b&d&e&g|a&c&d&e&f|a&c&d&e&g', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[9]);
            assert(res === 'a*d*b+a*d*c', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[10], '|', '&');
            assert(res === 'a&d&b|a&d&c', 'Unexpected result: '+res);
        });

        it('should simplify correctly', function() {
            res = Aql.simplify(terms[11], '||', '&&');
            assert(res === 'a&&b&&d&&e&&f||a&&b&&d&&e&&g||a&&c&&d&&e&&f||a&&c&&d&&e&&g', 'Unexpected result: '+res);
        });
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
    });

    describe('checkForSyntaxErrors()', function() {

        // alerts with syntax errors
        var failerts = [
            '{133962>7000}&({133964<6500}|{1337>9000})',                            // At least one type is required
            'quote:{1339|62>7000}&({133964<6500}|{1337>9000})',                     // Invalid character
            'quote:{133962>7000}&({133964<6500}|{1337>9000}|)&({12345>6789})',      // Missing expression
            'quote:{133962>7000}&(133964<6500}|{1337>9000})&{12345>6789}',          // Missing opening tag
            'quote:{133962>7000}&({133964<6500}|{1337>9000})}',                     // Missing opening tag
            'quote:{133962>7000}&({133964<6500}|{1337>9000})&{12345>6789',          // Missing closing tag
            '(quote:{133962>7000}&({133964<6500}|{1337>9000})))',                   // Missing opening bracket
            '((quote:{133962>7000}&({133964<6500}|({1337>9000})))',                 // Missing closing bracket
            'quote:{133962>7000}&{133964<6500}|{{1337>9000}',                       // Invalid brackets
            'quote:{133962>7000}&{133964<6500}|{1337>9000}}',                       // Invalid brackets
            'status.id:5&4type.id:3',                                               // Missing logical operator
            'status.id:(-1|1|-2)&3',                                                // Type must be followed by value or expression
            'status[]&type:2',                                                      // Invalid subtyping
            'status:[]&type:2',                                                     // Invalid subtyping
            'quote:{133962:4>7000}',                                                // Invalid character in expression
            'quote:{133962%4>7000}',                                                // Invalid character in expression
            'quote:{133962$4>7000}',                                                // Invalid character in expression
            'quote:{133962&4>7000}',                                                // Invalid character in expression
            'quote:{133962\'4>7000}',                                               // Invalid character in expression
            'quote:{133962,4>7000}',                                                // Invalid character in expression
            'quote:{133962\\4>7000}',                                               // Invalid character in expression
            'quote:{133962!4>7000}',                                                // Invalid character in expression
            'quote:{133962"4>7000}',                                                // Invalid character in expression
            'quote:{133962?4>7000}',                                                // Invalid character in expression
            'quote:{133962(4>7000}',                                                // Invalid character in expression
            'quote:{133962)4>7000}',                                                // Invalid character in expression
            'quote:{133962#4>7000}',                                                // Invalid character in expression
            'quote:{133962|4>7000}',                                                // Invalid character in expression
            'quote:{133962&4>7000}',                                                // Invalid character in expression
            'quote.:{>7000}',                                                       // Invalid typing
            'quote:{>7000}',                                                        // Invalid typing
            'quote:{>7000}&.133962:{>9000}'                                         // Invalid typing

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

        it('should recognize invalid character', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[28]);
            } catch(err) {
                assert(err.message.indexOf('Invalid character in expression') !== -1, err.message);
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

        it('should recognize invalid typing', function() {
            try {
                Aql.checkForSyntaxErrors(failerts[31]);
            } catch(err) {
                assert(err.message.indexOf('Invalid typing') !== -1, err.message);
            }
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
            "quote.133962.4.last:{>7000}|{<6500}"
        ];
        var res;

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[0]);
            assert(res[0]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[0]['quote'][0]);
            assert(res[0]['quote'][1] === '{133964<6500}', 'Unexpected result: '+res[0]['quote'][1]);
            assert(res[1]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[1]['quote'][0]);
            assert(res[1]['quote'][1] === '{1337>9000}', 'Unexpected result: '+res[1]['quote'][1]);
            assert(res[1]['quote'][2] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][2]);
            assert(res[1]['quote'][3] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][3]);
            assert(res[1]['topflop'][0] === '{1337>9000}', 'Unexpected result: '+res[1]['topflop'][0]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[1]);
            assert(res[0]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[0]['quote'][0]);
            assert(res[0]['quote'][1] === '{133964<6500}', 'Unexpected result: '+res[0]['quote'][1]);
            assert(res[1]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[1]['quote'][0]);
            assert(res[1]['quote'][1] === '{1337>9000}', 'Unexpected result: '+res[1]['quote'][1]);
            assert(res[1]['quote'][2] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][2]);
            assert(res[1]['quote'][3] === '{1337>9000}', 'Unexpected result: '+res[1]['quote'][3]);
            assert(res[1]['quote'][4] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][4]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[2]);
            assert(res[0]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[0]['quote'][0]);
            assert(res[0]['quote'][1] === '{133964<6500}', 'Unexpected result: '+res[0]['quote'][1]);
            assert(res[1]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[1]['quote'][0]);
            assert(res[1]['quote'][1] === '{1337>9000}', 'Unexpected result: '+res[1]['quote'][1]);
            assert(res[1]['quote'][2] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][2]);
            assert(res[1]['portfolio'][0] === '{1337>9000}', 'Unexpected result: '+res[1]['quote'][0]);
            assert(res[1]['portfolio'][1] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][1]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[3]);
            assert(res[0]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[0]['quote'][0]);
            assert(res[0]['quote'][1] === '{133964<6500}', 'Unexpected result: '+res[0]['quote'][1]);
            assert(res[1]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[1]['quote'][0]);
            assert(res[1]['portfolio'][0] === '{1337>9000}', 'Unexpected result: '+res[1]['portfolio'][0]);
            assert(res[1]['portfolio'][1] === '{12345>6789}', 'Unexpected result: '+res[1]['portfolio'][1]);
            assert(res[1]['topflop'][0] === '{1337>9000}', 'Unexpected result: '+res[1]['topflop'][0]);
            assert(res[1]['quote'][1] === '{12345>6789}', 'Unexpected result: '+res[1]['quote'][1]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[4]);
            assert(res[0]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[0]['quote'][0]);
            assert(res[0]['quote'][1] === '{133964<6500}', 'Unexpected result: '+res[0]['quote'][1]);
            assert(res[1]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[1]['quote'][0]);
            assert(res[1]['quote'][1] === '{1337>9000}', 'Unexpected result: '+res[1]['quote'][1]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[5]);
            assert(res[0]['status#id'][0] === '5', 'Unexpected result: '+res[0]['status#id'][0]);
            assert(res[0]['status#id'][1] === '4', 'Unexpected result: '+res[0]['status#id'][1]);
            assert(res[1]['type#id'][0] === '3', 'Unexpected result: '+res[1]['type#id'][0]);
            assert(res[2]['quote'][0] === '{133962>7000}', 'Unexpected result: '+res[2]['quote'][0]);
            assert(res[2]['quote'][1] === '{133964<6500}', 'Unexpected result: '+res[2]['quote'][1]);
            assert(res[2]['topflop'][0] === '{133962<5}', 'Unexpected result: '+res[2]['topflop'][0]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[6]);
            assert(res[0]['status#id'][0] === '5', 'Unexpected result: '+res[0]['status#id'][0]);
            assert(res[0]['status#id'][1] === '4', 'Unexpected result: '+res[0]['status#id'][1]);
            assert(res[1]['status#id'][0] === '5', 'Unexpected result: '+res[1]['status#id'][0]);
            assert(res[1]['status#id'][1] === '3', 'Unexpected result: '+res[1]['status#id'][1]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[7]);
            assert(res[0]['status#id'][0] === '-1', 'Unexpected result: '+res[0]['status#id'][0]);
            assert(res[1]['status#id'][0] === '1', 'Unexpected result: '+res[1]['status#id'][0]);
            assert(res[2]['status#id'][0] === '0', 'Unexpected result: '+res[2]['status#id'][0]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[8]);
            assert(res[0]['patternStatus#id'][0] === '{>=2}', 'Unexpected result: '+res[0]['patternStatus#id'][0]);
            assert(res[0]['timeHorizon'][0] === '2', 'Unexpected result: '+res[0]['timeHorizon'][0]);
            assert(res[0]['timeHorizon'][1] === '3', 'Unexpected result: '+res[0]['timeHorizon'][1]);
            assert(res[0]['timeHorizon'][2] === '120', 'Unexpected result: '+res[0]['timeHorizon'][2]);
            assert(res[1]['instrumentSort'][0] === 'stock', 'Unexpected result: '+res[1]['instrumentSort'][0]);
            assert(res[1]['instrumentSort'][1] === 'index', 'Unexpected result: '+res[1]['instrumentSort'][1]);
            assert(res[2]['instrumentSort'][0] === 'stock', 'Unexpected result: '+res[2]['instrumentSort'][0]);
            assert(res[2]['instrumentSort'][1] === 'commodity', 'Unexpected result: '+res[2]['instrumentSort'][1]);
            assert(res[2]['instrumentSort'][2] === 'currency', 'Unexpected result: '+res[2]['instrumentSort'][2]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[9]);
            assert(res[0]['status#id'][0] === '1', 'Unexpected result: '+res[0]['status#id'][0]);
            assert(res[0]['status#type#id'][0] === '2', 'Unexpected result: '+res[0]['status#type#id'][0]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[10]);
            assert(res[0]['status#id'][0] === '1', 'Unexpected result: '+res[0]['status#id'][0]);
            assert(res[0]['status#type#id'][0] === '2', 'Unexpected result: '+res[0]['status#type#id'][0]);
            assert(res[0]['status#type#name'][0] === 'abc', 'Unexpected result: '+res[0]['status#type#name'][0]);
            assert(res[0]['status#power'][0] === '{>9000}', 'Unexpected result: '+res[0]['status#power'][0]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[11]);
            assert(res[0]['status#id'][0] === '1', 'Unexpected result: '+res[0]['status#id'][0]);
            assert(res[0]['status#type#id'][0] === '{>2}', 'Unexpected result: '+res[0]['status#type#id'][0]);
            assert(res[1]['status#id'][0] === '1', 'Unexpected result: '+res[1]['status#id'][0]);
            assert(res[1]['status#type#name'][0] === 'abc', 'Unexpected result: '+res[1]['status#type#name'][0]);
        });

        it('should parse alert successful', function() {
            res = Aql.parse(alerts[12]);
            assert(res[0]['quote#133962#4#last'][0] === '{>7000}', 'Unexpected result: '+res[0]['quote#133962#4#last'][0]);
            assert(res[1]['quote#133962#4#last'][0] === '{<6500}', 'Unexpected result: '+res[1]['quote#133962#4#last'][0]);
        });

    });
});
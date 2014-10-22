var assert = require('assert'),
    Aql = require('../');

/*describe('setMissingTypes()', function() {
    var alerts, i, l;
    
    alerts = [
        [[['e1&e2', 'e1&e3&e4&e5&e6'],{
            e1: 'quote:{133962>7000}',
            e2: 'quote:{133962>7000}',
            e3: 'quote:{133962>7000}',
            e4: '{12345>6789}',
            e5: 'topflop:{1337>9000}',
            e6: 'quote:{12345>6789}'
        }], {
            'e4': 'quote'
        }, '&'],
        [[['e1&&e2', 'e1&&e3&&e4&&e5&&e6'],{
            e1: 'quote:{133962>7000}',
            e2: '{133964<6500}',
            e3: '{1337>9000}',
            e4: '{12345>6789}',
            e5: '{1337>9000}',
            e6: '{12345>6789}'
        }], {
            'e2': 'quote',
            'e3': 'quote',
            'e4': 'quote',
            'e5': 'quote',
            'e6': 'quote'
        }, '&&'],
        [[['e1&e2', 'e1&e3&e4&e5&e6'],{
            e1: 'quote:{133962>7000}',
            e2: '{133964<6500}',
            e3: '{1337>9000}',
            e4: '{12345>6789}',
            e5: 'portfolio:{1337>9000}',
            e6: '{12345>6789}'
        }], {
            'e2': 'quote',
            'e3': 'quote',
            'e4': 'quote',
            'e6': 'portfolio'
        }, '&'],
        [[['e1&&e2', 'e1&&e3&&e4&&e5&&e6'],{
            e1: 'quote:{133962>7000}',
            e2: 'quote:{133964<6500}',
            e3: 'portfolio:{1337>9000}',
            e4: '{12345>6789}',
            e5: 'topflop:{1337>9000}',
            e6: 'quote:{12345>6789}'
        }], {
            'e4': 'portfolio'
        }, '&&'],
        [[['e1&e2', 'e1&e3'],{
            e1: 'quote:{133962>7000}',
            e2: '{133964<6500}',
            e3: '{1337>9000}'
        }], {
            'e2': 'quote',
            'e3': 'quote'
        }, '&'],
        [[['e1&e2', 'e1&e3'],{
            e1: 'quote:{133962~7000}',
            e2: '{133964~6500}',
            e3: '{1337~9000}'
        }], {
            'e2': 'quote',
            'e3': 'quote'
        }, '&']
    ];
    
    function factory(alert) {
        return function() {
            var key, res;
            
            res = Aql.setMissingTypes(alert[0], alert[2]);
            for (key in alert[1]) {
                if (!alert[1].hasOwnProperty(key)) { continue; }
                assert(res[1][key].indexOf(alert[1][key]) !== -1, 'Expected: "'+alert[1][key]+'"  Result: "'+res[1][key]+'"');
            }
        }
    }
    
    for (i=0, l=alerts.length; i<l; i++) {
        it('should set type from alert '+(i+1), factory(alerts[i]));
    }
});*/

/*describe('checkForSyntaxErrors()', function() {
    var failerts, keys, i, l;

    // alerts with syntax error
    failerts = {
        '{133962>7000}&({133964<6500}|{1337>9000})':                            'At least one type is required',
        'quote:{1339|62>7000}&({133964<6500}|{1337>9000})':                     'Invalid character',
        'quote:{133962>7000}&({133964<6500}|{1337>9000}|)&({12345>6789})':      'Missing expression',
        'quote:{133962>7000}&(133964<6500}|{1337~9000})&{12345>6789}':          'Missing opening tag',
        'quote:{133962>7000}&({133964<6500}|{1337>9000})}':                     'Missing opening tag',
        'quote:{133962>7000}&({133964~6500}|{1337>9000})&{12345>6789':          'Missing closing tag',
        '(quote:{133962>7000}&({133964<6500}|{1337>9000})))':                   'Missing opening bracket',
        '((quote:{133962>7000}&({133964<6500}|({1337>9000})))':                 'Missing closing bracket',
        'quote:{133962>7000}&{133964<6500}|{{1337>9000}':                       'Invalid brackets',
        'quote:{133962~7000}&{133964<6500}|{1337>9000}}':                       'Invalid brackets',
        'status.id:5&4type.id:3':                                               'Missing logical operator',
        'status.id:(-1|1|-2)&3':                                                'Type must be followed by value or expression',
        'status[]&type:2':                                                      'Invalid subtyping',
        'status:[]&type:2':                                                     'Invalid subtyping',
        'quote:{133962:4>7000}':                                                'Invalid character in expression',
        'quote:{133962%4~7000}':                                                'Invalid character in expression',
        'quote:{133962$4>7000}':                                                'Invalid character in expression',
        'quote:{133962&4>7000}':                                                'Invalid character in expression',
        'quote:{133962\'4>7000}':                                               'Invalid character in expression',
        'quote:{133962\\4>7000}':                                               'Invalid character in expression',
        'quote:{133962!4>7000}':                                                'Invalid character in expression',
        'quote:{133962"4~7000}':                                                'Invalid character in expression',
        'quote:{133962?4>7000}':                                                'Invalid character in expression',
        'quote:{133962(4~7000}':                                                'Invalid character in expression',
        'quote:{133962)4~7000}':                                                'Invalid character in expression',
        'quote:{133962#4>7000}':                                                'Invalid character in expression',
        'quote:{133962|4~7000}':                                                'Invalid character in expression',
        'quote.:{>7000}':                                                       'Invalid typing',
        'quote:{>7000}':                                                        'Invalid typing',
        'quote:{>7000}&.133962:{~9000}':                                        'Invalid typing',
        'article.boxes:{1;}':                                                   'Invalid set expression',
        'article.boxes:{;6}':                                                   'Invalid set expression',
        'article.boxes:{;}':                                                    'Invalid set expression',
        '(timeHorizon:1)&&(patternStatus:2,7)&&(breakoutDirectionClose:1)':     'Invalid set expression',
        'instruments.id:{133954:133962~2}':                                     'Invalid character in expression'
    };
    keys = Object.keys(failerts);
    
    function factory(failert, result) {
        return function() {
            try {
                Aql.checkForSyntaxErrors(failert);
            } catch(err) {
                assert(err.message.indexOf(result) !== -1, err.message);
            }
        };
    }
    
    for (i=0, l=keys.length; i<l; i++) {
        it('should recognize wrong syntax '+(i+1), factory(keys[i], failerts[keys[i]]));
    }
});*/

describe('parse()', function() {
    var alerts, i, l;

    alerts = [
        ["quote:{133962>7000}&(quote:{133964<6500}|(quote:{1337>9000}&{12345>6789})&(topflop:{1337>9000}&quote:{12345>6789}))", [
            { 'quote': ['{133962>7000}', '{133964<6500}'] },
            { 'quote': ['{133962>7000}', '{1337>9000}', '{12345>6789}', '{12345>6789}'],
              'topflop': ['{1337>9000}'] }
        ]],
        ["quote:{133962>7000}&&({133964<6500}||({1337>9000}&&{12345>6789})&&({1337>9000}&&{12345>6789}))", [
            { 'quote': ['{133962>7000}', '{133964<6500}'] },
            { 'quote': ['{133962>7000}', '{1337>9000}', '{12345>6789}', '{1337>9000}', '{12345>6789}'] }
        ]],
        ["quote:{133962>7000}&({133964<6500}|({1337>9000}&{12345>6789})&(portfolio:{1337>9000}&{12345>6789}))", [
            { 'quote': ['{133962>7000}', '{133964<6500}'] },
            { 'quote': ['{133962>7000}', '{1337>9000}', '{12345>6789}'],
              'portfolio': ['{1337>9000}', '{12345>6789}'] }
        ]],
        ["quote:{133962>7000}&&(quote:{133964<6500}||(portfolio:{1337>9000}&&{12345>6789})&&(topflop:{1337>9000}&&quote:{12345>6789}))", [
            { 'quote': ['{133962>7000}', '{133964<6500}'] },
            { 'quote': ['{133962>7000}', '{12345>6789}'],
              'portfolio': ['{1337>9000}', '{12345>6789}'],
              'topflop': ['{1337>9000}'] }
        ]],
        ["quote:{133962>7000}&({133964<6500}|{1337>9000})", [
            { 'quote': ['{133962>7000}', '{133964<6500}'] },
            { 'quote': ['{133962>7000}', '{1337>9000}'] }
        ]],
        ["status.id:5&4|type.id:3|(quote:{133962>7000}&{133964<6500}&topflop:{133962<5})", [
            { 'status.id': ['5', '4'] },
            { 'type.id': ['3'] },
            { 'quote': ['{133962>7000}', '{133964<6500}'],
              'topflop': ['{133962<5}'] }
        ]],
        ["status.id:5&(4|3)", [
            { 'status.id': ['5', '4'] },
            { 'status.id': ['5', '3'] }
        ]],
        ["status.id:-1|1|0", [
            { 'status#id': ['-1'] },
            { 'status#id': ['1'] },
            { 'status#id': ['0'] }
        ]],
        ["patternStatus.id:>=2&timeHorizon:2&3&120|(instrumentSort:stock&(index|commodity&currency))", [
            { 'patternStatus.id': ['>=2'],
              'timeHorizon': ['2', '3', '120']},
            { 'instrumentSort': ['stock', 'index'] },
            { 'instrumentSort': ['stock', 'commodity', 'currency'] }
        ]],
        ["status[id:1&type[id:2]]", [
            { 'status:id': ['1'],
              'status:type:id': ['2'] }
        ]],
        ["status[id:1&type[id:2&name:abc]&power:{>9000}]", [
            { 'status:id': ['1'],
              'status:type:id': ['2'],
              'status:type:name': ['abc'],
              'status:power': ['{>9000}'] }
        ]],
        ["status[id:1&(type[id:{>2}|name:abc])]", [
            { 'status:id': ['1'],
              'status:type:id': ['{>2}'] },
            { 'status:id': ['1'],
              'status:type:name': ['abc'] }
        ]],
        ["quote.133962.4.last:{>7000}|{<6500}", [
            { 'quote.133962.4.last': ['{>7000}'] },
            { 'quote.133962.4.last': ['{<6500}'] }
        ]],
        ['quote[133962.4.last:{<7200}]', [
            { 'quote:133962.4.last': ['{<7200}'] }
        ]],
        ['quote.133962[4.last:{<7200}]', [
            { 'quote.133962:4.last': ['{<7200}'] }
        ]],
        ['quote.133962.4[last:{<7200}]', [
            { 'quote.133962.4:last': ['{<7200}'] }
        ]],
        ['quote.133962[4.last:{<7200}&22.last:{>7000}]', [
            { 'quote.133962:4.last': ['{<7200}'],
              'quote.133962:22.last': ['{>7000}'] }
        ]],
        ['article.boxes:1;10', [
            { 'article.boxes': ['1,2,3,4,5,6,7,8,9,10'] }
        ]],
        ['article[boxes:{1;6}&id:133962]', [
            { 'article:boxes': ['{1,2,3,4,5,6}'],
              'article:id': ['133962'] }
        ]],
        ['instruments.id:{133954,133962}', [
            { 'instruments.id': ['{133954,133962}'] }
        ]],
        ['article.boxes.id:{1;4,9;14}', [
            { 'article.boxes.id': ['{1,2,3,4,9,10,11,12,13,14}'] }
        ]],
        ['quote.134000.27.bid:{>1.3240}', [
            { 'quote.134000.27.bid': ['{>1.3240}'] }
        ]],
        ['article.author.lastname:{Kämmerer}', [
            { 'article.author.lastname': ['{Kämmerer}'] }
        ]],
        ['quote.134000.27.bid:{~1.3240}', [
            { 'quote.134000.27.bid': ['{~1.3240}'] }
        ]],
        ['chartpattern:patternData[(instrumentId:122118|instrumentId:122117|instrumentId:133978)&(patternType:2|patternType:2001|patternType:2012)]', [
            { 'chartpattern:patternData:instrumentId': ['122118'],
              'chartpattern:patternData:patternType': ['2'] },
            { 'chartpattern:patternData:instrumentId': ['122118'],
              'chartpattern:patternData:patternType': ['2001'] },
            { 'chartpattern:patternData:instrumentId': ['122118'],
              'chartpattern:patternData:patternType': ['2012'] },
            { 'chartpattern:patternData:instrumentId': ['122117'],
              'chartpattern:patternData:patternType': ['2'] },
            { 'chartpattern:patternData:instrumentId': ['122117'],
              'chartpattern:patternData:patternType': ['2001'] },
            { 'chartpattern:patternData:instrumentId': ['122117'],
              'chartpattern:patternData:patternType': ['2012'] },
            { 'chartpattern:patternData:instrumentId': ['133978'],
              'chartpattern:patternData:patternType': ['2'] },
            { 'chartpattern:patternData:instrumentId': ['133978'],
              'chartpattern:patternData:patternType': ['2001'] },
            { 'chartpattern:patternData:instrumentId': ['133978'],
              'chartpattern:patternData:patternType': ['2012'] }
        ]],
        ['chartpattern:patternData[(instrumentId:133962)&&(patternType:2||patternType:2000)&&(timeHorizon:1)&&(patternStatus:{2,7})&&(breakoutDirectionClose:1)]', [
            { 'chartpattern:patternData:instrumentId': [ '133962' ],
              'chartpattern:patternData:patternType': [ '2' ],
              'chartpattern:patternData:timeHorizon': [ '1' ],
              'chartpattern:patternData:patternStatus': [ '{2,7}' ],
              'chartpattern:patternData:breakoutDirectionClose': [ '1' ] },
            { 'chartpattern:patternData:instrumentId': [ '133962' ],
              'chartpattern:patternData:patternType': [ '2000' ],
              'chartpattern:patternData:timeHorizon': [ '1' ],
              'chartpattern:patternData:patternStatus': [ '{2,7}' ],
              'chartpattern:patternData:breakoutDirectionClose': [ '1' ] }
        ]],
        ['quote:133962:4:last:>0&>10000', [
            { 'quote:133962:4:last': [ '>0', '>10000' ] }
        ]],
        ['chartpattern:patternData[instrumentId:133962,118548&&patternType:2,2000,2001,2002,2003,2004,2005]', [
            { 'chartpattern:patternData:instrumentId': ['133962,118548'],
              'chartpattern:patternData:patternType': ['2,2000,2001,2002,2003,2004,2005']}
        ]],
        
        /*
         * NOT operator.
         */
        
        ['chartpattern:patternData:instrumentId:!133962', [
            { 'chartpattern:patternData:instrumentId': ['!133962'] }
        ]],
        ['chartpattern:patternData[instrumentId:!133962&&patternType:2,2000,2001,2002,2003,2004,2005]', [
            { 'chartpattern:patternData:instrumentId': ['!133962'],
                'chartpattern:patternData:patternType': ['2,2000,2001,2002,2003,2004,2005']}
        ]],
        ['chartpattern:patternData[patternType:2,2000,2001,2002,2003,2004,2005&&instrumentId:!133962]', [
            { 'chartpattern:patternData:instrumentId': ['!133962'],
                'chartpattern:patternData:patternType': ['2,2000,2001,2002,2003,2004,2005']}
        ]],
        ['quote:133962:4:last:!0&!10000', [
            { 'quote:133962:4:last': [ '!0', '!10000' ] }
        ]],
        ['chartpattern:patternData[(instrumentId:!133962)&&(patternType:2||patternType:2000)&&(timeHorizon:1)&&(patternStatus:2,7)&&(breakoutDirectionClose:!1)]', [
            { 'chartpattern:patternData:instrumentId': [ '!133962' ],
                'chartpattern:patternData:patternType': [ '2' ],
                'chartpattern:patternData:timeHorizon': [ '1' ],
                'chartpattern:patternData:patternStatus': [ '2,7' ],
                'chartpattern:patternData:breakoutDirectionClose': [ '!1' ] },
            { 'chartpattern:patternData:instrumentId': [ '!133962' ],
                'chartpattern:patternData:patternType': [ '2000' ],
                'chartpattern:patternData:timeHorizon': [ '1' ],
                'chartpattern:patternData:patternStatus': [ '2,7' ],
                'chartpattern:patternData:breakoutDirectionClose': [ '!1' ] }
        ]],
        ['chartpattern[type:UpperTriggerlineCrossedClose,LowerTriggerlineCrossedClose&patternData[instrumentId:133962&patternType:2]]', [
            { 'chartpattern:type': [ 'UpperTriggerlineCrossedClose,LowerTriggerlineCrossedClose' ],
                'chartpattern:patternData:instrumentId': [ '133962' ],
                'chartpattern:patternData:patternType': [ '2' ] }
        ]]
    ];
    
    function factory(alert) {
        return function() {
            var check, res, cond1, cond2, value, i, j, k, il, kl;
            
            res = Aql.parse(alert[0]);
            
            for (i=0, il=res.length; i<il; i++) {
                cond1 = res[i];
                for (j in cond1) {
                    if (!cond1.hasOwnProperty(j)) { continue; }
                    cond2 = cond1[j];
                    for (k=0, kl=cond2.length; k<kl; k++) {
                        value = cond2[k];
                        try { check = alert[1][i][j][k] }
                        catch(err) { throw new Error('Unable to find index '+i+' '+j+' '+k); }
                        assert(value === alert[1][i][j][k], 'At: '+i+' '+j+' '+k+'  Result: '+value+'  Expected: '+alert[1][i][j][k]);
                    }
                }
            }
        }
    }
    
    for (i=0, l=alerts.length; i<l; i++) {
        it('should understand alert '+(i+1), factory(alerts[i]));
    }
});
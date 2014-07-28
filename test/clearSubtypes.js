var assert = require('assert'),
    clearSubtypes = require('../libs/clearSubtypes');

describe('clearSubtypes()', function() {
    var terms, i, l;

    terms = [
        ['quote.133962[4.last:{<7200}]',
            'quote.133962:4.last:{<7200}'],
        ['status[id:1&type[id:2&name:abc]&power:{>9000}]',
            'status:id:1&status:type:id:2&status:type:name:abc&status:power:{>9000}'],
        ['chartpattern.patternData[(instrumentId:122118|instrumentId:122117|instrumentId:133978)&(patternType:2|patternType:2001|patternType:2012)]',
            '(chartpattern.patternData:instrumentId:122118' +
            '|chartpattern.patternData:instrumentId:122117' +
            '|chartpattern.patternData:instrumentId:133978)' +
            '&(chartpattern.patternData:patternType:2' +
            '|chartpattern.patternData:patternType:2001' +
            '|chartpattern.patternData:patternType:2012)'],
        ['chartpattern.patternData[instrumentId:122118&patternType:2&distPercentQuotePotentialFromLevel1:{>3.5}]',
            'chartpattern.patternData:instrumentId:122118' +
            '&chartpattern.patternData:patternType:2' +
            '&chartpattern.patternData:distPercentQuotePotentialFromLevel1:{>3.5}']
    ];

    function factory(term, ex) {
        return function() {
            var res = clearSubtypes(term);
            assert(res === ex, 'Input: '+term+'  Result: '+res+'  Expected: '+ex);  
        }
    }

    for (i=0, l=terms.length; i<l; i++) {
        it('should expand set #'+(i+1), factory(terms[i][0], terms[i][1]));
    }
});
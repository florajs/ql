var assert = require('assert');
var convert = require('../generators/convert.js');


describe('AQL Convert', function() {
    describe('from Api', function() {
        var erg, output, requests = [
            "patternStatus>=2;instrumentSort=stock,index,commodity,currency;timeHorizon=2,3,0",
            "instrument.id=121955;date>=2012-07-10T00:00:00;date<=2013-07-10T00:00:00"
        ];

        it('should convert successfully', function() {
            output = 'patternStatus:{>=2}&instrumentSort:stock&index&commodity&currency&timeHorizon:2&3&0';
            erg = convert.fromApi(requests[0]);
            assert(erg === output, 'Unexpected output: '+erg);
        });

        it('should convert successfully', function() {
            output = 'instrument.id:121955&date:{>=2012-07-10T00:00:00}&date:{<=2013-07-10T00:00:00}';
            erg = convert.fromApi(requests[1]);
            assert(erg === output, 'Unexpected output: '+erg);
        });
    });
});
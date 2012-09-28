/*
 input:  patternStatus>=2;instrumentSort=stock,index,commodity,currency;timeHorizon=2,3,0
 output: patternStatus:{>=2}&instrumentSort:stock&index/commodity&currency&timeHorizon:2&3&0
 */

var AQL = AQL || {
    fromApi: function fromApi(string) {
        var fields = string.split(';');
        var key, op, val, field;
        for (var i=0, l=fields.length; i<l; i++) {
            key = fields[i].match(/([\w\.]+)[><=]+/)[1];
            field = fields[i].match(/([><=]+)(.+)/);
            op = field[1];
            val = field[2].replace(/,/g, '&');

            if (op.match(/[\<\>]\=/)) {
                val = '{'+op+val+'}';
            }

            fields[i] = key+':'+val;
        }
        return fields.join('&');
    },
    fromPush: function fromPush(obj) {

    }
};


if (!!module && !!module.exports) {
    module.exports = AQL;
}
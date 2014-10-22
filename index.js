//var replaceSets   = require('./libs/replaceSets'),
//    simplify      = require('./libs/simplify'),
//    tokenize      = require('./libs/tokenize'),
//    splitExp      = require('./libs/splitExp'),
//    rebuild       = require('./libs/rebuild'),
//    clearSubtypes = require('./libs/clearSubtypes');
//
//module.exports = {
//    parse: function parse(query) {
//        query    = clearSubtypes(query);
//        query    = replaceSets(query);
//        query    = tokenize(query);
//        query[0] = simplify(query[0]);
//        query[1] = splitExp(query[1]);
//        query    = rebuild(query);
//        return query;
//    }
//};

var tokenizer = require('./tokenizer'),
    config = require('./config'),
    replaceOperators = require('./operators/replace'),
    clearSubtypes = require('./clearSubtypes'),
    simplify = require('./simplify');


var cfg = config({
    operators: ['=', '!=', '<', '<=', '>', '>='],
    glue: '.',
    and: ' AND ',
    or: ' OR ',
    string: '"'
});


var query = ['x=2 OR a=1 AND aA.hhasdhhXx[(b_=1 OR c0.d_0=" OR " AND c0.e=1) AND (f=1;5 OR g=")\\"(")] AND h=1'];
console.log(query);

query = tokenizer(cfg, query);
console.log(query);

query = replaceOperators(cfg, query);
console.log(query);

query = clearSubtypes(cfg, query);
console.log(query);



console.log(tokenizer(config({ or: ','}), "instruments(filter=assetClass.id=1)"));
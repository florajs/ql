var replaceSets   = require('./libs/replaceSets'),
    simplify      = require('./libs/simplify'),
    tokenize      = require('./libs/tokenize'),
    splitExp      = require('./libs/splitExp'),
    rebuild       = require('./libs/rebuild'),
    clearSubtypes = require('./libs/clearSubtypes');

module.exports = {
    parse: function parse(query) {
        query    = clearSubtypes(query);
        query    = replaceSets(query);
        query    = tokenize(query);
        query[0] = simplify(query[0]);
        query[1] = splitExp(query[1]);
        query    = rebuild(query);
        return query;
    }
};
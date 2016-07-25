var FloraQL = require('./');
FloraQL.setConfig('api');

var stmnt = '(categories.id=2084,1165 OR (categories.id=2241)) AND instruments.id=133962,119083,119231 AND (tags.id=2258 OR instruments.assetClass.id=3)';

var res = FloraQL.parse(stmnt);

console.log(res);



var floraQL = require('./');

floraQL.setConfig('api');
floraQL.setConfig({ flatten: false });

floraQL.parse('xyz[a=1 AND (zxy[e AND f][b=2 OR c=3])]');
var assert = require('assert');
var fs = require('fs');
var convert = require('../generators/convert.js');

var Aql = {
    addPreset: function addPreset(object) {
        for (var preset in object) {
            if (object.hasOwnProperty(preset)) {
                Aql.presets[preset] = object[preset];
            }
        }
    },
    checkForSyntaxErrors: function checkForSyntaxErrors(query) {
        var pos, subquery, closingBracket, regexp;

        function error(msg) {
            return 'Syntax error near "'+query.substr(pos-6<0? 0 : pos-6, 12)+'"'+(!!msg?': '+msg:'');
        }

        // allowed type chars: [a-zA-Z0-9\.]
        // allowed expression chars: [a-zA-Z0-9\>\<\=\-\+\*\;\_\,]
        // not allowed expression chars: [\:\%\$\'\,\\\!\"\?\(\)\#\|\&]

        assert((pos = query.search(/\{\{/)) === -1, error('Invalid brackets "{{"'));
        assert((pos = query.search(/\}\}/)) === -1, error('Invalid brackets "}}"'));
        assert((pos = query.search(/\|\|\|/)) === -1, error('Invalid operator "|||"'));
        assert((pos = query.search(/\&\&\&/)) === -1, error('Invalid operator "&&&"'));

        assert((pos = query.search(/\[\]/)) === -1, error('Invalid subtyping'));
        assert((pos = query.search(/[^a-zA-Z0-9]\[/)) === -1, error('Invalid subtyping'));

        assert((pos = query.search(/\.:/)) === -1, error('Invalid typing'));
        assert((pos = query.search(/\.\{/)) === -1, error('Invalid typing'));
        assert((pos = query.search(/[\&\|]\./)) === -1, error('Invalid typing'));
        assert((pos = query.search(/^\./)) === -1, error('Invalid typing'));

        assert((pos = query.search(/\{[0-9]+\;\}/)) === -1, error('Invalid set expression'));
        assert((pos = query.search(/\{\;[0-9]+\}/)) === -1, error('Invalid set expression'));
        assert((pos = query.search(/\{\;\}/)) === -1, error('Invalid set expression'));

        assert((pos = query.search(/\{[\-0-9a-zA-Z\.\+\*\;\_]*\,+[\-0-9a-zA-Z\.\+\*\;\_]*[\>\<\=]+[\-0-9a-zA-Z\.\+\*\;\_]*\}/)) === -1, error('Sets and operators cannot be mixed'));
        assert((pos = query.search(/\{[\-0-9a-zA-Z\.\+\*\;\_\,]+[\>\<\=]+\}/)) === -1, error('Invalid expression'));
        assert((pos = query.search(/\{\}/)) === -1, error('Invalid expression'));
        regexp = /\{[a-zA-Z0-9\>\<\=\-\+\*\;\_\,]*[\:\%\$\&\'\\\!\"\?\(\)\#\|\&\_][a-zA-Z0-9\>\<\=\-\+\*\;\_\:\,]*\}/;
        assert((pos = query.search(regexp)) === -1, error('Invalid character in expression'));

        assert((pos = query.search(/\}[a-zA-Z0-9]/)) === -1, error('Missing logical operator'));
        assert((pos = query.search(/\:[\(\[]/)) === -1, error('Type must be followed by value or expression'));

        subquery = query;
        while((pos = subquery.match( /\{/ )) !== null) {
            closingBracket = subquery.search( /\}/ );
            if (closingBracket === -1) {
                pos = pos['index'];
                assert(false, error('Missing closing tag'));
            } else {
                subquery = subquery.substr(0, pos['index'])+subquery.substr(pos['index']+1);
                subquery = subquery.substr(0, closingBracket-1)+subquery.substr(closingBracket);
            }
        }
        if ((pos = subquery.search( /\}/ )) !== -1) {
            assert(false, error('Missing opening tag'));
        }

        subquery = query;
        while((pos = subquery.match( /\(/ )) !== null) {
            closingBracket = subquery.search( /\)/ );
            if (closingBracket === -1) {
                pos = pos['index'];
                assert(false, error('Missing closing bracket'));
            } else {
                subquery = subquery.substr(0, pos['index'])+subquery.substr(pos['index']+1);
                subquery = subquery.substr(0, closingBracket-1)+subquery.substr(closingBracket);
            }
        }
        if ((pos = subquery.search( /\)/ )) !== -1) {
            assert(false, error('Missing opening bracket'));
        }

        assert((pos = query.search(/[a-zA-Z0-9\.]+\:/)) !== -1, error('At least one type is required'));

        regexp = new RegExp('\\}[\\&\\|](?![\\{\\(a-zA-Z0-9].).');
        assert((pos = query.search(regexp)) === -1, error('Missing expression'));
    },
    clearSubtypes: function clearSubtypes(query) {
        assert(typeof query === 'string', 'Query must be of type string');

        query = query.replace(/\./g, '#');

        var scope, term;
        while(scope = query.match(/#?([a-zA-Z0-9\#]+)\[([a-zA-Z0-9\{\}\(\)\:\|\&\-\>\<\=\;\,\+\*\_\#]+)\]/)) {
            term = scope[2].replace(/([a-zA-Z0-9\#]+)\:/g, scope[1]+'#$1:');
            query = query.replace(scope[0], term);
        }


        return query.replace('[', '').replace(']', '');
    },
    extractExpressions: function extractExpressions(term) {
        term = term+'@';
        var exp, ret={}, key=0, scope, A, Ω;
        var exp = /[a-zA-Z0-9\#]+\:\-?[0-9a-zA-Z]+|[\&\|\(]\-?[0-9]+|[\&\|\(][a-zA-Z]+[\&\|\)\@]|[a-zA-Z0-9\#]*\:?\{[\-\:0-9a-zA-Z\;\,\<\>\=]+\}/;
        while ((scope = term.match(exp)) !== null) {
            A = scope[0].match(/^[\(\|\&]/);
            A = A === null? '' : A[0];
            Ω = scope[0].match(/[\)\|\&\@]$/);
            Ω = Ω === null? '' : Ω[0];
            ret['e'+(++key)] = scope[0].replace(A, '').replace(Ω, '');
            term = term.replace(A+ret['e'+(key)]+Ω, A+'e'+key+Ω);
        }
        return [term.substr(0, term.length-1), ret];
    },
    getPreset: function getPreset(key, args) {
        assert(key in Aql.presets, 'Failed to substitute preset "'+key+'"');

        var preset=Aql.presets[key], search;

        for (var i=1, len=args.length; i<=len; ++i) {
            preset = preset.replace(new RegExp('\\$'+i, 'g'), args[i-1]);
        }
        if ((search = preset.match(/\$([0-9]+)/)) !== null) {
            throw new Error('Missing required argument $'+search[1]+' for preset "'+key+'"');
        }

        return '('+preset+')';
    },
    loadPresetFolder: function loadPresetFolder(relativePath) {
        var folder, file, filename;

        try {
            folder = fs.readdirSync(__dirname + '/' + relativePath);
        } catch(err) {
            return;
        }

        for (var i=0, len=folder.length; i<len; ++i) {
            if (folder[i].substr(-4) === '.pre') {
                file = {};
                filename = folder[i].substr(0, folder[i].length-4);
                file[filename] = fs.readFileSync(__dirname + '/' + relativePath + '/' + folder[i], 'utf-8');
                Aql.addPreset(file);
            }
        }
    },
    parse: function parse(query, options) {

        if (options && options.resolveDisjunctions) {
            query = Aql.resolveDisjunctions(query);
        }
        query = Aql.replacePresets(query);
        query = Aql.replaceSets(query);
        query = Aql.trim(query);
        Aql.checkForSyntaxErrors(query);
        query = Aql.clearSubtypes(query);
        query = Aql.extractExpressions(query);

        query[0] = Aql.simplify(query[0], '|', '&').split('|');
        query = Aql.setMissingTypes(query, '&');

        var ret = [], exp, type;
        for (var i=0, l=query[0].length; i<l; ++i) {
            query[0][i] = query[0][i].split('&');

            ret.push({});
            for (var j=0, lj=query[0][i].length; j<lj; ++j) {
                exp = query[1][query[0][i][j]].split(':');
                type = exp.shift();
                if (!(type in ret[ret.length-1])) {
                    ret[ret.length-1][type] = [];
                }
                ret[ret.length-1][type].push(exp.join(':'));
            }
        }
        return ret;
    },
    presets: {},
    replacePresets: function replacePresets(query) {

        var preset, key, args, parsedPre;
        while((preset = query.match(/([a-zA-Z\.]+)\(([a-zA-Z0-9\,]*)\)/)) !== null) {
            args = preset[2].split(',');
            if (args[0] === '') {
                args = [];
            }
            key = preset[1];
            parsedPre = Aql.getPreset(key, args);
            query = query.replace(preset[0], parsedPre);
        }
        return query;
    },
    replaceSets: function replaceSets(query) {
        var scope, regex = /([0-9]+)\;([0-9]+)/, out, min, max;
        while ((scope = query.match(regex)) !== null) {

            if (~~scope[1] < ~~scope[2]) {
                min = ~~scope[1];
                max = ~~scope[2];
            } else {
                min = ~~scope[2];
                max = ~~scope[1];
            }

            out = [];
            for (var i=min; i<=max; i++) {
                out.push(i);
            }
            query = query.replace(scope[0], out.join(','));
        }
        return query;
    },
    resolveDisjunctions: function resolveDisjunctions(query) {
        var scope, regex = /([a-zA-Z0-9\.]+)\:(\{[a-zA-Z0-9\-]*\,[a-zA-Z0-9\,\-]*\})/;
        while ((scope = query.match(regex)) !== null) {
            query = query.replace(scope[0], '('+scope[0].replace(/[\{\}]/g, '').replace(/\,/g, '|'+scope[1]+':')+')');
        }
        return query;
    },
    simplify: function simplify(term, plus, mul) {

        if (typeof plus === 'undefined') {
            plus = '+';
        }
        if (typeof mul === 'undefined') {
            mul = '*';
        }

        var plusEx = '', mulEx = '';
        for (var i=0, len = plus.length; i<len; ++i) {
            plusEx += '\\'+plus[i];
        }
        for (var i=0, len = mul.length; i<len; ++i) {
            mulEx += '\\'+mul[i];
        }

        var multiplicate = function(multiplier, scope) {
            var targets = scope.split(plus);
            var ret = '';
            for (var i= 0, len = targets.length; i<len; ++i) {
                if (ret !== '') {
                    ret += plus;
                }
                ret += multiplier+mul+targets[i];
            }
            return ret;
        }

        var scope, scopeB, scopeRegex, prefix, multiplier, simplified, regex, regexB;
        regex = new RegExp('\\(([\\w'+plusEx+mulEx+']*)\\)');
        while((scope = term.match(regex)) !== null) {

            scopeRegex = new RegExp('(['+plusEx+mulEx+'\\(\\)])', 'g');
            scopeRegex = scope[0].replace(scopeRegex, '\\$1');

            // (a+b)*c -> c*(a+b)
            regexB = new RegExp('('+scopeRegex+')'+mulEx+'(\\w+)');
            while((scopeB = term.match(regexB)) !== null) {
                term = term.replace(scopeB[0], scopeB[2]+mul+scopeB[1]);
            }

            // a*(b+c) -> (a*b+a*c)
            // (a*b+a*c) -> a*b+a*c
            regexB = new RegExp('(\\w+'+mulEx+'+)'+scopeRegex);
            if ((prefix = term.match(regexB)) !== null) {
                multiplier = prefix[1].substr(0, prefix[1].length-mul.length);
                simplified = multiplicate(multiplier, scope[1]);
                term = term.replace(prefix[0], '('+simplified+')');
            } else {
                term = term.replace(scope[0], scope[1]);
            }

            // (a+b)*(c+d) -> (a*c+a*d+b*c+b*d)
            regexB = new RegExp('(\\([\\w'+plusEx+mulEx+']+\\))'+mulEx+'(\\([\\w'+plusEx+mulEx+']+\\))');
            while((scopeB = term.match(regexB)) !== null) {
                var term1 = scopeB[1].replace(/[()]/g, '').split(plus);
                var term2 = scopeB[2].replace(/[()]/g, '').split(plus);
                var ret = [];
                for (var i=0, leni = term1.length; i<leni; ++i) {
                    for (var j=0, lenj = term2.length; j<lenj; ++j) {
                        ret.push(term1[i]+mul+term2[j]);
                    }
                }
                term = term.replace(scopeB[0], '('+ret.join(plus)+')');
            }
        }

        return term;
    },
    setMissingTypes: function setType(query, mul) {

        var exp, type = null, currentType;
        for (var i=0, len=query[0].length; i<len; ++i) {
            exp = query[0][i].split(mul);

            for (var j=0, lenj=exp.length; j<lenj; ++j) {
                currentType = query[1][exp[j]].match(/([a-zA-Z0-9\.\#]+)\:(.+)/);
                type = currentType !== null? currentType[1] : type;

                if (j === 0 && type === null) {
                    throw new Error('Missing required type at "'+query[1][exp[j]]+'"');
                }

                query[1][exp[j]] = type+':'+(currentType === null? query[1][exp[j]] : currentType[2]);
            }
        }
        return query;
    },
    trim: function trim(query) {
        var doubleOp;
        while((doubleOp = query.search(/\|\|/)) !== -1 ||
            (doubleOp = query.search(/\&\&/)) !== -1) {
            query = query.replace(/\|\|/, '|').replace(/\&\&/, '&');
        }
        return query;
    }
};

for (var fn in convert) { Aql[fn] = fn; }

module.exports = Aql;

Aql.loadPresetFolder('./presets');
var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    escape          = require('../lib/escape'),
    StmntF          = require('./Stmnt'),
    ArgumentError   = require('../error/ArgumentError');

/**
 * 
 * @param {Config} cfg
 * @returns {tokenizer}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var Stmnt = StmntF(cfg);

    /**
     *
     * @param str1
     * @param pos
     * @param str2
     * @returns {boolean}
     */

    function isAhead(str1, pos, str2) {
        return str1[pos] === str2[0] && str1.substr(pos, str2.length) === str2;
    }

    /**
     *
     * @param str1
     * @param pos
     * @param str2
     * @returns {boolean}
     */

    function isBehind(str1, pos, str2) {
        return str1[pos-1] === str2[str2.length-1] && str1.substr(pos-str2.length, str2.length) === str2;
    }

    /**
     * Replace any statements from a query string with an 
     * identifier and store them as instances of Stmnt in 
     * the second part of the query object.
     * 
     * @param {Query|string} query
     * @returns {Query}
     */
 
    function tokenizer(query) {
        var string;

        if (typeof query === 'string') {
            string = query;
        } else {
            validateQuery(query);
            string = query[0];
        }

        var i, l, j, lj, lastQuotationMark,
            stackAttribute = '',
            stackOperator = '',
            stackValue = '',
            state = 'attribute',
            isNewSentence = true,
            openBrackets = 0,
            operatorAhead = null,
            setValues = [],
            stmnts = {};

        //console.log('tokenize', query);

        var ii = 0;

        function getIdentifier() {
            return 'e' + ii++;
        }

        function closeBracket() {
            openBrackets--;
            if (openBrackets < 0) {
                throw new ArgumentError(2204, { bracket: string[i] });
            }
        }
        function openBracket() {
            openBrackets++;
        }

        function resolve() {
            if (stackValue) {
                setValues.push(stackValue);
                stackValue = '';
            } else if (!stackAttribute) {
                return;
            }

            var id = getIdentifier();
            var stmntLength = stackAttribute.length+stackOperator.length+setValues.join('').length+(setValues.length > 0? (setValues.length-1)*cfg.setDelimiter.length : 0);

            //console.log('Resolve', string, 'to', string.substr(0, i - stmntLength) + id + string.substr(i, string.length));
            string = string.substr(0, i - stmntLength) + id + string.substr(i, string.length);

            i -= l - string.length;
            l = string.length;

            stmnts[id] = new Stmnt(stackAttribute, stackOperator, setValues);

            stackAttribute = '';
            stackOperator = '';
            setValues = [];
        }

        for (i=0, l=string.length; i < l; i++) {

            if (state === 'attribute') {
                // Check if operator is coming
                operatorAhead = null;
                for (j = 0, lj = cfg.operators.length; j < lj; j++) {
                    if (isAhead(string, i, cfg.operators[j])) {
                        operatorAhead = cfg.operators[j];
                        break;
                    }
                }
                //console.log('START-'+string[i]+'-'+string.substr(i));

                // Attribute ends with operator, add to stack and expect incoming value
                if (operatorAhead) {
                    //console.log('Attribute ends with operator, add to stack and expect incoming value');

                    stackOperator = operatorAhead;
                    state = 'value';
                    i += operatorAhead.length - 1;

                // Attribute ends with opening round bracket
                } else if (stackAttribute.length > 0 &&
                    isAhead(string, i, cfg.roundBracket[0])) {
                    //console.log('Attribute ends with opening round bracket');

                    // Missing operator and value
                    throw new ArgumentError(2216, { stmnt: stackAttribute });

                // Attribute ends with opening square bracket
                } else if (stackAttribute.length > 0 &&
                    isAhead(string, i, cfg.squareBracket[0])) {
                    //console.log('Attribute ends with opening square bracket');

                    openBracket();
                    resolve();

                // Attribute ends with closing round bracket
                } else if (stackAttribute.length > 0 &&
                    isAhead(string, i, cfg.roundBracket[1])) {
                    //console.log('Attribute ends with closing round bracket');

                    closeBracket();
                    // Missing operator and value
                    //throw new ArgumentError(2216, { stmnt: stackAttribute });

                // Attribute ends with closing square bracket
                } else if (stackAttribute.length > 0 &&
                    isAhead(string, i, cfg.squareBracket[1])) {
                    //console.log('Attribute ends with closing square bracket');

                    closeBracket();
                    resolve();

                // Attribute ends with AND connective
                } else if (stackAttribute.length > 0 &&
                    isAhead(string, i, cfg.and)) {
                    //console.log('Attribute ends with AND connective');

                    resolve();
                    // Skip connective
                    i += cfg.and.length - 1;

                // Attribute ends with OR connective
                } else if (stackAttribute.length > 0 &&
                    isAhead(string, i, cfg.or)) {
                    //console.log('Attribute ends with OR connective');

                    resolve();
                    // Skip connective
                    i += cfg.or.length - 1;

                // Attribute starts with closing bracket
                } else if (stackAttribute.length === 0 &&
                    (isAhead(string, i, cfg.roundBracket[1]) ||
                    isAhead(string, i, cfg.squareBracket[1]))) {
                    //console.log('Attribute starts with closing bracket');

                    closeBracket();
                    if (isNewSentence) {
                        // Empty bracket
                        throw new ArgumentError(2210, { position: ' at pos:'+i });
                    }

                // Attribute starts with opening bracket
                } else if (stackAttribute.length === 0 &&
                    (isAhead(string, i, cfg.roundBracket[0]) ||
                    isAhead(string, i, cfg.squareBracket[0]))) {
                    //console.log('Attribute starts with opening bracket');

                    openBracket();
                    isNewSentence = true;

                // Attribute starts with AND connective
                } else if (stackAttribute.length === 0 &&
                    isAhead(string, i, cfg.and)) {
                    //console.log('Attribute starts with AND connective');

                    if (isNewSentence) {
                        // Missing left-hand side
                        throw new ArgumentError(2208, {
                            position: ' at \''+string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1>=0?i-1:i, i-3>=0?7:i-2>=0?6:5)+'\' (pos: '+(i)+')'
                        });
                    }
                    // Skip connective
                    i += cfg.and.length - 1;

                // Attribute starts with OR connective
                } else if (stackAttribute.length === 0 &&
                    isAhead(string, i, cfg.or)) {
                    //console.log('Attribute starts with OR connective');

                    if (isNewSentence) {
                        // Missing left-hand side
                        throw new ArgumentError(2208, {
                            position: ' at \''+string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1>=0?i-1:i, i-3>=0?7:i-2>=0?6:5)+'\' (pos: '+(i)+')'
                        });
                    }
                    // Skip connective
                    i += cfg.or.length - 1;

                // Attribute ongoing, add char to stack
                } else {
                    //console.log('Attribute ongoing, add char to stack');
                    if (isBehind(string, i, cfg.roundBracket[1])) {
                        // Missing connective
                        throw new ArgumentError(2211, {
                            context: string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1, i-3>=0?7:i-2>=0?6:5),
                            index: i
                        });
                    }

                    isNewSentence = false;
                    stackAttribute += string[i];
                }

            } else if (state === 'value') {
                // Value ends with AND
                if (stackValue.length > 0 &&
                    isAhead(string, i, cfg.and)) {
                    resolve();
                    state = 'attribute';
                    i += cfg.and.length - 1;

                // Value ends with OR
                } else if (stackValue.length > 0 &&
                    isAhead(string, i, cfg.or)) {
                    resolve();
                    state = 'attribute';
                    i += cfg.or.length - 1;

                // Value ends with set delimiter
                } else if (stackValue.length > 0 &&
                    isAhead(string, i, cfg.setDelimiter)) {
                    setValues.push(stackValue);
                    stackValue = '';
                    i += cfg.setDelimiter.length - 1;

                // Value ends with opening bracket
                } else if (stackValue.length > 0 &&
                    isAhead(string, i, cfg.roundBracket[0]) ||
                    isAhead(string, i, cfg.squareBracket[0])) {
                    // Missing connective
                    throw new ArgumentError(2211, {
                        context: string.substr(i-3>=0?i-3:i-2>=0?i-2:i-1, i-3>=0?7:i-2>=0?6:5),
                        index: i
                    });

                // Value ends with closing bracket
                } else if (stackValue.length > 0 &&
                    isAhead(string, i, cfg.roundBracket[1]) ||
                    isAhead(string, i, cfg.squareBracket[1])) {
                    closeBracket();
                    resolve();
                    isNewSentence = false;
                    state = 'attribute';

                // Value ongoing, found a string quotation mark
                } else if (stackValue.length > 0 &&
                    isAhead(string, i, cfg.string)) {
                    // Missing opening string quotation mark
                    if (cfg.validateStrings) {
                        throw new ArgumentError(2212, {
                            context: string.substr(i - 3, 7),
                            index: i + 1
                        });
                    } else {
                        stackValue += string[i];
                    }

                // Value starts with string quotation mark
                } else if (stackValue.length === 0 &&
                    isAhead(string, i, cfg.string)) {

                    lastQuotationMark = i;
                    state = 'string';
                    stackValue += string[i];

                // Value ongoing, add char to stack
                } else {
                    stackValue += string[i];
                }

            } else if (state === 'string') {
                // String closes with quotation mark, go to value state and look for delimiters
                if (isAhead(string, i, cfg.string) &&
                    string[i - 1] !== '\\') {
                    state = 'value';
                }
                // String ongoing or closed, add char to stack
                stackValue += string[i];
            }
        }

        if (state === 'attribute') {
            // throw errors

            //// Missing right-hand side
            //char = string[i+cfg.or.length];
            //if (!(typeof char !== 'undefined' &&
            //    char !== cfg.roundBracket[1][0] &&
            //    char !== cfg.squareBracket[1][0])) {
            //    throw new ArgumentError(2209, {
            //        position: ' at \''+string.substr(i+cfg.or.length-3, 7)+'\' (pos: '+(i+cfg.or.length)+')'
            //    });
            //}

        } else if (state === 'string') {
            if (cfg.validateStrings) {
            // Missing closing quotation mark
                throw new ArgumentError(2213, {
                    context: string.substr(lastQuotationMark-3, 7),
                    index: lastQuotationMark+1
                });
            }
        }
        resolve();
        
        return [string, stmnts];
    }
    
    return tokenizer;
};
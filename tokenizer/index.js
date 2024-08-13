const validateQuery = require('../validate/query');
const validateConfig = require('../validate/config');
const StmntF = require('./Stmnt');
const ArgumentError = require('../error/ArgumentError');
const assert = require('../error/assert');

/**
 * @param {Config} cfg
 * @returns {tokenizer}
 */
module.exports = function factory(cfg) {
    validateConfig(cfg);

    let Stmnt = StmntF(cfg);

    /**
     * @param str1
     * @param pos
     * @param str2
     * @returns {boolean}
     */
    function isAhead(str1, pos, str2) {
        return str1[pos] === str2[0] && str1.substr(pos, str2.length) === str2;
    }

    /**
     * @param str1
     * @param pos
     * @param str2
     * @returns {boolean}
     */
    function isBehind(str1, pos, str2) {
        return str1[pos - 1] === str2[str2.length - 1] && str1.substr(pos - str2.length, str2.length) === str2;
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
        let string;

        if (typeof query === 'string') {
            string = query;
        } else {
            validateQuery(query);
            string = query[0];
        }

        let i;
        let l;
        let j;
        let lj;
        let lastQuotationMark;
        let stackAttribute = '';
        let stackOperator = '';
        let stackValue = '';
        let state = 'attribute';
        let isNewSentence = true;
        let openBrackets = 0;
        let operatorAhead = null;
        let setValues = [];
        let rangeValues = [];
        let stmnts = {};
        let awaitValue = false;

        let ii = 0;

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
                if (rangeValues.length === 1) {
                    rangeValues.push(stackValue);
                } else {
                    setValues.push(stackValue);
                }
                stackValue = '';
            } else if (!stackAttribute) {
                return;
            }

            const id = getIdentifier();
            const stmntLength =
                stackAttribute.length +
                stackOperator.length +
                setValues.join('').length +
                (setValues.length > 0 ? (setValues.length - 1) * cfg.setDelimiter.length : 0) +
                rangeValues.join('').length +
                (rangeValues.length > 0 ? (rangeValues.length - 1) * cfg.rangeDelimiter.length : 0);
            string = string.substr(0, i - stmntLength) + id + string.substr(i, string.length);

            i -= l - string.length;
            l = string.length;

            // console.log('new stmnt', stackAttribute, stackOperator, setValues, rangeValues);
            stmnts[id] = new Stmnt(stackAttribute, stackOperator, setValues, rangeValues);

            stackAttribute = '';
            stackOperator = '';
            setValues = [];
            rangeValues = [];
        }

        if (cfg.validateConnectives) {
            assert((i = string.indexOf(cfg.roundBracket[1] + cfg.squareBracket[0])) === -1, 2211, {
                context: string.substr(
                    i - 3 >= 0 ? i - 3 : i - 2 >= 0 ? i - 2 : i - 1 >= 0 ? i - 1 : i,
                    i - 3 >= 0 ? 7 : i - 2 >= 0 ? 6 : 5
                ),
                index: i
            });
            assert((i = string.indexOf(cfg.squareBracket[1] + cfg.roundBracket[0])) === -1, 2211, {
                context: string.substr(
                    i - 3 >= 0 ? i - 3 : i - 2 >= 0 ? i - 2 : i - 1 >= 0 ? i - 1 : i,
                    i - 3 >= 0 ? 7 : i - 2 >= 0 ? 6 : 5
                ),
                index: i
            });
        }

        for (i = 0, l = string.length; i < l; i++) {
            //console.log(i+' START '+state+' \''+string[i]+'\' \''+string.substr(i)+'\'');

            if (state === 'connective') {
                if (
                    isAhead(string, i, cfg.and) ||
                    isAhead(string, i, cfg.or) ||
                    isAhead(string, i, cfg.roundBracket[1]) ||
                    isAhead(string, i, cfg.squareBracket[1])
                ) {
                    state = 'attribute';
                    i--;
                } else if (string[i] === ' ') {
                    string = string.substr(0, i) + string.substr(i + 1);
                    i--;
                    l--;
                } else {
                    // Missing connective
                    throw new ArgumentError(2211, {
                        context: string.substr(i, i - 3 >= 0 ? 5 : i - 2 >= 0 ? 4 : 3),
                        index: i
                    });
                }
            } else if (state === 'operator') {
                // Check if operator is coming
                operatorAhead = null;
                for (j = 0, lj = cfg.operators.length; j < lj; j++) {
                    if (isAhead(string, i, cfg.operators[j])) {
                        operatorAhead = cfg.operators[j];
                        break;
                    }
                }

                if (operatorAhead || isAhead(string, i, cfg.squareBracket[0])) {
                    state = 'attribute';
                    i--;
                } else if (string[i] === ' ') {
                    string = string.substr(0, i) + string.substr(i + 1);
                    i--;
                    l--;
                } else {
                    // Missing connective
                    throw new ArgumentError(2211, {
                        context: string.substr(i, i - 3 >= 0 ? 5 : i - 2 >= 0 ? 4 : 3),
                        index: i
                    });
                }
            } else if (state === 'attribute') {
                // Check if operator is coming
                operatorAhead = null;
                for (j = 0, lj = cfg.operators.length; j < lj; j++) {
                    if (isAhead(string, i, cfg.operators[j])) {
                        operatorAhead = cfg.operators[j];
                        break;
                    }
                }

                // Attribute ends with operator, add to stack and expect incoming value
                if (operatorAhead) {
                    //console.log('Attribute ends with operator, add to stack and expect incoming value');

                    stackOperator = operatorAhead;
                    state = 'value';
                    i += operatorAhead.length - 1;

                    // Attribute ends with opening round bracket
                } else if (stackAttribute.length > 0 && isAhead(string, i, cfg.roundBracket[0])) {
                    //console.log('Attribute ends with opening round bracket');

                    if (cfg.validateStatements) {
                        // Missing operator and value
                        throw new ArgumentError(2216, { stmnt: stackAttribute });
                    } else {
                        openBracket();
                        resolve();
                    }

                    // Attribute ends with opening square bracket
                } else if (stackAttribute.length > 0 && isAhead(string, i, cfg.squareBracket[0])) {
                    //console.log('Attribute ends with opening square bracket');

                    openBracket();
                    resolve();

                    // Attribute ends with closing round bracket
                } else if (stackAttribute.length > 0 && isAhead(string, i, cfg.roundBracket[1])) {
                    //console.log('Attribute ends with closing round bracket');

                    closeBracket();
                    resolve();
                    // Missing operator and value
                    //throw new ArgumentError(2216, { stmnt: stackAttribute });

                    // Attribute ends with closing square bracket
                } else if (stackAttribute.length > 0 && isAhead(string, i, cfg.squareBracket[1])) {
                    //console.log('Attribute ends with closing square bracket');

                    closeBracket();
                    resolve();

                    // Attribute ends with AND connective
                } else if (stackAttribute.length > 0 && isAhead(string, i, cfg.and)) {
                    //console.log('Attribute ends with AND connective');

                    resolve();
                    // Skip connective
                    i += cfg.and.length - 1;

                    // Attribute ends with OR connective
                } else if (stackAttribute.length > 0 && isAhead(string, i, cfg.or)) {
                    //console.log('Attribute ends with OR connective');

                    resolve();
                    // Skip connective
                    i += cfg.or.length - 1;

                    // Attribute starts with closing bracket
                } else if (
                    stackAttribute.length === 0 &&
                    (isAhead(string, i, cfg.roundBracket[1]) || isAhead(string, i, cfg.squareBracket[1]))
                ) {
                    //console.log('Attribute starts with closing bracket');

                    closeBracket();
                    if (isNewSentence) {
                        // Empty bracket
                        throw new ArgumentError(2210, { position: ' at pos:' + i });
                    }

                    // Attribute starts with opening bracket
                } else if (
                    stackAttribute.length === 0 &&
                    (isAhead(string, i, cfg.roundBracket[0]) || isAhead(string, i, cfg.squareBracket[0]))
                ) {
                    //console.log('Attribute starts with opening bracket');

                    openBracket();
                    isNewSentence = true;

                    // Attribute starts with AND connective
                } else if (stackAttribute.length === 0 && isAhead(string, i, cfg.and)) {
                    //console.log('Attribute starts with AND connective');

                    if (isNewSentence) {
                        // Missing left-hand side
                        throw new ArgumentError(2208, {
                            position:
                                " at '" +
                                string.substr(
                                    i - 3 >= 0 ? i - 3 : i - 2 >= 0 ? i - 2 : i - 1 >= 0 ? i - 1 : i,
                                    i - 3 >= 0 ? 7 : i - 2 >= 0 ? 6 : 5
                                ) +
                                "' (pos: " +
                                i +
                                ')'
                        });
                    }
                    // Skip connective
                    i += cfg.and.length - 1;

                    // Attribute starts with OR connective
                } else if (stackAttribute.length === 0 && isAhead(string, i, cfg.or)) {
                    //console.log('Attribute starts with OR connective');

                    if (isNewSentence) {
                        // Missing left-hand side
                        throw new ArgumentError(2208, {
                            position:
                                " at '" +
                                string.substr(
                                    i - 3 >= 0 ? i - 3 : i - 2 >= 0 ? i - 2 : i - 1 >= 0 ? i - 1 : i,
                                    i - 3 >= 0 ? 7 : i - 2 >= 0 ? 6 : 5
                                ) +
                                "' (pos: " +
                                i +
                                ')'
                        });
                    }
                    // Skip connective
                    i += cfg.or.length - 1;

                    // Attribute has whitespace, remove it
                } else if (string[i] === ' ') {
                    //console.log('Attribute has whitespace');
                    string = string.substr(0, i) + string.substr(i + 1);
                    i--;
                    l--;
                    if (stackAttribute.length > 0) {
                        state = 'operator';
                    }

                    // Attribute ongoing, add char to stack
                } else {
                    //console.log('Attribute ongoing, add char to stack');
                    if (cfg.validateConnectives && isBehind(string, i, cfg.roundBracket[1])) {
                        // Missing connective
                        throw new ArgumentError(2211, {
                            context: string.substr(
                                i - 3 >= 0 ? i - 3 : i - 2 >= 0 ? i - 2 : i - 1,
                                i - 3 >= 0 ? 7 : i - 2 >= 0 ? 6 : 5
                            ),
                            index: i
                        });
                    }

                    isNewSentence = false;
                    stackAttribute += string[i];
                }
            } else if (state === 'value') {
                // Value ends with AND
                if (stackValue.length > 0 && isAhead(string, i, cfg.and)) {
                    resolve();
                    state = 'attribute';
                    i += cfg.and.length - 1;

                    // Value ends with OR
                } else if (stackValue.length > 0 && isAhead(string, i, cfg.or)) {
                    resolve();
                    state = 'attribute';
                    i += cfg.or.length - 1;

                    // Value ends with set delimiter
                } else if (stackValue.length > 0 && isAhead(string, i, cfg.setDelimiter)) {
                    awaitValue = true;
                    setValues.push(stackValue);
                    stackValue = '';
                    i += cfg.setDelimiter.length - 1;

                    // Value ends with range delimiter
                } else if (stackValue.length > 0 && isAhead(string, i, cfg.rangeDelimiter)) {
                    if (rangeValues.length > 0) {
                        throw new ArgumentError(2218, {
                            context: string.substr(i),
                            index: i
                        });
                    }
                    awaitValue = true;
                    rangeValues.push(stackValue);
                    stackValue = '';
                    i += cfg.rangeDelimiter.length - 1;

                    // Value ends with opening bracket
                } else if (
                    (stackValue.length > 0 && isAhead(string, i, cfg.roundBracket[0])) ||
                    isAhead(string, i, cfg.squareBracket[0])
                ) {
                    // Missing connective
                    if (cfg.validateConnectives) {
                        throw new ArgumentError(2211, {
                            context: string.substr(
                                i - 3 >= 0 ? i - 3 : i - 2 >= 0 ? i - 2 : i - 1,
                                i - 3 >= 0 ? 7 : i - 2 >= 0 ? 6 : 5
                            ),
                            index: i
                        });
                    } else {
                        openBracket();
                        resolve();
                    }

                    // Value ends with closing bracket
                } else if (
                    (stackValue.length > 0 && isAhead(string, i, cfg.roundBracket[1])) ||
                    isAhead(string, i, cfg.squareBracket[1])
                ) {
                    closeBracket();
                    resolve();
                    isNewSentence = false;
                    state = 'attribute';
                    awaitValue = false;

                    // Value ongoing, found a string quotation mark
                } else if (stackValue.length > 0 && isAhead(string, i, cfg.string)) {
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
                } else if (stackValue.length === 0 && isAhead(string, i, cfg.string)) {
                    lastQuotationMark = i;
                    state = 'string';
                    stackValue += string[i];

                    // Value has whitespace, remove it, expect operator
                } else if (string[i] === ' ') {
                    //console.log('Value has whitespace', string);
                    string = string.substr(0, i) + string.substr(i + 1);
                    if (stackValue.length > 0) {
                        resolve();
                        state = 'connective';
                    } else {
                        i--;
                        l--;
                    }

                    // Value ongoing, add char to stack
                } else {
                    stackValue += string[i];
                    awaitValue = false;
                }
            } else if (state === 'string') {
                // String closes with quotation mark, go to value state and look for delimiters
                if (isAhead(string, i, cfg.string) && string[i - 1] !== '\\') {
                    state = 'value';
                }
                // String ongoing or closed, add char to stack
                stackValue += string[i];
            }
        }

        if (state === 'string') {
            if (cfg.validateStrings) {
                // Missing closing quotation mark
                throw new ArgumentError(2213, {
                    context: string.substr(lastQuotationMark - 3, 7),
                    index: lastQuotationMark + 1
                });
            }
        }

        if (state === 'value' && awaitValue && stackValue === '') {
            // Missing value
            throw new ArgumentError(2219, { context: string, index: i });
        }

        resolve();

        return [string, stmnts];
    }

    return tokenizer;
};

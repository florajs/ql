const escape = require('../lib/escape');
const validateQuery = require('../validate/query');
const replaceF = require('./replace');
const identifyF = require('./identify');
const expandF = require('./expand');
const lookAheadF = require('./lookAhead');
const lookBehindF = require('./lookBehind');
const assert = require('../error/assert');

/**
 * @param {Config} cfg
 * @returns {simplify}
 */
module.exports = function factory(cfg) {
    const replace = replaceF(cfg);
    const identify = identifyF(cfg);
    const expand = expandF(cfg);
    const lookAhead = lookAheadF(cfg);
    const lookBehind = lookBehindF(cfg);

    /**
     * Resolve a sentence with any amount of terms connected
     * by AND and OR connectives and any amount of round brackets.
     * Return the sentence in disjunctive normal form.
     *
     * @param {Query} query
     * @returns {Query}
     */
    function simplify(query) {
        let sentence;

        if (typeof query === 'string') {
            sentence = query;
        } else {
            validateQuery(query);
            sentence = query[0];
        }

        const bOpen = escape(cfg.roundBracket[0] + cfg.squareBracket[0]);
        const bClose = escape(cfg.roundBracket[1] + cfg.squareBracket[1]);
        const operator = escape(cfg.or + cfg.and);

        assert(
            !new RegExp('[' + bOpen + '][' + operator + '][a-z0-9]|^[' + operator + '][a-z0-9]').exec(sentence),
            2208,
            { position: '' }
        );
        assert(
            !new RegExp('[a-z0-9][' + operator + '][' + bClose + ']|[a-z0-9][' + operator + ']$').exec(sentence),
            2209,
            { position: '' }
        );

        sentence = identify(sentence, function (sentence, bracket, pos) {
            assert(typeof bracket !== 'undefined', 2210, { position: '' });

            let expanded;
            const origin = bracket;
            const behind = lookBehind(sentence, pos + 1);
            const ahead = lookAhead(sentence, pos + 1);

            expanded = [];
            for (let i = 0, l = behind[1].length; i < l; i++) {
                expanded.push(expand(behind[1][i], bracket));
            }
            bracket = expanded.join(cfg.or);

            expanded = [];
            for (let i = 0, l = ahead[1].length; i < l; i++) {
                expanded.push(expand(ahead[1][i], bracket, true));
            }
            bracket = expanded.join(cfg.or);

            if (behind[0] || ahead[0]) {
                bracket = cfg.roundBracket[0] + bracket + cfg.roundBracket[1];
            }

            return replace(
                sentence,
                pos - origin.length - 1 - behind[0].length - (behind[0] ? 1 : 0),
                pos + 1 + ahead[0].length + (ahead[0] ? 1 : 0),
                bracket
            );
        });

        return [sentence, query[1]];
    }

    return simplify;
};

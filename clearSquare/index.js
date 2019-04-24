const validateQuery = require('../validate/query');
const validateConfig = require('../validate/config');
const assert = require('../error/assert');
const config = require('../config');
const replace = require('../simplify/replace')();
const simplifyF = require('../simplify');
const resolveF = require('./resolve');
const relationF = require('./relation');
const identifyF = require('../simplify/identify');
const lookAheadF = require('../simplify/lookAhead');
const lookBehindF = require('../simplify/lookBehind');

/**
 *
 * @param {Config} cfg
 * @returns {clearSquare}
 */
module.exports = function factory(cfg) {
    validateConfig(cfg);

    /*
     * We can reuse the methods available under /simplify with
     * different configurations to help resolving square brackets.
     */

    const relation = relationF(cfg);
    const resolve = resolveF(cfg);
    const simplify = simplifyF(cfg);
    const identify = identifyF(
        config({
            roundBracket: cfg.squareBracket
        })
    );
    const lookAhead = lookAheadF(
        config({
            and: '',
            roundBracket: cfg.squareBracket,
            lookDelimiter: [cfg.or, cfg.and].concat(cfg.roundBracket)
        })
    );
    const lookBehind = lookBehindF(
        config({
            and: '',
            roundBracket: cfg.squareBracket,
            lookDelimiter: [cfg.or, cfg.and].concat(cfg.roundBracket)
        })
    );

    /**
     * Resolve any square brackets in the query. Creates relations between
     * statements and merges them afterwards.
     *
     * @param {Query|string} query
     * @param {Config} [config]
     * @returns {Query}
     */
    function clearSquare(query, config) {
        let sentence;

        if (typeof query === 'string') {
            sentence = query;
        } else {
            validateQuery(query);
            sentence = query[0];
        }

        sentence = identify(sentence, function(sentence, bracket, pos) {
            assert(typeof bracket !== 'undefined', 2210, { position: '' });

            const origin = bracket;
            const ahead = lookAhead(sentence, pos + 1);
            const behind = lookBehind(sentence, pos + 1);

            bracket = simplify(bracket)[0];

            if (ahead && ahead[0] !== '') {
                bracket = relation(bracket, ahead[1].join(cfg.or));
            }
            if (behind && behind[0] !== '') {
                if (config && config.elemMatch) {
                    (function(behind) {
                        for (let i = 0, l = behind.length; i < l; i++) {
                            if (behind[i] in query[1]) {
                                query[1][behind[i]].elemMatch();
                            }
                        }
                    })(
                        [].concat.apply(
                            [],
                            behind[1].map(function(e) {
                                return e.match(/e[0-9]+/g);
                            })
                        )
                    );
                }

                bracket = relation(behind[1].join(cfg.or), bracket);
            }

            if (behind[0] || ahead[0]) {
                bracket = cfg.squareBracket[0] + bracket + cfg.squareBracket[1];
            } else {
                bracket = cfg.roundBracket[0] + bracket + cfg.roundBracket[1];
            }

            return replace(sentence, pos - origin.length - 1 - behind[0].length, pos + 1 + ahead[0].length, bracket);
        });

        return resolve([sentence, query[1]]);
    }

    return clearSquare;
};

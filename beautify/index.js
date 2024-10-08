const validateQuery = require('../validate/query');
const validateConfig = require('../validate/config');
const assert = require('../error/assert');
const ArgumentError = require('../error/ArgumentError');

/**
 * @param {Config} cfg
 * @returns {beautify}
 */
module.exports = function factory(cfg) {
    /**
     * Take an internal Query object and generate a two-dimensional
     * array with the parsed statements.
     *
     * @param {Query} query
     * @param {Config} [config]
     * @returns {Array}
     * @throws {ArgumentError}
     */
    function beautify(query, config) {
        validateQuery(query);
        config = config || cfg;
        validateConfig(config);

        const result = [];

        const sentence = query[0].split(cfg.or);
        for (let i = 0, l = sentence.length; i < l; i++) {
            const conjunction = sentence[i].split(cfg.and);
            result.push([]);

            for (let j = 0, lj = conjunction.length; j < lj; j++) {
                if (conjunction[j] in query[1]) {
                    const term = query[1][conjunction[j]];

                    if (cfg.validateStatements) {
                        assert(term.attribute !== null && term.attribute !== '', 2215, { stmnt: term.toString() });
                        assert(term.operator !== null && term.operator !== '', 2216, { stmnt: term.toString() });
                        assert(
                            term.value === null ||
                                term.value === '' ||
                                term.value.length !== 0 ||
                                (term.range && term.range.length === 2),
                            2217,
                            {
                                stmnt: term.toString()
                            }
                        );
                    }

                    const res = {
                        attribute: (term.attribute || '').split(config.glue),
                        operator: term.operator
                    };
                    if (term.range && term.range.length === 2) res.range = term.range;
                    else res.value = term.value;

                    result[result.length - 1].push(res);
                } else {
                    throw new ArgumentError(2202);
                }
            }
        }

        return result;
    }

    return beautify;
};

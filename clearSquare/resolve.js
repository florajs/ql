const validateQuery = require('../validate/query');
const validateConfig = require('../validate/config');
const escape = require('../lib/escape');

/**
 * @param {Config} cfg
 * @returns {resolve}
 */
module.exports = function factory(cfg) {
    validateConfig(cfg);

    const regexp = new RegExp('e[0-9_]+' + escape(cfg.relate) + 'e[0-9_]+');

    /**
     * Resolve any relations and merge the statements.
     *
     * @param {Query} query
     * @returns {Query}
     */
    function resolve(query) {
        validateQuery(query);

        let sentence = query[0];
        const stmnts = query[1];

        let s;
        while ((s = regexp.exec(sentence))) {
            const terms = s[0].split(cfg.relate);
            const id = 'e' + (terms[0] + '_' + terms[1]).replace(/e/g, '');

            if (terms[0] in stmnts && terms[1] in stmnts) {
                stmnts[id] = stmnts[terms[0]].merge(stmnts[terms[1]]);
            }

            sentence = sentence.replace(s[0], id);
        }

        return [sentence, stmnts];
    }

    return resolve;
};

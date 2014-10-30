var validateQuery   = require('../validate/query'),
    validateConfig  = require('../validate/config'),
    escape          = require('../lib/escape');

/**
 * 
 * @param {Config} cfg
 * @returns {resolve}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var regexp = new RegExp('e[0-9_]+'+escape(cfg.relate)+'e[0-9_]+');

    /**
     * Resolve any relations and merge the statements.
     * 
     * @param {Query} query
     * @returns {Query}
     */
    
    function resolve(query) {
        validateQuery(query);
        
        var s, terms, id,
            sentence = query[0],
            stmnts = query[1];
        
        while(s = regexp.exec(sentence)) {
            terms = s[0].split(cfg.relate);
            id = 'e'+((terms[0]+'_'+terms[1]).replace(/e/g, ''));
            
            if (terms[0] in stmnts && terms[1] in stmnts) {
                stmnts[id] = stmnts[terms[0]].merge(stmnts[terms[1]]);
            }
            
            sentence = sentence.replace(s[0], id);
        }
        
        return [sentence, stmnts];
    }
    
    return resolve;
};
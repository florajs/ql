var escape = require('../lib/escape')();

module.exports = function factory(config) {
    var regexp = new RegExp('e[0-9_]+'+escape(config.relate)+'e[0-9_]+');

    /**
     * 
     * @param query
     * @returns {*[]}
     */
    
    
    function resolve(query) {
        var s, terms, id,
            sentence = query[0],
            stmnts = query[1];
        
        while(s = regexp.exec(sentence)) {
            terms = s[0].split(config.relate);
            id = 'e'+((terms[0]+'_'+terms[1]).replace(/e/g, ''));
            
            //console.log('new id', id);
            //console.log(terms[0] in stmnts && terms[1] in stmnts, terms[0], terms[1]);
            if (terms[0] in stmnts && terms[1] in stmnts) {
                stmnts[id] = stmnts[terms[0]].merge(stmnts[terms[1]]);
            }
            //console.log(Object.keys(stmnts));
            
            sentence = sentence.replace(s[0], id);
        }
        
        return [sentence, stmnts];
    }
    
    return resolve;
};
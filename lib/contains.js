var util = require('util');

module.exports = function factory() {
    
    function contains(a, b) {
        var i, l;
        
        if (typeof a !== typeof b) { return false; }
        
        if (util.isArray(a)) {
            if (!util.isArray(b)) { return false; }
            if (a.length !== b.length) { return false; }
            for (i=0, l=a.length; i<l; i++) {
                if (!contains(a[i], b[i])) { return false; }
            }
            
        } else if (typeof a === 'object') {
            for (i in b) {
                if (!b.hasOwnProperty(i)) { continue; }
                if (!a.hasOwnProperty(i)) { return false; }
                if (!contains(a[i], b[i])) { return false; }
            }
            
        } else if (a !== b) { return false; }
        
        return true;
    }
    
    return contains;
};
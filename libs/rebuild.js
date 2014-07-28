/**
 * 
 * @param {[string, object]} query
 * @returns {object}
 */

module.exports = function rebuild(query) {
    var i, l, j, lj, s, row, c, 
        res = [], last = null;
    
    s = query[0].split('+');
    for (i=0, l=s.length; i<l; i++) {
        s[i] = s[i].split('*');
        
        row = {};
        for (j=0, lj=s[i].length; j<lj; j++) {
            c = s[i][j];
            if (!(c in query[1])) { continue; }
            
            c = query[1][c];
            if (!c[0]) {
                if (!last) { continue; }
                c[0] = last; 
            }
            
            if (!(c[0] in row)) {
                row[c[0]] = [];
            }
            row[c[0]].push(c[1]);
            
            last = c[0];
        }
        
        res.push(row);
    }
    
    return res;
};
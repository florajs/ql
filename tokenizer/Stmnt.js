module.exports = function factory(config) {

    /**
     * 
     * @param str
     * @constructor
     */

    function Stmnt(str) {
        this.operator   = null;
        this.value      = null;
        this.attribute  = null;
        this.config     = config;
        if (!str) { return; }
        
        var i, l, split;
        
        for (i=0, l=this.config.operators.length; i<l; i++) {
            if (str.lastIndexOf(this.config.operators[i]) !== -1) {
                this.operator = this.config.operators[i];
                break;
            }
        }

        split = str.split(this.operator);
        if (split.length === 1) {
            this.attribute = split[0];
        } else {
            this.value = split.pop();
            this.attribute = split.join(this.operator);
        }

        if (this.value) {
            if (this.value[0] === config.string ||
                this.value === 'true' ||
                this.value === 'false') {
                try {
                    this.value = JSON.parse(this.value);
                } catch(err) {
                    this.value = null;
                }
            }
        
            var tmp = parseFloat(this.value);
            if (!isNaN(tmp)) {
                this.value = tmp;
            }
        }
    }

    /**
     * 
     * @returns {*}
     */
    
    Stmnt.prototype.toString = function toString() {
        return this.attribute+this.operator+JSON.stringify(this.value);
    };

    /**
     * 
     * @returns {*}
     */
    
    Stmnt.prototype.toJSON = function toJSON() {
        return this.toString();
    };

    /**
     * 
     */
    
    Stmnt.prototype.clone = function clone() {
        var stmnt = new Stmnt();
        stmnt.operator = this.operator;
        stmnt.value = this.value;
        stmnt.attribute = this.attribute;
        stmnt.config = this.config;
        return stmnt;
    };

    /**
     * 
     * @param b
     */
    
    Stmnt.prototype.merge = function merge(b) {
        var clone = this.clone();
        
        clone.attribute += clone.config.glue+b.attribute;
        clone.config = b.config;
        // todo throw error if own value is set
        clone.operator = b.operator;
        // todo throw error if own value is set
        clone.value = b.value;
        
        return clone;
    };
    
    return Stmnt;
};
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
        
        var i, l, split;
    
        if (str) {
            for (i=0, l=this.config.operators.length; i<l; i++) {
                if (str.indexOf(this.config.operators[i]) !== -1) {
                    this.operator = this.config.operators[i];
                    break;
                }
            }
    
            split = str.split(this.operator);
            this.attribute = split.shift();
            this.value = split.join(this.operator) || null;
    
            if (this.value && this.value[0] === '"') {
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
        return this.attribute+this.operator+this.value;
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
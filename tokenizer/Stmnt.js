var validateConfig  = require('../validate/config'),
    ArgumentError   = require('../error/ArgumentError');

/**
 * 
 * @param {Config} cfg
 * @returns {Stmnt}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    /**
     * Class to store and parse a statement of a 
     * query string.
     * 
     * @param {string} [str]
     * @class
     * @constructor
     */

    function Stmnt(str) {
        /** @member {string} */
        this.operator   = null;
        /** @member {string} */
        this.value      = null;
        /** @member {string} */
        this.attribute  = null;
        /** @member {Config} */
        this.config     = cfg;

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
        
        if (this.value === '') {
            this.value = null;

        } else if (this.value) {
            if (this.value === 'undefined') {
                this.value = undefined;
                
            } else if (this.value[0] === cfg.string ||
                this.value === 'true' ||
                this.value === 'false' ||
                this.value === 'null') {
                try {
                    this.value = JSON.parse(this.value);
                } catch(e) {
                    this.value = null;
                }

            } else {
                var tmp = parseFloat(this.value);
                if (isNaN(tmp)) {
                    throw new ArgumentError(2214, { value: this.value });
                } else {
                    this.value = tmp;
                }
            }
        }
    }

    /**
     * Create a human readable string of the statement.
     * 
     * @returns {string}
     */
    
    Stmnt.prototype.toString = function toString() {
        return (this.attribute||'')+(this.operator||'')+(this.value===null?'':JSON.stringify(this.value));
    };

    /**
     * If serialized with JSON.stringify, will return a human readable string of the statement.
     * 
     * @returns {string}
     */
    
    Stmnt.prototype.toJSON = function toJSON() {
        return this.toString();
    };

    /**
     * Simple shallow clone of the statement.
     * 
     * @returns {module.Stmnt}
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
     * Merge a provided second Stmnt with itself into a new one. 
     * It will not change the current Stmnt.
     * 
     * @param {module.Stmnt} b
     * @returns {module.Stmnt}
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
var validateConfig  = require('../validate/config'),
    util = require('util'),
    ArgumentError   = require('../error/ArgumentError');

/**
 * 
 * @param {Config} cfg
 * @returns {Stmnt}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);

    var currentElemMatchId = 0;

    /**
     * Class to store and parse a statement of a 
     * query string.
     * 
     * @param {string} [attribute]
     * @param {string} [operator]
     * @param {Array} [values]
     * @class
     * @constructor
     */

    function Stmnt(attribute, operator, values) {
        /** @member {string} */
        this.attribute  = attribute || null;
        /** @member {string} */
        this.operator   = operator || null;
        /** @member {Array|string} */
        this.value      = values || null;
        /** @member {Config} */
        this.config     = cfg;

        /*
         * Parse value
         */

        if (this.value) {
            if (!util.isArray(this.value)) { this.value = [this.value]; }
            for (var i=this.value.length, tmp; i--;) {
                if (this.value[i] === 'undefined') {
                    this.value[i] = undefined;

                } else if (this.value[i][0] === cfg.string ||
                    this.value[i] === 'true' ||
                    this.value[i] === 'false' ||
                    this.value[i] === 'null') {
                    try {
                        this.value[i] = JSON.parse(this.value[i]);
                    } catch (e) {
                        this.value[i] = null;
                    }

                } else {
                    tmp = parseFloat(this.value[i]);
                    if (isNaN(tmp)) {
                        if (cfg.validateStrings) {
                            throw new ArgumentError(2214, {value: this.value[i]});
                        }
                    } else {
                        this.value[i] = tmp;
                    }
                }
            }
            if (this.value.length === 1) { this.value = this.value[0]; }
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
     * @returns {Stmnt}
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
     * @param {Stmnt} b
     * @returns {Stmnt}
     */
    
    Stmnt.prototype.merge = function merge(b) {
        var clone = this.clone();

        if (b.attribute !== null && b.attribute !== '') {
            if (b.attribute.indexOf(b.config.glue) === 0) {
                clone.attribute = this.attribute+clone.config.glue+b.attribute.substr(b.config.glue.length);
            } else {
                clone.attribute = this.attribute+clone.config.glue+b.attribute;
            }

        }
        // todo throw error if own value is set
        clone.operator = b.operator;
        // todo throw error if own value is set
        clone.value = b.value;
        
        return clone;
    };

    /**
     * This statement will reference a single array entry, if
     * elemMatch is active, instead of multiple entries.
     *
     * @see https://docs.boerse-go.de/pages/viewpage.action?pageId=36339864
     * @param {boolean} [disable]
     */

    Stmnt.prototype.elemMatch = function elemMatch(disable) {
        if (!disable ) {
            if (this.attribute.split('.').pop().indexOf(this.config.relate) !== -1) { return; }
            this.attribute += this.config.relate+currentElemMatchId++;
        } else {
            this.attribute = this.attribute.split(this.config.relate)[0];
        }
    };
    
    return Stmnt;
};
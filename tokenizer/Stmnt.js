const util = require('util');

const validateConfig = require('../validate/config');
const ArgumentError = require('../error/ArgumentError');

/**
 * @param {Config} cfg
 * @returns {Stmnt}
 */
module.exports = function factory(cfg) {
    validateConfig(cfg);

    let currentElemMatchId = 0;

    function parseValue(value) {
        if (value === 'undefined') throw new ArgumentError(2220, { value });

        if (value[0] === cfg.string || value === 'true' || value === 'false' || value === 'null') {
            try {
                return JSON.parse(value);
            } catch {
                return null;
            }
        }

        if (isNaN(value)) {
            if (cfg.validateStrings) {
                throw new ArgumentError(2214, { value });
            }
        }
        return parseFloat(value);
    }

    /**
     * Class to store and parse a statement of a
     * query string.
     *
     * @param {string} [attribute]
     * @param {string} [operator]
     * @param {Array} [values]
     * @param {Array} [range]
     * @class
     * @constructor
     */
    function Stmnt(attribute, operator, values, range) {
        /** @member {string} */
        this.attribute = attribute || null;
        /** @member {string} */
        this.operator = operator || null;
        /** @member {Array|string} */
        this.value = values || null;
        /** @member {Array|string} */
        this.range = range || null;
        /** @member {Config} */
        this.config = cfg;

        /*
         * Parse value
         */
        if (this.value) {
            if (!util.isArray(this.value)) {
                this.value = [this.value];
            }
            for (let i = this.value.length; i--; ) {
                this.value[i] = parseValue(this.value[i]);
            }
            if (this.value.length === 1) {
                this.value = this.value[0];
            }
        }

        /*
         * Parse range
         */
        if (this.range && util.isArray(this.range) && this.range.length === 2) {
            this.range[0] = parseValue(this.range[0]);
            this.range[1] = parseValue(this.range[1]);
        }
    }

    /**
     * Create a human readable string of the statement.
     *
     * @returns {string}
     */
    Stmnt.prototype.toString = function toString() {
        return (this.attribute || '') + (this.operator || '') + (this.value === null ? '' : JSON.stringify(this.value));
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
        const stmnt = new Stmnt();
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
        const clone = this.clone();

        if (b.attribute !== null && b.attribute !== '') {
            if (b.attribute.indexOf(b.config.glue) === 0) {
                clone.attribute += clone.config.glue + b.attribute.substr(b.config.glue.length);
            } else {
                clone.attribute += clone.config.glue + b.attribute;
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
     * @param {boolean} disable
     */
    Stmnt.prototype.elemMatch = function elemMatch(disable) {
        if (!disable) {
            // elemMatch already active
            if (this.attribute.indexOf(this.config.relate) !== -1) {
                return;
            }

            this.attribute += this.config.relate + currentElemMatchId++;
        } else {
            this.attribute = this.attribute.split(this.config.relate)[0];
        }
    };

    return Stmnt;
};

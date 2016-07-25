var util            = require('util'),
    validateConfig  = require('../validate/config');

/**
 * 
 * @param {Config} cfg
 * @returns {lookAhead}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var delimiters = util.isArray(cfg.lookDelimiter)? cfg.lookDelimiter : [cfg.lookDelimiter];

    /**
     * Find any terms ahead of the provided position. Stops if 
     * delimiter (like OR connective) is found. If a bracket 
     * ahead contains any more brackets itself, ignore the term.
     * 
     * @param {string} str
     * @param {number} pos
     * @returns {[string, Array]}
     */

    function lookAhead(str, pos) {
        var i, isDelimiter, isEOF,
            level = 0,
            parts = [''],
            part = '',
            whole = '',
            delimiter = '',
            firstOp = str[pos] || '',
            firstDelimiters = delimiters.map(function(value) { return value[0];}).join(''),
            state = 'stmnt';

        if (str[pos] === cfg.roundBracket[0] || pos === str.length-1) {
            return ['', [''], ''];
        }

        for (i=pos; i<=str.length; i++) {
            isEOF = i === str.length;
            isDelimiter = false;

            if (state === 'stmnt') {
                if (isEOF) {
                    if (part) { parts.push(part); whole += part; }

                } else if (firstDelimiters.indexOf(str[i]) !== -1) {
                    delimiter = delimiters[firstDelimiters.indexOf(str[i])];
                    state = 'delimiter';
                    level = 1;
                    if (part) { parts.push(part); whole += part; }
                    part = '';
                    part += str[i];

                } else if (str[i] === cfg.roundBracket[1]) {
                    if (part) { parts.push(part); whole += part; }
                    break;

                } else if (str[i] === cfg.roundBracket[0]) {
                    state = 'brckt';
                    level = 1;
                    part += str[i];

                } else if (str[i] === cfg.and[0] || str[i] === cfg.relate[0]) {
                    state = 'op';
                    level = 1;
                    if (part) { parts.push(part); whole += part; }
                    part = '';
                    part += str[i];

                } else {
                    part += str[i];
                }

            }  else if (state === 'brckt') {
                if (isEOF) {
                    throw new Error('Damn');

                } else if (str[i] === cfg.roundBracket[1]) {
                    level--;

                } else if (str[i] === cfg.roundBracket[0]) {
                    level++;
                }

                part += str[i];

                if (level === 0) {
                    state = 'stmnt';
                }

            } else if (state === 'op') {
                if (isEOF) {
                    throw new Error('Damn');

                } else if (str[i] === cfg.and[level] || str[i] === cfg.relate[level]) {
                    level++;
                    part += str[i];

                } else if (part === cfg.and || part === cfg.relate) {
                    state = 'stmnt';
                    if (whole) { whole += part; }
                    part = '';
                    i--;

                } else {
                    state = 'stmnt';
                    part = parts[parts.length-1]+part+str[i];
                    whole = whole.substr(0, parts.pop().length)
                }

            } else if (state === 'delimiter') {
                if (isEOF) {
                    throw new Error('Damn');

                } else if (str[i] === delimiter[level]) {
                    level++;
                    part = str[i]+part;

                } else if (part === delimiter) {
                    break;

                } else {
                    state = 'stmnt';
                    part = parts[parts.length-1]+part+str[i];
                    whole = whole.substr(0, parts.pop().length)
                }
            }
        }

        if (parts.length > 1) {
            parts.shift();
        }

        return [whole, parts, firstOp];
    }
    
    return lookAhead;
};
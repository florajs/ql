var util            = require('util'),
    validateConfig  = require('../validate/config');

/**
 * 
 * @param {Config} cfg
 * @returns {lookBehind}
 */

module.exports = function factory(cfg) {
    validateConfig(cfg);
    
    var delimiters = util.isArray(cfg.lookDelimiter)? cfg.lookDelimiter : [cfg.lookDelimiter];

    /**
     * Find any terms behind of the provided position. Stops if
     * delimiter (like OR connective) is found. If a bracket
     * behind contains any more brackets itself, ignore the term.
     * 
     * @param {string} str
     * @param {number} pos
     * @returns {[string, Array]}
     */
    
    function lookBehind(str, pos) {
        var i, isDelimiter, isEOF,
            level = 0,
            parts = [''],
            part = '',
            whole = '',
            delimiter = '',
            firstOp = str[pos] || '',
            firstDelimiters = delimiters.map(function(value) { return value[0];}).join(''),
            state = 'stmnt';

        if (str[pos] === cfg.roundBracket[0] || pos === 0) {
            return ['', [''], ''];
        }
        
        for (i=pos; i>=-1; i--) {
            isEOF = i === -1;
            isDelimiter = false;

            if (state === 'stmnt') {
                if (isEOF) {
                    if (part) { parts.unshift(part); whole = part+whole; }

                } else if (firstDelimiters.indexOf(str[i]) !== -1) {
                    delimiter = delimiters[firstDelimiters.indexOf(str[i])];
                    state = 'delimiter';
                    level = 1;
                    if (part) { parts.unshift(part); whole = part+whole; }
                    part = '';
                    part = str[i]+part;

                } else if (str[i] === cfg.roundBracket[0]) {
                    if (part) { parts.unshift(part); whole = part+whole; }
                    break;

                } else if (str[i] === cfg.roundBracket[1]) {
                    state = 'brckt';
                    level = 1;
                    part = str[i]+part;

                } else if (str[i] === cfg.and[cfg.and.length-1] || str[i] === cfg.relate[cfg.relate.length-1]) {
                    state = 'op';
                    level = 1;
                    if (part) { parts.unshift(part); whole = part+whole; }
                    part = '';
                    part = str[i]+part;

                } else {
                    part = str[i]+part;
                }

            }  else if (state === 'brckt') {
                if (isEOF) {
                    throw new Error('Damn');

                } else if (str[i] === cfg.roundBracket[0]) {
                    level--;

                } else if (str[i] === cfg.roundBracket[1]) {
                    level++;
                }

                part = str[i]+part;

                if (level === 0) {
                    state = 'stmnt';
                }

            } else if (state === 'op') {
                if (isEOF) {
                    throw new Error('Damn');

                } else if (str[i] === cfg.and[cfg.and.length-1-level] || str[i] === cfg.relate[cfg.relate.length-1-level]) {
                    level++;
                    part = str[i]+part;

                } else if (part === cfg.and || part === cfg.relate) {
                    state = 'stmnt';
                    if (whole) { whole = part+whole; }
                    part = '';
                    i++;

                } else {
                    state = 'stmnt';
                    part = str[i]+part+parts[0];
                    whole = whole.substr(parts.shift().length);
                }

            } else if (state === 'delimiter') {
                if (isEOF) {
                    throw new Error('Damn');

                } else if (str[i] === delimiter[delimiter.length-1-level]) {
                    level++;
                    part = str[i]+part;

                } else if (part === delimiter) {
                    break;

                } else {
                    state = 'stmnt';
                    part = str[i]+part+parts[0];
                    whole = whole.substr(parts.shift().length);
                }
            }
        }

        if (parts.length > 1) {
            parts.pop();
        }

        return [whole, parts, firstOp];
    }
    
    return lookBehind;
};
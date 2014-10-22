function Stmnt(config, str) {
    this.operator   = null;
    this.value      = null;
    this.attribute  = null;
    this.config     = config;

    for (var i=0, l=config.operators.length; i<l; i++) {
        if (str.indexOf(config.operators[i]) !== -1) {
            this.operator = config.operators[i];
            break;
        }
    }

    var split = str.split(this.operator);
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

Stmnt.prototype.toString = function toString() {
    return this.attribute+this.operator+this.value;
};

module.exports = Stmnt;
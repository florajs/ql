function replaceOperators(config, query) {
    query[0] = query[0].replace(new RegExp(config.and, 'g'), '*');
    query[0] = query[0].replace(new RegExp(config.or, 'g'), '+');
    
    return query;
}

module.exports = replaceOperators;
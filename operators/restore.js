function operatorsRestore(config, query) {
    query[0] = query[0].replace(/\*/g, config.and);
    query[0] = query[0].replace(/\+/g, config.or);
    
    return query;
}

module.exports = operatorsRestore;
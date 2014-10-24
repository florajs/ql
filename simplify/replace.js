function replace(source, from, to, newPart) {
    return source.substr(0, from) + newPart + source.substr(to, source.length);
}

module.exports = replace;
function trimCity(str) {
    str = str.toLowerCase();
    str = str.split(',')[0];
    str = str.replace("\"", "");
    return str;
}

module.exports = { trimCity };
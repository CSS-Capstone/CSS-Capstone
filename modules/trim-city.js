function trimCity(str) {
    if(str.length === 2) {
        str = "seattle";
    }
    str = str.toLowerCase();
    str = str.split(',')[0];
    str = str.replace("\"", "");
    return str;
}

module.exports = { trimCity };
function trimCity(str) {
    if (typeof str === 'undefined') {
        console.log("We got undefined data", str);
        str = "seattle";
    }
    else if(str.length === 2) {
        str = "seattle";
    }
    str = str.toLowerCase();
    str = str.split(',')[0];
    str = str.replace("\"", "");
    return str;
}

module.exports = { trimCity };
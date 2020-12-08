function trimCity(str) {
    let uppercaseCounter = 0;
    if (typeof str === 'undefined') {
        console.log("We got undefined data", str);
        str = "seattle";
    }
    else if(str.length === 2) {
        str = "seattle";
    }
    str = str.split(',')[0];
    str = str.replace("\"", "");
    for (let i = 1; i < str.length; i++) {
        if (str.charAt(i) == str.charAt(i).toUpperCase()) {
            // console.log("---Upper---");
            // console.log(str.charAt(i))
            uppercaseCounter++;
        } else {
            // console.log("???");
            // console.log(str.charAt(i))
        }
    }
    if (uppercaseCounter > 2) {
        str = str.split(' ')[0];
        console.log(str);
    }
    str = str.toLowerCase();
    return str;
}

module.exports = { trimCity };
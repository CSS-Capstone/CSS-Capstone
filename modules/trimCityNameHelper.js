function trimCitiyNameHelper(locationName) {
    let trimLocation = locationName;
    let trimmedLocation = ``;
    let spliceIndex = -1;
    for (let i = 0; i < trimLocation.length; i++) {
        if (trimLocation.charAt(i) === ',') {
            spliceIndex = i;
            trimmedLocation = trimLocation.slice(0,i);
            break;
        }
    }
    console.log("Trimmed Location: ", trimmedLocation);
    console.log(spliceIndex);
    return trimmedLocation;
}

module.exports = { trimCitiyNameHelper };
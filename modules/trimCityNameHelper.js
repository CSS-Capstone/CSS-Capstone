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

function trimCityNameAndCountryName(hotelLocation) {
    let theHotelCityName = ``;
    let theHotelCountyName = ``;
    if (hotelLocation.length === 0) {
        console.log("You have empty Location");
        return false;
    }
    let trimmedHotelLocation = hotelLocation.trim();
    for (let i = 0; i < trimmedHotelLocation.length; i++) {
        if (trimmedHotelLocation.charAt(i) === ',') {
            theHotelCityName = trimmedHotelLocation.slice(0,i);
            break;
        }
    }
    for (let i = trimmedHotelLocation.length; i >= 0; i--) {
        if (trimmedHotelLocation.charAt(i) === ',') {
            theHotelCountyName = trimmedHotelLocation.slice(i+1);
            theHotelCountyName = theHotelCountyName.trim();
            break;
        }
    } 
    return [theHotelCityName, theHotelCountyName];
}

module.exports = { trimCitiyNameHelper, trimCityNameAndCountryName };

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

function addSemiToEachImageData(imageArray) {
    let convertedImageData = [];
    console.log(imageArray.length);
    if (typeof(imageArray) == 'string') {
        console.log("here single data passed!");
        convertedImageData = `'${imageArray}'`;
        return convertedImageData;
    } else {
        for (let i = 0; i < imageArray.length; i++) {
            convertedImageData.push(`'${imageArray[i]}'`);
        }
        return convertedImageData;
    }
}

function validateCheckInAndOutDate(checkin, checkout) {
    let insertedCheckin = checkin;
    let insertedCheckout = checkout;
    if (insertedCheckin.trim().length === 0 || insertedCheckin == null || typeof(insertedCheckin) === 'undefined') {
        insertedCheckin = new Date();
        let dd = insertedCheckin.getDate() + 1;
        let mm = insertedCheckin.getMonth() + 1;
        let yyyy = insertedCheckin.getFullYear();
        let today = mm + '/' + dd + '/' + yyyy;
        // console.log("TODAY ");
        // console.log(today.toString());
        insertedCheckin = today.toString();
    }
    if (insertedCheckout.trim().length === 0 || insertedCheckout == null || typeof(insertedCheckout) === 'undefined') {
        insertedCheckout = new Date();
        let dd = insertedCheckout.getDate() + 2;
        let mm = insertedCheckout.getMonth() + 1;
        let yyyy = insertedCheckout.getFullYear();
        let tomorrow = mm + '/' + dd + '/' + yyyy;
        insertedCheckout = tomorrow;
    }
    return [insertedCheckin, insertedCheckout];
}

function isInputEmpty(commentReview) {
    let comment = '';
    if (typeof (commentReview) === 'undefined') {
        commentReview = '';
    }
    commentReview.length <= 0 ?  comment = 'no comment from user' : comment = commentReview;
    return comment;
}

module.exports = { trimCitiyNameHelper, trimCityNameAndCountryName, addSemiToEachImageData, validateCheckInAndOutDate, isInputEmpty };

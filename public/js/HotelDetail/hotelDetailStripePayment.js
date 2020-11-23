const hotelBookBtn = document.querySelector('.hotelDetail_book_btn');
const hotelRateDOMEle = document.querySelector('.hotel_rating');
const StripePublicKey = hotelBookBtn.getAttribute('data-stripe-id');

// Event Listener
hotelBookBtn.addEventListener('click', (event) => {
    organizeDataFromStripe();
});

let stripeHandler = StripeCheckout.configure({
    key: publicStripeKey
,   locale: 'auto'
,   name: "Hotel Finder"
,   description: "4242 4242 4242 4242 for Card-Number"
,   token: function(token) {
        console.log(token);
        const body = sendStripeDataForBack_End();
        const hotelBookingId = body.hotelId;
        fetch(`/hotel/searched/detail/${hotelBookingId}/payment`, {
            method: 'POST',
            headers: {
                // tell server what data we are posting
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                body: body
            ,   token: token.id
            ,   email: token.email
            })
        }).then(response => {
            console.log("Reponse From fetch: ", response);
            window.location.replace(response.url);
        }).catch(error => {
            console.log(error);
        });
    }
});

function sendStripeDataForBack_End() {
    const theInformationForStripe = calculateTotal();
    const theTotalHotelPriceStripe = theInformationForStripe[0];
    const theTotalGuestNumStripe = theInformationForStripe[1];
    const theRoomTypeStripe = theInformationForStripe[2];
    const hotelBookingId = hotelBookBtn.getAttribute('data-hotel-id');
    const hotelNameDOM  = document.querySelector('.hotelDetail_hotelName');
    const hotelName = hotelNameDOM.getAttribute(`data-hotel-label`);
    const hotelLocationDOM = document.querySelector('.hotelDetail_hotelLocation');
    const hotelLocation = hotelLocationDOM.getAttribute('data-hotel-location');
    const hotelAddressDOM = document.querySelector('.hotelDetail_address');
    const hotelAddress = hotelAddressDOM.getAttribute('data-hotel-address');
    // const hotelDefaultPrice = document.querySelector('.hotelDetail_default_hotelPrice').value;
    const hotelRateAttribute = Number(hotelRateDOMEle.getAttribute('data-rate-value'));
    const hotelDefaultPrice = grabAllHotelRate(hotelRateAttribute);
    // Hotel Date
    const hotelCheckInDate = document.querySelector('#from');
    const hotelCheckOutDate = document.querySelector('#to');
    let hotelCheckInDateValue = hotelCheckInDate.value;
    let hotelCheckOutDateValue = hotelCheckOutDate.value;
    console.log(hotelBookingId);
    console.log(theTotalHotelPriceStripe);
    console.log(hotelName);
    console.log(hotelLocation);
    console.log(hotelAddress);
    console.log(hotelDefaultPrice);
    console.log(hotelCheckInDateValue);
    console.log(hotelCheckOutDateValue);
    const body = {
        hotelId: hotelBookingId
    ,   totalPrice: theTotalHotelPriceStripe
    ,   guestNumber: theTotalGuestNumStripe
    ,   roomType: theRoomTypeStripe
    ,   hotelName: hotelName
    ,   hotelLocation: hotelLocation
    ,   hotelAddress: hotelAddress
    ,   hotelDefaultPrice:hotelDefaultPrice
    ,   hotelCheckInDate:hotelCheckInDateValue
    ,   hotelCheckOutDate: hotelCheckOutDateValue
    }
    return body;
}

// Date Checker
function checkDateInputValidation() {
    
}

function organizeDataFromStripe() {
    // Date Checker
    const hotelCheckInDate = document.querySelector('#from');
    const hotelCheckOutDate = document.querySelector('#to');
    const checkDateValidation = document.querySelector('.checkDateValidation');
    console.log(hotelCheckInDate.value);
    if (hotelCheckInDate.value.trim() === '' || hotelCheckInDate.value == null) {
        console.log("It is returning false");
        checkDateValidation.textContent = 'Please select desired check in date';
        setTimeout(() => {
            checkDateValidation.textContent = '';
        }, 2000);
        return false;
    }
    if (hotelCheckOutDate.value.trim() === '' || hotelCheckOutDate.value == null) {
        console.log("It is returning false");
        checkDateValidation.textContent = 'Please select desired check out date';
        setTimeout(() => {
            checkDateValidation.textContent = '';
        }, 2000);
        return false;
    }
    // stripe front-end
    const theInformationForStripe = sendStripeDataForBack_End();
    theTotalHotelPriceStripe = theInformationForStripe.totalPrice;
    stripeHandler.open({
        amount: (theTotalHotelPriceStripe * 100)
    });
}

// check Input validation
function checkInputValidation() {
    if (document.querySelector('#userFirstName').value.length == 0) {
        console.log("Empty");
        return false;
    }
}

function calculateTotal() {
    const roomTypeRadioData = getPriceRoomType();
    const roomType = roomTypeRadioData[0];
    const roomPrice = roomTypeRadioData[1];
    const guestNumber = document.querySelector('.guests').value;
    const guestPrice = getPricePerGuests(guestNumber);
    const hotelRateAttribute = Number(hotelRateDOMEle.getAttribute('data-rate-value'));
    const hotelPrice = grabAllHotelRate(hotelRateAttribute);
    const theTotalPriceBooking = getTotalPrice(hotelPrice, guestPrice, roomPrice);
    return [theTotalPriceBooking, guestNumber, roomType];
}

// calculate total price
function getTotalPrice(hotelPrice, guestAdditionalPrice, roomTypePrice) {
    let totalPrice = 0;
    console.log("In Total Price: ", hotelPrice, guestAdditionalPrice, roomTypePrice);
    totalPrice = (Number(hotelPrice) + Number(guestAdditionalPrice) + Number(roomTypePrice));
    return totalPrice;
}

function getPricePerGuests(numGuest) {
    const DEFAULT_GUEST_PRICE = 7;
    return (numGuest * DEFAULT_GUEST_PRICE);
}

function getPriceRoomType() {
    const roomTypeRadios = document.getElementsByName("hotelRoomType");
    const roomPrice = [0, 25, 35];
    let returnPrice = 0;
    let selectedRoomType = ``;
    for (let i = 0; i < roomTypeRadios.length; i++) {
        if (roomTypeRadios[i].checked) {
            selectedRoomType = (roomTypeRadios[i].value);
            returnPrice += roomPrice[i];
        }
    }
    return [selectedRoomType, Number(returnPrice)];
}

function grabAllHotelRate(numPrice) {
    const defaultTotalPrice = [
        50, 55, 60, 65, 70, 80, 100, 120, 40
    ];
    if (numPrice > Number(6.0)) {
        return Number(numPrice + defaultTotalPrice[7]).toFixed(2);
    } else if (numPrice > Number(5.5)) {
        return Number(numPrice + defaultTotalPrice[6]).toFixed(2);
    } else if (numPrice > Number(5.0)) {
        return Number(numPrice + defaultTotalPrice[5]).toFixed(2);
    } else if (numPrice > Number(4.5)) {
        return Number(numPrice + defaultTotalPrice[4]).toFixed(2);
    } else if (numPrice > Number(4.0)) {
        return Number(numPrice + defaultTotalPrice[3]).toFixed(2);
    } else if (numPrice > Number(3.0)) {
        return Number(numPrice + defaultTotalPrice[2]).toFixed(2);
    } else if (numPrice > Number(2.0)) {
        return Number(numPrice + defaultTotalPrice[1]).toFixed(2);
    }  else if (numPrice > Number(1.0)) {
        return Number(numPrice + defaultTotalPrice[0]).toFixed(2);
    } else {
        console.log("at else");
        console.log(numPrice);
        return Number(numPrice + defaultTotalPrice[8]).toFixed(2);
    }
}

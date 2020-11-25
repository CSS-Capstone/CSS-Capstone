// DOM Element
const hotelBookBtn = document.querySelector('.hotelSearched_detail_book_btn');

// Event Listener
hotelBookBtn.addEventListener('click', (event) => {
    organizeDataFromStripe();
});

// Util Functions
let stripeHandler = StripeCheckout.configure({
    key: publicStripeKey
,   locale: 'auto'
,   name: "Hotel Finder"
,   description: "4242 4242 4242 4242 for Card-Number"
,   token: function(token) {
        console.log(token);
        const body = sendStripeDataForBackEnd();
        const hotelBookingId = body.hotelId;
        fetch(`/hotel/searched/detailDB/${hotelBookingId}/payment`, {
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

// organize data to send it through server
function sendStripeDataForBackEnd() {
    const userSetupData = retrieveSelectedData();
    const hotel_addressDOM = document.querySelector('.hotel_address');
    const hotel_city_countryDOM = document.querySelector('.hotel_full_city_country');
    const hotelDefaultPriceDOM = document.querySelector('.hotelSearched_detail_header_title');
    const hotel_id_DOM = document.querySelector('.hotelSearched_detail_main');
    

    const hotelId = hotel_id_DOM.getAttribute('data-hotel-id');
    const hotelName = hotel_id_DOM.getAttribute('data-hotel-name');
    const hotelAddress = hotel_addressDOM.getAttribute('data-hotel-address');
    const hotelCity = hotel_city_countryDOM.getAttribute('data-hotel-city');
    const hotelCountry = hotel_city_countryDOM.getAttribute('data-hotel-country');
    const hotelDefaultPrice = hotelDefaultPriceDOM.getAttribute('data-price-night');
    const check_in_date = userSetupData[0];
    const check_out_date = userSetupData[1];
    const roomType = userSetupData[2];
    const guestNumber = userSetupData[3];
    const totalPrice = userSetupData[4];
    // console.log(hotelName);
    const body = {
        hotelId: hotelId
    ,   hotelName: hotelName
    ,   totalPrice: totalPrice
    ,   guestNumber: guestNumber
    ,   roomType:roomType
    ,   hotelCity: hotelCity
    ,   hotelCountry: hotelCountry
    ,   hotelAddress: hotelAddress
    ,   hotelDefaultPrice: hotelDefaultPrice
    ,   check_in_date: check_in_date
    ,   check_out_date: check_out_date
    }
    return body;
}

function retrieveSelectedData() {
    const checkoutDate = document.querySelector('#to').value;
    const checkinDate = document.querySelector('#from').value;
    let checkoutDateInDate = new Date(checkoutDate);
    let checkinDateInDate = new Date(checkinDate);
    // grab calendar difference data
    let numberOfDaysStaying = Math.abs(checkinDateInDate-checkoutDateInDate) / 86400000;
    const roomTypeInfo = getRoomTypeAndPrice();
    const roomType = roomTypeInfo[0];
    const roomPrice = roomTypeInfo[1];
    const guestNumber = document.querySelector('.guests').value;
    const additionalGuestPrice = getPricePerGuest(guestNumber);
    const totalPrice = calculateTotalPrice(numberOfDaysStaying, roomPrice, additionalGuestPrice);
    return [checkinDate, checkoutDate, roomType, guestNumber, totalPrice];
}

function getRoomTypeAndPrice() {
    const roomContainer = document.getElementsByName('hotelRoomType');
    const roomPriceDefault = [0, 25, 35];
    let returnPrice = 0;
    let selectedRoomType = '';
    for (let i = 0; i < roomContainer.length; i++) {
        if (roomContainer[i].checked) {
            console.log(roomContainer[i]);
            selectedRoomType = (roomContainer[i].value);
            returnPrice = roomPriceDefault[i];
        }
    }
    console.log(returnPrice);
    return [selectedRoomType, Number(returnPrice)];
}

function getPricePerGuest(guestSelected) {
    const DEFAULT_GUEST_PRICE = 7;
    return (guestSelected * DEFAULT_GUEST_PRICE);
}

// calculate total price of hotel
function calculateTotalPrice(numberOfDaysStaying, roomPrice, additionalGuestPrice) {
    // Retrieve hotel default price
    let hotelDefaultPriceDOM = document.querySelector('.hotelSearched_detail_header_title');
    let hotelDefaultPriceAttribute = hotelDefaultPriceDOM.getAttribute('data-price-night');
    let numberStayingDates = Number(numberOfDaysStaying);
    let numberRoomPrice = Number(roomPrice);
    let numberAdditionalPriceGuest = Number(additionalGuestPrice);
    let totalPrice = 0;
    totalPrice = (hotelDefaultPriceAttribute * numberStayingDates) + numberRoomPrice + numberAdditionalPriceGuest;
    totalPrice = totalPrice.toFixed(2);
    return totalPrice;
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
    const theInformationForStripe = sendStripeDataForBackEnd();
    theTotalHotelPriceStripe = theInformationForStripe.totalPrice;
    stripeHandler.open({
        amount: (theTotalHotelPriceStripe * 100)
    });
}

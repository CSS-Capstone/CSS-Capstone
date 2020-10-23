// DOM Elements
const hotelRateDOM = document.querySelector('.hotel_rating');
const numberOfGuestContainer = document.querySelector('.guests');
const roomTypeContainer = document.getElementsByName('hotelRoomType');
// EventListeners
numberOfGuestContainer.addEventListener('change', (event) => {
    fillOutSummaryInfo();
});

roomTypeContainer.forEach(eachRoomtType => {
    eachRoomtType.addEventListener('change', (event) => {
        fillOutSummaryInfo();
    });
});

// Util Functions
function fillOutSummaryInfo() {
    const hotelDetail_summary_detailsUl = document.querySelector('.hotelDetail_summary_details');
    // Clear all Existing Child first
    clearExistingChildDOM(hotelDetail_summary_detailsUl);
    const numberOfDays = 1;    // this will be dynamic based on the calendar
    const NumberOfDaysStayin = numberOfDays;
    const hotelRateAttribute = Number(hotelRateDOM.getAttribute('data-rate-value'));
    const guestNumber = document.querySelector('.guests').value;
    // get additional price based on user's input
    const hotelPrice = grabAllHotelRate(hotelRateAttribute);
    const roomTypeInfo = getPriceRoomType();
    const roomType = roomTypeInfo[0];
    const roomPrice = roomTypeInfo[1];
    const guestAdditionalPrice = getPricePerGuests(guestNumber);
    const hotelTotalPrice = getTotalPrice(hotelPrice, guestAdditionalPrice, roomPrice);
    // ===========================
    // Organize Data =============
    applyDataToDOM(hotelDetail_summary_detailsUl, roomType, roomPrice, guestNumber, guestAdditionalPrice, hotelTotalPrice)
}

// clear pre-existing DOM elements
function clearExistingChildDOM(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// Apply Retrieved Data to DOM
function applyDataToDOM(hotelDetail_summary_detailsUl,roomType, roomPrice, guestNumber, guestAdditionalPrice, hotelTotalPrice) {
    // DOM Containers
    const hotelTotalPriceDOM = document.querySelector('.hotelDetail_summary_totalPrice');
    // ==============
    // Room Type DOM=
    const roomTypeLi = document.createElement('li');
    const roomtTypeSmall = document.createElement('small');
    roomtTypeSmall.innerHTML = `Selected Room <strong>${roomType}</strong> Price: <strong>$${roomPrice}.00</strong>`;
    roomTypeLi.appendChild(roomtTypeSmall);
    // =================
    // Guest Number DOM=
    const guestNumLi = document.createElement('li');
    const guestNumSmall = document.createElement('small');
    guestNumSmall.innerHTML = `Number of guest(s) <strong>${Number(guestNumber) + Number(1)}</strong>: Price: <strong>${guestAdditionalPrice}.00</strong>`;
    guestNumLi.appendChild(guestNumSmall);
    // ====================
    // Append li tags to Ul
    hotelDetail_summary_detailsUl.appendChild(roomTypeLi);
    hotelDetail_summary_detailsUl.appendChild(guestNumLi);
    // Apply DOM for Total Price
    hotelTotalPriceDOM.textContent = `$${hotelTotalPrice}`;
}

// get default hotel price per day
function getDefaultHotelPricePerDay(hotelPrice, numberOfDays) {
    return (hotelPrice * numberOfDays);
}

// get additional price based on number of guests
function getPricePerGuests(numGuest) {
    const DEFAULT_GUEST_PRICE = 7;
    return (numGuest * DEFAULT_GUEST_PRICE);
}

// get price based on room type selected
function getPriceRoomType() {
    const roomTypeRadios = document.getElementsByName("hotelRoomType");
    const roomPrice = [0, 25, 35];
    let returnPrice = 0;
    let selectedRoomType = ``;
    console.log(roomTypeRadios.length);
    for (let i = 0; i < roomTypeRadios.length; i++) {
        if (roomTypeRadios[i].checked) {
            selectedRoomType = (roomTypeRadios[i].value);
            returnPrice += roomPrice[i];
        }
    }
    return [selectedRoomType, Number(returnPrice)];
}

// calculate total price
function getTotalPrice(hotelPrice, guestAdditionalPrice, roomTypePrice) {
    let totalPrice = 0;
    console.log("In Total Price: ", hotelPrice, guestAdditionalPrice, roomTypePrice);
    totalPrice = (Number(hotelPrice) + Number(guestAdditionalPrice) + Number(roomTypePrice));
    return totalPrice;
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

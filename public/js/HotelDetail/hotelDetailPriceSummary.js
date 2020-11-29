// DOM Elements
const hotelRateDOM = document.querySelector('.hotel_rating');
const numberOfGuestContainer = document.querySelector('.guests');
const roomTypeContainer = document.getElementsByName('hotelRoomType');

initializeBookingPrice();
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
function initializeBookingPrice() {
    let totalPrice = 0;
    const checkoutDate = document.querySelector('#to').value;
    const checkfromDate = document.querySelector('#from').value;
    let checkoutDateInDate = new Date(checkoutDate);
    let checkinDateInDate = new Date(checkfromDate);
    let NumberOfDaysStayin = Math.abs(checkinDateInDate - checkoutDateInDate) / 86400000;
    if (NumberOfDaysStayin === 0) {
        NumberOfDaysStayin = Number(1);
    }
    const hotelRateAttribute = Number(hotelRateDOM.getAttribute('data-rate-value'));
    const hotelPrice = grabAllHotelRate(hotelRateAttribute);
    const hotelTotalPriceDOM = document.querySelector('.hotelDetail_summary_totalPrice');
    totalPrice = Number(NumberOfDaysStayin * hotelPrice).toFixed(2);
    hotelTotalPriceDOM.textContent = `$${totalPrice}`;
}

function fillOutSummaryInfo() {
    const hotelDetail_summary_detailsUl = document.querySelector('.hotelDetail_summary_details');
    // DATE CALCULATION
    const checkoutDate = document.querySelector('#to').value;
    const checkfromDate = document.querySelector('#from').value;
    let checkoutDateInDate = new Date(checkoutDate);
    let checkinDateInDate = new Date(checkfromDate);
    let NumberOfDaysStayin = Math.abs(checkinDateInDate - checkoutDateInDate) / 86400000;
    // PRE_EXIST ITEMS
    const hotelRateAttribute = Number(hotelRateDOM.getAttribute('data-rate-value'));
    const guestNumber = document.querySelector('.guests').value;
    // get additional price based on user's input
    const hotelPrice = grabAllHotelRate(hotelRateAttribute);
    const roomTypeInfo = getPriceRoomType();
    const roomType = roomTypeInfo[0];
    const roomPrice = roomTypeInfo[1];
    const guestAdditionalPrice = getPricePerGuests(guestNumber);
    const hotelTotalPrice = getTotalPrice(NumberOfDaysStayin, hotelPrice, guestAdditionalPrice, roomPrice);
    // Clear all Existing Child first
    clearExistingChildDOM(hotelDetail_summary_detailsUl);
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
    roomtTypeSmall.innerHTML = `Selected Room <strong>${roomType}</strong> Price: <strong>$${roomPrice}</strong>`;
    roomTypeLi.appendChild(roomtTypeSmall);
    // =================
    // Guest Number DOM=
    const guestNumLi = document.createElement('li');
    const guestNumSmall = document.createElement('small');
    guestNumSmall.innerHTML = `Number of guest(s) <strong>${guestNumber}</strong>: Price: <strong>${guestAdditionalPrice.toFixed(2)}</strong>`;
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
function getTotalPrice(NumberOfDaysStayin, hotelPrice, guestAdditionalPrice, roomTypePrice) {
    let totalPrice = 0;
    // console.log("In Total Price: ", hotelPrice, guestAdditionalPrice, roomTypePrice);
    let hotelDefaultPrice = Number(hotelPrice);
    let numberStayingDates = Number(NumberOfDaysStayin);
    let numberRoomPrice = Number(roomTypePrice);
    let numberAdditionaPriceGuest = Number(guestAdditionalPrice);
    if (numberStayingDates === 0) {
        numberStayingDates = Number(1);
    }
    totalPrice = (hotelDefaultPrice * numberStayingDates) + numberRoomPrice + numberAdditionaPriceGuest;
    totalPrice = totalPrice.toFixed(2);
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

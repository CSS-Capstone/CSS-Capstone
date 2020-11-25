// DOM Elements
const numberOfGuestsContainer = document.querySelector('.guests');
const roomTypeContainer = document.getElementsByName('hotelRoomType');

// Add Event Listener
numberOfGuestsContainer.addEventListener('change', (event) => {
    fillOutSummaryInfo();
});

roomTypeContainer.forEach(eachRoomType => {
    eachRoomType.addEventListener('change', (event) => {
        fillOutSummaryInfo();
    });
});

function fillOutSummaryInfo() {
    const hotelDetail_summary_conatiner = document.querySelector('.hotelSearched_detail_summary_details');
    const checkoutDate = document.querySelector('#to').value;
    const checkinDate = document.querySelector('#from').value;
    let checkoutDateInDate = new Date(checkoutDate);
    let checkinDateInDate = new Date(checkinDate);
    // grab calendar difference data
    let numberOfDaysStaying = Math.abs(checkinDateInDate-checkoutDateInDate) / 86400000;
    // console.log(numberOfDaysStaying);
    const roomTypeInfo = getRoomTypeAndPrice();
    const roomType = roomTypeInfo[0];
    const roomPrice = roomTypeInfo[1];
    const guestNumber = document.querySelector('.guests').value;
    const additionalGuestPrice = getPricePerGuest(guestNumber);
    const totalPrice = calculateTotalPrice(numberOfDaysStaying, roomPrice, additionalGuestPrice);
    // Clear Existing Children
    clearExistingChildDOM(hotelDetail_summary_conatiner);
    applyDataToDOM(hotelDetail_summary_conatiner, roomType, roomPrice, guestNumber, additionalGuestPrice, totalPrice);
}

//clear pre-existing DOM Elements
function clearExistingChildDOM(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// get price based on room type selected
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

// guest additional price based on get number
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

// apply to DOM elemnts
function applyDataToDOM(hotelDetail_summary_conatiner, roomType, roomPrice, guestNumber, additionalGuestPrice, totalPrice) {
    const totalPriceDOM = document.querySelector('.hotelSearched_detail_summary_totalPrice');
    // DOM CREATE
    const li_tags_for_roomType = document.createElement('li');
    const small_tags_for_roomType = document.createElement('small');
    const li_tags_for_guestNumber = document.createElement('li');
    const small_tags_for_guestNumber = document.createElement('small');
    small_tags_for_roomType.innerHTML = `Selected Room <strong>${roomType}</strong> Price: <strong>$${roomPrice}</strong>`;
    small_tags_for_guestNumber.innerHTML = `Number of guest(s) <strong>${guestNumber}</strong>: Price: <strong>$${additionalGuestPrice.toFixed(2)}</strong>`;
    li_tags_for_roomType.appendChild(small_tags_for_roomType);
    li_tags_for_guestNumber.appendChild(small_tags_for_guestNumber);
    hotelDetail_summary_conatiner.appendChild(li_tags_for_roomType);
    hotelDetail_summary_conatiner.appendChild(small_tags_for_guestNumber);
    totalPriceDOM.textContent = `$${totalPrice}`;
}

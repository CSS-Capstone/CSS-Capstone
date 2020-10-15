// DOM Elements
const hotelRate = document.querySelectorAll('.hotel_score_text');
const hotelPrice = document.querySelectorAll('.hotel_desc_price');
// =========================
// function call============
// =========================
window.addEventListener('DOMContentLoaded', (event) => {
    initializeArray(); 
    // grabAllHotelRate();
});

// initalize array
// it stored the data of data-score for the hotel
function initializeArray() {
    const numberOfPrices = new Array(hotelRate.length);
    for (let i = 0; i < numberOfPrices.length; i++) {
        numberOfPrices[i] = Number(hotelPrice[i].getAttribute('data-score'));
    }
    grabAllHotelRate(numberOfPrices);
}

// check type
function checkType() {
    console.log(typeof(numberOfPrices[0]));
}

// grab
function grabAllHotelRate(numPrice) {
    const defaultTotalPrice = [
        50, 55, 60, 65, 70, 80, 100, 120, 40
    ];
    console.log("hello world");
    console.log(numPrice.length);
    for (let i = 0; i < numPrice.length; i++) {
        if (numPrice[i] > Number(6.0)) {
            console.log("is bigger");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[7]} / Night`;
        } else if (numPrice[i] > Number(5.5)) {
            console.log("is bigger");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[6]} / Night`;
        } else if (numPrice[i] > Number(5.0)) {
            console.log("is bigger");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[5]} / Night`;
        } else if (numPrice[i] > Number(4.5)) {
            console.log("is bigger");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[4]} / Night`;
        } else if (numPrice[i] > Number(4.0)) {
            console.log("is bigger");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[3]} / Night`;
        } else if (numPrice[i] > Number(3.0)) {
            console.log("is bigger");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[2]} / Night`;
        } else if (numPrice[i] > Number(2.0)) {
            console.log("at 2");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[1]} / Night`;
        }  else if (numPrice[i] > Number(1.0)) {
            console.log("at 1");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[0]} / Night`;
        } else {
            console.log("at else");
            console.log(numPrice[i]);
            hotelPrice[i].textContent = `$${numPrice[i] + defaultTotalPrice[8]} / Night`;
            console.log("I do not know");
        }
    }
}

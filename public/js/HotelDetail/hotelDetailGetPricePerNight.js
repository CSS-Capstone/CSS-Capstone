// DOM Elements
const hotelRate = document.querySelector('.hotel_rating');
const hotelPricePerNight = document.querySelector('.hotelDetail_default_hotelPrice');
const hotelDefaultPrice = document.querySelector('.hotelDetail_summary_totalPrice');
grabAllHotelRate();
// Util Functions
function grabAllHotelRate() {
    const numPrice = Number(hotelRate.getAttribute("data-rate-value"));
    const defaultTotalPrice = [
        50, 55, 60, 65, 70, 80, 100, 120, 40
    ];
    if (numPrice > Number(6.0)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[7]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[7]).toFixed(2)}</strong>`;
        return;
    } else if (numPrice > Number(5.5)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[6]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[6]).toFixed(2)}</strong>`;
        return;
    } else if (numPrice > Number(5.0)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[5]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[5]).toFixed(2)}</strong>`;
        return;
    } else if (numPrice > Number(4.5)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[4]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[4]).toFixed(2)}</strong>`;
        return;
    } else if (numPrice > Number(4.0)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[3]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[3]).toFixed(2)}</strong>`;
        return;
    } else if (numPrice > Number(3.0)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[2]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[2]).toFixed(2)}</strong>`;
        return;
    } else if (numPrice > Number(2.0)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[1]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[1]).toFixed(2)}</strong>`;
        return;
    }  else if (numPrice > Number(1.0)) {
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[8]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[8]).toFixed(2)}</strong>`;
        return;
    } else {
        console.log("at else");
        console.log(numPrice);
        hotelPricePerNight.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[8]).toFixed(2)}</strong> / Night`;
        hotelDefaultPrice.innerHTML = `<strong>$${(numPrice + defaultTotalPrice[8]).toFixed(2)}</strong>`;
        return;
    }
}

get_date();

function get_date() {
    const current_date_DOM = document.querySelector('.cancelBooking_date');
    let current_date = new Date();
    current_date_DOM.textContent = `${current_date.toDateString()}`;
}
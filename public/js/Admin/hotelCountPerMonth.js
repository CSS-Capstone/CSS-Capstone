get_hotel_count_current_month();
get_booking_number_current_month();
get_cancel_booking_number_current_month();
get_new_user_number_current_month();


async function get_hotel_count_current_month() {
    const admin_hotelCount_DOM = document.querySelector('.admin_info_hotel_count_number');
    try {
        let hotel_count_per_month_fetch = await fetch('/djemfls-tbvjdbwj/auth/getCurrentMonthHotelNumber');
        let hotel_count_per_month_reponse = await hotel_count_per_month_fetch.json();
        // console.log(hotel_count_per_month_reponse.countHotelCurrentMonth.count.count);
        admin_hotelCount_DOM.textContent = `${hotel_count_per_month_reponse.countHotelCurrentMonth.count.count}`;
    } catch (error) {
        console.log(error);
        console.error(error);
    }
}

async function get_booking_number_current_month() {
    const admin_bookingCount_DOM = document.querySelector('.admin_info_booking_count_number');
    try {
        let booking_count_per_month_fetch = await fetch('/djemfls-tbvjdbwj/auth/getCurrentBookingCount');
        let booking_count_per_month_response = await booking_count_per_month_fetch.json();
        console.log(booking_count_per_month_response.getCurrentMonthBookingNumResult[0].bookingCount);
        admin_bookingCount_DOM.textContent = `${booking_count_per_month_response.getCurrentMonthBookingNumResult[0].bookingCount}`;
    } catch (error) {
        console.log(error);
        console.error(error);
    }
}

async function get_cancel_booking_number_current_month() {
    const admin_cancelCount_DOM = document.querySelector('.admin_info_cancel_count_number');
    // console.log(admin_cancelCount_DOM);
    try {
        let cancel_count_per_month_fetch = await fetch('/djemfls-tbvjdbwj/auth/getCurrentBookingCancelRequest');
        let cancel_count_per_month_response = await cancel_count_per_month_fetch.json();
        console.log(cancel_count_per_month_response.getCurrentMonthBookingCancelResult[0].booking_cancel_request);
        admin_cancelCount_DOM.textContent = `${cancel_count_per_month_response.getCurrentMonthBookingCancelResult[0].booking_cancel_request}`;
    } catch (error) {
        console.log(error);
        console.error(error);
    }
}

async function get_new_user_number_current_month() {
    const admin_newUserCount_DOM = document.querySelector('.admin_info_new_user_number');
    console.log(admin_newUserCount_DOM);
    try {
        let new_user_count_per_month_fetch = await fetch('/djemfls-tbvjdbwj/auth/getCurrentNewUser');
        let new_user_count_per_month_response = await new_user_count_per_month_fetch.json();
        console.log(new_user_count_per_month_response.getCurrentMonthNewUserResult[0].new_user);
        admin_newUserCount_DOM.textContent = `${new_user_count_per_month_response.getCurrentMonthNewUserResult[0].new_user}`;
    } catch (error) {
        console.log(error);
        console.error(error);
    }
}
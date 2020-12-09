grab_monthly_booking_rate();

async function grab_monthly_booking_rate() {
    const monthly_booking_header_DOM = document.querySelector('.card-header-totalPrice');

    try {
        let theMonthlyBookingDataFetch = await fetch('/djemals-tbvjdbwj/auth/monthlyBookingRate');
        let theMontlyBookingDateResponse = await theMonthlyBookingDataFetch.json();
        let theMonthlyBookingData = theMontlyBookingDateResponse.montlyBookingContainer;
        console.log(theMontlyBookingDateResponse.montlyBookingContainer[0].booking_date);
        // console.log(theMontlyBookingDateData);
        let theMonthlyBookingDate = [];
        let theMonthlyPrice = [];
        let theMontlyCount = [];
        let theMontlyTotalPrice = 0;
        for (let i = 0; i < theMonthlyBookingData.length; i++) {
            let bookingDate = new Date(theMonthlyBookingData[i].booking_date).toDateString();
            theMonthlyBookingDate.push(bookingDate);
            theMonthlyPrice.push(theMonthlyBookingData[i].booking_price);
            theMontlyCount.push(theMonthlyBookingData[i].count);
            theMontlyTotalPrice += theMonthlyBookingData[i].booking_price;
        }
        monthly_booking_header_DOM.textContent = `Month Booking Total: $${theMontlyTotalPrice}`;
        let ctx = document.getElementById('myBookingChart').getContext('2d');
        let chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: theMonthlyBookingDate,
                datasets:
                [
                    {
                        label: 'Rate of Total Booking Price of this Month',
                        borderColor: '#48494B',
                        data: theMonthlyPrice
                    }
                ]
            }, options: {
                scales: {
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: '$ Dollars'
                    }
                  }]
                }     
              }
        });

    } catch(error) {
        console.error(error);
        console.log(error);
    }
    
    //console.log(theDateResponse);
}
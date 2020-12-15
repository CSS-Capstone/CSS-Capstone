display_current_month_booking_cancenl();

async function display_current_month_booking_cancenl() {
    try {
        let getCurrentMonthCancelRateResponse = await fetch('/djemfls-tbvjdbwj/auth/getCurrentMonthBookingCancelRate');
        let getCurrentMonthCancelRateJson = await getCurrentMonthCancelRateResponse.json();
        console.log(getCurrentMonthCancelRateJson.monthlyBookingContainer);
        let monthylCancelBookingData = getCurrentMonthCancelRateJson.monthlyBookingContainer;
        let monthlyCancelBookingDate = [];
        let monthlyCancelBookingCount = [];
        
        for (let i = 0; i < monthylCancelBookingData.length; i++) {
            monthlyCancelBookingDate.push(monthylCancelBookingData[i].request_date);
            monthlyCancelBookingCount.push(monthylCancelBookingData[i].booking_cancel_count);
        }
        console.log(monthlyCancelBookingDate);
        console.log(monthlyCancelBookingCount);
        let ctx = document.getElementById('myCurrentMonthBookingCancel').getContext('2d');
        let chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyCancelBookingDate,
                datasets: 
                [
                    {
                        label: 'Rate of Cancel Booking for this month',
                        borderColor: '#48494B',
                        data: monthlyCancelBookingCount
                    }
                ]
            }, options: {
                scales: {
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: 'Number of Requests'
                    }
                  }]
                }     
              }
        });
    } catch (error) {
        console.log(error);
        console.error(error);
    }
}
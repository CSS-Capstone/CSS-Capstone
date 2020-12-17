get_hotel_barChart_by_city();

async function get_hotel_barChart_by_city() {
    try {
        console.log("Heelo hotel bar chart")
        let getAllHotelsByCityFetch = await fetch('/djemfls-tbvjdbwj/auth/getHotelByCity');
        let getAllHotelsByCityResponse = await getAllHotelsByCityFetch.json();
        let getAllHotelsByCityData = getAllHotelsByCityResponse.hotelsGroupByCityArr;
        // store city and country form
        let cityContainer = [];
        // store counts of hotel by city
        let countHotel = [];
        let totalHotelCount = 0;
        for (let i = 0; i < getAllHotelsByCityData.length; i++) {
            let locationName = `${getAllHotelsByCityData[i].hotel_city}, ${getAllHotelsByCityData[i].hotel_country}`;
            cityContainer.push(locationName);
            countHotel.push(getAllHotelsByCityData[i].hotel_count);
            totalHotelCount += getAllHotelsByCityData[i].hotel_count;
        }
        let currenTotalNumberOfHotelsDOM = document.querySelector('.card-header-total-number-of-hotels');
        currenTotalNumberOfHotelsDOM.textContent = `Total Hotel Count: ${totalHotelCount} hotels`;
        let ctx = document.getElementById('myHotelGroupByCity');
        console.log(countHotel);
        console.log(cityContainer);
        let hotelCityGroup_BarChart = new Chart(ctx, {
            type: 'bar'
        ,   data: {
                labels: cityContainer,
                datasets: 
                [
                    {
                        label: "# of Hotels in Each City"
                    ,   data: countHotel
                    ,   backgroundColor: [
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                        ]
                    }
                ]
            } ,options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: countHotel[0] 
                        }
                    }]
                }
            }
        });
    } catch (error) {
        console.error(error);
        console.log(error);
    }
}
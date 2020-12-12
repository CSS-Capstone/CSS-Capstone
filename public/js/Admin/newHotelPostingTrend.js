get_five_most_new_hotel_cities();

async function get_five_most_new_hotel_cities() {
    try {
        console.log("TOP FIVE TRENDING HOTEL POSTING CITIES!!!!")
        let getTopFiveNewHotelCitiesFetch = await fetch('/djemfls-tbvjdbwj/auth/getFiveMostNewHotelCities');
        let getTopFiveNewHotelCitiesResponse = await getTopFiveNewHotelCitiesFetch.json();
        let getTopFiveNewHotelCitiesData = getTopFiveNewHotelCitiesResponse.fiveHotelsGroupByDateArr;
        console.log('GET TOP FIVE CITIES DATA', getTopFiveNewHotelCitiesData);        // store city and country form
        let cityContainer = [];
        // store counts of hotel by city
        let countHotel = [];
        for (let i = 0; i < getTopFiveNewHotelCitiesData.length; i++) {
            cityContainer.push(getTopFiveNewHotelCitiesData[i].hotel_city);
            countHotel.push(getTopFiveNewHotelCitiesData[i].hotel_count);
        }
        let topFiveHotelsDOM = document.querySelector('.card-header-five-most-new-hotel-cities');
        topFiveHotelsDOM.textContent = cityContainer;
        let ctx = document.getElementById('myFiveMostNewHotelCities');
        console.log('Hotel Counter', countHotel);
        console.log('City Container', cityContainer);
        let topFiveHotels_BarChart = new Chart(ctx, {
            type: 'bar'
        ,   data: {
                labels: cityContainer,
                datasets: 
                [
                    {
                        label: "# of Hotels in Each City"
                    ,   data: countHotel
                    ,   minBarLength: 0
                    ,   backgroundColor: [
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)',
                            'rgba(0,0,139)'
                        ]
                    }
                ]
            },options: {
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
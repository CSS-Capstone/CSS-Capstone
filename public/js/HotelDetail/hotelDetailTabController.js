// DOM Elements
const hotelDetail_tab_btn = document.querySelectorAll('.hotelDetail_tab_btn');
const hotelDetail_tab_panel = document.querySelectorAll('.hotelDetail_tab_panel');

initialSelect();
airQualityControl();
hotelDetail_tab_btn.forEach( (eachBtn, index) => {
    eachBtn.addEventListener('click', (event) => {
        displayPanel(event, index);
    });
});

function displayPanel(event, index) {
    console.log(index);
    console.log(event.target);
    for (let i = 0; i < hotelDetail_tab_btn.length; i++) {
        hotelDetail_tab_btn[i].style.backgroundColor = "";
        hotelDetail_tab_btn[i].style.color = "";
    }
    if (index == 1) {
        covidControl();
    } else if (index == 3) {
        getCurrency();
    }
    event.target.style.backgroundColor = '#589fe6';
    event.target.style.color = "white";

    for (let i = 0; i < hotelDetail_tab_panel.length; i++) {
        hotelDetail_tab_panel[i].style.display = "none";
    }
    hotelDetail_tab_panel[index].style.display = "block";
}

function initialSelect() {
    for (let i = 0; i < hotelDetail_tab_btn.length; i++) {
        if (i === 0) {
            hotelDetail_tab_btn[i].style.backgroundColor = '#589fe6';
            hotelDetail_tab_btn[i].style.color = "white";
            hotelDetail_tab_panel[i].style.display = "block";
        } else {
            hotelDetail_tab_btn[i].style.backgroundColor = "";
            hotelDetail_tab_btn[i].style.color = "";
            hotelDetail_tab_panel[i].style.display = "none";
        }
    }
}

function airQualityControl() {
    let air_quality_face = [
        'far fa-laugh-squint'
    ,   'far fa-smile face'
    ,   'far fa-meh'
    ,   'far fa-frown-open'
    ,   'far fa-angry'
    ];
    let air_quality_value = [
        'Good'
    ,   'Moderate'
    ,   'Unhealthy for sensitive group'
    ,   'Unhealthy'
    ,   'Very unhealthy'
    ];
    // DOM elements
    const airQualityContainer = document.querySelector('.hotelDetail_air_quality_left');
    const airQualityIndexDOM = document.querySelector('.hotelDetail_air_quality_index');
    const airQualityIndex = Number(airQualityIndexDOM.getAttribute('data-air-quality-index'));
    const airQualityFaceDOM = document.querySelector('.face');
    const airQualityValueDOM = document.querySelector('.hotelDetail_air_quality_value');
    console.log(airQualityIndex);
    if (airQualityIndex >= 0 && airQualityIndex <= 50) {
        airQualityFaceDOM.className = air_quality_face[0];
        airQualityValueDOM.textContent = air_quality_value[0];
        airQualityFaceDOM.style.color = 'green';
    } else if (airQualityIndex >= 51 && airQualityIndex <= 100) {
        airQualityFaceDOM.className = air_quality_face[1];
        airQualityValueDOM.textContent = air_quality_value[1];
        airQualityContainer.style.backgroundColor = 'yellow';
    } else if (airQualityIndex >= 101 && airQualityIndex <= 150) {
        airQualityFaceDOM.className = air_quality_face[2];
        airQualityValueDOM.textContent = air_quality_value[2];
        airQualityContainer.style.backgroundColor = 'orange';
    } else if (airQualityIndex >= 151 && airQualityIndex <= 200) {
        airQualityFaceDOM.className = air_quality_face[3];
        airQualityValueDOM.textContent = air_quality_value[3];
        airQualityContainer.style.backgroundColor = 'red';
    } else {
        airQualityFaceDOM.className = air_quality_face[4];
        airQualityValueDOM.textContent = air_quality_value[4];
        airQualityContainer.style.backgroundColor = 'purple';
    }
}

async function covidControl() {
    try {
        // DOM Elements
        const covidCountryNameDOM = document.querySelector('.hotelDetail_covid_countryName');
        //const covidTodayDOM = document.querySelector('.hotelDetail_covid_today');
        const covidLastUpdateDOM = document.querySelector('.hotelDetail_covid_lastupdate');
        const covidCoutryCode = covidLastUpdateDOM.getAttribute('data-weather-countryName');
        // console.log(covidCoutryCode);
        // API CALL
        const covidDataRequest = await fetch(`/hotel/searched/detail/covid/${covidCoutryCode}`);
        const covidData = await covidDataRequest.json();
        covidCountryNameDOM.textContent = `In ${covidData.data.name}`;
        //covidTodayDOM.textContent = `Latest Updated: Confirm: ${covidData.data.latest_data.confirmed} Recovered: ${covidData.data.latest_data.recovered}`;
        covidLastUpdateDOM.textContent = `Latest Update Date: ${covidData.data.updated_at}`
        // console.log(covidData.data);
        // console.log(covidData.data.timeline);
        // console.log(covidData.data.timeline[1]);
        // console.log(covidData.data.timeline[99]);
        let dataTimelineArray = [];
        for (let i = 25; i >= 0; i--) {
            dataTimelineArray.push(covidData.data.timeline[i]);
        }
        console.log(dataTimelineArray);
        const covidDataDate = [];
        const covidDataDeathRate = [];
        const covidDataRecoverRate = [];
        const covidDataConfirmRate = [];
        for (let i = 0; i < dataTimelineArray.length; i++) {
            covidDataDate.push(dataTimelineArray[i].date);
            //covidDataDeathRate.push(dataTimelineArray[i].deaths);
            covidDataRecoverRate.push(dataTimelineArray[i].recovered);
            covidDataConfirmRate.push(dataTimelineArray[i].confirmed);
        }
        let ctx = document.getElementById('myChart').getContext('2d');
        let chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
        
            // The data for our dataset
            data: {
                labels: covidDataDate,
                datasets: 
                [
                    {
                        label: 'Covid Confirmed',
                        // backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: '#48494B',
                        data: covidDataConfirmRate
                    },
                    {
                        label: 'Covid Recovered',
                        borderColor: '#228C22',
                        data: covidDataRecoverRate
                    }
                ]
            },
        
            // Configuration options go here
            options: {}
        });
    } catch(error) {
        console.log(error);
    }
}

async function getCurrency() {
    // DEFAULT COUNTRY CURRENCY
    const DEFAULT_CURRENCY = `USD`
    // DOM Elements
    const targetCountryCountryCodeDOM = document.querySelector('.hotelDetail_thingstoKnow_title');
    const currencyDefaultDOM = document.querySelector('.hotelDetail_curreny_default');
    const currencyAmountFromDOM = document.querySelector('.hotelDetail_currency_default_from');
    const currencyAmountToDOM = document.querySelector('.hotelDetail_currency_to');
    const currencyLastUpdateDOM = document.querySelector('.hotelDetail_currency_lastUpdated');
    const targetCountryCurrencyCode = targetCountryCountryCodeDOM.getAttribute('data-currency-countryName');
    console.log(targetCountryCurrencyCode);
    // =========================
    // API calls ===============
    // Current Currency
    const countryIOResponse = await fetch(`/hotel/searched/detail/currency/${targetCountryCurrencyCode}`);
    const countryIOData = await countryIOResponse.json();
    const convertedCurrencyResponse = await fetch(`https://api.exchangeratesapi.io/latest?base=${DEFAULT_CURRENCY}`);
    const convertedCurrencyData = await convertedCurrencyResponse.json();
    // Historical Currency
    const todaysNewDate = new Date();
    const todayMonth = '' + (todaysNewDate.getMonth() + 1);
    const todayDate = '' + (todaysNewDate.getDate());
    const todayYear = todaysNewDate.getFullYear();
    // Last week
    const lastWeek = new Date(todaysNewDate.getTime() - (6 * 24 * 60 * 60 * 1000));
    const lastWeekMonth = '' + (lastWeek.getMonth() + 1);
    const lastWeekDate = '' + (lastWeek.getDate());
    const lastWeekYear = lastWeek.getFullYear();
    // Modify Date Data
    if (lastWeekMonth.length < 2) {
        lastWeekMonth = '0' + lastWeekMonth;
    }
    if (lastWeekDate.length < 2) {
        lastWeekDate = '0' + lastWeekDate;
    }
    if (todayMonth.length < 2) {
        todayMonth = '0' + todayMonth;
    }
    if (todayDate.length < 2) {
        todayDate = '0' + todayDate;
    }
    const toDate = `${todayYear}-${todayMonth}-${todayDate}`;
    const fromDate = `${lastWeekYear}-${lastWeekMonth}-${lastWeekDate}`;
    console.log("FromDate: ", fromDate);
    console.log("ToDate: ", toDate);
    // const GRAPH_CURRENCY_RESPONSE = await fetch(`/hotel/searched/detail/currency/${fromDate}/${toDate}/${countryIOData}`);
    // const graph_currency_data = await GRAPH_CURRENCY_RESPONSE.json();
    // const JSON_TARGET = DEFAULT_CURRENCY + '_' + countryIOData;
    // // console.log(JSON_TARGET);
    // // console.log(graph_currency_data[JSON_TARGET]);
    // const graphHistoryCurrencyData = graph_currency_data[JSON_TARGET];
    // // console.log(graphHistoryCurrencyData);
    // // console.log(graphHistoryCurrencyData[0]);
    // // grab the keys
    // const allDatesCurrencyHistory = [];
    // const allDataCurrencyHistory = [];
    // for (let index in graphHistoryCurrencyData) {
    //     allDatesCurrencyHistory.push(index);
    //     allDataCurrencyHistory.push(graphHistoryCurrencyData[index]);
    // }
    // // console.log(graphHistoryCurrencyData[allDatesCurrencyHistory[0]]);
    // console.log(allDatesCurrencyHistory);
    // console.log(allDataCurrencyHistory);
    // =============================
    // Data Factoring for DOM
    const convertedCurrency = Number(convertedCurrencyData.rates[countryIOData]).toFixed(2);
    // apply data to DOM Elements
    currencyDefaultDOM.innerHTML = `Default Currency <i class="fas fa-money-bill-wave"></i> ${DEFAULT_CURRENCY}`;
    currencyAmountFromDOM.textContent = `1 ${DEFAULT_CURRENCY} is equals to`;
    currencyAmountToDOM.textContent = `${convertedCurrency} ${countryIOData}`;
    currencyLastUpdateDOM.innerHTML = `<i class="far fa-edit"></i> Last Updated: ${convertedCurrencyData.date}`;
    
}
// DOM Elements
const hotelDetail_tab_btn = document.querySelectorAll('.hotelSearched_detail_tab_btn');
const hotelDetail_tab_panel = document.querySelectorAll('.hotelSearched_detail_tab_panel');

initialSelect();
airQualityControl();
// Event Listener
hotelDetail_tab_btn.forEach( (eachBtn, index) => {
    eachBtn.addEventListener('click', (event) => {
        displayPanel(event, index);
    });
});

// Util Function
function displayPanel(event, index) {
    console.log(index);
    console.log(event.target);
    for (let i = 0; i < hotelDetail_tab_btn.length; i++) {
        hotelDetail_tab_btn[i].style.backgroundColor = "";
        hotelDetail_tab_btn[i].style.color = "";
    }
    if (index == 1) {
        covidControl();
    } else if (index == 2) {
        getVideosForCity();
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
// weather and air quality
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
    const airQualityContainer = document.querySelector('.hotelSearched_detail_air_quality_left');
    const airQualityIndexDOM = document.querySelector('.hotelSearched_detail_air_quality_index');
    const airQualityIndex = Number(airQualityIndexDOM.getAttribute('data-air-quality-index'));
    const airQualityFaceDOM = document.querySelector('.face');
    const airQualityValueDOM = document.querySelector('.hotelSearched_detail_air_quality_value');
    console.log(airQualityIndex);
    if (airQualityIndex >= 0 && airQualityIndex <= 50) {
        airQualityFaceDOM.className = air_quality_face[0];
        airQualityValueDOM.textContent = air_quality_value[0];
        airQualityFaceDOM.style.color = 'green';
    } else if (airQualityIndex >= 51 && airQualityIndex <= 100) {
        airQualityFaceDOM.className = air_quality_face[1];
        airQualityValueDOM.textContent = air_quality_value[1];
        airQualityContainer.style.color = 'yellow';
    } else if (airQualityIndex >= 101 && airQualityIndex <= 150) {
        airQualityFaceDOM.className = air_quality_face[2];
        airQualityValueDOM.textContent = air_quality_value[2];
        airQualityContainer.style.color = 'orange';
    } else if (airQualityIndex >= 151 && airQualityIndex <= 200) {
        airQualityFaceDOM.className = air_quality_face[3];
        airQualityValueDOM.textContent = air_quality_value[3];
        airQualityContainer.style.color = 'red';
    } else {
        airQualityFaceDOM.className = air_quality_face[4];
        airQualityValueDOM.textContent = air_quality_value[4];
        airQualityContainer.style.color = 'purple';
    }
}

async function covidControl() {
    // DOM Elemetns
    const covidCountryNameDOM = document.querySelector('.hotelSearched_detail_covid_countryName');
    const covidLastUpdateDOM = document.querySelector('.hotelSearched_detail_covid_lastupdate');
    const covidCoutryCode = covidLastUpdateDOM.getAttribute('data-countryName');

    try {
        const covidDataRequest = await fetch(`/hotel/searched/detail/posted/covid/${covidCoutryCode}`);
        const covidData = await covidDataRequest.json();
        covidCountryNameDOM.textContent = `In ${covidData.data.name}`;
        covidLastUpdateDOM.textContent = `Latest Update Date: ${covidData.data.updated_at}`;
        let dataTimelineArray = [];
        for (let i = 25; i >= 0; i--) {
            dataTimelineArray.push(covidData.data.timeline[i]);
        }
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

///hotel/searched/detail/posted/video/:locationName
// Video
async function getVideosForCity() {
    // ============================
    // DOM Elements ===============
    const videoFrame = document.querySelector('.hotelSearched_detail_cityVideo_frame');
    const hotelLocationDOM = document.querySelector('#hotelSearched_detail_tab_video');
    // data before trim
    const trimmedCity = hotelLocationDOM.getAttribute('data-hotel-city-fullname');
    console.log(trimmedCity);
    // api call
    const videoResponse = await fetch(`/hotel/searched/detail/video/${trimmedCity}`);
    const videoData = await videoResponse.json();
    const singleVideo = videoData.hits[0].videos.tiny.url;
    videoFrame.src = `${singleVideo}`;
    console.log(videoData);
    console.log(singleVideo);
    // ===============================
    // Modal items ===================
    // Modal DOM Elements
    const video_modal_btn = document.querySelector('.video_show_more_btn');
    const videoModal = document.querySelector('.video_modal');
    const video_close_btn = document.querySelector('.close_video_modal_btn');
    const videoForModal = document.querySelector('.modal_video');

    videoFrame.addEventListener('mouseover', (event) => {
        videoFrame.play();
    });
    videoFrame.addEventListener('mouseout', (event) => {
        videoFrame.pause();
    });

    // ===============================
    // Video Modal Event Listener ====
    video_modal_btn.addEventListener('click', (event) => {
        videoModal.style.display = 'block';
        const modal_video_navigation = document.querySelector('.modal_video_navigation');
        if (videoData.total >= 5) {
            while (modal_video_navigation.firstChild) {
                modal_video_navigation.removeChild(modal_video_navigation.firstChild);
            }
            for (let i = 0; i < 5; i++) {
                let imageDOM = document.createElement('video');
                imageDOM.src = videoData.hits[i].videos.tiny.url;
                imageDOM.style.width = '180px';
                imageDOM.style.height = `120px`;
                modal_video_navigation.appendChild(imageDOM);
            }
            // default selection
            videoForModal.src = videoData.hits[0].videos.tiny.url;
            console.log(modal_video_navigation.childNodes.length);
            for (let i = 0; i < modal_video_navigation.childNodes.length; i++) {
                // console.log(modal_video_navigation.childNodes[i]);
                // now add event listener
                modal_video_navigation.childNodes[i].addEventListener('click', (event) => {
                    videoForModal.src = videoData.hits[i].videos.tiny.url;
                });
            }
        } else {
            while (modal_video_navigation.firstChild) {
                modal_video_navigation.removeChild(modal_video_navigation.firstChild);
            }
            for (let i = 0; i < videoData.total; i++) {
                let imageDOM = document.createElement('video');
                imageDOM.src = videoData.hits[i].videos.tiny.url;
                imageDOM.style.width = '180px';
                imageDOM.style.height = `120px`;
                modal_video_navigation.appendChild(imageDOM);
            }
            videoForModal.src = videoData.hits[0].videos.tiny.url;
            for (let i = 0; i < modal_video_navigation.childNodes.length; i++) {
                // console.log(modal_video_navigation.childNodes[i]);
                // now add event listener
                modal_video_navigation.childNodes[i].addEventListener('click', (event) => {
                    videoForModal.src = videoData.hits[i].videos.tiny.url;
                });
            }
        }
    });
    video_close_btn.addEventListener('click', (event) => {
        if (videoModal.style.display == 'block') {
            videoModal.style.display = 'none';
        }
    });
}

// Currency
async function getCurrency() {
    // DEFAULT COUNTRY CURRENCY
    const DEFAULT_CURRENCY = `USD`
    // ===========================
    // DOM Elements ==============
    // LEFT ======================
    const targetCountryCountryCodeDOM = document.querySelector('.hotelSearched_detail_things_to_know_title');
    const currencyDefaultDOM = document.querySelector('.hotelSearched_detail_currency_default');
    const currencyAmountFromDOM = document.querySelector('.hotelSearched_detail_currency_default_from');
    const currencyAmountToDOM = document.querySelector('.hotelSearched_detail_currency_to');
    const currencyLastUpdateDOM = document.querySelector('.hotelSearched_detail_curreny_lastUpdated');
    const targetCountryCurrencyCode = targetCountryCountryCodeDOM.getAttribute('data-currency-countryName');
    console.log(targetCountryCurrencyCode);
    // RIGHT =====================
    const currencyTopDefault = document.querySelector('.hotelSearched_detail_top_default');
    const currencyUserTypeAmount = document.querySelector('.hotelSearched_detail_currency_top_amount');
    const currencyBottomTargetCode = document.querySelector('.hotelSearched_detail_currency_bottom_country_code');
    const currencyBottomResult = document.querySelector('.hotelSearched_detail_currency_bottom_result');
    // =========================
    // API calls ===============
    // Current Currency
    const countryIOResponse = await fetch(`/hotel/searched/detail/currency/${targetCountryCurrencyCode}`);
    const countryIOData = await countryIOResponse.json();
    const convertedCurrencyResponse = await fetch(`https://api.exchangeratesapi.io/latest?base=${DEFAULT_CURRENCY}`);
    const convertedCurrencyData = await convertedCurrencyResponse.json();
    
    // Data Factoring for DOM
    const convertedCurrency = Number(convertedCurrencyData.rates[countryIOData]).toFixed(2);
    // apply data to DOM Elements
    // LEFT DOM Elements
    currencyDefaultDOM.innerHTML = `Default Currency <i class="fas fa-money-bill-wave"></i> ${DEFAULT_CURRENCY}`;
    currencyAmountFromDOM.textContent = `1 ${DEFAULT_CURRENCY} is equals to`;
    currencyAmountToDOM.textContent = `${convertedCurrency} ${countryIOData}`;
    currencyLastUpdateDOM.innerHTML = `<i class="far fa-edit"></i> Last Updated: ${convertedCurrencyData.date}`;
    // Right DOM Elements
    currencyTopDefault.textContent = `${DEFAULT_CURRENCY}`;
    currencyBottomTargetCode.textContent = `${countryIOData}`;
    // An Event Listener to Convert the Currency
    currencyUserTypeAmount.addEventListener('change', (event) => {
        console.log("hello currency chage");
        console.log(event.target.value);
        const currencyValidation = document.querySelector('.currency_validation');
        if (event.target.value.length === 0) {
            console.log("This is Empty");
            currencyValidation.textContent = `Amount cannot be empty`;
            return false;
        }
        else if (isNaN(event.target.value)) {
            console.log("This is not a Number");
            currencyValidation.textContent = `You must type number to convert`;
            return false;
        }
        else {
            currencyValidation.textContent = ``;
            currencyBottomResult.textContent = `${Number(event.target.value * convertedCurrency).toFixed(2)} ${countryIOData}`;
            return true;
        }

    });
}

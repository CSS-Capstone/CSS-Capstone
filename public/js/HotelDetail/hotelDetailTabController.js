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
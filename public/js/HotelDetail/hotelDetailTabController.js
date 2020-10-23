// DOM Elements
const hotelDetail_tab_btn = document.querySelectorAll('.hotelDetail_tab_btn');
const hotelDetail_tab_panel = document.querySelectorAll('.hotelDetail_tab_panel');

initialSelect();
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
    event.target.style.backgroundColor = "red";
    event.target.style.color = "white";

    for (let i = 0; i < hotelDetail_tab_panel.length; i++) {
        hotelDetail_tab_panel[i].style.display = "none";
    }
    hotelDetail_tab_panel[index].style.display = "block";
}

function initialSelect() {
    hotelDetail_tab_btn[0].style.backgroundColor = "red";
    hotelDetail_tab_btn[0].style.color = "white";
    hotelDetail_tab_panel[0].style.display = "block";
}

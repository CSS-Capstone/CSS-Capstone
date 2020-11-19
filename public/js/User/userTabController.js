const user_tab_btn = document.querySelectorAll('.user__tab__btn');
const user_tab_panel = document.querySelectorAll('.user__tab__panel');

initialSelect();
user_tab_btn.forEach((eachBtn, index) => {
    eachBtn.addEventListener('click', (event) => {
        displayPanel(event, index);
    });
});

function displayPanel(event, index) {
    for (let i = 0; i < user_tab_btn.length; i++) {
        user_tab_btn[i].style.backgroundColor = "";
        user_tab_btn[i].style.color = "";
    }
    if (index == 0) {
        getComments();
        clearDom('hotel_posts');
    } else if (index == 1) {
        getBookingHistory();
        clearDom('hotel_posts');
    } else if (index == 2) {
        getHotelPosts();
    }
    event.target.style.backgroundColor = '#589fe6';
    event.target.style.color = "white";

    for (let i = 0; i < user_tab_panel.length; i++) {
        user_tab_panel[i].style.display = "none";
    }
    user_tab_panel[index].style.display = "block";
}

function initialSelect() {
    for (let i = 0; i < user_tab_btn.length; i++) {
        if (i === 0) {
            user_tab_btn[i].style.backgroundColor = '#589fe6';
            user_tab_btn[i].style.color = "white";
            user_tab_panel[i].style.display = "block";
        } else {
            user_tab_btn[i].style.backgroundColor = "";
            user_tab_btn[i].style.color = "";
            user_tab_panel[i].style.display = "none";
        }
    }
}

function clearDom(toRemove) {
    var outterDiv = document.getElementById(toRemove);
    while(outterDiv.firstChild) {
        outterDiv.removeChild(outterDiv.firstChild);
    }
    return;
}

function getComments() {

}

function getBookingHistory() {

}

async function getHotelPosts() {
    const hotelPostsRequest = await fetch(`/user/viewHotelPosts`);
    const hotelPostsData = await hotelPostsRequest.json();
    const hotelPosts = hotelPostsData.userPostHotels;
    var hotelPostPanel = document.getElementById("hotel_posts");
    for (var i = 1; i < hotelPosts.length; i++){
        var rowContainer = document.createElement('div');
        rowContainer.setAttribute('class', 'hotel__postings__row');

        var img = document.createElement('div');
        img.setAttribute('class', 'hotel__postings__image');

        var hotelInfoContainer = document.createElement('div');
        hotelInfoContainer.setAttribute('class', 'hotel__info__container');

        var hotelName = document.createElement('div');
        hotelName.setAttribute('class', 'hotel__info__name');
        hotelName.innerHTML = `${hotelPosts[i].hotel_name}`;

        var hotelAddr = document.createElement('div');
        hotelAddr.setAttribute('class', 'hotel__info__address');
        hotelAddr.innerHTML = `${hotelPosts[i].address}`;

        var hotelPrice = document.createElement('div');
        hotelPrice.setAttribute('class', 'hotel__info__price');
        hotelPrice.innerHTML = `${hotelPosts[i].hotel_price}`;

        hotelInfoContainer.appendChild(hotelName);
        hotelInfoContainer.appendChild(hotelAddr);
        hotelInfoContainer.appendChild(hotelAddr);
        rowContainer.appendChild(img);
        rowContainer.appendChild(hotelInfoContainer);
        hotelPostPanel.appendChild(rowContainer);
    }
}



const user_tab_btn = document.querySelectorAll('.user__tab__btn');
const user_tab_panel = document.querySelectorAll('.user__tab__panel');

initialSelect();
getComments();
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
        clearDom('booking_history');
    } else if (index == 1) {
        getBookingHistory();
        clearDom('comments');
        clearDom('hotel_posts');
    } else if (index == 2) {
        getHotelPosts();
        clearDom('comments');
        clearDom('booking_history');
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

function ifDataEmpty(domElem, message) {
    var messageElem = document.createElement('div');
    messageElem.setAttribute('class', 'missing__info__message');
    messageElem.innerHTML = message;
    domElem.appendChild(messageElem);
}

async function getComments() {
    const getCommentsRequest = await fetch(`/user/viewComments`);
    const commentsData = await getCommentsRequest.json();
    const comments = commentsData.userComments;
    var commentsPanel = document.getElementById('comments');

    if (comments.length === 0) {
        ifDataEmpty(commentsPanel, "You don't have any comments.");
        return;
    }

    for (var i = 0; i < comments.length; i++) {
        var rowContainer = document.createElement('div');
        rowContainer.setAttribute('class', 'cooment__row');
        var commentId = new String(comments[i].comment_id);

        var img = document.createElement('img');
        img.setAttribute('class', 'user__profile__image');
        img.setAttribute('src', "");

        

    }
}

async function getBookingHistory() {
    const bookingHistoryRequest = await fetch(`/user/viewBookingHistory`);
    const bookingHistoryData = await bookingHistoryRequest.json();
    const bookingHistories = bookingHistoryData.userBookingHistory;
    var bookingHistoryPanel = document.getElementById("booking_history");

    if (bookingHistories.length === 0) {
        ifDataEmpty(bookingHistoryPanel, "You don't have any booking records.");
        return;
    }

    for (var i = 0; i < bookingHistories.length; i++) {
        var rowContainer = document.createElement('div');
        var bookingId = new String(bookingHistories[i].booking_id);
        rowContainer.setAttribute('class', 'booking__history__row');
        //rowContainer.setAttribute();

        var img = document.createElement('img');
        img.setAttribute('class', 'hotel__postings__image');
        img.setAttribute('src', "https://photo.hotellook.com/image_v2/limit/h" + `${bookingHistories[i].hotel_API_id}` + "_1/330/330.jpg");

        var infoContainer = document.createElement('div');
        infoContainer.setAttribute('class', 'booking__hisotry__info__container');
        
        var dateToday = new Date(Date.now());
        var dateToCompare = dateToday.getFullYear() + "-" + (dateToday.getMonth() + 1) + "-" + dateToday.getDate();

        var leaveCommentButton = document.createElement
        if (dateToCompare > bookingHistories[i].check_out_date) {
            console.log("Shoud leave comments");
            console.log('user/review/booking:id/new');
        }

        var hotelName = document.createElement('div');
        hotelName.setAttribute('class', 'hotel__info__name');
        hotelName.innerHTML = `${bookingHistories[i].hotel_name}`;

        var hotelAddr = document.createElement('div');
        hotelAddr.setAttribute('class', 'hotel__info__address');
        hotelAddr.innerHTML = `${bookingHistories[i].hotel_address}`;

        var hotelPrice = document.createElement('div');
        hotelPrice.setAttribute('class', 'hotel__info__price');
        hotelPrice.innerHTML = "$" + `${bookingHistories[i].booking_price}`;

        var chkInDate = document.createElement('div');
        chkInDate.setAttribute('class', 'booking__info__chkin');
        chkInDate.innerHTML = "Check-in Date: " + `${bookingHistories[i].check_in_date}`;

        var chkOutDate = document.createElement('div');
        chkOutDate.setAttribute('class', 'booking__info__chkin');
        chkOutDate.innerHTML = "Check-out Date: " + `${bookingHistories[i].check_out_date}`;

        infoContainer.appendChild(hotelName);
        infoContainer.appendChild(hotelAddr);
        infoContainer.appendChild(hotelPrice);
        infoContainer.appendChild(chkInDate);
        infoContainer.appendChild(chkOutDate);

        rowContainer.appendChild(img);
        rowContainer.appendChild(infoContainer);
        bookingHistoryPanel.appendChild(rowContainer);
    }
}

async function getHotelPosts() {
    const hotelPostsRequest = await fetch(`/user/viewHotelPosts`);
    const hotelPostsData = await hotelPostsRequest.json();
    const hotelPosts = hotelPostsData.userPostHotels;
    var hotelPostPanel = document.getElementById("hotel_posts");

    if (hotelPosts.length === 0) {
        ifDataEmpty(hotelPostPanel, "You don't have any hotel posting records.");
        return;
    }

    for (var i = 0; i < hotelPosts.length; i++){
        var rowContainer = document.createElement('div');
        var hotelId = new String(hotelPosts[i].hotel_id);
        rowContainer.setAttribute('class', 'hotel__postings__row');
        rowContainer.setAttribute('onclick', "location.href='/become-host/hotel/" + `${hotelId}` + "'");

        var img = document.createElement('img');
        img.setAttribute('class', 'hotel__postings__image');
        img.setAttribute('src', `${hotelPosts[i].hotel_images[0]}`);

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
        hotelPrice.innerHTML = "$" + `${hotelPosts[i].hotel_price}`;

        hotelInfoContainer.appendChild(hotelName);
        hotelInfoContainer.appendChild(hotelAddr);
        hotelInfoContainer.appendChild(hotelPrice);
        rowContainer.appendChild(img);
        rowContainer.appendChild(hotelInfoContainer);
        hotelPostPanel.appendChild(rowContainer);
    }
}



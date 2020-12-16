loadUserTable();

async function loadUserTable() {
    const userDataRequest = await fetch(`/djemals-tbvjdbwj/auth/getUsersAndBooking`);
    const userJsonData = await userDataRequest.json();
    const users = userJsonData.users.data;
    var userData = [];

    for(var i = 0; i < users.length; i++) {
        userData.push(users[i]);
    }

    var table = document.getElementById('user__table');

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    
    var headTexts = ["Id", "Username", "Email", "Email Status", "Hosting Status"];

    for (var i = 0; i < headTexts.length; i++) {
        var th = document.createElement('th');
        th.textContent = headTexts[i];
        headRow.appendChild(th);
    }

    thead.appendChild(headRow);

    var tbody = document.createElement('tbody');

    for (var i = 0; i < userData.length; i++) {
        var row = document.createElement('tr');
        var values = Object.values(userData[i]);
        for (var j = 0; j < values.length - 1; j++) {
            var td = document.createElement('td');
            if (j === 3) {
                td.innerHTML = (values[j] === 1) ? "Confirmed" : "Unconfirmed";
            } else if (j === 4) {
                td.innerHTML = (values[j] === 1) ? "Yes" : "No";
            } else {
                td.innerHTML = `${values[j]}`;
            }
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
   
    table.appendChild(thead);
    table.appendChild(tbody);
    loadChart(userJsonData.users);
}

function loadChart(data) {
    const priceData = data.usersBookingsPriceDatePair;
    var bookingPriceCnt = {'$0-50': 0, 
                            '$51-100': 0, 
                            '$101-200': 0, 
                            '$201-300': 0, 
                            '$300+': 0 };
    var labels = ['$0-50', '$51-100', '$101-200', '$201-300', '$300+'];
    
    for (var i = 0; i < priceData.length; i++) {
        var price = priceData[i].bookingPrice;
        if (price > 0 && price <= 50) {
            bookingPriceCnt['$0-50']++;
        } else if (price > 50 && price <= 100) {
            bookingPriceCnt['$51-100']++;
        } else if (price > 100 && price <= 200) {
            bookingPriceCnt['$101-200']++;
        } else if (price > 200 && price <= 300) {
            bookingPriceCnt['$201-300']++;
        } else {
            bookingPriceCnt['$300+']++;
        }
    }

    var ctx = document.getElementById('myChart')
    ctx.height = 500
    ctx.width = 500
    var data = {
        labels: labels,
        datasets: [{
            data: [ bookingPriceCnt[labels[0]], bookingPriceCnt[labels[1]], 
                    bookingPriceCnt[labels[2]], bookingPriceCnt[labels[3]], 
                    bookingPriceCnt[labels[4]] ],
            backgroundColor: ['#9BBFE0', '#E8A09A', '#FBE29F', '#C6D68F', '#F7B7A3']
        }]
    }
    
    var pieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
        }
    })
}

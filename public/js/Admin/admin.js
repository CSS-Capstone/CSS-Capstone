const primaryColor = '#4834d4'
const warningColor = '#f0932b'
const successColor = '#6ab04c'
const dangerColor = '#eb4d4b'

const themeCookieName = 'theme'
const themeDark = 'dark'
const themeLight = 'light'

const body = document.getElementsByTagName('body')[0]

function setCookie(cname, cvalue, exdays) {
  var d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  var expires = "expires="+d.toUTCString()
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function getCookie(cname) {
  var name = cname + "="
  var ca = document.cookie.split(';')
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

loadTheme();
loadUserTable();

const nav_btns = document.querySelectorAll('.sidebar-nav-item');
const user_tab_panel = document.querySelectorAll('#panel');

nav_btns.forEach((eachBtn, index) => {
    eachBtn.addEventListener('click', (event) => {
        displayPanel(event, index);
    });
});

function displayPanel(event, index) {
    for (let i = 0; i < nav_btns.length; i++) {
        nav_btns[i].style.backgroundColor = "";
        nav_btns[i].style.color = "";
    }
    if (index == 0) {
        getComments();
        //clearDom('booking_history');
    } else if (index == 1) {
        getBookingHistory();
        //clearDom('hotel_posts');
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

async function loadUserTable() {
    const userDataRequest = await fetch(`/djemals-tbvjdbwj/3d9cfb1f8220a46bca8de65d0f252cac2fbd`);
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

function loadTheme() {
	var theme = getCookie(themeCookieName)
	body.classList.add(theme === "" ? themeLight : theme)
}

function switchTheme() {
	if (body.classList.contains(themeLight)) {
		body.classList.remove(themeLight)
		body.classList.add(themeDark)
		setCookie(themeCookieName, themeDark)
	} else {
		body.classList.remove(themeDark)
		body.classList.add(themeLight)
		setCookie(themeCookieName, themeLight)
	}
}

function collapseSidebar() {
	body.classList.toggle('sidebar-expand')
}

window.onclick = function(event) {
	openCloseDropdown(event)
}

function closeAllDropdown() {
	var dropdowns = document.getElementsByClassName('dropdown-expand')
	for (var i = 0; i < dropdowns.length; i++) {
		dropdowns[i].classList.remove('dropdown-expand')
	}
}

function openCloseDropdown(event) {
	if (!event.target.matches('.dropdown-toggle')) {
		// 
		// Close dropdown when click out of dropdown menu
		// 
		closeAllDropdown()
	} else {
		var toggle = event.target.dataset.toggle
		var content = document.getElementById(toggle)
		if (content.classList.contains('dropdown-expand')) {
			closeAllDropdown()
		} else {
			closeAllDropdown()
			content.classList.add('dropdown-expand')
		}
	}
}

function loadChart(data) {
    const priceData = data.usersBookingsPriceDatePair;
    var bookingPriceCnt = {'$0-50': 0, 
                            '$51-100': 0, 
                            '$101-200': 0, 
                            '$200-300': 0, 
                            '$300+': 0 };
    var labels = ['$0-50', '$51-100', '$101-200', '$200-300', '$300+'];
    
    for (var i = 0; i < priceData.length; i++) {
        var price = priceData[i].bookingPrice;
        if (price > 0 && price <= 50) {
            bookingPriceCnt['$0-50']++;
        } else if (price > 50 && price <= 100) {
            bookingPriceCnt['$51-100']++;
        } else if (price > 100 && price <= 200) {
            bookingPriceCnt['$101-200']++;
        } else if (price > 200 && price <= 300) {
            bookingPriceCnt['$200-300']++;
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

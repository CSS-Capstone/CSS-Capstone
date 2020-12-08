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

var ctx = document.getElementById('myChart')
ctx.height = 500
ctx.width = 500
var data = {
	labels: ['January', 'February', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	datasets: [{
		fill: false,
		label: 'Completed',
		borderColor: successColor,
		data: [120, 115, 130, 100, 123, 88, 99, 66, 120, 52, 59],
		borderWidth: 2,
		lineTension: 0,
	}, {
		fill: false,
		label: 'Issues',
		borderColor: dangerColor,
		data: [66, 44, 12, 48, 99, 56, 78, 23, 100, 22, 47],
		borderWidth: 2,
		lineTension: 0,
	}]
}

var lineChart = new Chart(ctx, {
	type: 'line',
	data: data,
	options: {
		maintainAspectRatio: false,
		bezierCurve: false,
	}
})
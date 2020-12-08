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
loadChart();

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

function loadChart() {
    var ctx = document.getElementById('myChart')
    ctx.height = 500
    ctx.width = 500
    var data = {
        labels: ['$0-50', '$51-100', '$101-200', '$200-300', '$300+'],
        datasets: [{
            data: [35, 25, 20, 10, 10],
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

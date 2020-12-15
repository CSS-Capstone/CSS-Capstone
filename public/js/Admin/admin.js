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


const nav_btns = document.querySelectorAll('.sidebar-nav-item');
const user_tab_panel = document.querySelectorAll('#panel');

nav_btns.forEach((eachBtn, index) => {
    eachBtn.addEventListener('click', (event) => {
        displayPanel(event, index);
    });
    eachBtn.addEventListener('hover', (event) =>  {
        console.log("on  hoverr");
    });
});

loadTheme();
initialSelect();

function displayPanel(event, index) {
    for (let i = 0; i < nav_btns.length; i++) {
        nav_btns[i].style.backgroundColor = "";
        nav_btns[i].style.color = "";
    }
    if (index == 0) {
        //clearDom('booking_history');
    } else if (index == 1) {
        //clearDom('hotel_posts');
    } 
    event.target.style.backgroundColor = '#f1f1f1';
    event.target.style.color = "#eb4d4b";

    for (let i = 0; i < user_tab_panel.length; i++) {
        user_tab_panel[i].style.display = "none";
    }
    user_tab_panel[index].style.display = "block";
}

function initialSelect() {
    for (let i = 0; i < nav_btns.length; i++) {
        if (i === 0) {
            nav_btns[i].style.backgroundColor = '#f1f1f1';
            nav_btns[i].style.color = "#eb4d4b";
            user_tab_panel[i].style.display = "block";
        } else {
            nav_btns[i].style.backgroundColor = "";
            nav_btns[i].style.color = "";
            user_tab_panel[i].style.display = "none";
        }
    }
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
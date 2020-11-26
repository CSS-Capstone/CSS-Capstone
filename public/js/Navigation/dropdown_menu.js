var hidden = document.getElementById("isLoggedIn__hidden");
var isLoggedIn = ((hidden.innerHTML).replace(/\s/g, '') == 'true');

window.onclick = function(event) {
    if (!event.target.matches('.dropdown__link')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function showDropDown() {
    if (isLoggedIn) {
        document.getElementById("dropdown__menu__loggedIn").classList.toggle("show");
    } else {
        document.getElementById("dropdown__menu__loggedOut").classList.toggle("show");
    }
}
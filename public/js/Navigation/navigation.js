// DOM Element
const modeSetting = document.querySelector('.mode_setting');
// add event listener
modeSetting.addEventListener('click', change_theme);

// mode change util function
function change_theme() {
    let currentMode = document.documentElement.getAttribute("data-theme");
    if (currentMode === 'light') {
        modeSetting.innerHTML = '<i class="far fa-sun"> Light Mode</i>'
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        modeSetting.innerHTML = '<i class="far fa-moon"> Dark Mode</i>'
        document.documentElement.setAttribute("data-theme", "light");  
    }
}

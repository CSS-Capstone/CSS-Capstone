var login = document.querySelector('.login_form');
var register = document.querySelector('.register_form');
var box = document.querySelector('.popup');

function openForm() {
    document.body.classList.add("showForm");
}

function closeForm() {
    document.body.classList.remove("showForm");
}

function showRegister() {
    // var loginStyle = getComputedStyle(login);
    // var registerStyle = getComputedStyle(register);
    // console.log(loginStyle.display);
    // console.log(registerStyle.display);
    if (getComputedStyle(register).display === "none")
    {
        console.log("success");
        // login.setAttribute('style', 'display: none');
        // register.setAttribute('style', 'display: block');
        login.style.display = 'none';
        register.style.display = 'block';
        box.style.height = '580px';
    }
}

function showLogin() {
    if (getComputedStyle(login).display === "none")
    {
        console.log("success");
        // login.setAttribute('style', 'display: none');
        // register.setAttribute('style', 'display: block');
        login.style.display = 'block';
        register.style.display = 'none';
        box.style.height = '440px';
    }
}
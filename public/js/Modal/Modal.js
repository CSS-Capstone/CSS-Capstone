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
    if (getComputedStyle(register).display === "none")
    {
        // console.log("success");
        login.style.display = 'none';
        register.style.display = 'block';
        box.style.height = '510px';
    }
}

function showLogin() {
    if (getComputedStyle(login).display === "none")
    {
        // console.log("success");
        login.style.display = 'block';
        register.style.display = 'none';
        box.style.height = '440px';
    }
}
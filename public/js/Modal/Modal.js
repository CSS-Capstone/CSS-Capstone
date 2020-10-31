var login = document.querySelector('.login_form');
var register = document.querySelector('.register_form');
var resetPassword = document.querySelector('.reset_password_form');
var messageResetPassword = document.querySelector('.message_reset_password');
var box = document.querySelector('.popup');
// var loginForm = document.querySelector('#login');
// var registerForm = document.querySelector('#register');

// loginForm.addEventListener("submit", checkLoginForm);
// registerForm.addEventListener("submit", checkRegisterForm);

function checkLoginForm(form) {
    alert("connected to login form");
    // event.preventDefault();
}

function checkRegisterForm(form) {
    //check email

    //see if email is empty or not
    if(form.email.value === "") {
        alert("Error! Email cannot be empty");
        form.email.focus();
        return false;
    }
    //see if email is valid or not
    let reg = /^[0-9?A-z0-9?]+(\.)?[0-9?A-z0-9?]+@[A-z]+\.[A-z]{3}.?[A-z]{0,3}$/;
    if(!reg.test(form.email.value)) {
        alert("Error! Email needs to be a valid email");
        form.email.focus();
        return false;
    }

    //check password

    //see if password is empty or not
    if(form.newPassword.value === "") {
        alert("Error! Password cannot be empty and needed to be confirmed");
        form.newPassword.focus();
        return false;
    }

    //see if the password is valid or not based on some criterias
    if(form.newPassword.value !== "") {
        //see if the password is matching with the confirm password
        if(form.newPassword.value === form.confirmPassword.value) {
            //see if password length is more than six character
            if(form.newPassword.value.length < 6) {
                alert("Error! Password need to have at least 6 characters");
                form.newPassword.focus();
                return false;
            }
            //see if password contains any number
            reg = /[0-9]/;
            if(!reg.test(form.newPassword.value)) {
                alert("Error! Password need to have at least a digit");
                form.newPassword.focus();
                return false;
            }
            //see if password contains lowercase letter
            reg = /[a-z]/;
            if(!reg.test(form.newPassword.value)) {
                alert("Error! Password need to contain at least one lowercase letter");
                form.newPassword.focus();
                return false;
            }
            //see if password contains uppercase letter
            reg = /[A-Z]/;
            if(!reg.test(form.newPassword.value)) {
                alert("Error! Password need to contain at least one uppercase letter");
                form.newPassword.focus();
                return false;
            }
        }
        else {
            alert("Error! Your confirmed password must match with your password");
            form.newPassword.focus();
            return false;
        }
    }

    //successfull registration
    alert("Registration successful! If you have more question, feel free to ask about it in our FAQ page.");
    return true;
}

function checkResetPasswordForm(form) {

}

function openForm() {
    showLogin();
    document.body.classList.add("showForm")
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
        resetPassword.style.display = 'none';
        messageResetPassword.style.display = 'none';
        box.style.height = '600px';
    }
}

function showLogin() {
    if (getComputedStyle(login).display === "none")
    {
        // console.log("success");
        login.style.display = 'block';
        register.style.display = 'none';
        resetPassword.style.display = 'none';
        messageResetPassword.style.display = 'none';
        box.style.height = '440px';
    }
}

function showResetPassword() {
    if (getComputedStyle(resetPassword).display === "none")
    {
        // console.log("success");
        login.style.display = 'none';
        register.style.display = 'none';
        resetPassword.style.display = 'block';
        messageResetPassword.style.display = 'none';
        box.style.height = '500px';
    }
}

function showResetPasswordMessage() {
    if (getComputedStyle(messageResetPassword).display === "none")
    {
        // console.log("success");
        login.style.display = 'none';
        register.style.display = 'none';
        resetPassword.style.display = 'none';
        messageResetPassword.style.display = 'block';
        box.style.height = '200px';
    }
}
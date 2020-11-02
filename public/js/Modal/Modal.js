var login = document.querySelector('.login_form');
var register = document.querySelector('.register_form');
var resetPassword = document.querySelector('.reset_password_form');
var messageResetPassword = document.querySelector('.message_reset_password');
var messageLogin = document.querySelector('.message_login');
var messageRegister = document.querySelector('.message_register');
var box = document.querySelector('.popup');
var loginForm = document.querySelector('#login');
var registerForm = document.querySelector('#register');
var resetPasswordForm = document.querySelector('#reset_password');

loginForm.addEventListener("submit", checkLoginForm, true);
registerForm.addEventListener("submit", checkRegisterForm, true);
resetPasswordForm.addEventListener("submit", checkResetPasswordForm, true);

function checkLoginForm(e) {
    //email
    // var emptyEmailMessage = document.querySelector("#login_error_message_empty");
    // var invalidEmailMessage = document.querySelector("#login_rror_message_invalid");
    if(this.email.value === "") {
        alert("Error! The email cannot be empty");
        // emptyEmailMessage.style.display = block;
        // invalidEmailMessage.style.display = none;
        this.email.focus();
        e.preventDefault();
        return;
    }

    let reg = /^[0-9?A-z0-9?]+(\.)?[0-9?A-z0-9?]+@[A-z]+\.[A-z]{3}.?[A-z]{0,3}$/;
    if(!reg.test(this.email.value)) {
        alert("Error! The email needs to be valid");
        // invalidEmailMessage.style.display = block;
        // emptyEmailMessage.style.display = none;
        this.email.focus();
        e.preventDefault();
        return;
    }

    //password
    // var emptyPasswordMessage = document.querySelector("#login_error_message_password");
    if (this.password.value === "") {
        alert("Error! The password cannot be empty");
        // emptyPasswordMessage.style.display = block;
        this.password.focus();
        e.preventDefault();
        return;
    }

    // alert("Login successful! If you have more question, feel free to ask about it in our FAQ page.");
    // invalidEmailMessage.style.display = block;
    // emptyEmailMessage.style.display = none;
    // emptyPasswordMessage.style.display = block;
    // return true;
    // event.preventDefault();
}

function checkRegisterForm(e) {
    //check email

    //see if email is empty or not
    if(this.email.value === "") {
        alert("Error! Email cannot be empty");
        this.email.focus();
        e.preventDefault();
        return;
    }
    
    //see if email is valid or not
    let reg = /^[0-9?A-z0-9?]+(\.)?[0-9?A-z0-9?]+@[A-z]+\.[A-z]{3}.?[A-z]{0,3}$/;
    if(!reg.test(this.email.value)) {
        alert("Error! Email needs to be a valid email");
        this.email.focus();
        e.preventDefault();
        return;
    }

    //check password

    //see if password is empty or not
    if(this.newPassword.value === "") {
        alert("Error! Password cannot be empty and needed to be confirmed");
        this.newPassword.focus();
        e.preventDefault();
        return;
    }

    //see if the password is valid or not based on some criterias
    if(this.newPassword.value !== "") {
        //see if the password is matching with the confirm password
        if(this.newPassword.value === this.confirmPassword.value) {
            //see if password length is more than six character
            if(this.newPassword.value.length < 6) {
                alert("Error! Password need to have at least 6 characters");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
            //see if password contains any number
            reg = /[0-9]/;
            if(!reg.test(this.newPassword.value)) {
                alert("Error! Password need to have at least a digit");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
            //see if password contains lowercase letter
            reg = /[a-z]/;
            if(!reg.test(this.newPassword.value)) {
                alert("Error! Password need to contain at least one lowercase letter");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
            //see if password contains uppercase letter
            reg = /[A-Z]/;
            if(!reg.test(this.newPassword.value)) {
                alert("Error! Password need to contain at least one uppercase letter");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
        }
        //see if the password is not the same with the confirm password
        else {
            alert("Error! Your confirmed password must match with your password");
            this.newPassword.focus();
            e.preventDefault();
            return;
        }
    }

    //successfull registration
    // alert("Registration successful! If you have more question, feel free to ask about it in our FAQ page.");
    // return true;
}

function checkResetPasswordForm(e) {
    //email
    
    //see if email is empty or not
    if(this.email.value === "") {
        alert("Error! Email cannot be empty");
        this.email.focus();
        e.preventDefault();
        return;
    }
        
    //see if email is valid or not
    let reg = /^[0-9?A-z0-9?]+(\.)?[0-9?A-z0-9?]+@[A-z]+\.[A-z]{3}.?[A-z]{0,3}$/;
    if(!reg.test(this.email.value)) {
        alert("Error! Email needs to be a valid email");
        this.email.focus();
        e.preventDefault();
        return;
    }

    //password

    //see if the password is valid or not based on some criterias
    if(this.newPassword.value !== "") {
        //see if the password is matching with the confirm password
        if(this.newPassword.value === this.confirmPassword.value) {
            //see if password length is more than six character
            if(this.newPassword.value.length < 6) {
                alert("Error! Password need to have at least 6 characters");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
            //see if password contains any number
            reg = /[0-9]/;
            if(!reg.test(this.newPassword.value)) {
                alert("Error! Password need to have at least a digit");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
            //see if password contains lowercase letter
            reg = /[a-z]/;
            if(!reg.test(this.newPassword.value)) {
                alert("Error! Password need to contain at least one lowercase letter");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
            //see if password contains uppercase letter
            reg = /[A-Z]/;
            if(!reg.test(this.newPassword.value)) {
                alert("Error! Password need to contain at least one uppercase letter");
                this.newPassword.focus();
                e.preventDefault();
                return;
            }
        }
        //see if the password is not the same with the confirm password
        else {
            alert("Error! Your confirmed password must match with your password");
            this.newPassword.focus();
            e.preventDefault();
            return;
        }
    }

    // alert("Reset Password successful! If you have more question, feel free to ask about it in our FAQ page.");
    // return true;
}

function openForm() {
    showLogin();
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
        resetPassword.style.display = 'none';
        messageLogin.style.display = 'none';
        messageRegister.style.display = 'none';
        messageResetPassword.style.display = 'none';
        box.style.height = '600px';
    }
}

function showRegisterMessage() {
    if (getComputedStyle(messageRegister).display === "none")
    {
        // console.log("success");
        login.style.display = 'none';
        register.style.display = 'none';
        resetPassword.style.display = 'none';
        messageLogin.style.display = 'none';
        messageRegister.style.display = 'block';
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
        messageLogin.style.display = 'none';
        messageRegister.style.display = 'none';
        messageResetPassword.style.display = 'none';
        box.style.height = '440px';
    }
}

function showLoginMessage() {
    if (getComputedStyle(messageLogin).display === "none")
    {
        // console.log("success");
        login.style.display = 'none';
        register.style.display = 'none';
        resetPassword.style.display = 'none';
        messageLogin.style.display = 'block';
        messageRegister.style.display = 'none';
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
        messageLogin.style.display = 'none';
        messageRegister.style.display = 'none';
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
        messageLogin.style.display = 'none';
        messageRegister.style.display = 'none';
        messageResetPassword.style.display = 'block';
        box.style.height = '200px';
    }
}
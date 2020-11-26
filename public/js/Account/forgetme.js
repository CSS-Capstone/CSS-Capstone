const forgetme_btn = document.querySelectorAll('.forget__me__btn');

function forgetMe() {
    event.preventDefault();
    let deleteConfirm = prompt("This will delete all your information. \nPlease type 'delete permanently' to confirm");
    const deleteForm = document.querySelector('#user_delete_form');
    if (deleteConfirm != null) {
        if (deleteConfirm === 'delete permanently') {
            console.log("success");
            deleteForm.submit();
        } else {
            deleteConfirm = prompt("Please type 'delete permanently' to confirm");
        }
    }
}
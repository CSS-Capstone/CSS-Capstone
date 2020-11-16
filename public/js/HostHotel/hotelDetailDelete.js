// DOM Elements
const onDeleteSubmitBtn = document.querySelector('.hotelDetail_header_delete_btn');
// Event Listeners
onDeleteSubmitBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let deleteConfirm = prompt("Please type 'delete' to confirm");
    const deleteForm = document.querySelector('#hotelDetail_delete_form');
    if (deleteConfirm != null) {
        if (deleteConfirm === 'delete') {
            console.log("success");
            deleteForm.submit();
        } else {
            deleteConfirm = prompt("Please type 'delete' to confirm");
        }
    }
});

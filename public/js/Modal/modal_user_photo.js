const imageUpload = document.getElementById("imageUpload");
imageUpload.addEventListener("change", uploadImage, false);

function openForm() {
    document.body.classList.add("showForm");
}

function closeForm() {
    document.body.classList.remove("showForm");
}

function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
 
    return file && acceptedImageTypes.includes(file['type'])
}

async function uploadImage() {
    let imgFile = this.files[0];
    if (imgFile) {
        const formData = new FormData();
        formData.append('imageFile', imgFile);
        const response = await fetch('/users/upload', {
            method: 'POST',
            headers: {},
            body: formData
        })
    } else {
        console.log('Not supported type');
    }
}

function getTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
    var time = today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
    return date + '-' + time + '_';
}
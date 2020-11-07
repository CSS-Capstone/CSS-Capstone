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

    const fileReader = new FileReader();
        fileReader.readAsDataURL(imgFile);
        fileReader.onload = (event) => {
            eachImageContainer.innerHTML = `<img src="${event.target.result}"/>`;
            let inputArea = fileContainer.querySelector('#hotelImagePost');
            console.log(inputArea);
            // inputArea.setAttribute('disabled', 'disabled');
            deleteIconArea.addEventListener('click', (event) => {
                removeTheElement(event.target);
            });
        };

    if (imgFile) {
        const formData = new FormData();
        formData.append('imageFile', imgFile);
        const response = await fetch('/user/upload', {
            method: 'POST',
            headers: {},
            body: formData
        }).then(response => {
            console.log("Reponse From fetch: ", response);
            window.location.replace(response.url);
        }).catch(error => {
            console.log(error);
        });
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

function selectToMain() {
    
}
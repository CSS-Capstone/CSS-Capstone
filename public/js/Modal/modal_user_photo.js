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

    if (imgFile && isFileImage(imgFile)) {
        const formData = new FormData();
        formData.append('imageFile', imgFile);
        const uploadRes = await fetch('/user/upload', {
            method: 'POST',
            headers: {},
            body: formData
        }).then(async (uploadRes) => {
            const imageUploadRes = await uploadRes.json();
            const imageData = imageUploadRes.profile.imgDom;
            const profileImg = document.getElementById('profile__image__main');
            profileImg.setAttribute('src', `${imageData}`);
            const profileImgModal = document.getElementById('profile__image__modal');
            profileImgModal.setAttribute('src', `${imageData}`);
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
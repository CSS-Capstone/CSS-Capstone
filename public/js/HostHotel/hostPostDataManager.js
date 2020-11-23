// DOM ELEMENTS ===============================
const imageInputContainer = document.querySelector('.main_image_container');
const imageInputField = document.querySelector('.form_group');
const imageInputBtn = document.querySelector('#hotelImagePost');
const imageSubmitBtn = document.querySelector('.image_submit_btn');

// EVENT LISTENERS ============================
imageSubmitBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let allImageInputTags = document.querySelectorAll('#hotelImagePost');
    let invalidImageText = document.querySelector('.image_container_step');
    const formSubmitTag = document.querySelector('#formSubmitTag');
    const postingImage_max_validation = document.querySelector('.postHostImage_max_validation');
    // exclude the last one
    if (allImageInputTags[0].value == '') {
        console.log("Input is empty");
        invalidImageText.textContent = `We need at least 1 image from you`;
        setTimeout( () => {
            invalidImageText.textContent = ``;
        }, 2000);
        return false;
    }
    if (allImageInputTags.length > 11) {
        postingImage_max_validation.textContent = "You cannot upload more than 10 Images\n Please Remove Some Images";
        setTimeout( () => {
            postingImage_max_validation.textContent = ''
        },3000);
        return false;
    }

    for (let i = 0; i < allImageInputTags.length - 1; i++) {
        if (allImageInputTags[i].hasAttribute('disabled')) {
            allImageInputTags[i].removeAttribute('disabled');
        }
    }
    formSubmitTag.submit();
});

imageInputField.addEventListener('click', (event) => {
    imageInputBtn.click();
});

imageInputField.addEventListener('change', (event) => {
    const imageInputDIVDOM = imageInputBtn.closest('.form_group');
    imageInputBtn.files = event.target.files;
    // console.log(imageInputDIVDOM);
    // console.log(event.target.files[0]);
    CreateNextElements();
    ReadAndDisplayInputFile(imageInputDIVDOM, event.target.files[0]);
});

// Util Function ===============
function CreateNextElements()  {
    let nextImageInputArea = document.createElement('div');
    let nextLabelArea = document.createElement('label');
    let nextImageInputField = document.createElement('input');
    // set up 
    nextImageInputArea.classList.add('form_group');
    nextLabelArea.classList.add('labelForUploadImage');
    nextImageInputField.setAttribute('type', 'file');
    nextImageInputField.setAttribute('accept', '.png, .jpg, .jpeg');
    nextImageInputField.setAttribute('id', 'hotelImagePost');
    nextImageInputField.setAttribute('name', "hotelImages");
    nextLabelArea.innerHTML = "Click to Uplaod Image";
    nextImageInputArea.appendChild(nextLabelArea);
    nextImageInputArea.appendChild(nextImageInputField);
    imageInputContainer.appendChild(nextImageInputArea);

    nextImageInputArea.addEventListener('click', (event) => {
        if (nextImageInputArea.querySelector('uploadImage_eachBox')) {
            event.preventDefault();
            nextImageInputField.preventDefault();
        } else {
            nextImageInputField.click();
        }
        
    });
    nextImageInputArea.addEventListener('change', (event) => {
        CreateNextElements();
        // console.log(event.target);
        // console.log(event.target.files[0]);
        ReadAndDisplayInputFile(nextImageInputArea, event.target.files[0]);
    }); 
}

function ReadAndDisplayInputFile(fileContainer, theFile) {
    console.log(fileContainer);
    // if (theFile.length) {
        if (fileContainer.querySelector('.labelForUploadImage') != null) {
            console.log("It has Label OBJ");
            fileContainer.querySelector('.labelForUploadImage').style.display = "none"; 
        }

        let deleteIconArea = document.createElement('span');
        deleteIconArea.innerHTML = `<i class="fas fa-trash-alt removeImage"></i>`;
        const eachImageContainer = document.createElement('div');
        eachImageContainer.classList.add('uploadImage_eachBox');
        fileContainer.appendChild(eachImageContainer);
        fileContainer.appendChild(deleteIconArea);
        // eachImageContainer
        const fileReader = new FileReader();
        fileReader.readAsDataURL(theFile);
        fileReader.onload = (event) => {
            eachImageContainer.innerHTML = `<img src="${event.target.result}"/>`;
            let inputArea = fileContainer.querySelector('#hotelImagePost');
            console.log(inputArea);
            inputArea.setAttribute('disabled', 'disabled');
            deleteIconArea.addEventListener('click', (event) => {
                removeTheElement(event.target);
            });
        };
}

function removeTheElement(trashIcon) {
    let imageContainer = trashIcon.parentElement.parentElement;
    imageContainer.remove();
}

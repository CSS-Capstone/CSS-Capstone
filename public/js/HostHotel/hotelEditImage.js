// DOM Elements
const allTabs = document.querySelectorAll('.tab');
const nextBtn = document.querySelector('#nextBtn');
// DOM Elements for Image Container
const imageInputContainer = document.querySelector('.main_image_container');
const imageInputField = document.querySelector('.form_group');
const imageInputBtn = document.querySelector('#hotelImagePost');
// DOM Elements for Existing Image
let form_group_existing_image = document.querySelector('.form_group_submitted');
let existingImages = document.querySelectorAll('.submitted_image');
let existingImagesRemove = document.querySelectorAll('.submitted_image_remove');
// const imageSubmitBtn = document.querySelector('.image_submit_btn');
// Event Listners
nextBtn.addEventListener('click', (event) => {
    checkIfHitLastTap();
});

function checkIfHitLastTap() {
    let tabNumbers = allTabs.length;
    if (allTabs[tabNumbers - 1].style.display == 'block') {
        // console.log("hello");
        if (existingImages.length > 0) {
            // add event listener to remove icon to existing items
            // add function that allow to remove pre-existing images
            existingImagesRemove.forEach(eachRemoveBtn => {
                eachRemoveBtn.addEventListener('click', (event) => {
                    removeImageDOMForExistingImage(event.target);
                });
            });
        }
        let totalImageDisplayer = document.querySelector('.totalImageDisplayer');
        totalImageDisplayer.textContent = 'Maximum Images: 10 Images';
        nextBtn.addEventListener('click', (event) => {
            event.preventDefault();
            let editImageValidationMinimum = document.querySelector('.editImageValidationMin');
            let editImageValidationMax = document.querySelector('.editImageValidationMax');
            let allImageInputTags = document.querySelectorAll('#hotelImagePost');
            // grab all images (both pre-exist if there is one and inserted images)
            let totalImageCounter = 0;
            let preSubmittedImages = document.querySelectorAll('.submitted_image');
            // console.log(preSubmittedImages.length);
            if (preSubmittedImages.length) {
                totalImageCounter = preSubmittedImages.length;
            }
            if (allImageInputTags.length) {
                totalImageCounter += allImageInputTags.length;
            }
            // console.log(totalImageCounter);
            if (totalImageCounter <= 1) {
                console.log("We need more Images");
                editImageValidationMinimum.textContent = `We need at least one images`;
                setTimeout(() => {
                    editImageValidationMinimum.textContent = '';
                }, 2000);
                return false;
            }
            if (totalImageCounter > 11) {
                editImageValidationMax.textContent = 'Image cannot be more than 10';
                setTimeout(() => {
                    editImageValidationMax.textContent = '';
                }, 2000);
                return false;
            }
            // console.log("Remove return false then it will work");
            // console.log("stop!");
            let formSubmitTag = document.querySelector('#regForm');
            for (let i = 0; i < allImageInputTags.length - 1; i++) {
                if (allImageInputTags[i].hasAttribute('disabled')) {
                    allImageInputTags[i].removeAttribute('disabled');
                }
            }
            formSubmitTag.submit();
        });
        // add event listener to all existing form_group input button
        imageInputField.addEventListener('click', (event) => {
            imageInputBtn.click();
        });
        imageInputField.addEventListener('change', (event) => {
            createInputBox();
            const imageInputDIVDOM = imageInputBtn.closest('.form_group');
            imageInputBtn.files = event.target.files;
            // console.log(event.target.files[0]);
            renderImageToDOM(imageInputDIVDOM, event.target.files[0]);
        });
    }
}

// Remove the existing images
function removeImageDOMForExistingImage(removeIcon) {
    let targetRemoveDOM = removeIcon.closest('.form_group_submitted');
    targetRemoveDOM.remove();
}

// Create another image input box
function createInputBox() {
    let nextImageInputDOM = document.createElement('div');
    let nextLabelDOM = document.createElement('label');
    let nextInputDOM = document.createElement('input');
    nextImageInputDOM.classList.add('form_group');
    nextLabelDOM.classList.add('labelForUploadImage');
    nextInputDOM.setAttribute('type', 'file');
    nextInputDOM.setAttribute('accept', 'image/*');
    nextInputDOM.setAttribute('id', 'hotelImagePost');
    nextInputDOM.setAttribute('name', "hotelImages");
    nextLabelDOM.innerHTML = "Click to Uplaod Image";
    nextImageInputDOM.appendChild(nextLabelDOM);
    nextImageInputDOM.appendChild(nextInputDOM);
    imageInputContainer.appendChild(nextImageInputDOM);
    nextImageInputDOM.addEventListener('click', (event) => {
        if (nextImageInputDOM.querySelector('uploadImage_eachBox')) {
            event.preventDefault();
            nextInputDOM.preventDefault();
        } else {
            nextInputDOM.click();
        }
    });
    nextImageInputDOM.addEventListener('change', (event) => {
        createInputBox();
        //console.log(event.target);
        //console.log(event.target.files[0]);
        renderImageToDOM(nextImageInputDOM, event.target.files[0]);
    }); 
}

function renderImageToDOM(fileContainer, theFile) {
    if (fileContainer.querySelector('.labelForUploadImage') != null) {
            //console.log("It has Label OBJ");
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
            //console.log(inputArea);
            inputArea.setAttribute('disabled', 'disabled');
            deleteIconArea.addEventListener('click', (event) => {
                removeTheElement(event.target);
            });
        };
} 

// REMOVE the upload image
function removeTheElement(trashIcon) {
    let imageContainer = trashIcon.parentElement.parentElement;
    imageContainer.remove();
}

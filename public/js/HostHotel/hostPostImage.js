const imageInputDOM = document.querySelector('#hotelImagePost');
const imageInputDIVDOM = imageInputDOM.closest('.form_group');
const uploadedImageContainer = document.querySelector('.uploaded_image_conatiner');
imageInputDIVDOM.addEventListener('dragover', (event) => {
    event.preventDefault();
    imageInputDIVDOM.classList.add("form_group_dragOver");
});

imageInputDIVDOM.addEventListener('click', (event) => {
    // event.preventDefault();
    imageInputDOM.click();
});

// imageInputDOM.addEventListener('click', (event) => {
//     event.preventDefault();
// });

imageInputDOM.addEventListener('change', (event) => {
    if (imageInputDOM.files.length) {
        let imageFileLists = event.target.files;
        console.log(imageFileLists);
        // uploadImageAndDisplay(uploadedImageContainer, event.dataTransfer.files[0]);
        // console.log(event.dataTransfer.files.length);
        for (let i = 0; i < imageFileLists.length; i++) {
            let eachImageFile = imageFileLists[i];
            if (!eachImageFile.type.match('image')) {
                continue;
            }
            const fileReader = new FileReader(); 
            fileReader.readAsDataURL(eachImageFile);
            fileReader.onload = (event) => {
                console.log("does it gets here?");
                let filePictureURL = event.target.result;
                let filePictureName = event.target.name;
                let imageContainer = document.createElement('div');
                // ========== Adding UP
                imageContainer.classList.add('upload_each_image_container');
                let iconContainer = document.createElement('span');
                iconContainer.innerHTML = `<i class="fas fa-trash-alt removeImage"></i>`;
                // ========== End of Adding UP
                imageContainer.innerHTML = `<img src="${filePictureURL}" title="${filePictureName}"/>`;
                console.log(imageContainer);
                // ========== ADDING UP
                imageContainer.appendChild(iconContainer);
                // ========== END OF ADDING UP
                uploadedImageContainer.appendChild(imageContainer);
                // ========== ADDING UP
                iconContainer.addEventListener('click', (event) => {
                    event.target.parentElement.parentElement.remove();
                });
                // ========== END of Adding UP
            }
            
            console.log(eachImageFile);
        }
    }
    imageInputDIVDOM.classList.remove('form_group_dragOver');
});

// Adding multiple events
// https://stackoverflow.com/questions/11845678/adding-multiple-event-listeners-to-one-element
["dragleave", "dragend"].forEach( eventType => {
    imageInputDIVDOM.addEventListener(eventType, (event) => {
        imageInputDIVDOM.classList.remove('form_group_dragOver');
    });
});

imageInputDIVDOM.addEventListener('drop', (event) => {
    event.preventDefault();
    //console.log(event.dataTransfer.files);
    if (event.dataTransfer.files.length) {
        imageInputDOM.files = event.dataTransfer.files;
        // uploadImageAndDisplay(uploadedImageContainer, event.dataTransfer.files[0]);
        // console.log(event.dataTransfer.files.length);
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
            let eachImageFile = event.dataTransfer.files[i];
            if (!eachImageFile.type.match('image')) {
                continue;
            }
            const fileReader = new FileReader(); 
            fileReader.readAsDataURL(eachImageFile);
            fileReader.onload = (event) => {
                console.log("does it gets here?");
                let filePictureURL = event.target.result;
                let filePictureName = event.target.name;
                let imageContainer = document.createElement('div');
                // ========== Adding UP
                imageContainer.classList.add('upload_each_image_container');
                let iconContainer = document.createElement('span');
                iconContainer.innerHTML = `<i class="fas fa-trash-alt removeImage"></i>`;
                // ========== End of Adding UP
                imageContainer.innerHTML = `<img src="${filePictureURL}" title="${filePictureName}"/>`;
                console.log(imageContainer);
                // ========== ADDING UP
                imageContainer.appendChild(iconContainer);
                // ========== END OF ADDING UP
                uploadedImageContainer.appendChild(imageContainer);
                // ========== ADDING UP
                iconContainer.addEventListener('click', (event) => {
                    event.target.parentElement.parentElement.remove();
                });
                // ========== END of Adding UP
            }
            
            console.log(eachImageFile);
        }
    }
    imageInputDIVDOM.classList.remove('form_group_dragOver');
});

// DOM Elements
const showMoreImageButton = document.querySelector('.hotelSearched_detail_more_image_btn');
const closeModalButton = document.querySelector('.close_modal_btn');
const rightModalArrowButton = document.querySelector('.modal-right');
const leftModalArrowButton = document.querySelector('.modal-left');
// Event Listener
showMoreImageButton.addEventListener('click', (event) => {
    let imageCounter = 0;
    displayModalWithImage(imageCounter);
});

closeModalButton.addEventListener('click', (event) => {
    closeModal();
});

// Util Function
function displayModalWithImage(imageCounter) {
    console.log(imageCounter);
    const modal = document.querySelector('.modal');
    modal.style.display = "block";
    let imageNodes = document.querySelectorAll('.modal_img');
    console.log(imageNodes);
    // Setting up image for default (0 index display others none)
    const MAX_IMAGE = imageNodes.length - 1;
    imageNodes[0].style.display = "block";
    // if (imageNodes.length > 0) {
        for (let i = 1; i < imageNodes.length; i++) {
            console.log("here");
            imageNodes[i].style.display = "none";
        }
    // }
    // Add Event Listener
    leftModalArrowButton.addEventListener('click', (event) => {
        if (imageCounter == 0) {
            for (let i = 1; i < imageNodes.length; i++) {
                console.log("here");
                imageNodes[i].style.display = "none";
            }
            imageCounter = 0;
            imageNodes[imageCounter].style.display = "block";
        } else {
            for (let i = 0; i < imageNodes.length; i++) {
                console.log("here");
                imageNodes[i].style.display = "none";
            }
            imageCounter--;
            imageNodes[imageCounter].style.display = "block";
        }
    });
    rightModalArrowButton.addEventListener('click', (event) => {
        if (MAX_IMAGE == imageCounter) {
            for (let i = 0; i < imageNodes.length - 1; i++) {
                console.log("here");
                imageNodes[i].style.display = "none";
            }
            // imageNodes[imageCounter].style.display = "none";
            imageCounter = MAX_IMAGE;
            imageNodes[imageCounter].style.display = "block";
        } else {
            for (let i = 0; i < imageNodes.length; i++) {
                console.log("here");
                imageNodes[i].style.display = "none";
            }
            imageCounter++;
            imageNodes[imageCounter].style.display = "block";
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    const imageNodes = document.querySelectorAll('.modal_img');
    for (let i = 0; i < imageNodes.length; i++) {
        imageNodes[i].style.display = "none";
    }
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    }
}
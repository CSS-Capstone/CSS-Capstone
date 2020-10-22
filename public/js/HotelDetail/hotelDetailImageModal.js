// DOM Elements
const moreImageBtn = document.querySelector('.hotelDetail_moreImage_btn');
const closeBtn = document.querySelector('.close_modal_btn');
const modalLeftArrow = document.querySelector('.modal-left');
const modalRightArrow = document.querySelector('.modal-right');
const modalCurrentImage = document.querySelector('.modal_img_counter');
const MAX_IMAGE = Number(10);

// Event Listeners
moreImageBtn.addEventListener('click', (event) => {
    var imageCounter = 0;
    displayModalWithImages(event, imageCounter);
});

closeBtn.addEventListener('click', (event) => {
    closeModal(event);
});

// util funtion;
function displayModalWithImages(event, imageCounter) {
    console.log(imageCounter);
    const modal = document.querySelector('.modal');
    const imageNode = document.querySelector('.modal_img');
    modal.style.display = "block";
    const hotelId = imageNode.getAttribute("data-modal-hotelId");
    console.log(hotelId);

    if (imageCounter == 0 && modal.style.display == "block") {
        modalLeftArrow.style.display = "none";
    }

    imageNode.src = `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${imageCounter}/680/630.jpg`;
    // Nested Event Listener
    modalLeftArrow.addEventListener('click', (event) => {
        if (imageCounter == 0) {
            imageCounter = 0;
        } else {
            imageCounter--;
        }
        changeImage(imageCounter, imageNode, hotelId);
    });

    modalRightArrow.addEventListener('click', (event) => {
        if (imageCounter == MAX_IMAGE) {
            if (modalRightArrow.style.display == "block") {
                modalRightArrow.style.display = "none";
            }
            imageCounter = 0;
        } else {
            imageCounter++;
        }
        changeImage(imageCounter, imageNode, hotelId);
    });
}

function changeImage(imageCounter, imageNode, hotelId) {
    if (imageCounter == 0 && modalLeftArrow.style.display == "block") {
        modalLeftArrow.style.display = "none";
    }
    if (imageCounter != 0 && modalLeftArrow.style.display == "none") {
        modalLeftArrow.style.display = "block";
    }
    if (imageCounter == MAX_IMAGE && modalRightArrow.style.display == "block") {
        modalRightArrow.style.display = "none";
    }
    if (imageCounter != MAX_IMAGE && modalRightArrow.style.display == "none") {
        modalRightArrow.style.display = "block";
    }
    imageNode.src = `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${imageCounter}/680/630.jpg`;
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    }
}
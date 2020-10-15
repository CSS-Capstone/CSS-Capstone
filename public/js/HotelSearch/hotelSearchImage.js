// ======================
// ==========DOM Elements
// ======================
const leftArrow = document.querySelectorAll('.leftArrow');
const rightArrow = document.querySelectorAll('.rightArrow');
const arrayCounter = new Array(leftArrow.length);
// =======================
// =========initialization
initalizeArray();
function initalizeArray() {
    for (let i = 0; i < arrayCounter.length; i++) {
        arrayCounter[i] = 0;
    }
}
// ========================
// Event Listener
leftArrow.forEach( (la, index) => {
    la.addEventListener('click', (event) => {
        console.log(event.target);
        this.leftHandleClick(event.target ,index);
    });
});
rightArrow.forEach( (ra, index) => {
    ra.addEventListener('click', (event) => {
        this.rightHandleClick(event.target, index);
    });
})

// Util functions
function leftHandleClick(event,index) {
    if (arrayCounter[index] == 0) {
        arrayCounter[index] = 4;
    } else {
        arrayCounter[index]--;
    }
    const parentDOM = event.parentNode;
    console.log(parentDOM);
    const hotelId = parentDOM.getAttribute('data-id-set');
    console.log(hotelId);
    const imageURL = `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${arrayCounter[index]}/280/180.jpg`
    const targetImgTag = event.nextElementSibling;
    console.log(arrayCounter[index]);
    targetImgTag.src = imageURL;
}

function rightHandleClick(event, index) {
    if (arrayCounter[index] > 4) {
        arrayCounter[index] = 0;
    } else {
        arrayCounter[index]++;
    }
    const parentDOM = event.parentNode;
    console.log(parentDOM);
    const hotelId = parentDOM.getAttribute('data-id-set');
    console.log(hotelId);
    const imageURL = `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${arrayCounter[index]}/280/180.jpg`
    const targetImgTag = event.previousElementSibling;
    targetImgTag.src = imageURL;
    console.log(arrayCounter[index]);
}

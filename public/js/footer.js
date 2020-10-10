// DOM Elements
const upArrow = document.querySelector('.up_arrow');

// Event Listener
upArrow.addEventListener("click", handleClick);

// handle Functions
function handleClick(event) {
    event.preventDefault();
    scrollTop();
};

// util Function
function scrollTop() {
    window.scrollTo({
        top: 0
    ,   left: 0
    ,   behavior: "smooth"
    });
}

const forgetme_btn = document.querySelectorAll('.forget__me__btn');

forgetme_btn.forEach((eachBtn, index) => {
    eachBtn.addEventListener('click', (event) => {
        displayPanel(event, index);
    });
});
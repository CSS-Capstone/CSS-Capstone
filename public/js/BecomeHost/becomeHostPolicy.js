console.log("hello world");
// DOM Elements
const termsOfAgreementBtn = document.querySelector('.terms_of_agreement_main_right_btn');
const readyToHost_scrollUpBtn = document.querySelector('.ready_to_host_bottom_btn');

// Add Event Listeners
readyToHost_scrollUpBtn.addEventListener('click', (event) => {
    scrollToTopHelper();
});

termsOfAgreementBtn.addEventListener('click', (event) => {
    termsOfAgreementValide();
});

// Util Functions
function scrollToTopHelper() {
    window.scrollTo({
        top: 150
    ,   left: 0
    ,   behavior: 'smooth' 
    });
}

function termsOfAgreementValide() {
    const agreeCheckBox = document.querySelector('#agree');
    const agreeCheckBoxValidation = document.querySelector('.terms_of_agree_validation');
    if (!agreeCheckBox.checked) {
        agreeCheckBoxValidation.textContent = `You have to check "Agree"`;
        return false;
    }
    let url = `/become-host/postHotel`;
    window.location = url;
}

// DOM Elements
const reviewNumberDOM = document.querySelector('.hotelSearched_detail_reviews_header');
let reviewNumber = reviewNumberDOM.getAttribute('data-user-comment');
console.log(reviewNumber);
if (reviewNumber > 0) {
    const moreReviewBtn = document.querySelector('.hotelSearched_detail_review_display_all_button');
    const closeReviewBtn = document.querySelector('.close_reivew_modal_btn');
    console.log(moreReviewBtn);
    // Event Listener
    moreReviewBtn.addEventListener('click', (event) => {
        console.log("Clicked");
        displayReviewModal();
    });

    closeReviewBtn.addEventListener('click', (event) => {
        closeReviewModal();
    });

    // util function
    function displayReviewModal() {
        const reviewModal = document.querySelector('.review_modal');
        console.log(reviewModal);
        reviewModal.style.display = "block";
    } 

    function closeReviewModal() {
        const reviewModal = document.querySelector('.review_modal');
        if (reviewModal.style.display === 'block') {
            reviewModal.style.display = "none";
        }
    }

}
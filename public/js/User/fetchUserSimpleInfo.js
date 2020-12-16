fetchReviewCount();
fetchHostingHotelCount();
fetchVertificationStatus();

async function fetchReviewCount() {
    var results = await fetch(`/user/reviewCounts`);
    var jsonList = await results.json();
    var reviewCnt = jsonList.profile.review_count;

    var reviewSpan = document.getElementById('profile__review__cnt');
    reviewSpan.innerHTML = `${reviewCnt}` + ' Reviews';
}

async function fetchHostingHotelCount() {
    var results = await fetch(`/user/hostingCounts`);
    var jsonList = await results.json();
    var hostingCnt = jsonList.profile.hosting_count;

    var hostingSpan = document.getElementById('profile__hosting__cnt');
    hostingSpan.innerHTML = `${hostingCnt}` + ' Hotels';
}

async function fetchVertificationStatus() {
    var results = await fetch(`/user/identityVertified`);
    var jsonList = await results.json();
    var isVerified = jsonList.profile.is_verified;

    var str = "Account ";

    var verificationSpan = document.getElementById('profile__vertification__status');
    verificationSpan.innerHTML = (isVerified === 1) ? str + ' Confirmed': str + ' Unconfirmed';
}
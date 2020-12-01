var user_profile_form = document.querySelectorAll('.profile__edit__form');
var profile_edit_btn = document.querySelector('.profile__edit__btn');
var profile_cancle_btn = document.querySelector('.profile__cancle__btn');
var profile_submit_btn = document.querySelector('.profile__submit__btn');

const userAbout = document.querySelector('.profile__form__about');
const userLocation = document.querySelector('.profile__form__location');

hideForm();

userAbout.addEventListener('aboutChange', changeSubmitButton);
userLocation.addEventListener('locationChange', changeSubmitButton);
const profileSubmit = document.getElementById("profileSubmit");
profileSubmit.addEventListener("change", submitProfile, false);

function showForm() {
    for (let i = 0; i < user_profile_form.length; i++) {
        user_profile_form[i].style.backgroundColor = "";
        user_profile_form[i].style.color = "";
        user_profile_form[i].style.display = "block";
    }
}

function hideForm() {
    for (let i = 0; i < user_profile_form.length; i++) {
        user_profile_form[i].style.backgroundColor = "";
        user_profile_form[i].style.color = "";
        user_profile_form[i].style.display = "none";
    }
}

function changeSubmitButton() {
    profile_submit_btn.removeAttribute("disabled");
    profile_submit_btn.style.background = '#000000';
}

function htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

async function submitProfile() {
    fetch(`/user/updateProfile`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            about: userAbout.value,
            location: userLocation.value,
            languages: 'English, Korean'
        })
    }).then(async (uploadRes) => {
        const profileRes = await uploadRes.json();
        const aboutData = profileRes.profile.about;
        const locationData = profileRes.profile.location;
        const languagesData = profileRes.profile.languages;
        
        document.getElementById('profile_about_me').innerHTML 
        = "&nbsp;" + ((locationData) ? aboutData : 'This is about me..') + "&nbsp;";
        document.getElementById('profile_location').innerHTML 
            = "&nbsp;" + ((locationData) ? locationData : 'Where do you live?');
        document.getElementById('profile_languages').innerHTML 
            = "&nbsp;" + ((languagesData) ? languagesData : 'Speak some language');

        hideForm();
    });
}
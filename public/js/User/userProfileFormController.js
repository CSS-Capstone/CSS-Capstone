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
    initSlider();
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

function deleteLanguage(btnName) {
    btnName.remove();
    var lang = btnName.childNodes[0].lang;
    console.log('before clickedArr: ' + clickedArr.length);
    clickedArr.splice(clickedArr.findIndex(item => item.code === lang), 1);
    console.log('after clickedArr: ' + clickedArr.length);
    return;
}

function initSlider() {
    try {
        var isActive = document.querySelector('#developer__toggle__switch').attributes['state'].value;
        if (isActive === "true") {
            document.querySelector('#developer__toggle__switch').checked = true;
        } else {
            document.querySelector('#developer__toggle__switch').checked = false;
        }
    } catch(error) {

    }
}

function updateState(clickedThis) {
    var currentState = clickedThis.attributes['state'].value;
    var changeState = (currentState === "true") ? "false" : "true";
    document.getElementById('developer__toggle__switch').setAttribute('state', `${changeState}`);
    changeSubmitButton();
}

async function generateAPIKeys() {
    var apiKeyWrapper = document.querySelector('.profile__form__toggle__wrapper');
    try {
        const apiDataRequest = await fetch(`/user/getApi`);
        const apiData = await apiDataRequest.json();
        const isActive = apiData.developer.is_active;
        const api = apiData.developer.api_key;
        
        var apiKeyInput = document.createElement('input');
        apiKeyInput.setAttribute('readonly', true);
        apiKeyInput.setAttribute('class', "profile__form__developer__key");
        apiKeyInput.setAttribute('value', `${api}`);
        
        var sliderInput = document.createElement('input');
        sliderInput.setAttribute('type', 'checkbox');
        sliderInput.setAttribute('id', 'developer__toggle__switch');
        sliderInput.setAttribute('class', 'checkbox');
        sliderInput.setAttribute('onclick', "updateState(this)");
        sliderInput.setAttribute('state', "false");

        var sliderLable = document.createElement('label');
        sliderLable.setAttribute('for', 'developer__toggle__switch');
        sliderLable.setAttribute('class', 'toggle');

        apiKeyWrapper.appendChild(apiKeyInput);
        apiKeyWrapper.appendChild(sliderInput);
        apiKeyWrapper.appendChild(sliderLable);
        hideGenBtn();
    } catch (error) {
        console.log(error);
    };
}

function hideGenBtn() {
    var apiSlider = document.querySelectorAll('.profile__developer__api__btn');

    for (let i = 0; i < apiSlider.length; i++) {
        apiSlider[i].style.display = "none";
    }
}

function getLanguages() {
    var returnArr = [];
    var userLanguages = document.querySelectorAll('.profile__form__languages__container');
    if (userLanguages.length > 0) {
        for (let i = 0; i < userLanguages.length; i++) {
            returnArr.push({
                lang: `${userLanguages[i].childNodes[0].innerHTML}`
            });
        }
    } else {
        returnArr = [
            { lang: "한국어" },
            { lang: "English" }
        ];
    }
    return returnArr;
}

async function submitProfile() {
    var langs = getLanguages();
    var langString = "";

    for (let i = 0; i < langs.length; i++) {
        if (i > 0) {
            langString += ", ";
        }
        langString += langs[i].lang 
    }

    var apiKey = document.querySelector('.profile__form__developer__key').attributes['value'].value;
    var isActive = document.querySelector('#developer__toggle__switch').attributes['state'].value;

    fetch(`/user/updateProfile`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            about: userAbout.value,
            location: userLocation.value,
            languages: langString,
            api_key: apiKey,
            is_active: isActive
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
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

    // var langs = document.getElementById('profile_languages').innerText;
    // if (langs === '&nbsp;Speaks&nbsp;some languages') {
    //     console.log('get something');
    //     console.log(langs);
    // } else {
    //     var temp = langs.replace(/\s/g, '');
    //     temp = temp.replace('Speaks', '');
    //     temp = temp.replace(',', ' ');
    //     var tempArr = temp.split(' ');
        
    //     tempArr.forEach((eachLang) => {
    //         languagesArr.forEach((item) => {
    //             if (eachLang === item.lang) {
    //                 initalizeLanguageContainers(item);
    //             }
    //         });
    //     });
    // }
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
    return;
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

    fetch(`/user/updateProfile`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            about: userAbout.value,
            location: userLocation.value,
            languages: langString
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
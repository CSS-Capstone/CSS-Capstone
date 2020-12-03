const languagesArr = 
[
    { code: "id", lang: "Bahasa Indonesia" }, 
    { code: "bn", lang: "Bengali" },
    { code: "da", lang: "Dansk" },
    { code: "de", lang: "Deutsch" },
    { code: "en", lang: "English" },
    { code: "es", lang: "Español" },
    { code: "fr", lang: "Français" },
    { code: "hi", lang: "Hindi" },
    { code: "it", lang: "Italiano" },
    { code: "hu", lang: "Magyar" },
    { code: "ms", lang: "Melayu" },
    { code: "nl", lang: "Nederlands" },
    { code: "nb", lang: "Norsk" },
    { code: "pl", lang: "Polski" },
    { code: "pt", lang: "Português" },
    { code: "pa", lang: "Punjabi" },
    { code: "sl", lang: "Sign Language" },
    { code: "fi", lang: "Suomi" },
    { code: "sv", lang: "Svenska" },
    { code: "tl", lang: "Tagalog" },
    { code: "tr", lang: "Türkçe" },
    { code: "cs", lang: "Čeština" },
    { code: "el", lang: "Ελληνικά" },
    { code: "ru", lang: "Русский" },
    { code: "uk", lang: "Українська" },
    { code: "he", lang: "עברית" },
    { code: "ar", lang: "العربية" },
    { code: "th", lang: "ภาษาไทย" },
    { code: "zh", lang: "中文" },
    { code: "ja", lang: "日本語" },
    { code: "ko", lang: "한국어" } 
];

var clickedArr = [];

function showLangModal() {
    displayLanguageList();
    document.body.classList.add("show__lang__modal");
    addListeners();
}

function closeLangModal() {
    document.body.classList.remove("show__lang__modal");
}

function displayLanguageList() {
    var checkBoxList = document.getElementById('checkBox__list');
    for (let i = 0; i < languagesArr.length; i++) {
        var chkBoxContainer = document.createElement('div');
        chkBoxContainer.setAttribute('class', 'lang__modal__chkbox__row');

        var checkBox = document.createElement('input');
        checkBox.setAttribute('type', 'checkbox');
        checkBox.setAttribute('id', 'chkbox__code__' + `${languagesArr[i].code}`);
        checkBox.setAttribute('value', `${languagesArr[i].lang}`);
        checkBox.setAttribute('class', 'lang__modal__chkbox');
        checkBox.setAttribute('name', 'lang_setting');

        var label = document.createElement('label');
        label.setAttribute('for', 'chkbox__code__' + `${languagesArr[i].code}`);
        label.setAttribute('class', 'lang__modal__label');
        label.innerHTML = `${languagesArr[i].lang}`;
        chkBoxContainer.appendChild(checkBox);
        chkBoxContainer.appendChild(label);
        checkBoxList.appendChild(chkBoxContainer);
    }
}

function addListeners() {
    var checkBoxes = document.querySelectorAll("input[type=checkbox][name=lang_setting]");

    checkBoxes.forEach(function(eachCheckBox) {
        eachCheckBox.addEventListener('change', function(event) {
            if (eachCheckBox.checked) {
                clickedArr.push({
                    chkBox_id: eachCheckBox.id,
                    lang: eachCheckBox.value
                });
            } else {

            }
        })
    });
}

function submitLanguages() {
    if (clickedArr.length > 0) {
        resetDoms("lang__row");
        clickedArr.forEach(function(item) {
            createLanguageContainersCheckBox(item);
        });
    }
    // Change backdrops
    resetDoms("checkBox__list");
    closeLangModal();
}

function initalizeLanguageContainers(lang) {
    var languagesRow = document.getElementById('lang__row'); 

    var langContainer = document.createElement('div');
    langContainer.setAttribute('class', 'profile__form__languages__container');
    langContainer.setAttribute('id', 'lang__container__' + `${lang.code}`);

    var btnString = 'lang__container__' + lang.code;

    var langSpan = document.createElement('span');
    langSpan.setAttribute('class', 'profile__form__language__text');
    langSpan.setAttribute('lang', `${lang.code}`);
    langSpan.innerHTML = `${lang.lang}`;

    var langBtn = document.createElement('div');
    langBtn.setAttribute('class', 'profile__form__language__btn');
    langBtn.setAttribute('id', 'lang__btn__' + `${lang.code}`);
    langBtn.setAttribute('onclick', 'deleteLanguage(' + `${btnString}` + ')');
    langBtn.innerHTML = '&times;';

    langContainer.appendChild(langSpan);
    langContainer.appendChild(langBtn);

    languagesRow.appendChild(langContainer);
    changeSubmitButton();
}

function createLanguageContainersCheckBox(langObject) {
    var languagesRow = document.getElementById('lang__row'); 

    var langContainer = document.createElement('div');
    langContainer.setAttribute('class', 'profile__form__languages__container');
    langContainer.setAttribute('id', 'lang__container__' + `${langObject.chkBox_id.substr(-2)}`);

    var temp = langObject.chkBox_id.substr(-2);
    var btnString = 'lang__container__' + temp;

    var langSpan = document.createElement('span');
    langSpan.setAttribute('class', 'profile__form__language__text');
    langSpan.setAttribute('lang', `${langObject.chkBox_id.substr(-2)}`);
    langSpan.innerHTML = `${langObject.lang}`;

    var langBtn = document.createElement('div');
    langBtn.setAttribute('class', 'profile__form__language__btn');
    langBtn.setAttribute('id', 'lang__btn__' + `${langObject.chkBox_id.substr(-2)}`);
    langBtn.setAttribute('onclick', 'deleteLanguage(' + `${btnString}` + ')');
    langBtn.innerHTML = '&times;';

    langContainer.appendChild(langSpan);
    langContainer.appendChild(langBtn);

    languagesRow.appendChild(langContainer);
    changeSubmitButton();
}

function resetDoms(elemId) {
    var outterDiv = document.getElementById(elemId);
    while(outterDiv.firstChild) {
        outterDiv.removeChild(outterDiv.firstChild);
    }
    return;
}
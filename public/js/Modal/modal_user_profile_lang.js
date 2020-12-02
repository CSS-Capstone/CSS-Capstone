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

function showLangModal() {
    displayLanguageList();
    document.body.classList.add("show__lang__modal");
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

        var label = document.createElement('label');
        label.setAttribute('for', 'chkbox__code__' + `${languagesArr[i].code}`);
        label.setAttribute('class', 'lang__modal__label');
        label.innerHTML = `${languagesArr[i].lang}`;
        chkBoxContainer.appendChild(checkBox);
        chkBoxContainer.appendChild(label);
        checkBoxList.appendChild(chkBoxContainer);
    }
}

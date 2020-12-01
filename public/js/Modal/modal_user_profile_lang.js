const languagesArr = { 
    id: "Bahasa Indonesia", 
    bn: "Bengali",
    da: "Dansk",
    de: "Deutsch",
    en: "English",
    es: "Español",
    fr: "Français",
    hi: "Hindi",
    it: "Italiano",
    hu: "Magyar",
    ms: "Melayu",
    nl: "Nederlands",
    nb: "Norsk",
    pl: "Polski",
    pt: "Português",
    pa: "Punjabi",
    sl: "Sign Language",
    fi: "Suomi",
    sv: "Svenska",
    tl: "Tagalog",
    tr: "Türkçe",
    cs: "Čeština",
    el: "Ελληνικά",
    ru: "Русский",
    uk: "Українська",
    he: "עברית",
    ar: "العربية",
    th: "ภาษาไทย",
    zh: "中文",
    ja: "日本語",
    ko: "한국어"
};

var checkBoxList = document.getElementById('#checkBox__list');

function showLangModal() {
    document.body.classList.add("show__lang__modal");
    displayLanguageList();
}

function closeLangModal() {
    document.body.classList.remove("show__lang__modal");
}

function displayLanguageList() {
    for (var key in languagesArr) {
        console.log(key);
        console.log(languagesArr[key]);
        var checkBox = document.createElement('input');
        checkBox.type = "checkbox";
        checkBox.name = key;
        checkBox.value = languagesArr[key];
        checkBoxList.appendChild(checkBox);
    }
}

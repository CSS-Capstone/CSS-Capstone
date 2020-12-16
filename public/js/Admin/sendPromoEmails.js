var mailingGroupArray = {
    0: '0-50',
    1: '51-100',
    2: '101-200',
    3: '201-300',
    4: '300+'
};

var templateArray = {
    0: 'promoEmail',
    1: 'otherEmail',
    2: 'somethingEmail'
};

var grpSelect = document.getElementById('promo__group__select');
var templateSelect = document.getElementById('promo__template__select');

createDropDowns();
document.querySelector("[class=submit__promo__grp__btn]").addEventListener('click', sendPromoMails);
document.getElementById('promo_btn').value = "Submit Promo Group";

function createDropDowns() {
    for (index in mailingGroupArray) {
        grpSelect.options[grpSelect.options.length] = new Option(mailingGroupArray[index], index);
    }

    for (index in templateArray) {
        templateSelect.options[templateSelect.options.length] = new Option(templateArray[index], index);
    }
}

async function sendPromoMails(e) {
    e.preventDefault();
    var promoData = {
        promo_group: `${grpSelect.options[grpSelect.selectedIndex].text}`,
        promo_email_template: `${templateSelect.options[templateSelect.selectedIndex].text}`
    }

    fetch('/djemals-tbvjdbwj/auth/sendPromoEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ promoData })
    }).then(async uploadRes => {
        console.log('hello??');
        const resData = await uploadRes.json();
        console.log('Promo mail sent to following : ' + resData);
    });
}
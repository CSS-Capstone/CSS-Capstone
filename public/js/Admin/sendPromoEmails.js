var mailingGroupArray = {
    0: '0-50',
    1: '51-100',
    2: '101-200',
    3: '201-300',
    4: '300+'
};

var select = document.getElementById('send__promo__select');

createDropDowns();
document.querySelector("[class=submit__promo__grp__btn]").addEventListener('click', sendPromoMails);


function createDropDowns() {
    for (index in mailingGroupArray) {
        select.options[select.options.length] = new Option(mailingGroupArray[index], index);
    }
}

async function sendPromoMails() {
    var button = this;
    this.preventDefault();
    console.log(select.options[select.selectedIndex].text + "\nValue: " + select.options[select.selectedIndex].value);
    //var results = await fetch(`/djemals-tbvjdbwj/auth/sendPromoEmail`);
    //var jsonList = await results.json();
}
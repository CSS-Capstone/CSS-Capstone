async function sendPromoMails() {
    var results = await fetch(`/djemals-tbvjdbwj/auth/sendPromoEmail`);
    var jsonList = await results.json();
    console.log(jsonList.list);
}
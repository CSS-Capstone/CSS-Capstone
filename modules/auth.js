function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        console.log("Login please");
    }
}

module.exports = { loggedIn };
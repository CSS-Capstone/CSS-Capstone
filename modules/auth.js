function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        console.log("User is not currently logged in");
        res.redirect('/');
    } else {
        next();
    }
}

module.exports = { isLoggedIn };
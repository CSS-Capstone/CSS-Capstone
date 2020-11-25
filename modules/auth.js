const db = require('../utilities/db.js');

function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        console.log("User is not currently logged in");
        req.flash('error', "You must logged in to proceed");
        res.redirect('/');
    } else {
        next();
    }
}

function isAbleToWriteReview(req, res, next) {
    let currentLogedInUserId = req.session.user.user_id;
    let bookingID = req.params.bookingId;
    const isUserIdMatching = "SELECT user_id FROM BOOKING WHERE booking_id=?";
    db.query(isUserIdMatching, bookingID, (toCheckUserError, toCheckUserResult) => {
        if (toCheckUserError) {
            console.log("ERROR: ERRO ON isAbleToWriteReview");
            console.log(toCheckUserError);
            throw toCheckUserError;
        }
        if (currentLogedInUserId === toCheckUserResult[0].user_id) {
            console.log("It is matching with the user id");
            next();
        } else {
            console.log("The user id is not matching, not authorize");
            res.redirect('/');
        }
    });
}

module.exports = { isLoggedIn, isAbleToWriteReview };

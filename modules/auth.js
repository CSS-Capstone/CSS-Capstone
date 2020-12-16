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

// Check if the login user is admin
function check_is_admin(req, res, next) {
    // console.log(req.session.user.user_id);
    if (typeof(req.session.user) == 'undefined') {
        req.flash('error', "Not Logged in");
        res.redirect('/');
    } else {
        let current_login_admin = req.session.user.user_id;
        console.log("=============== CHECK IS ADMIN ==================");
        console.log(current_login_admin);
        const getAdminAccount = `SELECT * FROM USER WHERE user_id = ?`;
        db.query(getAdminAccount, [current_login_admin], (getAdminError, getAdminResult) => {
            if (getAdminError) {
                console.log("ERROR: MIDDLEWARE IS ADMIN ACCOUNT");
                console.log(getAdminError);
                throw getAdminError;
            }
            console.log(getAdminResult[0].isAdmin);
            if (getAdminResult[0].isAdmin == 1 || getAdminResult[0] == true) {
                console.log("HE is Admin");
                next();
            } else {
                console.log("He is not Authorized");
                req.flash('error', "Not Authorized");
                res.redirect('/');
            } 
        });
    }
}

module.exports = { isLoggedIn, isAbleToWriteReview, check_is_admin };

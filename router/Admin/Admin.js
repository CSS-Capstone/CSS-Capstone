const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');
const bcrypt = require('bcryptjs');

router.get('/djemals%20tbvjdbwj', async (req, res) => {
    res.render('pages/sign_in', {
        errorMessage: ''
    });
})

router.post('/auth/djemals%20tbvjdbwj', (req, res) => {
    let adminEmail = req.body.email;
    let adminPassword = req.body.password;

    db.query('SELECT * FROM USER WHERE email = ?', [adminEmail], async (error, results) => {
        if (error) {
            console.log(error);
        }
        else {
            // console.log(results);
            // if email or password is incorrect
            if (results.length === 0 || !(await bcrypt.compare(adminPassword, results[0].password))) {
                // send a message saying that email or password is incorrect
                res.render('pages/sign_in', {
                    errorMessage: 'email or password is incorrect'
                });
            }

            // if account is confirmed
            else if (!results[0].isConfirmed) {
                // send a message saying that account is not confirmed yet, ask for DB manager to confirm the account
                res.render('pages/sign_in', {
                    errorMessage: 'account is not confirmed yet'
                });
            }

            // if account is admin
            else if (!results[0].isAdmin) {
            //     // send a message saying that account is not admin
                res.render('pages/sign_in', {
                    errorMessage: 'account is not admin'
                });
            }

            else {
                res.redirect('/djemals%20tbvjdbwj/T8NM51l%20vwiLayy%205DhvIB%20WOgesj5M4xKkx%209Xig7JoRx%20KARwcM');
            }
        }
    });
})

router.get('/djemals%20tbvjdbwj/T8NM51l%20vwiLayy%205DhvIB%20WOgesj5M4xKkx%209Xig7JoRx%20KARwcM', (req, res) => {
    // query all users data
    // that are not admin (isAdmin = 0, isAdmin = false)
    db.query('SELECT * FROM USER WHERE isAdmin = false', (error, userResults) => {
        if (error) {
            console.log(error);
        }
        else {
            // console.log(userResults.length);
            // console.log(userResults);

            var userIDs = [];
            for (let i = 0; i < userResults.length; i++) {
                userIDs.push(userResults[i].user_id);
            }

            // console.log(userIDs);

            // from the user's data
            // query bookings of each user gotten
            // if a user does not have booking, handle it in ejs
            db.query('SELECT * FROM BOOKING WHERE user_id IN (?)', [userIDs], (error, bookingResults) => {
                if (error) {
                    console.log(error);
                }
                else {
                    // console.log(bookingResults.length);
                    // console.log(bookingResults);

                    // var userBookings = bookingResults;
                    var usersBookingsPriceDatePair = [];
                    var eachUserBookingPriceDatePair = {};
                    
                    // make a hashap for the booking based on user id
                    var bookingHash = {};
                    // instantiate the hash map
                    for (let k = 0; k < bookingResults.length; k++) {
                        bookingHash[bookingResults[k].user_id] = [];
                    }
                    // fill the hash map with booking in respect with the user id
                    for (let l = 0; l < bookingResults.length; l++) {
                        bookingHash[bookingResults[l].user_id].push(bookingResults[l]);
                        // console.log(bookingHash[bookingResults[l].user_id]);
                    }


                    for (let j = 0; j < bookingResults.length; j++) {
                        eachUserBookingPriceDatePair.bookingId = bookingResults[j].booking_id;
                        eachUserBookingPriceDatePair.userId = bookingResults[j].user_id;
                        // eachUserBookingPriceDatePair.hotelId = bookingResults[j].hotel_id;
                        eachUserBookingPriceDatePair.bookingDate = bookingResults[j].booking_date;
                        eachUserBookingPriceDatePair.bookingPrice = bookingResults[j].booking_price;
                        // eachUserBookingPriceDatePair.checkInDate = bookingResults[j].check_in_date;
                        // eachUserBookingPriceDatePair.checkOutDate = bookingResults[j].check_out_date;
                        usersBookingsPriceDatePair.push(eachUserBookingPriceDatePair);
                        eachUserBookingPriceDatePair = {};
                    }

                    // add all the bookings in respect toi each user and make it as an array of JSON
                    var usersNotAdmin = [];
                    var currUser = {};
                    for (let m = 0; m < userResults.length; m++) {
                        currUser = userResults[m];
                        currUser.bookings = bookingHash[userResults[m].user_id];
                        usersNotAdmin.push(currUser);
                        currUser = {};
                    }
                    
                    // for (let n = 0; n < usersNotAdmin.length; n++) {
                    //     console.log(usersNotAdmin[n].bookings);
                    // }

                    // console.log(usersNotAdmin);
                    // console.log(usersNotAdmin.length);

                    // console.log(usersBookingsPriceDatePair);
                    // console.log(usersBookingsPriceDatePair.length);

                    res.render('pages/admin', {
                        usersNotAdmin: usersNotAdmin,
                        usersBookingsPriceDatePair: usersBookingsPriceDatePair
                    });
                }
            })
        }
        
        
    })

    // send the JSON data to 'pages/admin'
    // the data will be all the bookings' price and date
    // do we have to specified the user of each booking?

    // res.render('pages/admin');
})

module.exports = router;
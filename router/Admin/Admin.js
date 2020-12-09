const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');
const bcrypt = require('bcryptjs');

router.get('/djemals-tbvjdbwj', async (req, res) => {
    res.render('pages/admin/sign_in', {
        errorMessage: ''
    });
})

router.post('/djemals-tbvjdbwj/auth', (req, res) => {
    let adminEmail = req.body.email;
    let adminPassword = req.body.password;

    db.query('SELECT * FROM USER WHERE email = ?', [adminEmail], async (error, results) => {
        if (error) { console.log(error); }
        else {
            if (results.length === 0 || !(await bcrypt.compare(adminPassword, results[0].password))
                || !results[0].isConfirmed || !results[0].isAdmin) {
                res.render('pages/admin/sign_in', {
                    errorMessage: 'email or password is incorrect'
                });
            }

            else {
                const grabAllBookingCancelRequest = `SELECT cancel.booking_cancel_id, cancel.booking_cancel_reason, user.username, booking.booking_date
                                                        FROM BOOKING_CANCEL AS cancel
                                                        INNER JOIN BOOKING AS booking
                                                        ON cancel.booking_id = booking.booking_id
                                                        INNER JOIN USER AS user
                                                        ON user.user_id = booking.user_id`;
                db.query(grabAllBookingCancelRequest, (allBookingCancelError, allBookingCancelResult) => {
                     if (allBookingCancelError) {
                         console.log("ERROR: ADMIN Retrieving All Booking Cancel Data");
                         console.log(allBookingCancelError);
                         throw allBookingCancelError;
                     }
                     // console.log(allBookingCancelResult);
                     
                     res.render('pages/admin/admin', {allBookingCancelResult:allBookingCancelResult});
                });
            }
        }
    });
});

// djemals-tbvjdbwj -> SHA 512 and cutted out random parts
router.get('/djemals-tbvjdbwj/3d9cfb1f8220a46bca8de65d0f252cac2fbd', (req, res) => {
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
                    
                    for (let m = 0; m < userResults.length; m++) {
                        var currUser = {
                            id: userResults[m].user_id,
                            username: userResults[m].username,
                            email: userResults[m].email,
                            email_status: userResults[m].isConfirmed,
                            host_status: userResults[m].is_host,
                            booking_records: null
                        };
                        currUser.booking_records = bookingHash[userResults[m].user_id];
                        usersNotAdmin.push(currUser);
                    }
                    
                    var users = {
                        data: usersNotAdmin,
                        usersBookingsPriceDatePair: usersBookingsPriceDatePair
                    };

                    res.json({ users: users });
                }
            })
        }
        
        
    })
});

router.get('/djemals-tbvjdbwj/auth/monthlyBookingRate', (req, res) => {
    const getCurrentMonthBookingCount = `SELECT COUNT(*) AS count, booking_date, SUM(booking_price) AS booking_price
                                            FROM BOOKING
                                            WHERE MONTH(booking_date) = MONTH(current_date())
                                            GROUP BY DATE(booking_date)
                                            ORDER BY booking_date;`
    db.query(getCurrentMonthBookingCount, (monthlyBookingError, monthlyBookingResult) => {
        if (monthlyBookingError) {
            console.log("ERROR: Admin page getting Monthly Booking Count");
            console.log(monthlyBookingError);
            throw monthlyBookingError;
        }
        let montlyBookingContainer = [];
        let monthlyBookingResultObj = {};
        for (let i = 0; i < monthlyBookingResult.length; i++) {
            monthlyBookingResultObj.count = monthlyBookingResult[i].count;
            monthlyBookingResultObj.booking_date = monthlyBookingResult[i].booking_date;
            monthlyBookingResultObj.booking_price = monthlyBookingResult[i].booking_price;
            montlyBookingContainer.push(monthlyBookingResultObj);
            monthlyBookingResultObj = {};
        }
        // console.log(montlyBookingContainer);
        res.json({montlyBookingContainer:montlyBookingContainer});
    });
});

router.get('/djemfls-tbvjdbwj/auth/getHotelByCity', (req, res) => {
    const retrieveHotelsByCity = `SELECT COUNT(*) AS count, city, country
                                    FROM HOTEL
                                    GROUP BY city
                                    ORDER BY count DESC
                                    LIMIT 18`;
    db.query(retrieveHotelsByCity, (retrieveHotelsByCityError, retrieveHotelsByCityResult) => {
        if (retrieveHotelsByCityError) {
            console.log("ERROR: Admin page getting hotels data group by city");
            console.log(retrieveHotelsByCityError);
            throw retrieveHotelsByCityError;
        }
           
        let hotelsGroupByCityArr = [];
        let hotelGroupByCityObj = {};
        for (let i = 0; i < retrieveHotelsByCityResult.length; i++) {
            hotelGroupByCityObj.hotel_count = retrieveHotelsByCityResult[i].count;
            hotelGroupByCityObj.hotel_city = retrieveHotelsByCityResult[i].city;
            hotelGroupByCityObj.hotel_country = retrieveHotelsByCityResult[i].country;
            hotelsGroupByCityArr.push(hotelGroupByCityObj);
            hotelGroupByCityObj = {};
        }
        // console.log(hotelsGroupByCityArr);
        res.json({hotelsGroupByCityArr:hotelsGroupByCityArr});
    });
});

module.exports = router;

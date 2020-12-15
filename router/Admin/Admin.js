const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const NodeGeocoder = require('node-geocoder');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOTELFINDER_ADDRESS,
      pass: process.env.EMAIL_HOTELFINDER_PASSWORD 
    }
});

var options = {
    provider: 'opencage',
    apiKey: '9fb9a64523aa49f597c0c288bc6d7745'
};

var geoCoder = NodeGeocoder(options);

router.get('/djemals-tbvjdbwj', async (req, res) => {
    res.render('pages/admin/sign_in', {
        errorMessage: ''
    });
})

// /auth 빼버림
router.post('/djemals-tbvjdbwj', (req, res) => {
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
                res.status(200).redirect('/djemals-tbvjdbwj/auth');
            }
        }
    });
});

router.get('/djemals-tbvjdbwj/auth', (req, res) => {
    const grabAllBookingCancelRequest = `SELECT cancel.booking_cancel_id, cancel.booking_cancel_reason, user.username, booking.booking_date
                                            FROM BOOKING_CANCEL AS cancel
                                            INNER JOIN BOOKING AS booking
                                            ON cancel.booking_id = booking.booking_id
                                            INNER JOIN USER AS user
                                            ON user.user_id = booking.user_id
                                            ON user.user_id = booking.user_id
                                            WHERE cancel.cancel_status = "Sent"`;
    db.query(grabAllBookingCancelRequest, (allBookingCancelError, allBookingCancelResult) => {
        if (allBookingCancelError) {
            console.log("ERROR: ADMIN Retrieving All Booking Cancel Data");
            console.log(allBookingCancelError);
            throw allBookingCancelError;
        }
        else {
            db.query('SELECT COUNT(*), country FROM `css-capstone`.HOTEL GROUP BY country', (countryError, countryResults) => {
                if (countryError) {
                    console.log(countryError);
                }
                else {
                    // make a hash map with country as keys
                    // console.log(countryResults);

                    //there is a duplicate between USA and United States
                    var hashedHotelColor = {};
                    var countryColor = [];
                    var currCountry = {};
                    let colorInDecimal = 1052413;
                    for(let i = 0; i < countryResults.length; i++) {
                        currCountry.country_name = countryResults[i].country;
                        currCountry.country_color = '#' + colorInDecimal.toString(16).toUpperCase();
                        hashedHotelColor[countryResults[i].country] = colorInDecimal.toString(16).toUpperCase();
                        countryColor.push(currCountry);
                        colorInDecimal += 153961;
                        currCountry = {}
                    }
                    // console.log(hashedHotelColor);
                    db.query('SELECT * FROM `css-capstone`.HOTEL ORDER BY country', async (hotelsError, hotelsResults) => {
                        if (hotelsError) {
                            console.log(hotelsError);
                        }
                        else {
                            // console.log(hotelsResults);
                            // var testgeo = await geoCoder.geocode('Japan, Aichi, Kota, Fukōzu, 鶴方 国道23号');
                            // console.log(testgeo);
                            var hotelByCountry = [];
                            var currHotel = {};
                            var latlong = {};
                            for(let j = 0; j < hotelsResults.length; j++) {
                                //get city, address, hotel name, hotel id, hotel price, color of marker
                                currHotel.hotel_id = hotelsResults[j].hotel_id;
                                currHotel.hotel_name = hotelsResults[j].hotel_name;
                                currHotel.hotel_city = hotelsResults[j].city;
                                currHotel.hotel_addr = hotelsResults[j].address;
                                currHotel.hotel_price = hotelsResults[j].hotel_price;
                                currHotel.markerColor = hashedHotelColor[hotelsResults[j].country];
                                currHotel.latitude = null;
                                currHotel.longitude = null;
                                //get latitude and longitude
                                // latlong = await geoCoder.geocode(currHotel.hotel_addr);
                                if(latlong[0] !== undefined) {
                                    currHotel.latitude = latlong[0].latitude;
                                    currHotel.longitude = latlong[0].longitude;
                                }
                                hotelByCountry.push(currHotel);
                                currHotel = {};
                            }
                            // console.log(hotelByCountry);
                            res.render('pages/admin/admin', {
                                allBookingCancelResult: allBookingCancelResult,
                                hotelByCountry: hotelByCountry,
                                countryColor: countryColor
                            });
                        }
                    });
                }
            });
        }                
    });
});

// djemals-tbvjdbwj -> SHA 512 and cutted out random parts
router.get('/djemals-tbvjdbwj/auth/getUsersAndBooking', (req, res) => {
    // query all users data
    console.log('do I  get called');
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

// GET ALL COUNT OF HOTEL OF THIS MONTH
router.get('/djemfls-tbvjdbwj/auth/getCurrentMonthHotelNumber', (req, res) => {
    const getCurrentMonthHotelCount = `SELECT COUNT(*) AS count
                                        FROM HOTEL
                                        WHERE MONTH(created_date) = MONTH(current_date())`;
    let countHotelCurrentMonth = {};
    db.query(getCurrentMonthHotelCount, (countThisMonthNewHotelError, countThisMonthNewHotelResult) => {
        if (countThisMonthNewHotelError) {
            console.log("ERROR: ADMIN FAIL TO COUNT THIS MONTH HOTEL NUMBER");
            console.log(countThisMonthNewHotelError);
            throw countThisMonthNewHotelError;
        }
        countHotelCurrentMonth.count = countThisMonthNewHotelResult[0];
        res.json({countHotelCurrentMonth:countHotelCurrentMonth});
    });
});

router.get('/djemfls-tbvjdbwj/auth/getCurrentBookingCount', (req, res) => {
    const getCurrentMonthBookingNumber = `SELECT COUNT(*) AS bookingCount
                                            FROM BOOKING
                                            WHERE MONTH(booking_date) = MONTH(current_date())`;
    db.query(getCurrentMonthBookingNumber, (getCurrentMonthBookingNumError, getCurrentMonthBookingNumResult) => {
        if (getCurrentMonthBookingNumError) {
            console.log("ERROR: ADMIN Fail to count this month booking number");
            console.log(getCurrentMonthBookingNumError);
            throw getCurrentMonthBookingNumError;
        }
        res.json({getCurrentMonthBookingNumResult:getCurrentMonthBookingNumResult});
    });
});

router.get('/djemfls-tbvjdbwj/auth/getCurrentBookingCancelRequest', (req, res) => {
    const getCurrentMonthBookingCancelRequest = `SELECT COUNT(*) AS booking_cancel_request
                                                    FROM BOOKING_CANCEL
                                                    WHERE MONTH(request_date) = MONTH(current_date())`;
    db.query(getCurrentMonthBookingCancelRequest, (getCurrentMonthBookingCancelError, getCurrentMonthBookingCancelResult) => {
        if (getCurrentMonthBookingCancelError) {
            console.log("ERROR: ADMIN Fail to count this month booking cancel number");
            console.log(getCurrentMonthBookingCancelError);
            throw getCurrentMonthBookingCancelError;
        }
        res.json({getCurrentMonthBookingCancelResult:getCurrentMonthBookingCancelResult});
    });
});

router.get('/djemfls-tbvjdbwj/auth/getCurrentNewUser', (req, res) => {
    const getCurrentMonthNewUser = `SELECT COUNT(*) AS new_user
                                    FROM USER
                                    WHERE MONTH(user_created_date) = MONTH(current_date())`;
    db.query(getCurrentMonthNewUser, (getCurrentMonthNewUserError, getCurrentMonthNewUserResult) => {
        if (getCurrentMonthNewUserError) {
            console.log("ERROR: ADMIN Fail to count this month new user count");
            console.log(getCurrentMonthNewUserError);
            throw getCurrentMonthNewUserError;
        }
        console.log(getCurrentMonthNewUserResult);
        res.json({getCurrentMonthNewUserResult:getCurrentMonthNewUserResult});
    });
});

// get 3 month of user rate in line graph
router.get('/djemfls-tbvjdbwj/auth/getFiveMostNewHotelCities', (req, res) => {
    const getAllThreeMonthUserTrend = `SELECT COUNT(*) AS count, hotel.created_date, hotel.city
                                    FROM HOTEL AS hotel
                                    WHERE MONTH(hotel.created_date) = MONTH(current_date())
                                    GROUP BY hotel.city
                                    ORDER BY count DESC
                                    LIMIT 5`;

    db.query(getAllThreeMonthUserTrend, (getAllThreeMonthUserTrendError, getAllThreeMonthUserTrendResult) => {
        if (getAllThreeMonthUserTrendError) {
            console.log("ERROR: ADMIN Fail to retrieve three month hotel user trend");
            console.log(getAllThreeMonthUserTrendError);
            throw getAllThreeMonthUserTrendError;
        }
        let fiveHotelsGroupByDateArr = [];
        let fiveHotelGroupByCityObj = {};
        for (let i = 0; i < getAllThreeMonthUserTrendResult.length; i++) {
            fiveHotelGroupByCityObj.hotel_count = getAllThreeMonthUserTrendResult[i].count;
            fiveHotelGroupByCityObj.hotel_city = getAllThreeMonthUserTrendResult[i].city;
            fiveHotelsGroupByDateArr.push(fiveHotelGroupByCityObj);
            fiveHotelGroupByCityObj = {};
        }
        // console.log('TOP FIVE RESULT', getAllThreeMonthUserTrendResult);
        // console.log('TOP FIVE HOTELS ARRAY', fiveHotelsGroupByDateArr)
        res.json({fiveHotelsGroupByDateArr:fiveHotelsGroupByDateArr});
    });
});

// get number of cancel booking rate 
// TODO: SEND THIS DATA TO JAVASCRIPT TO GENERATE LINE GRAPH
router.get('/djemfls-tbvjdbwj/auth/getCurrentMonthBookingCancelRate', (req, res) => {
    const getCurrentMonthBookingCancelRate = `SELECT COUNT(*) AS booking_cancel_count, request_date
                                                FROM BOOKING_CANCEL
                                                WHERE MONTH(request_date) = MONTH(current_date())
                                                GROUP BY request_date
                                                ORDER BY request_date`;
    db.query(getCurrentMonthBookingCancelRate, (monthlyBookingCancelError, monthlyBookingCancelResult) => {
        if (monthlyBookingCancelError) {
            console.log("ERROR: ADMIN retrieve monthly booking cancel rate");
            console.log(monthlyBookingCancelError);
            throw monthlyBookingCancelError;
        }
        let monthlyBookingContainer = [];
        let monthlyBookingCancelObj = {};
        for (let i = 0; i < monthlyBookingCancelResult.length; i++) {
            monthlyBookingCancelObj.request_date = monthlyBookingCancelResult[i].request_date;
            monthlyBookingCancelObj.booking_cancel_count = monthlyBookingCancelResult[i].booking_cancel_count;
            monthlyBookingContainer.push(monthlyBookingCancelObj);
            monthlyBookingCancelObj = {};
        }
        // console.log(monthlyBookingCancelObj);
        res.status(200).json({monthlyBookingContainer:monthlyBookingContainer});
    });
});

router.get('/djemfls-tbvjdbwj/auth/getSelectedRequest/:id', (req, res) => {
    let requestCancel_id = req.params.id;
    const retrieveSelectedBookingCancel = `SELECT cancel.booking_cancel_id, cancel.booking_cancel_reason, 
                                            booking.booking_date, booking.booking_price, booking.hotel_id,
                                            booking.check_in_date, booking.check_out_date, user.username, 
                                            hotel.hotel_name, hotel.country, hotel.city, hotel.address,
                                            hotel.isAPI, hotel.api_hotel_id, cancel.cancel_status
                                            FROM BOOKING_CANCEL AS cancel
                                            INNER JOIN BOOKING AS booking
                                            ON cancel.booking_id = booking.booking_id
                                            INNER JOIN USER AS user
                                            ON user.user_id = booking.user_id
                                            INNER JOIN HOTEL AS hotel
                                            ON hotel.hotel_id = booking.hotel_id
                                            WHERE cancel.booking_cancel_id = ?
                                            LIMIT 1`;
    const retrieveHotelImageForBookingCancel = `SELECT *
                                                FROM USER_HOTEL_IMAGE
                                                WHERE hotel_id = ?
                                                LIMIT 1`;
    db.query(retrieveSelectedBookingCancel, [requestCancel_id], (retrieveBookingCancelError, retrieveBookingCancelResult) => {
        if (retrieveBookingCancelError) {
            console.log("ERROR: ADMIN Retrieve Booking Cancel");
            console.log(retrieveBookingCancelError);
            throw retrieveBookingCancelError;
        }
        // console.log(retrieveBookingCancelResult[0].isAPI);
        console.log("------- is NULL? -----------");
        console.log(retrieveBookingCancelResult[0].api_hotel_id);
        // console.log(retrieveBookingCancelResult);
        // let retrieve_hotel_id = retrieveBookingCancelResult[0].hotel_id;
        // console.log(retrieve_hotel_id);
        if (retrieveBookingCancelResult[0].isAPI == false || retrieveBookingCancelResult[0].api_hotel_id == null) {
            let cancelBooking_hotel_id = retrieveBookingCancelResult[0].hotel_id;
            db.query(retrieveHotelImageForBookingCancel, [cancelBooking_hotel_id], async (hotelImageError, hotelImageResult) => {
                if (hotelImageError) {
                    console.log("ERROR: Hotel Image Retrieve FROM Admin Page Cancel Booking");
                    console.log(hotelImageError);
                    throw hotelImageError;
                }
                let imageContainer = [];
                let S3Param = {
                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                    Key: `${hotelImageResult[0].hotel_img_id}`
                };
                
                let hotel_img_data = await s3.s3.getObject(S3Param).promise();
                let hotel_image = hotel_img_data.Body;
                let imageBuffer = Buffer.from(hotel_image);
                let base64data = imageBuffer.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,' + base64data;
                imageContainer.push(imageDOM);
                res.status(200).render('pages/admin/cancelBooking', {
                    retrieveBookingCancelResult:retrieveBookingCancelResult
                ,   imageContainer:imageContainer
                }); 
            });
            
        } else {
            console.log("IF IT IS COMING COME API THEN SHOULD NOT COME HERE");
            res.status(200).render('pages/admin/cancelBooking', {
                retrieveBookingCancelResult:retrieveBookingCancelResult
            }); 
        }
    });
});

router.get('/djemals-tbvjdbwj/auth/sendPromoEmail', (req, res) => {
    //var promoMailPath = path.join(__dirname, 'promoEmail.ejs');

    var testPath = path.join(__dirname, '..', '..', 'views/mailTemplates/promoEmail.ejs');
    var promoMailPath = path.normalize(testPath);

    fs.access(promoMailPath, (fileError) => {
        if (fileError) {
            console.log("Can't find the template file for the email");
        } else {
            var mailingList = ['solomonjc0218@gmail.com', 'josephcc.dev@gmail.com', 'jeeyoung8230@gmail.com'];

            ejs.renderFile(promoMailPath, async (err, data) => {
                if (err) { console.log('Something went wrong with ejs rendering before sending email : ' + err); }
                else {
                    var mailOptions = {
                        from: process.env.EMAIL_HOTELFINDER_ADDRESS,
                        to: mailingList,
                        subject: 'This is a promtion email from Hotel Finder!!',
                        html: data
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) { console.log('Failed to send emails'); }
                        else {
                            console.log('Email sent successful');
                            res.json({ list: mailingList });
                        }
                    });
                }
            });
        }
    });
});

router.post('/djemfls-tbvjdbwj/auth/getSelectedRequest/:id', (req, res) => {
    let cancelBooking_id = req.params.id;
    const bookingStatusConfirm = 'Confirmed';
    const checkIfCancelBookingIdExist = `SELECT * FROM BOOKING_CANCEL WHERE booking_cancel_id = ?`;
    db.query(checkIfCancelBookingIdExist, [cancelBooking_id], (cancelBookingStatusExistError, cancelBookingStatusExistResult) => {
        if (cancelBookingStatusExistError) {
            console.log("ERROR: Admin Finding Booking Cancel Status Change to Confirm FAIL");
            console.log(cancelBookingStatusExistError);
            throw cancelBookingStatusExistError;
        }
        console.log(cancelBookingStatusExistResult);
        if (cancelBookingStatusExistResult.length > 0) {
            const changeBookingConfirmStatus = `UPDATE BOOKING_CANCEL SET cancel_status=? WHERE booking_cancel_id = ?`;
            db.query(changeBookingConfirmStatus, [bookingStatusConfirm, cancelBooking_id], (statusUpdateConfirmError, stausUpdateConfirmResult) => {
                if (statusUpdateConfirmError) {
                    console.log("ERROR: Admin Updating Status to Confirm");
                    console.log(statusUpdateConfirmError);
                    throw statusUpdateConfirmError;
                }
                console.log("Affected Rows Booking Cancel Update Confirm");
                console.log(stausUpdateConfirmResult.affectedRows);
                res.status(200).redirect('/djemals-tbvjdbwj/auth');
            });
        } else {
            console.log("Cannot find Confirm status change target");
            res.status(502).redirect("/");
        }
    });
});

router.delete('/djemfls-tbvjdbwj/auth/getSelectedRequest/:id', (req, res) => {
    let cancelBookingId = req.params.id;
    const bookingStatusDeny = 'Deny';
    const checkIfCancelBookingIdExist = `SELECT * FROM BOOKING_CANCEL WHERE booking_cancel_id = ?`;
    db.query(checkIfCancelBookingIdExist, [cancelBookingId], (checkCancelBookingExistError, checkCancelBookingResult) => {
        if (checkCancelBookingExistError) {
            console.log("ERROR: Admin Booking Cancel Status Change to Deny FAIL");
            console.log(checkCancelBookingExistError);
            throw checkCancelBookingExistError;
        }
        if (checkCancelBookingResult.length > 0) {
            const changeBookingCancelStatus = `UPDATE BOOKING_CANCEL SET cancel_status=? WHERE booking_cancel_id = ?`;
            db.query(changeBookingCancelStatus, [bookingStatusDeny, cancelBookingId], (statusUpdateError, statusUpdateResult) => {
                if (statusUpdateError) {
                    console.log("ERROR: Update booking status to DENY");
                    console.log(statusUpdateError);
                    throw statusUpdateError;
                }
                console.log("AFFECTED ROWS");
                console.log(statusUpdateResult.affectedRows);
                res.status(200).redirect('/djemals-tbvjdbwj/auth');
            });
        } else {
            console.log("Cannot find cancel status change target");
            res.status(502).redirect("/");
        }
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const NodeGeocoder = require('node-geocoder');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');
const bcrypt = require('bcryptjs');

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
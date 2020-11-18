const express = require('express');
// const app = express();
const dotenv = require('dotenv');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const multer = require('multer');
const fetch = require('node-fetch');
// const bodyParser = require('body-parser');
const passport = require('passport');
// const cookieParser = require('cookie-parser');
const trimCityNameHelper = require('../../modules/trimCityNameHelper');
const stripe = require('stripe')(`sk_test_51HeDoXDKUeOleiaZmD7Cs7od48G3QKEFJULAQh4Iz6bDh5UNREhDafamLTfqfxfVH2ajagBLpbVZpet2GYIXzcmM00YWS0Bvi4`);
const router = express.Router();
const authMW = require('../../modules/auth');
const db = require('../../utilities/db.js');

router.get('/hotel/searched/:cityname', async (req, res) => {
    // API KEY will be hide to env
    const HOTEL_API_KEY = `297461`;
    const theKey = `AIzaSyDiccr3QeWOHWRfSzLrNyUzrRX_I1bcZa4`;
    // Currently limited to 3
    const HOTEL_API_URL = `http://engine.hotellook.com/api/v2/lookup.json?query=${req.params.cityname}&lang=en&lookFor=both&limit=5&token=${HOTEL_API_KEY}`
    try {
        const response = await fetch(HOTEL_API_URL);
        const hoteldata = await response.json();
        if (hoteldata.status !== 'ok') {
            throw 'API Satus is bad';
        }
        // if (hoteldata.results.hotels.length === 0 && hoteldata.results.locations.length === 0)
        if (hoteldata.results.hotels.length === 0 && hoteldata.results.locations.length === 0) {
            console.log("No hotel and location fetched");
            // query the top 20 or 25 hotel based on rate from DB
            // query the countries where all the hotels exists in
            // call pixabay api to get the photos for each country

            // make two variables (decide how many variables needed to be passed in to errorSearchPage.ejs)
            // 1. contains the hotel 
            // 2. contains the countries and the photos
            
            return res.render('pages/hotel/errorSearchPage');
        }
        // ========== Filter Data ==================
        // 1. get country name of the location
        const fullCountryName = hoteldata.results.locations[0].countryName;
        //console.log(`From Express server: ${fullCountryName}`);
        // 2. filter hotel data based on the country name 
        // so all hotel are in united states
        const filterHotelData = hoteldata.results.hotels.filter(s => s.locationName.indexOf(fullCountryName) >= 0);
        const mapHotelData = filterHotelData.map(filteredHotel => {
            const filterObj = {
                id: filteredHotel.id
            ,   name: filteredHotel.label
            ,   location: {
                    lat: filteredHotel.location.lat
                ,   lon: filteredHotel.location.lon
                }
            };
            return filterObj;
        });
        // console.log(mapHotelData);
        //console.log(mapHotelData);
        const theHotelData = {
            hoteldata: hoteldata
        ,   filterHotelData: filterHotelData
        ,   mapHotelData: mapHotelData
        }
        
        res.render('pages/hotel/hotelSearched', {theHotelData: theHotelData, theKey: theKey});
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});


router.get('/hotel/searched/detail/:id', authMW.isLoggedIn, async (req, res) => {
    const StripePublicKey = process.env.STRIPE_PUBLIC_KEY;
    const AirQualityKey = process.env.AIR_QUALITY_KEY;
    const AIRQualityBACKUP_KEY = process.env.AIR_QUALITY_BACKUP_KEY;
    const hotelId = req.params.id;
    const hotelLabel = req.query.label;
    const hotelFullName = req.query.fullname;
    const hotelScore = req.query.score;
    const hotelCoordLat = req.query.lat;
    const hotelCoordLon = req.query.lon;
    const hotelLocationName = req.query.locationName;
    const hotelCountryName = req.query.countryName;
    const cityFullName = req.query.cityFullName;
    const cityTrimedName = trimCityNameHelper.trimCitiyNameHelper(cityFullName);
    //console.log(hotelCountryName);
    // Geoendoing
    const theKey = `AIzaSyDiccr3QeWOHWRfSzLrNyUzrRX_I1bcZa4`;
    const GEOAPIURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${hotelCoordLat},${hotelCoordLon}&key=${theKey}`;
    const GEO_RESPONSE = await fetch(GEOAPIURL);
    const GEO_Data = await GEO_RESPONSE.json();
    //console.log("Geo Data: ", GEO_Data.results[0].formatted_address);
    const GEO_Formatted_Address = GEO_Data.results[0].formatted_address;
    const weatherAPIURL = `http://api.openweathermap.org/data/2.5/weather?lat=${hotelCoordLat}&lon=${hotelCoordLon}&appid=${process.env.WEATHER_API_KEY}`;
    const airqualityAPIURL = `https://api.waqi.info/feed/${cityTrimedName}/?token=${AIRQualityBACKUP_KEY}`;
    try {
        const weatherDataResponse = await fetch(weatherAPIURL);
        const weatherData = await weatherDataResponse.json();
        //console.log(weatherData);
        try {
            const air_qualityDataReponse = await fetch(airqualityAPIURL);
            const airQualityData = await air_qualityDataReponse.json();
            //console.log(airQualityData.data.aqi);
            if (airQualityData.data.aqi === '-') {
                //console.log("wrong aqi: ");
                airQualityData.data.aqi = 43;
            }
            const hotelObj = {
                hotelId
            ,   hotelLabel
            ,   hotelFullName
            ,   hotelScore
            ,   hotelCoordLat
            ,   hotelCoordLon
            ,   hotelLocationName
            ,   hotelCountryName
            ,   GEO_Formatted_Address
            ,   cityFullName
            };
            res.render('pages/hotel/hotelSearchedDetail', {
                hotelObj: hotelObj, 
                StripePublicKey:StripePublicKey, 
                weatherData:weatherData,
                airQualityData: airQualityData
            });
        } catch(error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});


router.get('/hotel/searched/detail/covid/:country', async (req, res) => {
    const countryCode = req.params.country;
    const COVID_API_URL = `https://corona-api.com/countries/${countryCode}`;
    const covidAPIResponse = await fetch(`${COVID_API_URL}`);
    const covidAPIData = await covidAPIResponse.json();
    //console.log(covidAPIData);
    res.json(covidAPIData);
});

router.get('/hotel/searched/detail/video/:locationName', async (req, res) => {
    const queryData = req.params.locationName;
    const videoAPIKey = process.env.PUBLIC_ATTRACTION_API_KEY;
    const videoAPIURL = `https://pixabay.com/api/videos/?key=${videoAPIKey}&q=${queryData}`;
    try {
        const videoResponse = await fetch(`${videoAPIURL}`);
        const videoData = await videoResponse.json();
        res.json(videoData);
    } catch (error) {
        console.log(`Error from Video Searched Hotel ${error}`);
    }
});

router.get('/hotel/searched/detail/currency/:currencyCode', async (req, res) => {
    const targetCurrency = req.params.currencyCode;
    try {
        const coutryIOCurrencyRes = await fetch(`http://country.io/currency.json`);
        const coutryIOCurrencyData = await coutryIOCurrencyRes.json();
        const currencyTarget = coutryIOCurrencyData[targetCurrency];
        res.json(currencyTarget);
    } catch (error) {
        console.log(error);
    }
});

router.get('/hotel/searched/detail/:id/payment', authMW.isLoggedIn, async (req, res) => {
    // ============== TEMP DATA ======================
    const temporaryHotelPrice = 20;
    const temporaryUser_id = 18;
    const user_id = req.session.user.user_id;
    // ===============================================
    let hotelCookieData = req.cookies.hotelBookingData;
    // console.log("HOTEL PRICE");
    // console.log(hotelCookieData.body.hotelDefaultPrice);
    let hotelCheckInDateString = hotelCookieData.body.hotelCheckInDate;
    let hotelCheckOutDateString = hotelCookieData.body.hotelCheckOutDate;
    // console.log("Check in Date");
    let hotelCheckInDate = new Date(hotelCheckInDateString);
    let hotelCheckOutDate = new Date(hotelCheckOutDateString);
    // console.log(hotelCheckInDate);
    // console.log(typeof (hotelCheckInDate));

    let COUNT_TO_CHECK_HOTEL_EXIST_DB_QUERY = `SELECT * FROM HOTEL WHERE api_hotel_id=?`;
    let INSERT_API_TO_HOTEL_DB_QUERY = "INSERT INTO HOTEL (hotel_name, hotel_price, country, city, address, isAPI, isDeveloper, user_id, api_hotel_id) VALUES (?,?,?,?,?,?,?,?,?)";
    let INSERT_BOOKING_DB_QUERY = `INSERT INTO BOOKING (booking_date, booking_price, user_id, hotel_id, check_in_date, check_out_date) VALUES (?,?,?,?,?,?)`; 
    let api_hotel_id = Number(hotelCookieData.body.hotelId);
    let queryCounter = 1;
    // console.log("HELLO WORLD");

    const queryFinish = () => {
        res.redirect(`/hotel/searched/detail/${hotelCookieData.body.hotelId}/paymentconfirm`);
    }
    db.query(COUNT_TO_CHECK_HOTEL_EXIST_DB_QUERY, api_hotel_id, (countError, countResult) => {
        if (countError) {
            console.log("ERROR: Hotel Existence Check");
            console.log(countError);
            throw countError;
        }
        // console.log(countResult.length);
        let lengthOfCountResult = countResult.length;
        if (lengthOfCountResult == 0) {
            console.log("it is zero"); 
            // =============== INSERT DATA PREPARE ======================
            let hotelName = hotelCookieData.body.hotelName.toString();
            let hotel_API_Id = Number(hotelCookieData.body.hotelId);
            let cityAndCountryName = trimCityNameHelper.trimCityNameAndCountryName(hotelCookieData.body.hotelLocation);
            let countryName= cityAndCountryName[1];
            let cityName= cityAndCountryName[0];
            let isAPI = true;
            let isDeveloper = false;
            let hotelDefaultPrice = hotelCookieData.body.hotelDefaultPrice;
            let hotelInsertDataSet = [hotelName, hotelDefaultPrice, countryName, cityName, hotelCookieData.body.hotelLocation, isAPI, isDeveloper, user_id, hotel_API_Id];
            //  ============== INSERT DATA FOR BOOKING ===================
            let bookingPrice = hotelCookieData.body.totalPrice;
            let bookingDate = new Date();
            // INSERT HOTEL DATA INTO DATABASE
            db.query(INSERT_API_TO_HOTEL_DB_QUERY, hotelInsertDataSet, (insertError, insertResult) => {
                if (insertError) {
                    console.log("ERROR: INSERT HOTEL FROM API TO DB ERROR");
                    console.log(insertError);
                    throw insertError;
                }
                console.log("AFFECTED DATA: ", insertResult.affectedRows);
                console.log(insertResult.insertId);
                let hotelID = insertResult.insertId;
                let dataForBooking = [bookingDate, bookingPrice, user_id, hotelID];
                // INSERT BOOKING DATA INTO DATABASE
                db.query(INSERT_BOOKING_DB_QUERY, dataForBooking, async (errorBooking, resultBooking) => {
                    if (errorBooking) {
                        console.log("ERROR: INSERT BOOKING DATA TO DB ERROR");
                        console.log(errorBooking);
                        throw new errorBooking;
                    }
                    console.log("AFFECTD DATA FOR INSERTING BOOKING", resultBooking.affectedRows);
                    console.log(resultBooking);
                    queryCounter-=1;
                    console.log(queryCounter);
                    // res.clearCookie("hotelBookingData");
                    if (queryCounter == 0) {
                        // console.log("GOT IN TO NOT WORKING");
                        queryFinish();
                    }
                });
            });
        } else {
            console.log("it is not zero");
            // console.log("SETTING UP DATA FOR NOT ZERO");
            console.log(countResult[0].hotel_id);
            let bookingPrice = hotelCookieData.body.totalPrice;
            let bookingDate = new Date();
            
            let dataForBookingToExistingHotel = [bookingDate, bookingPrice, user_id, countResult[0].hotel_id, hotelCheckInDate, hotelCheckOutDate];
            db.query(INSERT_BOOKING_DB_QUERY, dataForBookingToExistingHotel, async (errorExistBooking, resultExistBooking) => {
                if (errorExistBooking) {
                    console.log("ERROR: ERROR ON EXISTING HOTEL BOOKING");
                    console.log(errorExistBooking);
                    throw errorExistBooking;
                }
                queryCounter-=1;
                
                console.log("Affected Existing Booking ROW: ", resultExistBooking.affectedRows);
                console.log(queryCounter);
                // res.render('pages/booking/bookConfirm', {hotelCookieData:hotelCookieData});
                if (queryCounter == 0) {
                    // console.log("GOT IN TO ALREADY EXISTING");
                    queryFinish();
                }
            });
        }
    });
});

router.get('/hotel/searched/detail/:id/paymentconfirm', async (req, res) => {
    let hotelCookieData = req.cookies.hotelBookingData;
    let hotel_APi_data = req.params.id;
    console.log(hotel_APi_data);
    // res.clearCookie("hotelBookingData");
    console.log(hotelCookieData);
    res.render('pages/booking/bookConfirm', {hotelCookieData:hotelCookieData});
});

router.post('/hotel/searched/detail/:id/payment', (req, res) => {
    const paymentData = req.body;
    const passingData = req.body.body;
    // 
    console.log(passingData);
    let hotelPrice = Number(paymentData.body.totalPrice * 100).toFixed(2);
    hotelPrice = Number(hotelPrice);
    // console.log(paymentData);
    // console.log(`The Price: `, hotelPrice);
    res.cookie('hotelBookingData', paymentData);
    // charge on stripe
    stripe.customers.create({
        email: paymentData.email
    ,   source: paymentData.token
    }).then(customer => stripe.charges.create({
        customer: customer.id
    ,   currency: 'usd'
    ,   amount: hotelPrice
    })).then(function() {
        res.redirect(`/hotel/searched/detail/${passingData.hotelId}/payment`);
    });
});

module.exports = router;

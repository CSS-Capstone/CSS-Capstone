const express = require('express');
const db = require('../../utilities/db.js');
// const app = express();
const dotenv = require('dotenv');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const s3 = require('../../utilities/s3');
// const newS3 = require('../../utilities/newS3');
const multer = require('multer');
const fetch = require('node-fetch');
// const bodyParser = require('body-parser');
const passport = require('passport');
// const cookieParser = require('cookie-parser');
const trimCityNameHelper = require('../../modules/trimCityNameHelper');
const stripe = require('stripe')(`sk_test_51HeDoXDKUeOleiaZmD7Cs7od48G3QKEFJULAQh4Iz6bDh5UNREhDafamLTfqfxfVH2ajagBLpbVZpet2GYIXzcmM00YWS0Bvi4`);
const router = express.Router();

const authMW = require('../../modules/auth');

//just for testing,will delete later after all logic is done
router.get('/trial/fucked-up-page', (req, res) => {
    console.log('hello');
            var topRatedHotel = [];
            var hotelCountry = [];
            // query the top 20 or 25 hotel based on rate from DB
            // how to get the review of the hotel
            db.query('SELECT * FROM HOTEL ORDER BY hotel_price DESC LIMIT 20', (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('top 20 hotel');
                    var ids = [];
                    for (var j = 0; j < result.length; j++) {
                        ids.push(result[j].hotel_id);
                    }
                    db.query('SELECT * FROM `css-capstone`.USER_HOTEL_IMAGE WHERE hotel_id IN (?)', [ids], async (imageErr, images) => {
                        if (imageErr) {
                            console.log(imageErr);
                        }
                        else {
                            console.log('image query');
                            var currHotel = {};
                            // var currPictures = [];
                            // var pictures = images;
                            // create hashmap for the pictures for faster runtime
                            var imagesHash = {};
                            for (var n = 0; n < images.length; n++) {
                                imagesHash[images[n].hotel_id] = [];
                            }
                            for (var m = 0; m < images.length; m++) {
                                let S3Param = {
                                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                                    Key: `${images[m].hotel_img_id}`
                                };
                                let hotel_image_data = await s3.s3.getObject(S3Param).promise();
                                // console.log(hotel_image_data);
                                let hotel_image = hotel_image_data.Body;
                                // console.log(hotel_image);
                                let buffer = Buffer.from(hotel_image);
                                // console.log(buffer);
                                let base64data = buffer.toString('base64');
                                // console.log(base64data);
                                let imageDOM = 'data:image/jpeg;base64,' + base64data;
                                // console.log(imageDOM);
                                // currPictures.push(imageDOM);
                                imagesHash[images[m].hotel_id].push(imageDOM);
                                // imagesHash[images[m].hotel_id].push(images[m].hotel_img_id);
                            }
                            // console.log(imagesHash);
                            for (var k = 0; k < result.length; k++) {
                                currHotel.hotel_id = result[k].hotel_id;
                                currHotel.hotel_name = result[k].hotel_name;
                                currHotel.hotel_price = result[k].hotel_price;
                                currHotel.country = result[k].country;
                                currHotel.city = result[k].city;
                                // get all the pictures based on the hotel_id
                                // for (var l = 0; l < images.length; l++) {
                                //     if (currHotel.hotel_id === images[l].hotel_id) {
                                //         // console.log(currHotel.hotel_id);
                                //         // console.log(images[l].hotel_id);
                                //         // console.log(images[l]);
                                //         let S3Param = {
                                //             Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                                //             Key: `${images[l].hotel_img_id}`
                                //         };
                                //         let hotel_image_data = await s3.s3.getObject(S3Param).promise();
                                //         // console.log(hotel_image_data);
                                //         let hotel_image = hotel_image_data.Body;
                                //         // console.log(hotel_image);
                                //         let buffer = Buffer.from(hotel_image);
                                //         // console.log(buffer);
                                //         let base64data = buffer.toString('base64');
                                //         // console.log(base64data);
                                //         let imageDOM = 'data:image/jpeg;base64,' + base64data;
                                //         // console.log(imageDOM);
                                //         currPictures.push(imageDOM);
                                //         // currPictures.push(images[l]);
                                //     }
                                // }

                                
                                currHotel.pictures = imagesHash[currHotel.hotel_id];
                                topRatedHotel.push(currHotel);
                                currHotel = {};
                                // currPictures = [];
                            }
                            // console.log(topRatedHotel);
                        }
                        db.query('SELECT country FROM HOTEL GROUP BY country LIMIT 10', async (countryErr, results) => {
                            // call pixabay api to get the photos for each country
                            
                            if (countryErr) {
                                console.log(error);
                            }
                            else {
                                console.log('country query');
                                var currCountry = {};
                                for (var i = 0; i < results.length; i++) {
                                    currCountry.name = results[i].country;
                                    // get the picture of currCountry from pixabay api
                                    // currCountry.picture = the picture from pixabay
                                    const apiName = currCountry.name.toLowerCase();
                                    const pixabayURL = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(apiName)}`;
                                    const pixabayResponse = await fetch(pixabayURL);
                                    const pixabayData = await pixabayResponse.json();
                                    const pictureURLUsed = pixabayData.hits[0].webformatURL;
                                    currCountry.pictureURL = pictureURLUsed;
                                    // console.log(pixabayResponse);
                                    // console.log(pixabayData);
                                    hotelCountry.push(currCountry);
                                    currCountry = {};
                                }
                                // console.log(topRatedHotel);
                                // console.log(hotelCountry);
                                
                                //query the picture of the hotel
                                let searchKeyword = req.cookies.searchKeyword;
                                let isLoggedIn = req.session.user == null ? false : true;
            
                                let userDetailLogin = {
                                    email: ''
                                }
                                let userDetailRegister = {
                                    email: '',
                                    username: ''
                                }
                                // console.log(topRatedHotel);
                                return res.render('pages/hotel/errorSearchPage', {
                                    topRatedHotel: topRatedHotel, 
                                    hotelCountry: hotelCountry,
                                    searchKeyword: searchKeyword,
                                    isLoggedIn: isLoggedIn,
                                    registerMessage: '',
                                    loginMessage: '',
                                    resetPasswordMessage: '',
                                    modalStyle: '',
                                    stayInWhere: '',
                                    formDataLogin: userDetailLogin,
                                    formDataRegister: userDetailRegister
                                });
                            }
                        });
                    });
                    // console.log(ids);
                    // query the hotel
                }
            });
})

router.get('/hotel/searched/:cityname', async (req, res) => {
    // API KEY will be hide to env
    // console.log(req.cookies);
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
        // console.log(hoteldata.results.hotels.length);
        // console.log(hoteldata.results.locations.length);
        if (hoteldata.results.hotels.length === 0 && hoteldata.results.locations.length === 0) {
            console.log('hello');
            var topRatedHotel = [];
            var hotelCountry = [];
            // query the top 20 or 25 hotel based on rate from DB
            // how to get the review of the hotel
            db.query('SELECT * FROM HOTEL ORDER BY hotel_price DESC LIMIT 20', (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('top 20 hotel');
                    var ids = [];
                    for (var j = 0; j < result.length; j++) {
                        ids.push(result[j].hotel_id);
                    }
                    db.query('SELECT * FROM `css-capstone`.USER_HOTEL_IMAGE WHERE hotel_id IN (?)', [ids], async (imageErr, images) => {
                        if (imageErr) {
                            console.log(imageErr);
                        }
                        else {
                            console.log('image query');
                            var currHotel = {};
                            // var currPictures = [];
                            // var pictures = images;
                            // create hashmap for the pictures for faster runtime
                            var imagesHash = {};
                            for (var n = 0; n < images.length; n++) {
                                imagesHash[images[n].hotel_id] = [];
                            }
                            for (var m = 0; m < images.length; m++) {
                                let S3Param = {
                                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                                    Key: `${images[m].hotel_img_id}`
                                };
                                let hotel_image_data = await s3.s3.getObject(S3Param).promise();
                                // console.log(hotel_image_data);
                                let hotel_image = hotel_image_data.Body;
                                // console.log(hotel_image);
                                let buffer = Buffer.from(hotel_image);
                                // console.log(buffer);
                                let base64data = buffer.toString('base64');
                                // console.log(base64data);
                                let imageDOM = 'data:image/jpeg;base64,' + base64data;
                                // console.log(imageDOM);
                                // currPictures.push(imageDOM);
                                imagesHash[images[m].hotel_id].push(imageDOM);
                                // imagesHash[images[m].hotel_id].push(images[m].hotel_img_id);
                            }
                            // console.log(imagesHash);
                            for (var k = 0; k < result.length; k++) {
                                currHotel.hotel_id = result[k].hotel_id;
                                currHotel.hotel_name = result[k].hotel_name;
                                currHotel.hotel_price = result[k].hotel_price;
                                currHotel.country = result[k].country;
                                currHotel.city = result[k].city;
                                // get all the pictures based on the hotel_id
                                // for (var l = 0; l < images.length; l++) {
                                //     if (currHotel.hotel_id === images[l].hotel_id) {
                                //         // console.log(currHotel.hotel_id);
                                //         // console.log(images[l].hotel_id);
                                //         // console.log(images[l]);
                                //         let S3Param = {
                                //             Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                                //             Key: `${images[l].hotel_img_id}`
                                //         };
                                //         let hotel_image_data = await s3.s3.getObject(S3Param).promise();
                                //         // console.log(hotel_image_data);
                                //         let hotel_image = hotel_image_data.Body;
                                //         // console.log(hotel_image);
                                //         let buffer = Buffer.from(hotel_image);
                                //         // console.log(buffer);
                                //         let base64data = buffer.toString('base64');
                                //         // console.log(base64data);
                                //         let imageDOM = 'data:image/jpeg;base64,' + base64data;
                                //         // console.log(imageDOM);
                                //         currPictures.push(imageDOM);
                                //         // currPictures.push(images[l]);
                                //     }
                                // }

                                
                                currHotel.pictures = imagesHash[currHotel.hotel_id];
                                topRatedHotel.push(currHotel);
                                currHotel = {};
                                // currPictures = [];
                            }
                            // console.log(topRatedHotel);
                        }
                        db.query('SELECT country FROM HOTEL GROUP BY country LIMIT 10', async (countryErr, results) => {
                            // call pixabay api to get the photos for each country
                            
                            if (countryErr) {
                                console.log(error);
                            }
                            else {
                                console.log('country query');
                                var currCountry = {};
                                for (var i = 0; i < results.length; i++) {
                                    currCountry.name = results[i].country;
                                    // get the picture of currCountry from pixabay api
                                    // currCountry.picture = the picture from pixabay
                                    const apiName = currCountry.name.toLowerCase();
                                    const pixabayURL = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(apiName)}`;
                                    const pixabayResponse = await fetch(pixabayURL);
                                    const pixabayData = await pixabayResponse.json();
                                    const pictureURLUsed = pixabayData.hits[0].webformatURL;
                                    currCountry.pictureURL = pictureURLUsed;
                                    // console.log(pixabayResponse);
                                    // console.log(pixabayData);
                                    hotelCountry.push(currCountry);
                                    currCountry = {};
                                }
                                // console.log(topRatedHotel);
                                // console.log(hotelCountry);
                                
                                //query the picture of the hotel
                                let searchKeyword = req.cookies.searchKeyword;
                                let isLoggedIn = req.session.user == null ? false : true;
            
                                let userDetailLogin = {
                                    email: ''
                                }
                                let userDetailRegister = {
                                    email: '',
                                    username: ''
                                }
                                // console.log(topRatedHotel);
                                return res.render('pages/hotel/errorSearchPage', {
                                    topRatedHotel: topRatedHotel, 
                                    hotelCountry: hotelCountry,
                                    searchKeyword: searchKeyword,
                                    isLoggedIn: isLoggedIn,
                                    registerMessage: '',
                                    loginMessage: '',
                                    resetPasswordMessage: '',
                                    modalStyle: '',
                                    stayInWhere: '',
                                    formDataLogin: userDetailLogin,
                                    formDataRegister: userDetailRegister
                                });
                            }
                        });
                    });
                    // console.log(ids);
                    // query the hotel
                }
            });
        }
        // ========== Filter Data ==================
        // 1. get country name of the location
        else {
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
            
            let searchKeyword = req.cookies.searchKeyword;
            let isLoggedIn = req.session.user == null ? false : true;
    
            let userDetailLogin = {
                email: ''
            }

            let userDetailRegister = {
                email: '',
                username: ''
            }

            res.render('pages/hotel/hotelSearched', {
                theHotelData: theHotelData, 
                theKey: theKey,
                searchKeyword: searchKeyword,
                isLoggedIn: isLoggedIn,
                registerMessage: '',
                loginMessage: '',
                resetPasswordMessage: '',
                modalStyle: '',
                stayInWhere: '',
                formDataLogin: userDetailLogin,
                formDataRegister: userDetailRegister
            });
        }
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});


router.get('/hotel/searched/detail/:id', async (req, res) => {
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

router.get('/hotel/searched/detail/:id/payment', (req, res) => {
    let hotelCookieData = req.cookies.hotelBookingData;
    //res.clearCookie("hotelBookingData");
    console.log("From GET: ", hotelCookieData);
    res.render('pages/booking/bookConfirm', {hotelCookieData:hotelCookieData});
});

router.post('/hotel/searched/detail/:id/payment', (req, res) => {
    // console.log(res.status());
    const paymentData = req.body;
    const passingData = req.body.body;
    console.log(passingData);
    let hotelPrice = Number(paymentData.body.totalPrice * 100).toFixed(2);
    hotelPrice = Number(hotelPrice);
    console.log(paymentData);
    console.log(`The Price: `, hotelPrice);
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

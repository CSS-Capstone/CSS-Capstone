const express = require('express');
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
const db = require('../../utilities/db.js');
// const { trimCitiyNameHelper } = require('../../modules/trimCityNameHelper');

router.get('/hotel/searched/:cityname', async (req, res) => {
    // API KEY will be hide to env
    // console.log(req.cookies);
    const HOTEL_API_KEY = `297461`;
    const theKey = `AIzaSyDiccr3QeWOHWRfSzLrNyUzrRX_I1bcZa4`;
    // let theCityNameRemoveQuote = trimCityNameHelper.removeLastQuote(req.params.cityname);
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
        if (typeof (hoteldata.results.locations[0]) === 'undefined' || hoteldata.results.hotels.length === 0 && hoteldata.results.locations.length === 0) {
            console.log('hello');
            var topRatedHotel = [];
            var hotelCity = [];
            // query the top 20 or 25 hotel based on rate from DB
            // how to get the review of the hotel
            db.query('SELECT * FROM HOTEL ORDER BY hotel_price DESC LIMIT 10', (error, result) => {
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
                                currHotel.pictures = imagesHash[currHotel.hotel_id];
                                topRatedHotel.push(currHotel);
                                currHotel = {};
                            }
                            // console.log(topRatedHotel);
                        }
                        db.query('SELECT city FROM HOTEL GROUP BY city ORDER BY COUNT(city) DESC LIMIT 5', async (countryErr, results) => {
                            // call pixabay api to get the photos for each country
                            
                            if (countryErr) {
                                console.log(error);
                            }
                            else {
                                console.log('country query');
                                var currCity = {};
                                // console.log(results);
                                for (var i = 0; i < results.length; i++) {
                                    currCity.name = results[i].city;
                                    // get the picture of currCountry from pixabay api
                                    // currCountry.picture = the picture from pixabay
                                    const apiName = currCity.name.toLowerCase();
                                    const pixabayURL = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(apiName)}`;
                                    const pixabayResponse = await fetch(pixabayURL);
                                    const pixabayData = await pixabayResponse.json();
                                    const pictureURLUsed = pixabayData.hits[0].webformatURL;
                                    currCity.pictureURL = pictureURLUsed;
                                    // console.log(pixabayResponse);
                                    // console.log(pixabayData);
                                    hotelCity.push(currCity);
                                    currCity = {};
                                }
                                // console.log(topRatedHotel);
                                // console.log(hotelCity);
                                
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
                                    theKey: theKey,
                                    topRatedHotel: topRatedHotel, 
                                    hotelCity: hotelCity,
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
            let theCityNameRemoveQuote = req.params.cityname;
            const retrieveAllHotelBasedOnCity = `SELECT DISTINCT *
                                                    FROM HOTEL
                                                    WHERE city = ?`;
            const retrieveAllHotelImageBasedOnCity = `SELECT *
                                                        FROM USER_HOTEL_IMAGE
                                                        WHERE hotel_id IN (?)`;
            const retrieveAllHotelComments = `SELECT AVG(rating) AS rating, hotel_id
                                                FROM COMMENT
                                                WHERE hotel_id IN (?)
                                                GROUP BY hotel_id`;
            db.query(retrieveAllHotelBasedOnCity, theCityNameRemoveQuote, (hotelRetrieveError, hotelRetrieveResult) => {
                if (hotelRetrieveError) {
                    console.log("ERROR: RETRIEVE HOTEL FROM DB BASED ON CITY");
                    console.log(hotelRetrieveError);
                    throw hotelRetrieveError;
                }
                console.log("=================================")
                console.log(hotelRetrieveResult);
                console.log(hotelRetrieveResult.length);
                if (hotelRetrieveResult.length == 0) {
                    console.log("Got in here With 0");
                    let hotelsFromDB = [];
                    const fullCountryName = hoteldata.results.locations[0].countryName;
                    let testingValue = hoteldata.results.hotels[1].locationName;
                    let theHotelCountyName = '';
                        for (let i = testingValue.length; i >= 0; i--) {
                            if (testingValue.charAt(i) === ',') {
                                theHotelCountyName = testingValue.slice(i+1);
                                theHotelCountyName = theHotelCountyName.trim();
                                break;
                            }
                        }
                    console.log("============================")
                    console.log(theHotelCountyName);
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
                    // console.log(mapForRating);
                    res.render('pages/hotel/hotelSearched', {
                        theHotelData: theHotelData, 
                        theKey: theKey,
                        hotelsFromDB: hotelsFromDB,
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
                } else {
                    console.log("GOT IN HERE? NOT ZERO");
                    let hotel_id = [];
                    // let hotelImageMap = new Map();
                    for (let i = 0; i < hotelRetrieveResult.length; i++) {
                        hotel_id.push(hotelRetrieveResult[i].hotel_id);
                    }
                    // my try before retrieveAllHotelImageBasedOnCity
                    let mapForRating = new Map();
                    db.query(retrieveAllHotelComments, [hotel_id], (hotelCommentRateError, hotelCommentRateResult) => {
                        if (hotelCommentRateError) {
                            console.log("ERROR: RETRIEVE STORED PROCEDURE COMMENT RATE HOTEL SEARCH");
                            console.log(hotelCommentRateError);
                            throw hotelCommentRateError;
                        }
                        console.log(hotel_id);
                        for (let i = 0; i < hotelCommentRateResult.length; i++) {
                            mapForRating.set(hotelCommentRateResult[i].hotel_id, hotelCommentRateResult[i].rating);
                        }
                        console.log("==== AFTER LOOP ====")
                        console.log(mapForRating);
                        // moved
                        db.query(retrieveAllHotelImageBasedOnCity, [hotel_id], async (hotelImageRetrieveError, hotelImageRetrieveResult) => {
                            if (hotelImageRetrieveError) {
                                console.log("ERROR: RETRIEVE HOTEL IMAGE FROM DB BASED ON CITY");
                                console.log(hotelImageRetrieveError);
                                throw hotelImageRetrieveError;
                            }
                            let imageHashMap = {};
                            for (let i = 0; i < hotelImageRetrieveResult.length; i++) {
                                imageHashMap[hotelImageRetrieveResult[i].hotel_id] = [];
                            }
                            // console.log("========================");
                            // console.log(imageHashMap);
                            for (let i = 0; i < hotelImageRetrieveResult.length; i++) {
                                let params = {
                                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                                ,   Key: `${hotelImageRetrieveResult[i].hotel_img_id}`
                                };
                                //console.log(hotelImageRetrieveResult[i].hotel_img_id);
                                let hotel_img_data = await s3.s3.getObject(params).promise();
                                let hotel_img = hotel_img_data.Body;
                                let buffer = Buffer.from(hotel_img);
                                let base64data = buffer.toString('base64');
                                let imageDOM = 'data:image/jepg;base64,' + base64data;
                                imageHashMap[hotelImageRetrieveResult[i].hotel_id].push(imageDOM);
                            }
                            
                            let hotelAddress = [];
                            let eachHotelAddressObj = {};
                            let hotelsFromDB = [];
                            let eachHotelDBObj = {};
                            for (let i = 0; i < hotelRetrieveResult.length; i++) {
                                eachHotelDBObj.hotel_id = hotelRetrieveResult[i].hotel_id;
                                eachHotelDBObj.hotel_name = hotelRetrieveResult[i].hotel_name;
                                eachHotelDBObj.hotel_price = hotelRetrieveResult[i].hotel_price;
                                eachHotelDBObj.hotel_address = hotelRetrieveResult[i].address;
                                eachHotelDBObj.hotel_image = imageHashMap[eachHotelDBObj.hotel_id];
                                hotelsFromDB.push(eachHotelDBObj);
                                eachHotelDBObj = {};
                            }
                            const fullCountryName = hoteldata.results.locations[0].countryName;
                            let testingValue = hoteldata.results.hotels[1].locationName;
                            let theHotelCountyName = '';
                            for (let i = testingValue.length; i >= 0; i--) {
                                if (testingValue.charAt(i) === ',') {
                                    theHotelCountyName = testingValue.slice(i+1);
                                    theHotelCountyName = theHotelCountyName.trim();
                                    break;
                                }
                            }
                            console.log("==============================");
                            console.log(testingValue);
                            console.log(theHotelCountyName);
                            
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
                            console.log(mapForRating);
                            res.render('pages/hotel/hotelSearched', {
                                theHotelData: theHotelData, 
                                theKey: theKey,
                                hotelsFromDB: hotelsFromDB,
                                mapForRating: mapForRating,
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
                        });
                    });
                }
            });
        }
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});

router.get('/hotel/searched/detail/posted/:id',  async(req, res) => {
    let hotelId = req.params.id;
    let dateObj = req.cookies.hotelBookingDateData;
    const StripePublicKey = process.env.STRIPE_PUBLIC_KEY;
    let dateObjCheckInDate = req.cookies.hotelBookingDateData.checkin__date;
    let dateObjCheckOutDate = req.cookies.hotelBookingDateData.checkout__date;
    let dateObjectInAndOut = trimCityNameHelper.validateCheckInAndOutDate(dateObjCheckInDate, dateObjCheckOutDate);
    let preSelected_CheckInDate = dateObjectInAndOut[0];
    let preSelected_CehckOutDate =  dateObjectInAndOut[1];
    const findHotelQuery = `SELECT *
                            FROM HOTEL
                            WHERE hotel_id = ?`;
                            
    const findHotelImageQuery = `SELECT hotel_img_id
                                 FROM USER_HOTEL_IMAGE
                                 WHERE hotel_id = ?`;
    const queryToRetrieveCommentsForHotelDB = `SELECT user.username, comment.rating, comment.comment_date, comment.comment_content, comment.user_id, comment.hotel_id
                                            FROM COMMENT AS comment
                                            INNER JOIN USER AS user
                                            ON comment.user_id = user.user_id 
                                            WHERE comment.hotel_id=?`;
    const queryToUserProfile = `SELECT DISTINCT comment.user_id, userProfile.img_id
                                FROM COMMENT AS comment
                                INNER JOIN USER_PROFILE_IMAGE AS userProfile
                                ON userProfile.user_id = comment.user_id
                                WHERE comment.hotel_id = ?`;
    let user_map = new Map();
    let hotel_id_data = [hotelId];
    let imageArray = [];
    db.query(findHotelQuery, hotel_id_data, async (searchedPostedHotelError, searchedPostedHotelResult) => {
        if (searchedPostedHotelError) {
            console.log("ERROR: DB ERROR Hotel Searched Posted");
            console.log(searchedPostedHotelError);
            throw searchedPostedHotelError;
        }
        let hotelDBObj = {
            hotel_id: searchedPostedHotelResult[0].hotel_id
        ,   hotel_name: searchedPostedHotelResult[0].hotel_name
        ,   hotel_price: searchedPostedHotelResult[0].hotel_price
        ,   hotel_country: searchedPostedHotelResult[0].country
        ,   hotel_city: searchedPostedHotelResult[0].city
        ,   hotel_address: searchedPostedHotelResult[0].address
        ,   preSelected_CheckInDate: preSelected_CheckInDate
        ,   preSelected_CehckOutDate: preSelected_CehckOutDate
        };
        const weatherAPIDBURL = `http://api.openweathermap.org/data/2.5/weather?q=${hotelDBObj.hotel_city}&appid=${process.env.WEATHER_API_KEY}`;
        let weatherReponse = await fetch(weatherAPIDBURL);
        let weatherData = await weatherReponse.json();
        const airqualityAPIURL = `https://api.waqi.info/feed/${hotelDBObj.hotel_city}/?token=${process.env.AIR_QUALITY_BACKUP_KEY}`;
        let airqualityResponse = await fetch(airqualityAPIURL);
        const airQualityData = await airqualityResponse.json();
            //console.log(airQualityData.data.aqi);
            if (airQualityData.data.aqi === '-') {
                //console.log("wrong aqi: ");
                airQualityData.data.aqi = 43;
            }
        // retrieve images from S3 using MySQL primary key
        db.query(findHotelImageQuery, hotelDBObj.hotel_id, async (searchedPostHotelImageError, searchPostedHotelImageResult) => {
            if (searchedPostHotelImageError) {
                console.log("ERROR: DB ERROR Hotel Image Searched Posted");
                console.log(searchedPostHotelImageError);
                throw searchedPostHotelImageError;
            }
            for (let i = 0; i < searchPostedHotelImageResult.length; i++) {
                console.log("Image Loop Entered");
                let searchedPostedS3Param = {
                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                ,   Key: `${searchPostedHotelImageResult[i].hotel_img_id}`
                };
                let eachHotelImage = await s3.s3.getObject(searchedPostedS3Param).promise();
                let each_hotel_image = eachHotelImage.Body;
                let buffer = Buffer.from(each_hotel_image);
                let base64data = buffer.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,' + base64data;
                imageArray.push(imageDOM);
            }
            db.query(queryToRetrieveCommentsForHotelDB, hotelDBObj.hotel_id, (searchedPostHotelReviewError, searchedPostHotelReviewResult) => {
                if(searchedPostHotelReviewError) {
                    console.log("ERROR: DB ERROR Hotel Searched Review Retrieve");
                    console.log(searchedPostHotelReviewError);
                    throw searchedPostHotelReviewError;
                }
                console.log("REVIEW GET IN?");
                let userComment = searchedPostHotelReviewResult;
                db.query(queryToUserProfile, hotel_id_data, async (searchedPostHotelProfileImgError, searchedPostHotelProfileImgResult) => {
                    console.log("PROFILE IMAGE GOT IN?");
                    if (searchedPostHotelProfileImgError) {
                        console.log("ERROR: DB ERROR hotel Searched Profile Images Retrieve");
                        console.log(searchedPostHotelProfileImgError);
                        throw searchedPostHotelProfileImgError;
                    }
                    for (let i = 0 ; i < searchedPostHotelProfileImgResult.length; i++) {
                        let params = {
                            Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME
                        ,   Key: `${searchedPostHotelProfileImgResult[i].img_id}`
                        };
                        let eachProfilePhoto = await s3.s3.getObject(params).promise();
                        let profileImageData = eachProfilePhoto.Body;
                        let buffer = Buffer.from(profileImageData);
                        let base64data = buffer.toString('base64');
                        let profileImageDOM = 'data:image/jpeg;base64,' + base64data;
                        user_map.set(searchedPostHotelProfileImgResult[i].user_id, profileImageDOM);
                        console.log("GOT IT");
                    }
                    res.render('pages/hotel/hotelSearchedDBPostDetail', 
                    {
                        hotelDBObj:hotelDBObj, 
                        imageArray:imageArray, 
                        weatherData:weatherData, 
                        airQualityData:airQualityData, 
                        userComment:userComment,
                        StripePublicKey:StripePublicKey,
                        user_map:user_map
                    });
                });
            })
        });
    });
});

// COVID FOR DB Hotel Data
router.get('/hotel/searched/detail/posted/covid/:country', async (req, res) => {
    const countryCode = req.params.country;
    const COVID_API_URL = `https://corona-api.com/countries/${countryCode}`;
    const covidAPIResponse = await fetch(`${COVID_API_URL}`);
    const covidAPIData = await covidAPIResponse.json();
    //console.log(covidAPIData);
    res.json(covidAPIData);
});


router.get('/hotel/searched/detail/:id', authMW.isLoggedIn, async (req, res) => {
    console.log(req.session.user);
    let username = req.session.user.username;
    let dateObj = req.cookies.hotelBookingDateData;
    console.log(dateObj);
    let dateObjCheckInDate = req.cookies.hotelBookingDateData.checkin__date;
    let dateObjCheckOutDate = req.cookies.hotelBookingDateData.checkout__date;
    let dateObjectInAndOut = trimCityNameHelper.validateCheckInAndOutDate(dateObjCheckInDate, dateObjCheckOutDate);
    let preSelected_CheckInDate = dateObjectInAndOut[0];
    let preSelected_CehckOutDate =  dateObjectInAndOut[1];
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
    const theKey = `AIzaSyDiccr3QeWOHWRfSzLrNyUzrRX_I1bcZa4`;
    const GEOAPIURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${hotelCoordLat},${hotelCoordLon}&key=${theKey}`;
    const GEO_RESPONSE = await fetch(GEOAPIURL);
    const GEO_Data = await GEO_RESPONSE.json();
    //console.log("Geo Data: ", GEO_Data.results[0].formatted_address);
    const GEO_Formatted_Address = GEO_Data.results[0].formatted_address;
    const weatherAPIURL = `http://api.openweathermap.org/data/2.5/weather?lat=${hotelCoordLat}&lon=${hotelCoordLon}&appid=${process.env.WEATHER_API_KEY}`;
    const airqualityAPIURL = `https://api.waqi.info/feed/${cityTrimedName}/?token=${AIRQualityBACKUP_KEY}`;
    // ===================== COMMENTS FOR QUERY API ==============================
    const queryToRetrieveCommentsForAPI = `SELECT user.username, comment.rating, comment.comment_date, comment.comment_content, comment.user_id, comment.hotel_id, hotel.hotel_name, hotel.address, hotel.city, hotel.country
                                            FROM COMMENT AS comment 
                                            INNER JOIN HOTEL AS hotel 
                                            ON comment.hotel_id = hotel.hotel_id
                                            INNER JOIN USER AS user
                                            ON comment.user_id = user.user_id 
                                            WHERE hotel.api_hotel_id=?`;
    const queryToUserProfile = `SELECT DISTINCT comment.user_id, userProfile.img_id
                                FROM COMMENT AS comment
                                INNER JOIN USER_PROFILE_IMAGE AS userProfile
                                ON userProfile.user_id = comment.user_id
                                INNER JOIN HOTEL AS hotel
                                ON hotel.hotel_id = comment.hotel_id
                                WHERE hotel.api_hotel_id = ?`;
    let user_map = new Map();
    let queryRetrieveTargetHotel = hotelId;
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
            db.query(queryToRetrieveCommentsForAPI, [queryRetrieveTargetHotel], (errorDetailHotelAPI, resultDetailHotelAPI) => {
                if (errorDetailHotelAPI) {
                    console.log("ERROR: ERROR RETRIEVE DETAIL HOTEL API COMMENT");
                    console.log(errorDetailHotelAPI);
                    throw errorDetailHotelAPI;
                }
                console.log("==== RESULT DETAIL HOTEL API ====");
                // console.log(resultDetailHotelAPI);
                db.query(queryToUserProfile, [queryRetrieveTargetHotel], async (userProfileImageError, userProfileResult) => {
                    if (userProfileImageError) {
                        console.log("ERROR: ERROR USER PROFILE IMAGE API COMMNET");
                        console.log(userProfileImageError);
                        throw userProfileImageError;
                    }
                    console.log(userProfileResult);
                    
                    for (let i = 0; i < userProfileResult.length; i++) {
                        let params = {
                            Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME
                        ,   Key: `${userProfileResult[i].img_id}`
                        };
                        let eachProfilePhoto = await s3.s3.getObject(params).promise();
                        let profileImageData = eachProfilePhoto.Body;
                        let buffer = Buffer.from(profileImageData);
                        let base64data = buffer.toString('base64');
                        let profileImageDOM = 'data:image/jpeg;base64,' + base64data; 
                        user_map.set(userProfileResult[i].user_id, profileImageDOM);
                        // console.log(user_map);
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
                    ,   preSelected_CheckInDate
                    ,   preSelected_CehckOutDate
                    ,   resultDetailHotelAPI: resultDetailHotelAPI                     
                    };
                    res.render('pages/hotel/hotelSearchedDetail', {
                        hotelObj: hotelObj, 
                        StripePublicKey:StripePublicKey, 
                        weatherData:weatherData,
                        airQualityData: airQualityData,
                        user_map:user_map
                    });
                });
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

// insert booking data into DB based on hotel from DB
router.get('/hotel/searched/detailDB/:id/payment', authMW.isLoggedIn, (req, res) => {
    const user_id = req.session.user.user_id;
    let hotelDBCookieData = req.cookies.hotelBookingDataDB;
    // console.log(hotelDBCookieData);
    let hotelCheckInDateString = hotelDBCookieData.body.check_in_date;
    let hotelCheckOutDateString = hotelDBCookieData.body.check_out_date;
    // DATA SET UP TO INSERT INTO DB
    let hotelCheckInDate = new Date(hotelCheckInDateString);
    let hotelCheckOutDate = new Date(hotelCheckOutDateString);
    let hotelBookingDate = new Date();
    let hotelBookingPrice = hotelDBCookieData.body.totalPrice;
    let hotelBooking_hotel_id = hotelDBCookieData.body.hotelId;
    let insertBookingData = [hotelBookingDate, hotelBookingPrice, user_id, hotelBooking_hotel_id, hotelCheckInDate, hotelCheckOutDate];
    const insertBookingDataToDB = `INSERT INTO BOOKING (booking_Date, booking_price, user_id, hotel_id, check_in_date, check_out_date) VALUES (?,?,?,?,?,?)`;
    // QUERY TO INSERT INTO DB BOOKING TABLE
    db.query(insertBookingDataToDB, insertBookingData, (hotelBookingQueryError, hotelBookingQueryResult) => {
        if (hotelBookingQueryError) {
            console.log("ERROR INSERT INTO HOTEL BOOKING RECORD (DB)");
            console.log(hotelBookingQueryError);
            throw hotelBookingQueryError;
        }
        console.log("AFFECTED DATA FOR INSERTING BOOKING (DB): ", hotelBookingQueryResult.affectedRows);
        res.redirect(`/hotel/searched/detailDB/${hotelBooking_hotel_id}/paymentconfirm`);
    });
});

router.get('/hotel/searched/detail/:id/payment', authMW.isLoggedIn, async (req, res) => {
    const user_id = req.session.user.user_id;
    const hotel_admin_id = 68;
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
            let hotelInsertDataSet = [hotelName, hotelDefaultPrice, countryName, cityName, hotelCookieData.body.hotelLocation, isAPI, isDeveloper, hotel_admin_id, hotel_API_Id];
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
                let dataForBooking = [bookingDate, bookingPrice, user_id, hotelID, hotelCheckInDate, hotelCheckOutDate];
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

// Confirm page for API hotel
router.get('/hotel/searched/detail/:id/paymentconfirm', (req, res) => {
    let hotelCookieData = req.cookies.hotelBookingData;
    // let hotel_APi_data = req.params.id;
    // console.log(hotel_APi_data);
    // res.clearCookie("hotelBookingData");
    // console.log(hotelCookieData);
    res.render('pages/booking/bookConfirm', {hotelCookieData:hotelCookieData});
});

router.get('/hotel/searched/detailDB/:id/paymentconfirm', (req, res) => {
    let hotelCookieData = req.cookies.hotelBookingDataDB;
    res.render('pages/booking/bookConfirm', {hotelCookieData:hotelCookieData});
});

// Stripe for the hotels from API
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

// Stripe for Hotel from DB
router.post('/hotel/searched/detailDB/:id/payment', (req, res) => {
    const paymentData = req.body;
    // const passingData = req.body.body;
    // console.log(passingData);
    let hotelPrice = Number(paymentData.body.totalPrice * 100).toFixed(2);
    hotelPrice = Number(hotelPrice);
    res.cookie('hotelBookingDataDB', paymentData);
    stripe.customers.create({
        email: paymentData.email
    ,   source: paymentData.token
    }).then(customer => stripe.charges.create({
        customer: customer.id
    ,   currency: 'usd'
    ,   amount: hotelPrice
    })).then(function() {
        res.redirect(`/hotel/searched/detailDB/${paymentData.body.hotelId}/payment`);
    });
}); 


module.exports = router;

const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const trimCityNameHelper = require('../../modules/trimCityNameHelper');
// const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const db = require('../../utilities/db.js');
const uuid = require('uuid');
const multer = require('../../utilities/multer.js');
///////////////////////////////////
// multer to AWS S3 upload logics
///////////////////////////////////
const s3 = require('../../utilities/s3');

// const storage = multer.memoryStorage({
//     destination: function(req, file, callback) {
//         callback(null, '');
//     }
// });
// // mulitple
// const upload_multiple = multer({storage:storage}).array('hotelImages');

router.get('/become-host', authMW.isLoggedIn, (req, res) => {
    res.render('pages/becomeHost/becomeHostPolicy');
    //res.send('hello host');
});

router.get('/become-host/postHotel/new', authMW.isLoggedIn, (req, res) => {
    let loggedInUserData = req.session.user;
    res.render('pages/hostHotel/hotelPost', {loggedInUserData:loggedInUserData});
});

router.post('/become-host/postHotel', authMW.isLoggedIn, (req, res) => {
    let postedUserID = req.session.user.user_id;
    let hotelPostData = req.body;
    // ==============================
    // HOTEL BASIC DATA =============
    let hotelLabel = hotelPostData.hotelLabel;
    let hotelPrice = hotelPostData.hotelPrice;
    let hotelLocation = hotelPostData.hotelLocation;
    let hotelLocationStreetAddress = hotelPostData.hotel_location_street;
    let hotelLocationTrimmedForDB = trimCityNameHelper.trimCityNameAndCountryName(hotelLocation);
    // Datas to insert DB after trim by using trim helper functions
    // ASSUME USER ID is has a USER ID 14
    let hotelCity = hotelLocationTrimmedForDB[0];
    let hotelCountry = hotelLocationTrimmedForDB[1];
    let insertQuery = "INSERT INTO `css-capstone`.HOTEL SET ?";
    db.query(insertQuery, 
        {hotel_name: hotelLabel, 
        hotel_price: hotelPrice, 
        country: hotelCountry,
        city: hotelCity,
        address: hotelLocationStreetAddress,
        isAPI: false,
        isDeveloper: true,
        user_id: postedUserID}, (err, result) => {
            // callback function
            if (err) {
                console.log(err);
                throw err;
            }
            console.log("Hotel Insert Added Successfully into Database");
            console.log(result);
            console.log(result.insertId);
            req.session.hotelPostData = hotelPostData;
            req.session.hotelPostId = result.insertId;
            res.redirect('/become/postHotelImage');
        });
});

router.get('/become/postHotelImage', authMW.isLoggedIn, (req, res) => {
    // CHANGE RETRIEVE DATA FROM DB LATER
    let hotelPostData = req.session.hotelPostData;
    let hotelPostId = req.session.hotelPostId;
    // console.log(hotelPostId);
    req.session.hotelPostData = null;
    req.session.hotelPostId = null;
    // console.log(hotelPostData);
    // console.log(`HotelData in Hotel Image: ${hotelPostData}`);
    // console.log(hotelPostData);
    res.render('pages/hostHotel/hotelPostImage', {hotelPostData:hotelPostData,  hotelPostId:hotelPostId});
});

router.post('/become-host/postHotelImage', multer.upload_multiple, (req, res) => {
    // console.log(req.files);
    const postedHotelID = req.body.postedHotelId;
    let currentPostingUser = req.session.user;
    let currentPostingUserID = currentPostingUser.user_id;
    console.log(currentPostingUser);
    let hotelImageData = req.files;
    console.log(hotelImageData);
    // DB CONNECT
    for (let i = 0; i < hotelImageData.length; i++) {
        let eachImageData = hotelImageData[i];
        // console.log(eachImageData.mimetype);
        if (eachImageData.mimetype == 'image/jpg' || eachImageData.mimetype == 'image/jpeg' || eachImageData.mimetype == 'image/png') {
            console.log("is it here?");
            // console.log(eachImageData.originalname.split("."));
            let splitByDataType = eachImageData.originalname.split(".");
            console.log(splitByDataType[0]);
            console.log(splitByDataType[1]);
            let fileName = uuid.v5(splitByDataType[0], process.env.SEED_KEY);
            console.log(fileName);
            let fullHotelImageName = currentPostingUserID + '_'  + fileName + '.' + splitByDataType[1];
            console.log(fullHotelImageName);

            // PARAMETER FOR UPLOAD IN S3 BUCKET
            let params = {
                Bucket: process.env.AWS_HOTEL_BUCKET_NAME
            ,   Key: `${fullHotelImageName}`
            ,   Body: eachImageData.buffer
            };

            s3.s3.upload(params, (error, data) => {
                if (error) {
                    res.status(500).send(error);
                }
                
                console.log("============== AWS S3 ACCESS ==========");
                const tempUserId = currentPostingUser.user_id;
                let hotelImageID = data.key;
                let fileLocation = data.Location;
                console.log(hotelImageID);
                console.log(fileLocation);
                const insertHotelImageQuery = "INSERT INTO `css-capstone`.USER_HOTEL_IMAGE SET ?";
                db.query(insertHotelImageQuery, 
                    {
                        // this will be change into req.session.user later
                        user_id: tempUserId
                    ,   hotel_img_id: fullHotelImageName
                    ,   hotel_img: fileLocation
                    ,   hotel_id: postedHotelID
                    }, (err, result) => {
                        // callback function
                        if (err) {
                            console.log(err);
                            console.log("Error on Hotel Image Database");
                            throw err;
                        }
                        console.log("Successfully added in the Hotel Image Database");
                    }
                )
            });
            //res.render('pages/hostHotel/hotelPostImage');
        } else {
            console.log("It should be here....");
            
        }
        
    }
    req.session.hotelPostId = postedHotelID;
    res.redirect('/become-host/postHotelThankyou');
});

router.get('/become-host/postHotelThankyou', (req, res) => {
    const postedHotelId = req.session.hotelPostId;
    const tempPostedHotelId = 22;
    req.session.hotelPostId = null;
    // Data Variables to pass to render
    let hotelDataObj = '';

    let hotelInformationQuery = `SELECT * FROM HOTEL H WHERE H.hotel_id = ${tempPostedHotelId}`;
    // let hotelImageRetrieveQuery = `SELECT hotel_img_id
    // FROM `css-capstone`.HOTEL AS H
    //     INNER JOIN `css-capstone`.USER_HOTEL_IMAGE AS HI
    //     ON HI.hotel_id = H.hotel_id`
    db.query(hotelInformationQuery, function(err, result) {
        if (err) {
            console.log(err);
            console.log("Error happend during retrieve hotel for thank you page");
            throw err;
        } else {

            hotelDataObj = result[0];
            console.log(hotelDataObj);
            res.render('pages/hostHotel/hotelPostThankyou', {tempPostedHotelId:tempPostedHotelId,hotelDataObj:hotelDataObj});
        }
    });

    // console.log(tempPostedHotelId);
    // console.log(hotelDataObj);
    
});

module.exports = router;

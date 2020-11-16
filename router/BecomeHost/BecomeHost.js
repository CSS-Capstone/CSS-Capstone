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
const nodemailer = require('nodemailer');
///////////////////////////////////
// multer to AWS S3 upload logics
///////////////////////////////////
const s3 = require('../../utilities/s3');
////////////////////////////////////
/////////// NODE MAILER ////////////
let transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "hotelfinder114@outlook.com",
      pass: "Hotel0505114"
    }
});

router.get('/become-host', authMW.isLoggedIn, (req, res) => {
    res.render('pages/becomeHost/becomeHostPolicy');
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
    let postedHotelID = req.body.postedHotelId;
    let currentPostingUser = req.session.user;
    let currentPostingUserID = currentPostingUser.user_id;
    let hotelImageData = req.files;
    // DB CONNECT
    const HOTEL_SELECT_QUERY = `SELECT * FROM HOTEL WHERE hotel_id=?`;
    db.query(HOTEL_SELECT_QUERY, postedHotelID, async (error, hotelResult) => {
        if (error) {
            console.log("ERROR: HOTEL DATA Retriving from DB FAIL");
        }
        for (let i = 0; i < hotelImageData.length; i++) {
            let eachImageData = hotelImageData[i];
            // console.log(eachImageData.mimetype);
            if (eachImageData.mimetype == 'image/jpg' || eachImageData.mimetype == 'image/jpeg' || eachImageData.mimetype == 'image/png') {
                // console.log("is it here?");
                // console.log(eachImageData.originalname.split("."));
                let splitByDataType = eachImageData.originalname.split(".");
                let fileName = uuid.v5(splitByDataType[0], process.env.SEED_KEY);
                let fullHotelImageName = postedHotelID + '_' + currentPostingUserID + '_'  + fileName + '.' + splitByDataType[1];    
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
                    let tempUserId = currentPostingUser.user_id;
                    let hotelImageID = data.key;
                    let fileLocation = data.Location;
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
                    });
                });
                //res.render('pages/hostHotel/hotelPostImage');
            } else {
                console.log("It should be here....");
            }
        }
        req.session.hotelPostId = postedHotelID;
        res.redirect('/become-host/postHotelThankyou');
    }); 
});

router.get('/become-host/postHotelThankyou', async (req, res) => {
    let postedHotelId = req.session.hotelPostId;
    req.session.hotelPostId = null;
    // Data Variables to pass to render
    let hotelDataObj = '';
    // let imageArray = [];
    let hotelInformationQuery = `SELECT * FROM HOTEL H WHERE H.hotel_id = ${postedHotelId}`;
    // let hotelImageRetrieveQuery = `SELECT hotel_img_id FROM USER_HOTEL_IMAGE WHERE hotel_id=${postedHotelId}`;
    db.query(hotelInformationQuery, async function(err, resultHotel) {
        if (err) {
            console.log(err);
            console.log("Error happend during retrieve hotel for thank you page");
            throw err;
        } 
        hotelDataObj = resultHotel[0];
        console.log("THANK_YOU: Hotel Data");
        console.log(hotelDataObj);
        let info = await transporter.sendMail({
            from: "hotelfinder114@outlook.com", // sender address
            to: "jhpp114nemo@gmail.com", // list of receivers
            subject:"Hotel Finder - Thank you for Posting ✔", // Subject line
            html: `<div><img width="400" height="400" src="cid:successImage"/> <h2>Thank you for posting Your hotel</h2> <p>Your Hotel,<strong>${hotelDataObj.hotel_name}</strong> located in ${hotelDataObj.address} had been posted! </p></div>` // html body
            ,attachments: [{
                filename: 'successfull_post.jpg',
                path: './public/images/successfully_post.jpg',
                cid: 'successImage' //same cid value as in the html img src
            }]
        });
        // console.log(imageArray);
        res.render('pages/hostHotel/hotelPostThankyou', 
            {
                postedHotelId:postedHotelId
            ,   hotelDataObj:hotelDataObj
        });
    });
});

// Render Hotel Detail Page
router.get('/become-host/hotel/:id', async (req, res) => {
    let hotelId = req.params.id;
    let hotel_user_id = req.session.user_id;
    // Query and data set up
    const findHotelQuery = `SELECT *
                            FROM HOTEL
                            WHERE hotel_id = ?`;
                            
    const findHotelImageQuery = `SELECT hotel_img_id
                                 FROM USER_HOTEL_IMAGE
                                 WHERE hotel_id = ?`;
    let hotel_id_data = [hotelId];
    // extra variable to store result data
    let hotelDataObj = '';
    let imageArray = [];
    // retrieve hotel data from db
    db.query(findHotelQuery, hotel_id_data, (err, hotelResult) => {
        if (err) {
            console.log("ERROR: hotel detail data retrieving from DB");
            console.log(err);
            throw err;
        }
        hotelDataObj = hotelResult[0];
        console.log(hotelResult);
        // console.log(`FROM DATABASE HOTEL DATA: ${hotelDataObj}`);
        // retrieve hotel images from db
        db.query(findHotelImageQuery, hotel_id_data, async (error, hotelImageResult) => {
            if (error) {
                console.log("ERROR: hotel detail image data retrieving from DB");
                console.log(error);
                throw new error;
            }
            for (let i = 0; i < hotelImageResult.length; i++) {
                console.log("Detail Image Loop Entered");
                let hotelDetailS3Param = {
                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                ,   Key: `${hotelImageResult[i].hotel_img_id}`
                };
                let each_hotel_image_data = await s3.s3.getObject(hotelDetailS3Param).promise();
                let each_hotel_image = each_hotel_image_data.Body;
                let buffer = Buffer.from(each_hotel_image);
                let base64data = buffer.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,' + base64data;
                imageArray.push(imageDOM);
            }
            res.render('pages/hostHotel/hotelDetail', {
                imageArray:imageArray
            ,   hotelDataObj:hotelDataObj
            });
        });
    });
});

// Render Hotel Edit Page
router.get('/become-host/hotel/:id/edit', async (req, res) => {
    let targetHotelId = req.params.id;
    let hotelDataObj = '';
    let imageArray = new Map();
    let findHotelFromDB = `SELECT * FROM HOTEL WHERE hotel_id = ${targetHotelId}`;
    let findHotelImageFromDB = `SELECT hotel_img_id FROM HOTEL AS H INNER JOIN USER_HOTEL_IMAGE AS HI ON HI.hotel_id = H.hotel_id WHERE HI.hotel_id = ${targetHotelId}`;
    try {
        db.query(findHotelFromDB, async (error, result) => {
            if (error) {
                console.log(error);
                console.log("Error happend during retrieve hotel for editing page");
                throw error;
            }
            try {
                hotelDataObj = result[0];
                db.query(findHotelImageFromDB, async (err, imageResult) => {
                    if (err) {
                        console.log("Error happend during retrieve hotel image for editing page");
                        throw err;
                    }
                    for (let i = 0; i < imageResult.length; i++) {
                        console.log("got in here");
                        let params = {
                            Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                        ,   Key: `${imageResult[i].hotel_img_id}`
                        };
                        let eachImageData = await s3.s3.getObject(params).promise();
                        let imageData = eachImageData.Body;
                        let buff = Buffer.from(imageData);
                        let base64data = buff.toString('base64');
                        let imageDOM = 'data:image/jpeg;base64,'+ base64data;
                        imageArray.set(imageResult[i].hotel_img_id, imageDOM);
                    }
                    res.render('pages/hostHotel/hotelEdit', 
                    {
                        targetHotelId:targetHotelId
                    ,   hotelDataObj:hotelDataObj
                    ,   imageArray:imageArray
                });
                    
                });
            } catch (err) {
                console.err(err);
            } 
        });
    } catch (error) {
        console.err(error);
    }
});

// Action method for edit hotel
router.put('/become-host/hotel/:id', multer.upload_multiple, async (req, res) => {
    let userID = req.session.user.user_id;
    let newHotelImageData = req.files;
    let newHotelId = req.body.editHotelId;
    let newHotelLabel = req.body.hotelLabel;
    let newHotelPrice = req.body.hotelPrice;
    let newHotelLocation = req.body.hotelLocation;
    let hotelLocationTrimmedForDB = trimCityNameHelper.trimCityNameAndCountryName(newHotelLocation);
    // Datas to insert DB after trim by using trim helper functions
    let newHotelCity = hotelLocationTrimmedForDB[0];
    let newHotelCountry = hotelLocationTrimmedForDB[1];
    let newHotelStreetAddress = req.body.hotel_location_street;
    let parsedImageData = trimCityNameHelper.addSemiToEachImageData(req.body.imageId);
    // console.log(parsedImageData.toString());
    // Update Query for plain hotel data
    let updateHotelDataQuery = `UPDATE HOTEL SET 
                                hotel_name=?,
                                hotel_price=?, 
                                country=?, 
                                city=?, 
                                address=? 
                                where hotel_id=?`;
    let dataForHotelQuery = [newHotelLabel, newHotelPrice, newHotelCountry, newHotelCity, newHotelStreetAddress, newHotelId];
    let updateHotelImageDataQuery = `SELECT hotel_img_id 
                                     FROM USER_HOTEL_IMAGE
                                     WHERE hotel_img_id
                                     NOT IN (${parsedImageData.toString()})
                                     AND hotel_id = ${newHotelId}`;
    
    //  Updating hotel data
    db.query(updateHotelDataQuery, dataForHotelQuery, async (error, results, fields) => {
        if (error) {
            console.log("Error on Editing hotel data");
            throw error;
        }
        console.log('Rows for editing hotel data affected:', results.affectedRows);
        // Update pre-existing image data
        db.query(updateHotelImageDataQuery, async (error, imageFilterResult) => {
            if (error) {
                console.log("Error on retrieving hotel image data");
                throw error;
            }
            // ====================================================
            // Loop over deleted image and delete the image from DB
            for (let i = 0; i < imageFilterResult.length; i++) {
                let targetDeleteImg = `'${imageFilterResult[i].hotel_img_id}'`;
                console.log(targetDeleteImg);
                // delete from database
                let deleteTargetImageDataQuery = `DELETE FROM USER_HOTEL_IMAGE WHERE hotel_img_id = ${targetDeleteImg}`;
                let params = {
                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                ,   Key: `${imageFilterResult[i].hotel_img_id}`
                };
                s3.s3.deleteObject(params, (err, data) => {
                    if (err) {
                        console.log("Error on deleting from S3");
                        console.log(err);
                        throw err;
                    }
                    console.log("Successfully Deleted Image from S3")
                    db.query(deleteTargetImageDataQuery, async (error, result) => {
                        if (error) {
                            console.log("Error on Deleting before editing image");
                            console.log(error);
                            throw error;
                        }
                        console.log('Rows for editing hotel data affected:', result.affectedRows);
                    });
                });
            }
            // INSERT NEW IMAGES
            if (newHotelImageData.length !== 0) {
                for (let i = 0; i < newHotelImageData.length; i++) {
                    console.log("Upload new images proceed");
                    let eachNewImageData = newHotelImageData[i];
                    console.log(eachNewImageData);
                    if (eachNewImageData.mimetype === 'image/jpg' || eachNewImageData.mimetype == 'image/jpeg' || eachNewImageData.mimetype == 'image/png') {
                        console.log("Upload new image Type is valid");
                    //     console.log(eachNewImageData);
                        let splitByDataType = eachNewImageData.originalname.split(".");
                        let fileName = uuid.v5(splitByDataType[0], process.env.SEED_KEY);
                        let fullHotelImageName = newHotelId + '_' + userID + '_'  + fileName + '.' + splitByDataType[1];
                    //     // PARAMETER FOR UPLOAD IN S3 BUCKET
                        let uploadImgParams = {
                            Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                        ,   Key: `${fullHotelImageName}`
                        ,   Body: eachNewImageData.buffer
                        };
                        s3.s3.upload(uploadImgParams, (error, data) => {
                            if (error) {
                                console.log("Error on new image upload to S3");
                                res.status(500).send(error);
                            }
                            console.log("=========== AWS S3 Upload Success ==========");
                            let newUploadHotelImageId = data.key;
                            let newUploadHotelImageFileLocation = data.Location;
                            const insertNewHotelImageQuery = "INSERT INTO `css-capstone`.USER_HOTEL_IMAGE SET ?";
                            db.query(insertNewHotelImageQuery, 
                                {
                                    user_id: userID
                                ,   hotel_img_id: fullHotelImageName
                                ,   hotel_img: newUploadHotelImageFileLocation
                                ,   hotel_id: newHotelId
                                }, (err, newImageUploadResult) => {
                                    if (err) {
                                        console.log("DB: Error on upload new images");
                                        console.log(err);
                                        throw err;
                                    }
                                console.log("Edit: New upload image to database completed successfully");
                            });
                        });
                    } else {
                        console.log("Your file does not contain image");
                    }
                }
            }
            // If the length of the image is empty (NO NEW UPLOAD IMAGES)
            res.redirect('/');
        });
    });
});

module.exports = router;

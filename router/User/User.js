const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const multer = require('../../utilities/multer');
const imageHelper = require('../../modules/profilePhotoHelper');
const hotelImgHelper = require('../../modules/hotelRetrieveHelper');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');
const uuid = require('uuid');

router.get('/user', authMW.isLoggedIn, async (req, res) => {

    var user = req.session.user;
    let isLoggedIn = req.session.user == null ? false : true;
            
    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    if (!user.profile.img || user.profile.img === "default_profile_img") {
        req.session.user.profile.img = "default_profile_img";
        res.render('pages/user/user', {
            user: req.session.user,
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
        console.log('You seem to have more than a default photo');
        let params = {
            Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME
        ,   Key: `${user.profile.img}`
        };
        s3.s3.getObject(params, (err, data) => {
            if (err) { 
                console.log('Failed to get the image from S3.' + err); 
                user.profile.img = "default_profile_img";
                req.session.user = user;
                res.render('pages/user/user', {
                    user: req.session.user,
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
                let imageData = data.Body;
                let buff = Buffer.from(imageData);
                let base64data = buff.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,'+ base64data;
                user.profile.imgDom = imageDOM;
                req.session.user = user;
                res.render('pages/user/user', {
                    user: req.session.user,
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
    }
});

router.post('/user/upload', authMW.isLoggedIn, multer.upload, async (req, res) => {

    const file = req.file;
    var user = req.session.user
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {

        let userId = user.user_id;
        let image = file.originalname.split(".");
        const fileType = image[image.length - 1];
        const fileName = uuid.v5(image[0], process.env.SEED_KEY);
        const fullFileName = userId + "_" + fileName + "." + fileType;

        if(!user.profile.img || user.profile.img === "default_profile_img") {
            imageHelper.uploadImage(userId, file, fullFileName);
            
            let buff = Buffer.from(file.buffer);
            let base64data = buff.toString('base64');
            let imageDOM = 'data:image/jpeg;base64,'+ base64data;
            req.session.user.profile.img = fullFileName;
            req.session.user.profile.imgDom = imageDOM
            res.json(req.session.user);
        } else {
            if (user.profile.img === fullFileName) {
                res.json(req.session.user);
            } else {
                imageHelper.updateImage(userId, user.profile.img, file, fullFileName);

                let buff = Buffer.from(file.buffer);
                let base64data = buff.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,'+ base64data;
                req.session.user.profile.img = fullFileName;
                req.session.user.profile.imgDom = imageDOM
                res.json(req.session.user);
            }
        }
    } else {
        return;
    }
});

router.post('/user/updateProfile', authMW.isLoggedIn, async(req, res) => {
    console.log('Fetch request: /user/updateProfile');
    var userProfileBio = {
        about: req.body.about,
        location: req.body.location,
        languages: req.body.languages,
        api_key: req.body.api_key,
        is_active: req.body.is_active
    };
    
    let bioQuery = `UPDATE USER SET profile_about = ?, profile_location = ?, profile_languages = ? WHERE user_id=?`;
    let bioData = [userProfileBio.about, userProfileBio.location, 
        userProfileBio.languages, req.session.user.user_id];
    
    let devQuery = `UPDATE DEVELOPER SET api_key = ?, is_active = ? WHERE user_id=?`;
    let devData = [userProfileBio.api_key, (userProfileBio.is_active === "true"), req.session.user.user_id];
    
    db.query(bioQuery, bioData, async (err, results) => {
        if (err) console.log('Failed to update user profile : ' + err);
        else console.log('Successful update to user profile');
    });

    db.query(devQuery, devData, async (err, results) => {
        if (err) console.log('Failed to update user dev info : ' + err);
        else console.log('Successful update to user dev info');
    });

    req.session.user.profile.about = userProfileBio.about;
    req.session.user.profile.location = userProfileBio.location;
    req.session.user.profile.languages = userProfileBio.languages;
    req.session.user.developer.api_key = userProfileBio.api_key;
    req.session.user.developer.is_active = userProfileBio.is_active;
    res.json(req.session.user);
});

router.get('/user/reviewCounts', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/reviewCounts');

    let user = req.session.user;

    let reviewCntQuery = `SELECT COUNT(*) AS cnt FROM COMMENT WHERE user_id=?`;

    db.query(reviewCntQuery, [user.user_id], async (err, results) => {
        if (err) console.log('Failed to get user comment count :' + err);
        else {
            console.log('Successful on retrieving review counts');
            req.session.user.profile.review_count = results[0].cnt;
            res.json(req.session.user);
        }
    });
});

router.get('/user/hostingCounts', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/hostingCounts');

    let user = req.session.user;

    let hostingCntQuery = `SELECT COUNT(*) AS cnt FROM HOTEL WHERE user_id=?`;

    db.query(hostingCntQuery, [user.user_id], async (err, results) => {
        if (err) console.log('Failed to get hosting hotel count :' + err);
        else {
            console.log('Successful on retrieving hosting hotel counts');
            req.session.user.profile.hosting_count = results[0].cnt;
            res.json(req.session.user);
        }
    });
});

router.get('/user/identityVertified', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/identityVertified');

    let user = req.session.user;

    let hostingCntQuery = `SELECT * FROM USER WHERE user_id=?`;

    db.query(hostingCntQuery, [user.user_id], async (err, results) => {
        if (err) console.log('Failed to get email confirmation status :' + err);
        else {
            console.log('Successful on retrieving email confirmation status');
            req.session.user.profile.is_verified = results[0].isConfirmed;
            res.json(req.session.user);
        }
    });
});

router.get('/user/viewComments', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/viewComments');

    let user = req.session.user;
    let commentsArr = [];
    let commentsData = [user.user_id];
    // based on booking_id get hotel image, hotel name, and hotel address
    let commentsQuery = `SELECT * FROM COMMENT WHERE user_id = ?`;
    db.query(commentsQuery, commentsData, async (err, results) => {
        if (err) console.log('Failed to retrieve user comment : ' + err);
        var i;
        for (i = 0; i < results.length; i++) {
            var comment = {
                comment_id: results[i].comment_id,
                rating: results[i].rating,
                comment_date: results[i].comment_date,
                comment_content: results[i].comment_content,
                hotel_id: results[i].hotel_id,
                booking_id: results[i].booking_id
            };
            commentsArr.push(comment);
        }
        req.session.user.userComments = commentsArr;
        res.json(req.session.user);
    });
});

router.get('/user/viewBookingHistory', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/viewBookingHistory');

    let user = req.session.user;
    var userBookingHistoryArr = [];
    var tempImgArray = [];
    let userBookingHistoryData = [user.user_id];
    let getBookingHistoryQuery = `SELECT BK.booking_id, BK.booking_date, BK.booking_price,
                                        BK.hotel_id, BK.check_in_date, BK.check_out_date,
                                        HTL.hotel_name, HTL.address, HTL.isAPI, HTL.api_hotel_id
                                    FROM
                                        HOTEL HTL
                                    INNER JOIN
                                        BOOKING BK
                                    ON
                                        HTL.hotel_id = BK.hotel_id AND BK.user_id = ?
                                    ORDER BY
                                        BK.booking_date
                                    DESC`; 
    db.query(getBookingHistoryQuery, userBookingHistoryData, async (err, results, fields) => {
        if (err) console.log('Failed to retrieve booking history : ' + err);
        var i;
        for (i = 0; i < results.length; i++) {
            var booking = { 
                booking_id: results[i].booking_id,
                booking_date: results[i].booking_date,
                booking_price: results[i].booking_price,
                check_in_date: results[i].check_in_date,
                check_out_date: results[i].check_out_date,
                hotel_id: results[i].hotel_id,
                hotel_name: results[i].hotel_name,
                hotel_address: results[i].address,
                hotel_isAPI: results[i].isAPI,
                hotel_API_id: results[i].api_hotel_id,
                hotel_img_id: null
            };
            userBookingHistoryArr.push(booking);
        }
        req.session.user.userBookingHistory = userBookingHistoryArr;
        res.json(req.session.user);
    });
});

router.get('/user/getHotelImg/:id', authMW.isLoggedIn, async (req, res) => {
    let hotelId = req.params.id;
    let getHotelImgQuery = `SELECT hotel_img_id FROM USER_HOTEL_IMAGE WHERE hotel_id=? LIMIT 1`;
    
    db.query(getHotelImgQuery, hotelId, async (error, img) => {
        if (error) { console.log('Failed to get hotel image'); }
        else {
            let params = {
                Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                Key: `${img[0].hotel_img_id}`
            };
            let eachHotelPhoto = await s3.s3.getObject(params).promise();
            let eachImageData = eachHotelPhoto.Body;
            let buffer = Buffer.from(eachImageData);
            let base64data = buffer.toString('base64');
            let imageDOM = 'data:image/jpeg;base64,' + base64data;
            res.json({ imgDom: imageDOM });
        }
    });
});

router.get('/user/viewHotelPosts', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/viewHotelPosts');

    let user = req.session.user;
    var userHotelPostArr = [];
    let userHotelPostImgArr = [];
    let getHotelInfoData = [user.user_id, user.user_id];
    let getHotelInfoQuery = `SELECT hotel.hotel_id, hotel.user_id,hotel_name, hotel_price, country, city, address, hotel_img_id 
                            FROM HOTEL hotel 
                            INNER JOIN USER_HOTEL_IMAGE hotel_Image
                            ON hotel.hotel_id = hotel_Image.hotel_id AND hotel.user_id = ?`;

    function isHotelIdExist(arr, toPush) {
        var indexToReturn = -1;
        arr.forEach(function (item, index) {
            if(item.hotel_id === toPush.hotel_id) {
                indexToReturn = index;
            }
        });
        return indexToReturn;
    }

    if (!user.is_host) {
        return;
    } else {
        db.query(getHotelInfoQuery, getHotelInfoData, async (err, results, fields) => {
            if (err) console.log('Failed to retrieve hotel info from user : ' + err);
            else {
                var i;
                for (i = 0; i < results.length; i++) {
                    var hotel = { 
                        hotel_id: results[i].hotel_id,
                        user_id: results[i].user_id,
                        hotel_name: results[i].hotel_name,
                        hotel_price: results[i].hotel_price,
                        country: results[i].country,
                        city: results[i].city,
                        address: results[i].address,
                        hotel_images: [results[i].hotel_img_id]
                    };
                    if (i == 0) {
                        userHotelPostArr.push(hotel);
                    } else {
                        var doesExistIndex = isHotelIdExist(userHotelPostArr, hotel);
                        if (doesExistIndex === -1) {
                            userHotelPostArr.push(hotel);
                        } else {
                            userHotelPostArr[doesExistIndex].hotel_images.push(hotel.hotel_images[0]);
                        }
                    }
                }

                await Promise.all(userHotelPostArr.map(async function (item, index) {
                    let params = {
                        Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                    ,   Key: `${item.hotel_images[0]}`
                    };
                    let eachImageData = await s3.s3.getObject(params).promise();
                    let imageData = eachImageData.Body;
                    let buff = Buffer.from(imageData);
                    let base64data = buff.toString('base64');
                    let imageDOM = 'data:image/jpeg;base64,'+ base64data;
                    item.hotel_images[0] = imageDOM;
                }, userHotelPostArr));

                req.session.user.userPostHotels = userHotelPostArr;
                res.json(req.session.user);
            }
        });
    }
});

router.get('/user/getApi', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /user/developer');

    var d = new Date().getTime();
	
    var apiKey = (req.session.user.user_id + uuid.v4(d)).replace(/[\W_]+/g,"");

    console.log(apiKey);

    let devQuery = `INSERT INTO DEVELOPER SET api_key = ?, is_active = ?, user_id=?`;
    let devData = [apiKey, false, req.session.user.user_id];
    db.query(devQuery, devData, async (err, results) => {
        if (err) console.log('Failed to INSERT user dev info : ' + err);
        else console.log('Successful to INSERT user dev info');
    }); 

    req.session.user.developer.api_key = apiKey;
    req.session.user.developer.is_active = false;
    res.json(req.session.user);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const multer = require('../../utilities/multer');
const imageHelper = require('../../modules/profilePhotoHelper');
<<<<<<< Updated upstream
const hotelImgHelper = require('../../modules/hotelRetrieveHelper');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');

router.get('/user', authMW.isLoggedIn, async (req, res) => {

    let user = req.session.user;
    
    imageHelper.getUserPhotoCount(user);
=======
const hotelRetrieveHelper = require('../../modules/hotelRetrieveHelper');

router.get('/user', authMW.isLoggedIn, async (req, res) => {

    var user = req.session.user;
    // let userPhotos = await imageHelper.getImageKeys(user);
    // req.session.user.userPhotos = userPhotos;
    
    // let getHotelPosts = await hotelRetrieveHelper.getUserHotelPostInfo(user);
    // req.sesssion.user.hotelPosts = getHotelPosts;
>>>>>>> Stashed changes

    if (user.profile_img == imageHelper.DEFAULT_PROFILE_PHOTO || !user.profile_img) {
        req.session.user.profile_img = imageHelper.DEFAULT_PROFILE_PHOTO;
        res.render('pages/user/user', {user: user});
    } else {
        console.log('You seem to have more than a default photo');
        try {
            req.session.user.profile_img = await imageHelper.getProfilePhoto(user);
        } catch(err) {
            console.log('Waiting for image..');
        }
        res.render('pages/user/user', {user: user});
    }
});

<<<<<<< Updated upstream
router.get('/user/viewComments', async (req, res) => {
    
});

router.get('/user/viewHotelPosts', authMW.isLoggedIn, async (req, res) => {
    console.log('Got the fetch request from the front-end');

    let user = req.session.user;
    // Will be moved to different section
    var userHotelPostArr = [];
    let userHotelPostImgArr = [];
    let getHotelInfoQuery = `SELECT hotel.hotel_id, hotel.user_id,hotel_name, hotel_price, country, city, address, hotel_img_id 
                            FROM HOTEL hotel 
                            INNER JOIN USER_HOTEL_IMAGE hotel_Image
                            ON (hotel.hotel_id = hotel_Image.hotel_id AND hotel.user_id = hotel_Image.user_id)`;

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
    } else if (user.userPostHotels) { 
        res.json(req.session.user);
    } else {
        db.query(getHotelInfoQuery, async (err, results, fields) => {
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
=======
router.post('/user/viewComments', () => {

});

router.post('/user/viewHotelPosts', () => {

>>>>>>> Stashed changes
});

router.post('/user/upload', authMW.isLoggedIn, multer.upload, async (req, res) => {

    const file = req.file;
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {
        
        const user = req.session.user; 
<<<<<<< Updated upstream
        
        //new Promise(imageHelper.getUserPhotoCount(user))
        
        // if (imgCnt >= 3) {
        //     console.log ('NO MORE PHOTOS FOR YOU BROO');
        //     res.json(req.session.user);
        // } else if (imgCnt == 0) {
        //     console.log("JUST FOR FUUUN DO YOU COME HERE?");
        // } else {
        //     //const fileName = imageHelper.uploadImage(user, file);
        //     console.log("Will upload a file ");

        //     // let promiseA = new Promise(function(resolve, reject) {
        //     //     resolve(imageHelper.uploadImage(user,file)),
        //     //     reject(console.log('Failed in new Promise'));
        //     // });
        //     // let thenProm = promiseA.then(value => {console.log("after promA : " + value)});

        //     // const promiseA = new Promise(imageHelper.uploadImage(user, file));
        //     // const promiseB = promiseA.then(imageHelper.refreshProfilePhoto(promiseA), console.log('rejected'));

        //     // console.log("맡애 콘솔로그 promiseA : " + promiseA);
        //     // console.log("밑에 thenProm : " + thenProm);

        //     //const fileName = await imageHelper.uploadImage(user, file);
        //     // new Promise(imageHelper.uploadImage(user, file)).then((fileName) => {
        //     //     req.session.user.profile_img = imageHelper.refreshProfilePhoto(fileName);
        //     // });
        //     //console.log(fileName);
                
            
        //     //res.render('pages/user/user.ejs', {user: user});
        // }
=======
       
        const fileName = imageHelper.uploadImage(user, file);
        console.log(fileName);

        // let promiseA = new Promise(function(resolve, reject) {
        //     resolve(imageHelper.uploadImage(user,file)),
        //     reject(console.log('Failed in new Promise'));
        // });
        // let thenProm = promiseA.then(value => {console.log("after promA : " + value)});

        // const promiseA = new Promise(imageHelper.uploadImage(user, file));
        // const promiseB = promiseA.then(imageHelper.refreshProfilePhoto(promiseA), console.log('rejected'));

        // console.log("맡애 콘솔로그 promiseA : " + promiseA);
        // console.log("밑에 thenProm : " + thenProm);

        //const fileName = await imageHelper.uploadImage(user, file);
        // new Promise(imageHelper.uploadImage(user, file)).then((fileName) => {
        //     req.session.user.profile_img = imageHelper.refreshProfilePhoto(fileName);
        // });
        //console.log(fileName);
            
        
        //res.render('pages/user/user.ejs', {user: user});
>>>>>>> Stashed changes
    } else {
        return;
    }
});

module.exports = router;
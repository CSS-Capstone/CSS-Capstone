const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const s3 = require('../../utilities/s3');
const multer = require('../../utilities/multer');
const db = require('../../utilities/db.js');

router.get('/user', authMW.isLoggedIn, (req, res) => {
    // testing purpose
    // Key is the image_id in MySQL image db
    // Which should be in user.session

    console.log("req.session.user");
    console.log(req.session.user);

    var user = req.session.user;
    const DEFAULT_PROFILE_PHOTO = "<img class='profile__image' src='images/default_user_profile_img_login.png'/>";
    //const userPhotos = user.userPhotos;
    //const photoHelper = require('../../modules/profilePhotoHelper');
    //const image = photoHelper.getProfilePhoto(userPhotos);
    if (user.profile_img == DEFAULT_PROFILE_PHOTO || !user.profile_img) {
        req.session.user.profile_img = DEFAULT_PROFILE_PHOTO;
        res.render('pages/user/user', {user: user});
    } else {
        console.log('You seem to have more than a default photo');
        res.render('pages/user/user', {user: user});
    }

    

    // var params = { 
    //     Bucket: process.env.AWS_BUCKET_NAME, 
    //     Key: '4319367f-5484-5303-8915-712d014451ff.png'
    // };

    // async function getImage() {
    //     const data = s3.getObject(params).promise();
    //     return data;
    // };

    // function encode(data) {
    //     let buf = Buffer.from(data);
    //     let base64 = buf.toString('base64');
    //     return base64;
    // }

    // getImage().then((img) => {
    //     let image = "<img class='profile__image' src='data:image/jpeg;base64," + encode(img.Body) + "'" + "/>";
    //     res.render('pages/users', { image });
    // }).catch((e)=> {
    //     console.log(e);
    // });
    //res.render('pages/users', {image: fileLocation});
});

router.post('/user/upload', authMW.isLoggedIn, multer.upload, (req, res) => {

    // var tempUserId = 11;
    // var queryForPhotoCnt = "SELECT COUNT(*) FROM `USER_PROFILE_IMAGE` WHERE `user_id` = '" + tempUserId + "'";

    const file = req.file;
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {
        
        console.log("INNNN?");
        const user = req.session.user;
        console.log(user);
        
        // if (user.userPhotos.length >= 3) {
        //     console.log("You have more than 3 images");
        //     //res.send('<script>alert("Message"); window.location.href = "/page_location"; </script>');
        //     //res.redirect('/users#');
        // }

        let userId = user.user_id;
        let image = file.originalname.split(".");
        const fileType = image[image.length - 1];

        const fileName = uuid.v5(image[0], process.env.SEED_KEY);
        console.log(uuid.v5(image[0], process.env.SEED_KEY));
        console.log(fileName);
        const fullFileName = userId + "_" + fileName + "." + fileType;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${fullFileName}`,
            Body: file.buffer
        };
        
        s3.s3.upload(params, (error, data) => {
            if (error) {
                res.status(500).send(error); 
            }
    
            if (res.statusCode == 200) {
                console.log("======= AWS S3 Upload Success =======");

                const isMain = true;

                console.log(data);

                let insertPhotoQuery = "INSERT INTO `css-capstone`.USER_PROFILE_IMAGE SET user_id=?, img_id=?, is_main=?";
                let insertPhotoData = [userId, fullFileName, isMain];
                db.query(insertPhotoQuery, insertPhotoData, (err, results, fields) => {
                    if (err) console.log('Failed to upload NEW photo');
                    else {
                        console.log('MySQL : Success to upload NEW photo');

                        const isSub = false;
                        let updatePhotoQuery = "UPDATE `css-capstone`.USER_PROFILE_IMAGE SET `is_main` = ? WHERE `img_id` != ? AND `user_id` = ?";
                        let updatePhotoData = [isSub, fullFileName, userId];
                        db.query(updatePhotoQuery, updatePhotoData, (err, results, fields) => {
                            if (err) console.log('Failed to UPDATE previous photo status');
                            else {
                                console.log('MySQL : Success to update previous photo');

                                return;
                            }
                        });
                    }
                });
                //res.redirect('/user');
            }
        });
    } else {
        return;
        //res.render('/users', {user: req.session.user});
    }
});

module.exports = router;
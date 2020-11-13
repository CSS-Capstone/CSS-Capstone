const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const s3 = require('../../utilities/s3');
const multer = require('../../utilities/multer');
const db = require('../../utilities/db.js');
const imageHelper = require('../../modules/profilePhotoHelper');

router.get('/user', authMW.isLoggedIn, async (req, res) => {
    // testing purpose
    // Key is the image_id in MySQL image db
    // Which should be in user.session

    // console.log("req.session.user");
    // console.log(req.session.user);
    
    var user = req.session.user;
    let userPhotos = await imageHelper.getImageKeys(user);
    //console.log(userPhotos);

    if (user.profile_img == imageHelper.DEFAULT_PROFILE_PHOTO || !user.profile_img) {
        req.session.user.profile_img = imageHelper.DEFAULT_PROFILE_PHOTO;
        res.render('pages/user/user', {user: user});
    } else {
        console.log('You seem to have more than a default photo');
        req.session.user.profile_img = await imageHelper.getProfilePhoto(user);
        let userPhotos = "";
        res.render('pages/user/user', {user: user});
    }
});

router.post('/user/upload', authMW.isLoggedIn, multer.upload, (req, res) => {

    const file = req.file;
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {
        
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
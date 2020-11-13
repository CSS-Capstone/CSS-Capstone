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
const sharp = require('sharp');

router.get('/user', authMW.isLoggedIn, async (req, res) => {

    var user = req.session.user;
    let userPhotos = await imageHelper.getImageKeys(user);
    req.session.user.userPhotos = userPhotos;

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

router.post('/user/upload', authMW.isLoggedIn, multer.upload, async (req, res) => {

    const file = req.file;
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {
        
        const user = req.session.user; 
        try {
            await imageHelper.uploadImage(user, file);
        } catch(err) {
            console.log('Waiting for upload..');
        }
        res.redirect('/user');
    } else {
        return;
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const multer = require('../../utilities/multer');
const imageHelper = require('../../modules/profilePhotoHelper');
const hotelRetrieveHelper = require('../../modules/hotelRetrieveHelper');

router.get('/user', authMW.isLoggedIn, async (req, res) => {

    var user = req.session.user;
    // let userPhotos = await imageHelper.getImageKeys(user);
    // req.session.user.userPhotos = userPhotos;
    
    // let getHotelPosts = await hotelRetrieveHelper.getUserHotelPostInfo(user);
    // req.sesssion.user.hotelPosts = getHotelPosts;

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

router.post('/user/viewComments', () => {

});

router.post('/user/viewHotelPosts', () => {

});

router.post('/user/upload', authMW.isLoggedIn, multer.upload, async (req, res) => {

    const file = req.file;
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {
        
        const user = req.session.user; 
       
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
    } else {
        return;
    }
});

module.exports = router;
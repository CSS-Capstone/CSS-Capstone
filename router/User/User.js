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
    console.log("req.user");
    console.log(req.user);

    console.log("req.session.user");
    console.log(req.session.user);

    var user = req.session.user;
    const userPhotos = user.userPhotos;
    const photoHelper = require('../../modules/profilePhotoHelper');
    const image = photoHelper.getProfilePhoto(userPhotos);
    if (userPhotos.length == 0) {
        user.userPhotos[0] = image;
    }

    res.render('pages/user/user', {user: user});

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
        console.log(req.session.user);
        // console.log("req.session : " + req.session);
        // console.log("req.session.user : " + req.session.user);
        if (req.session.user.userPhotos.length >= 3) {
            console.log("You have more than 3 images");
            //res.send('<script>alert("Message"); window.location.href = "/page_location"; </script>');
            //res.redirect('/users#');
        }
        // Check the counts of photo is less than 3? and if there is any matching file ID
        // if (req.session.user.photos.length? >= 3)
        // res.redirect('/users#', {message: "Unsupported Image Type Error"});
        // foreach photos
        // if (photos.img_id == uuid.v5 of newly uploaded photo)
        // res.redirect('/users#', {message: "Image already exist"});
        // else

        let image = file.originalname.split(".");
        const fileType = image[image.length - 1];

        const fileName = uuid.v5(image[0], process.env.SEED_KEY);
        console.log(uuid.v5(image[0], process.env.SEED_KEY));
        console.log(fileName);
        const fullFileName = fileName + "." + fileType;

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

                // Will be replaced with req.session.user_id ?
                const tempUserId = 11;
                const imgID = data.key;
                const fileLocation = data.Location;
                // user.session.photo.isMain? should be used
                const isMain = false;

                console.log(data);

                // var insertData = "INSERT INTO `USER_PROFILE_IMAGE`(`user_id`,`img_id`,`img_url`,`is_main`)VALUES('" 
                //                 + tempUserId + "','" + fullFileName + "','" + fileLocation + "','" + isMain + "')";
                // db.query(insertData, (err, result) => {
                //     if (err) throw err;
                //     console.log('Data Saved');
                //     console.log(result);
                // });
              
                console.log('Successful image upload');
                res.redirect('/user');
            }
        });
        //res.render('pages/users', {user: req.session.user});
        //s3UploadPromise.then(function() {
            //console.log('Successful image upload');
            //res.redirect('/users');
            //return;
    } else {
        return;
        //res.render('/users', {user: req.session.user});
    }
});

module.exports = router;
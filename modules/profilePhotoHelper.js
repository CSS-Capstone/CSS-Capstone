const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

const DEFAULT_PROFILE_PHOTO = "<img class='profile__image' src='images/default_user_profile_img_login.png'/>";

async function getProfilePhoto(user) {
    if (user.profile_img == DEFAULT_PROFILE_PHOTO || !user.profile_img) {
        return DEFAULT_PROFILE_PHOTO;
    } else {
        const imgData = await getImage(user.profile_img);
        const convertedImg = encode(imgData.Body);
        return  "<img class='profile__image' src='data:image/jpeg;base64," + convertedImg + "'" + "/>";     
    }
}

function getSubPhotos(user) {
    
}

async function getImageKeys(user) {
    let userPhotos = [];
    let getSubPhotoQuery = "SELECT * FROM `css-capstone`.USER_PROFILE_IMAGE WHERE `is_main` = ? AND `user_id` = ?";
    let getSubPhotoData = [false, user.user_id];
    db.query(getSubPhotoQuery, getSubPhotoData, (err, results, fields) => {
        if (err) console.log('Failed to get Sub photos');
        else {
            var i;
            for(i = 0; i < results.length; i++) {
                userPhotos[i] = results[i].img_id;
            }
            console.log(userPhotos);
        }
    });
}

async function getImage(key) {
    var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${key}`
    }
    return await s3.s3.getObject(params).promise();
};

function encode(data) {
    let buf = Buffer.from(data);
    let base64 = buf.toString('base64');
    return base64;
}

module.exports = { getProfilePhoto, getImageKeys, encode, DEFAULT_PROFILE_PHOTO };

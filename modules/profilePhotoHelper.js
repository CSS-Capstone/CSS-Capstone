const dotenv = require('dotenv');
const s3 = require('../utilities/s3');

const DEFAULT_PROFILE_PHOTO = "<img class='profile__image' src='images/default_user_profile_img_login.png'/>";

async function getProfilePhoto(user) {
    if (user.profile_img == DEFAULT_PROFILE_PHOTO || !user.profile_img) {
        return DEFAULT_PROFILE_PHOTO;
    } else {
        console.log('You seem to have more than a default photo');
        const imgData = await getImage(user.profile_img);
        const convertedImg = encode(imgData.Body);
        return  "<img class='profile__image' src='data:image/jpeg;base64," + convertedImg + "'" + "/>";     
    }
}

function getSubPhotos(user) {

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

module.exports = { getProfilePhoto, encode, DEFAULT_PROFILE_PHOTO };

const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

const DEFAULT_PROFILE_PHOTO = "default_profile_img";

async function getProfilePhoto(user) {
    const imgData = await getImage(user.profile_img);
    const convertedImg = encode(imgData.Body);
    return  "<img class='profile__image' src='data:image/jpeg;base64," + convertedImg + "'" + "/>";     
}

async function refreshProfilePhoto(fileName) {
    const imgData = await getImage(fileName);
    const convertedImg = encode(imgData.Body);
    return  "<img class='profile__image' src='data:image/jpeg;base64," + convertedImg + "'" + "/>";     
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
            return userPhotos;
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

function updateImage(userId, prevFileName, file, newFileName) {
    const params = {
        Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME,
        Key: `${prevFileName}`
    };

    s3.s3.deleteObject(params, (error, data) => {
        if (error) {
            console.log('Failed to delete photo from S3' + error); 
        }

        console.log("======= AWS S3 Delete Success =======");

        let updatePhotoQuery = "UPDATE `css-capstone`.USER_PROFILE_IMAGE SET img_id=? WHERE user_id=?";
        let updatePhotoData = [newFileName, userId];
        db.query(updatePhotoQuery, updatePhotoData, (err, results, fields) => {
            if (err) console.log('Failed to update NEW photo' + err);
            else {
                console.log('MySQL : Success to update NEW photo');
                console.log('fullFileName : ' + newFileName);

                const paramsUpload = {
                    Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME,
                    Key: `${newFileName}`,
                    Body: file.buffer
                };
            
                s3.s3.upload(paramsUpload, (error, data) => {
                    if (error) console.log('Failed to upload photo to S3' + error); 
                    else {
                        console.log("======= AWS S3 Upload Success =======");
                        return;
                    }
                });
            }
        });
    }); 
}

function uploadImage(userId, file, fullFileName) {
    const params = {
        Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME,
        Key: `${fullFileName}`,
        Body: file.buffer
    };
    
    s3.s3.upload(params, (error, data) => {
        if (error) {
            console.log('Failed to upload photo to S3' + error); 
        }

        console.log("======= AWS S3 Upload Success =======");

        let insertPhotoQuery = "INSERT INTO `css-capstone`.USER_PROFILE_IMAGE SET user_id=?, img_id=?";
        let insertPhotoData = [userId, fullFileName];
        db.query(insertPhotoQuery, insertPhotoData, (err, results, fields) => {
            if (err) console.log('Failed to upload NEW photo' + err);
            else {
                console.log('MySQL : Success to upload NEW photo');
                console.log('fullFileName : ' + fullFileName);
                return;
            }
        });
    });
}

module.exports = { getProfilePhoto, refreshProfilePhoto, getImageKeys, encode, DEFAULT_PROFILE_PHOTO, uploadImage, updateImage };

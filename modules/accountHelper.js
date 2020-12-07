const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

async function deleteAccout(userId) {
    const userIdData = [userId];
    const getAllUserHotelImgs = `SELECT * FROM USER_HOTEL_IMAGE WHERE user_id=?`;
    const deleteAllUserHotelImgsQuery = `DELETE FROM USER_HOTEL_IMAGE WHERE user_id=?`;
    const getUserProfilePhoto = `SELECT * FROM USER_PROFILE_IMAGE WHERE user_id=?`;
    const deleteAccount = `DELETE FROM USER WHERE user_id=?`;
    var hotelImgArr = [];
    var s3DeleteKeys = [];

    // get hotel images by userid
    // then delete s3 hotels
    // delete hotel images
    // get user images by userid
    // then delete s3 user image
    // delete user

    db.query(getAllUserHotelImgs, userIdData, (err, results) => {
        if (err) { 
            console.log('0. Failed to RETRIEVE user hotel imgs : ' + err); 
            return;
        } else {
            console.log('0. Successfully RETRIEVED user hotel imgs');
            for (let i = 0; i < results.length; i++) {
                var hotelImg = {
                    hotel_img_id: results[i].hotel_img_id,
                };
                hotelImgArr.push(hotelImg);
                s3DeleteKeys.push({Key: `${results[i].hotel_img_id}`});
            }
            
            let params = {
                Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                Delete: {
                    Objects:
                        s3DeleteKeys
                }
            };
            s3.s3.deleteObjects(params, (errs, data) => {
                if (errs) { 
                    console.log('0-1. Failed to DELETE user hotel imgs from S3 : ' + errs); 
                    return;
                } else {
                    console.log('0-1. Successfully DELETED user hotel imgs from S3');
                }
            });

            db.query(deleteAllUserHotelImgsQuery, userIdData, (error, results) => {
                if (error) { 
                    console.log('0-2. Failed to DELETE user hotel imgs from DB : ' + error); 
                    return;
                } else {
                    console.log('0-2. Successfully DELETED user hotel imgs from DB');
                }
            });
        }
    });

    db.query(getUserProfilePhoto, userIdData, (err, results) => {
        if (err) { 
            console.log('1. Failed to RETRIEVE user profile photo : ' + err);
            return;
        } else {
            console.log('1. Successfully RETRIEVED user profile photo : ');
            if (results[0].img_id) {
                let photoId = results[0].img_id;

                const params = {
                    Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME,
                    Key: `${photoId}`
                };
    
                s3.s3.deleteObject(params, (error, data) => {
                    if (error) { 
                        console.log('1-1. Failed to DELETE profile photo from S3: ' + error); 
                        return;
                    } else {
                        console.log('1-2. Successfully DELETED profile photo from S3: ');
                    }
                });
            } 
        }
    });

    db.query(deleteAccount, userIdData, (err, result) => {
        if (err) {
            console.log('2. Failed to DELETE user account : ' + err);
            return;
        } else {
            console.log('1. Successfully DELETED user account : ');
        }
    });
}

module.exports = { deleteAccout };
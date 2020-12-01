const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

async function deleteAccout(userId) {
    const userIdData = [userId];
    const deleteCommentsQuery = `DELETE FROM COMMENT WHERE user_id=?`;
    const deleteBookingQuery = `DELETE FROM BOOKING WHERE user_id=?`;
    const getAllUserHotelImgs = `SELECT * FROM USER_HOTEL_IMAGE WHERE user_id=?`;
    const deleteAllUserHotelImgsQuery = `DELETE FROM USER_HOTEL_IMAGE WHERE user_id=?`;
    const deleteAllHotelQuery = `DELETE FROM HOTEL WHERE user_id=?`;
    const getUserProfilePhoto = `SELECT * FROM USER_PROFILE_IMAGE WHERE user_id=?`;
    const deleteUserProfilePhoto = `DELETE FROM USER_PROFILE_IMAGE WHERE user_id=?`;
    const deleteAccount = `DELETE FROM USER WHERE user_id=?`;
    var hotelImgArr = [];
    var s3DeleteKeys = [];

    db.query(getAllUserHotelImgs, userIdData, (err, results) => {
        if (err) { 
            console.log('0. Failed to RETRIEVE user hotel imgs : ' + err); 
            return;
        } else {
            console.log('0. Successfully RETRIEVED user hotel imgs');
            for (let i = 0; i < results.length; i++) {
                var hotelImg = {
                    hotel_img_id: results[i].hotel_img_id,
                    hotel_id: results[i].hotel_id,
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
            s3.s3.deleteObjects(params, (errs3, data) => {
                if (errs3) { 
                    console.log('0-1. Failed to DELETE user hotel imgs from S3 : ' + errs3); 
                    return;
                } else {
                    console.log('0-1. Successfully DELETED user hotel imgs from S3');

                    db.query(deleteAllUserHotelImgsQuery, userIdData, (errDB, resultsDB) => {
                        if (errDB) { console.log('0-2. Failed to DELETE user hotel imgs from DB : ' + errs3); }
                        else {
                            console.log('0-2. Successfully DELETED user hotel imgs from DB');
                        }
                    });
                }
            });
        }
    });

    db.query(deleteCommentsQuery, userIdData, (err, results) => {
        if (err) { 
            console.log('1. Failed to DELETE user comments : ' + err); 
            return;
        } else {
            console.log('1. Successfully deleted user comments');
            return;
        }
    });

    db.query(deleteBookingQuery, userIdData, (err2, results2) => {
        if (err2) { 
            console.log('2. Failed to DELETE user booking history : ' + err2); 
            return;
        } else {
            console.log('2. Successfully deleted user booking history');
            db.query(deleteAllHotelQuery, userIdData, (err3, results3) => {
                if (err3) { 
                    console.log('3. Failed to DELETE Hotels : ' + err3); 
                    return;
                } else {
                    console.log('3. Successfully deleted hotels');
                    return;
                }
            });
        }
    });

    db.query(getUserProfilePhoto, userIdData, (err, results) => {
        if (err) { 
            console.log('4. Failed to RETRIEVE user profile photo : ' + err);
            return;
        } else {
            console.log('4. Successfully RETRIEVED user profile photo : ');
            if (results[0].img_id) {
                let photoId = results[0].img_id;

                const params = {
                    Bucket: process.env.AWS_USER_PROFILE_BUCKET_NAME,
                    Key: `${photoId}`
                };
    
                s3.s3.deleteObject(params, (error, data) => {
                    if (error) { 
                        console.log('5. Failed to DELETE profile photo from S3: ' + error); 
                        return;
                    } else {
                        console.log('5. Successfully DELETED profile photo from S3: ');

                        db.query(deleteUserProfilePhoto, userIdData, (err2, results2) => {
                            if (err2) { console.log('6. Failed to DELETE user profile photo from DB : ' + err2); } 
                            else { console.log('6. Successfully DELETED user profile photo from DB'); }
                            return;
                        });
                    }
                    db.query(deleteAccount, userIdData, (err3, results3) => {
                        if (err3) { console.log('7. Failed to DETETE user account from DB : ' + err3); }
                        else {
                            console.log('7. Successfully DELETED user account from DB');
                        }
                    });
                });
            } else {
                db.query(deleteAccount, userIdData, (err3, results3) => {
                    if (err3) { console.log('7. Failed to DETETE user account from DB : ' + err3); }
                    else {
                        console.log('7. Successfully DELETED user account from DB');
                    }
                });
            }
        }
    });
}

module.exports = { deleteAccout };
const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const multer = require('../../utilities/multer');
const AWS = require('aws-sdk');
const s3 = require('../../utilities/s3');
const imageHelper = require('../../modules/profilePhotoHelper');
const trimCityNameHelper = require('../../modules/trimCityNameHelper');
const hotelRetrieveHelper = require('../../modules/hotelRetrieveHelper');
const db = require('../../utilities/db');

router.get('/user/review/:bookingId/new', authMW.isLoggedIn, authMW.isAbleToWriteReview, (req, res) => {
    const isThisAPI = 1;
    let currentUserId = req.session.user_id;
    let currentBookingId = req.params.bookingId;
    // check if it is from api
    const isHotelFromAPI = `SELECT hotel.isAPI 
                            FROM BOOKING AS booking 
                            INNER JOIN HOTEL AS hotel 
                            ON hotel.hotel_id = booking.hotel_id 
                            WHERE booking.booking_id=?`;
    const GetHotelFromAPI = `SELECT * 
                            FROM BOOKING AS booking 
                            INNER JOIN HOTEL AS hotel 
                            ON hotel.hotel_id = booking.hotel_id 
                            WHERE booking.booking_id=?`;
    const GetHotelFromDB = `SELECT *
                            FROM BOOKING AS booking
                            INNER JOIN HOTEL AS hotel
                            ON hotel.hotel_id = booking.hotel_id
                            INNER JOIN USER_HOTEL_IMAGE AS hotelImage
                            ON booking.hotel_id = hotelImage.hotel_id
                            WHERE booking.booking_id=?
                            LIMIT 1; `;
    db.query(isHotelFromAPI, currentBookingId, (isFromApiError, isFromApiResult) => {
        if (isFromApiError) {
            console.log("ERROR: GET REVIEW BOOKING isHotelFromAPI");
            console.log(isFromApiError);
            throw isFromApiError;
        }
        console.log(isFromApiResult);
        console.log(isFromApiResult[0]);
        // console.log(isFromApiResult[0]);
        if (isFromApiResult[0].isAPI) {
            console.log("the data is from api");
            db.query(GetHotelFromAPI, currentBookingId, (getHotelFromAPIError, getHotelFromAPIResult) => {
                if (getHotelFromAPIError) {
                    console.log("ERROR: GET REVIEW BOOKING GetHotelFromAPI");
                    console.log(getHotelFromAPIError);
                    throw getHotelFromAPIError;
                }
                let hotelApiObj = {
                    booking_id: getHotelFromAPIResult[0].booking_id
                ,   booking_date: getHotelFromAPIResult[0].booking_date
                ,   booking_price: getHotelFromAPIResult[0].booking_price
                ,   user_id: getHotelFromAPIResult[0].user_id
                ,   hotel_id: getHotelFromAPIResult[0].hotel_id
                ,   check_in_date: getHotelFromAPIResult[0].check_in_date
                ,   check_out_date: getHotelFromAPIResult[0].check_out_date
                ,   hotel_name: getHotelFromAPIResult[0].hotel_name
                ,   country: getHotelFromAPIResult[0].country
                ,   city: getHotelFromAPIResult[0].city
                ,   address: getHotelFromAPIResult[0].address
                ,   api_hotel_id: getHotelFromAPIResult[0].api_hotel_id
                };
                console.log(hotelApiObj);
                res.render('pages/review/reviewNewApiHotel', {hotelApiObj:hotelApiObj});
            });
        } else {
            db.query(GetHotelFromDB, [currentBookingId], async (getHotelFromDBError, getHotelFromDBResult) => {
                if (getHotelFromDBError) {
                    console.log("ERROR: RENDERING WRITE REVIEW PAGE FOR HOTEL DB");
                    console.log(getHotelFromDBError);
                    throw getHotelFromDBError;
                }
                let params = {
                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
                    Key: `${getHotelFromDBResult[0].hotel_img_id}`
                };
                let hotel_db_image_data = await s3.s3.getObject(params).promise();
                let hotel_db_image = hotel_db_image_data.Body;
                let buffer = Buffer.from(hotel_db_image);
                let base64String = buffer.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,' + base64String;
                let hotelDBObj = {
                    booking_id: getHotelFromDBResult[0].booking_id
                ,   booking_date: getHotelFromDBResult[0].booking_date
                ,   booking_price: getHotelFromDBResult[0].booking_price
                ,   user_id: getHotelFromDBResult[0].user_id
                ,   hotel_id: getHotelFromDBResult[0].hotel_id
                ,   check_in_date: getHotelFromDBResult[0].check_in_date
                ,   check_out_date: getHotelFromDBResult[0].check_out_date
                ,   hotel_name: getHotelFromDBResult[0].hotel_name
                ,   country: getHotelFromDBResult[0].country
                ,   city: getHotelFromDBResult[0].city
                ,   address: getHotelFromDBResult[0].address
                ,   imageDOM:imageDOM
                }
                console.log("the data is not from api");
            res.render('pages/review/reviewNewDBHotel', {hotelDBObj:hotelDBObj});
            });
            
        }
    });
});

router.post('/user/review', authMW.isLoggedIn, (req, res) => {
    const addingCommentToDBQuery = `INSERT INTO COMMENT (rating, comment_date, comment_content, user_id, hotel_id, booking_id) VALUES (?, ?, ?, ?, ?, ?)`;
    let rating = Number(req.body.rating);
    let comment_date = new Date();
    let comment_content_before_trim = req.body.reviewComment.trim();
    let comment_content_after_trim = trimCityNameHelper.isInputEmpty(comment_content_before_trim);
    let user_id = req.session.user.user_id;
    let hotel_id = req.body.hotel_id;
    let booking_id = req.body.booking_id;
    let query_data = [rating, comment_date, comment_content_after_trim, user_id, hotel_id, booking_id];
    console.log(query_data);
    db.query(addingCommentToDBQuery, query_data, (addingCommentApiError, addingCommentApiResult) => {
        if (addingCommentApiError) {
            console.log("ERROR: ADDING COMMENT API ERROR");
            console.log(addingCommentApiError);
            throw addingCommentApiError;
        }
        console.log("AFFECTED ROW: ", addingCommentApiResult.affectedRows);
        res.redirect('/user');
    });
});

module.exports = router;

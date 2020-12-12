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

// TODO: Create Booking Cancel Request
// @ PARAM booking id
router.get('/user/cancelbooking/:id', (req, res) => {
    let booking_id_to_cancel = req.params.id;
    let userSession_user_id = req.session.user.user_id;
    let userSession_username = req.session.user.username;
    const retrieveHotel_Booking_data = `SELECT *
                                        FROM BOOKING AS booking
                                        INNER JOIN HOTEL AS hotel
                                        ON booking.hotel_id = hotel.hotel_id
                                        WHERE booking.user_id=? AND booking.booking_id=?`;
    db.query(retrieveHotel_Booking_data, [userSession_user_id, booking_id_to_cancel], (retrieveDataCanecelBookingError, retrieveDataCancelBookingResult) => {
        if (retrieveDataCanecelBookingError) {
            console.log("ERROR: USER REVIEW retrieve data to render for booking cancel");
            console.log(retrieveDataCanecelBookingError);
            throw retrieveDataCanecelBookingError;
        }
        console.log(retrieveDataCancelBookingResult);
        let retrieved_bookingCancelData = retrieveDataCancelBookingResult[0];
        if (retrieved_bookingCancelData.api_hotel_id == null || typeof(retrieved_bookingCancelData.api_hotel_id) == 'undefined') {
            // hotels from database
            let hotel_db_id = retrieved_bookingCancelData.hotel_id;
            const get_hotel_db_image = `SELECT * FROM USER_HOTEL_IMAGE WHERE hotel_id = ?`;
            db.query(get_hotel_db_image, [hotel_db_id], async (retrieveHotelImageError, retrieveHotelImageResult) => {
                if (retrieveHotelImageError) {
                    console.log("ERROR: USER REVIEW, Booking cancel retrieve Image ");
                    console.log(retrieveHotelImageError);
                    throw retrieveHotelImageError;
                }
                let hotelImageArray = [];
                let paramsForS3 = {
                    Bucket: process.env.AWS_HOTEL_BUCKET_NAME
                ,   Key: `${retrieveHotelImageResult[0].hotel_img_id}`
                };
                let hotel_image_data = await s3.s3.getObject(paramsForS3).promise();
                let hotel_image = hotel_image_data.Body;
                let imageBuffer = Buffer.from(hotel_image);
                let imageButterToString64 = imageBuffer.toString('base64');
                let imageDOM = 'data:image/jpeg;base64,' +imageButterToString64;
                hotelImageArray.push(imageDOM);
                res.status(200).render('pages/booking/bookingCancelRequestFromUser', {
                    retrieved_bookingCancelData:retrieved_bookingCancelData
                ,   hotelImageArray:hotelImageArray
                ,   userSession_username:userSession_username
                });
            });
        } else {
            // hotels that are not from database
            res.status(200).render('pages/booking/bookingCancelRequestFromUser', {
                retrieved_bookingCancelData:retrieved_bookingCancelData
            ,   userSession_username:userSession_username
            });
        }
    });
});

router.post('/user/cancelBooking', (req, res) => {
    let cancelBooking_formData = req.body;
    let cancelBooking_formData_reason = cancelBooking_formData.cancelRequest_reason;
    const initial_request = "Sent";
    let filter_cancel_booking_formData_reason = trimCityNameHelper.isInputEmpty(cancelBooking_formData_reason);
    let target_booking_id = cancelBooking_formData.booking_id;
    let cancel_request_date = new Date();
    console.log(filter_cancel_booking_formData_reason);
    console.log(cancelBooking_formData);
    const insertInto_Booking_Cancel = `INSERT INTO BOOKING_CANCEL (booking_cancel_reason, booking_id, cancel_status, request_date) VALUES (?, ?, ?, ?)`;
    db.query(insertInto_Booking_Cancel, [filter_cancel_booking_formData_reason, target_booking_id, initial_request, cancel_request_date], (insertCancelBookingError, insertCancelBookingResult) => {
        if (insertCancelBookingError) {
            console.log("ERROR: USER REVIEW insert cancel booking request");
            console.log(insertCancelBookingError);
            throw insertCancelBookingError;
        }
        console.log("AFFECTED ROW");
        console.log(insertCancelBookingResult.affectedRows);
        res.status(200).redirect('/user');
    });
});

module.exports = router;

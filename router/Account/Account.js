const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');

router.get('/account', (req, res) => {
    res.send('hello: user account page where user sees there posts and make actions post, edit, and delete');
});

router.get('/account/new', (req, res) => {
    res.send('hello: Posting new Hotel');
});

router.get('/account/:id', (req, res) => {
    res.send('hello: detail of the user posted hotel');
});

router.get('/account/:id/edit', (req, res) => {
    res.send('hello: render edit page of posted hotel');
});

// delete action method
router.delete('/account/:id', async (req, res) => {
    let userId = req.params.id;
    console.log('/accout/' + userId);
    const anyCommentBookingData = [userId];
    const anyCommentsQuery = `DELETE FROM COMMENT WHERE user_id=?`;
    const anyBookingQuery = `DELETE FROM BOOKING WHERE user_id=?`;
    const getAllUserHotelImgs = `SELECT * FROM USER_HOTEL_IMAGE WHERE user_id=?`;

    // USER 14
    // STEP 1
    // IF USER HAD POSTED ANY HOTEL
    // 1. COMMENT
    // 2. BOOKING
    // 3. DELETE ALL USER_HOTEL_IMAGE (S3) and DB
    // 4. DELETE ALL HOTEL
    // 5. PROFILE IMAGE
    // 6. USER
    res.redirect('/');
});

// router.delete('/become-host/hotel/:id', async (req, res) => {
//     let target_hotel_id = req.params.id;
//     console.log(target_hotel_id);
//     const SELECT_IMAGE_QUERY = `SELECT hotel_img_id
//                                 FROM USER_HOTEL_IMAGE
//                                 WHERE hotel_id=?`;
//     const DELETE_HOTE_IMAGE_QUERY = `DELETE 
//                                      FROM USER_HOTEL_IMAGE
//                                      WHERE hotel_id=?`;
//     const DELETE_HOTEL_QUERY = `DELETE
//                                 FROM HOTEL
//                                 WHERE hotel_id=?`;
//     let deleteS3Objects = [];
//     db.query(SELECT_IMAGE_QUERY, target_hotel_id , async (error, selectResults) => {
//         if (error) {
//             console.log("ERROR: SELECT ITEMS TO DELETE");
//             console.log(error);
//             throw error;
//         }
//         // LOOP to generate KEY VALUE for S3 Delete
//         for (let i = 0; i < selectResults.length; i++) {
//             deleteS3Objects.push({Key: `${selectResults[i].hotel_img_id}`})
//         }
//         // console.log(deleteS3Objects);
//         console.log("Start to Delete on S3");
//         let options = {
//             Bucket: process.env.AWS_HOTEL_BUCKET_NAME
//         ,   Delete: {
//                 Objects:
//                     deleteS3Objects
//             }
//         };
//         console.log(deleteS3Objects);
//         s3.s3.deleteObjects(options, (errS3, data) => {
//             if (errS3) {
//                 console.log("ERROR: S3 Image Delete");
//                 console.log(errS3);
//                 throw errS3;
//             }
//             console.log("======= AWS S3 Successed ========");
//             console.log("======= Deleted From S3 =========");
//         });
//         // Delete Hotel Image data from DB
//         db.query(DELETE_HOTE_IMAGE_QUERY, target_hotel_id, async(deleteError, deleteReulstRows) => {
//             if (deleteError) {
//                 console.log("ERROR: DELETE IMAGES FROM DATABASE");
//                 console.log(deleteError);
//                 throw deleteError;
//             }
//             console.log('DELETE IMAGES ROWS AFFECTED: ',deleteReulstRows.affectedRows);
//             // Delete the hotel data from DB
//             db.query(DELETE_HOTEL_QUERY, target_hotel_id, async(deleteHotelError, deleteHotelResult) => {
//                 if (deleteHotelError) {
//                     console.log("ERROR: DELETE HOTEL FROM DATABASE");
//                     console.log(deleteHotelError);
//                     throw deleteHotelError;
//                 }
//                 console.log('Affected ROWS for Delete Hotel Data', deleteHotelResult.affectedRows);
//                 res.redirect('/');
//             });
//         });
//     });
// });

module.exports = router;
const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

function getUserHotelPostInfo(user) {
    if (!user.is_host) {
        return;
    } else {
        // `SELECT hotel_name, hotel_price, country, city, address, hotel_img_id 
        // FROM HOTEL hotel 
        // INNER JOIN USER_HOTEL_IMAGE hotel_Image
	    // ON (hotel.hotel_id = hotel_Image.hotel_id AND hotel.user_id = hotel_Image.user_id)`;
        var userHotelPostArr = [];
        let userHotelPostImgArr = [];
        let getHotelInfoQuery = "SELECT * FROM `css-capstone`.HOTEL WHERE `user_id` = ?";
        let getHotelInfoData = [user.user_id];
        let getHotelImagesQuery = "SELECT * FROM `css-capstone`.USER_HOTEL_IMAGE WHERE `hotel_id` = ?";
        db.query(getHotelInfoQuery, getHotelInfoData, (err, results, fields) => {
            if (err) console.log('Failed to retrieve hotel info from user');
            else {
                var i;
                for (i = 0; i < results.length; i++) {
                    userHotelPostArr[i] = results[i];
                }
                //console.log(userHotelPostArr);
                console.log(userHotelPostArr[0]);
                return userHotelPostArr;
                    // db.query(getHotelImagesQuery, [userHotelPostArr[i].hotel_id], (error, img_results, img_fields) => {
                    //     if (error) console.log('Failed to retrieve hotel image info from user');
                    //     else {
                    //         //userHotelPostArr[i].hotel_imgs = img_results[0];
                    //     }
                    // });
                //console.log(userHotelPostArr);
            }
        });
        
    }
}

module.exports = { getUserHotelPostInfo };
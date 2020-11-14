const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

async function getUserHotelPostInfo(user) {
    if (!user.is_host) {
        return;
    } else {
        let userHotelPostArr = [];
        let getHotelInfoQuery = "SELECT * FROM `css-capstone`.HOTEL WHERE `user_id` = ?";
        let getHotelInfoData = [user.user_id];
        db.query(getHotelInfoQuery, getHotelInfoData, (err, results, fields) => {
            if (err) console.log('Failed to retrieve hotel info from user');
            else {
                var i;
                for(i = 0; i < results.length; i++) {
                    userHotelPostArr[i] = results[i];
                }
                return userHotelPostArr;
            }
        });
    }
}

module.exports = { getUserHotelPostInfo };
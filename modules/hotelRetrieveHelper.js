const dotenv = require('dotenv');
const s3 = require('../utilities/s3');
const db = require('../utilities/db');

async function getUserHotelPostImg(photoId) {
    const imgData = await getImage(photoId);
    const convertedImg = encode(imgData.Body);
    return 'data:image/jpeg;base64,' + convertedImg;     
}

async function getImage(key) {
    var params = {
        Bucket: process.env.AWS_HOTEL_BUCKET_NAME,
        Key: `${key}`
    }
    return await s3.s3.getObject(params).promise();
};

function encode(data) {
    let buf = Buffer.from(data);
    let base64 = buf.toString('base64');
    return base64;
}

module.exports = { getUserHotelPostImg };
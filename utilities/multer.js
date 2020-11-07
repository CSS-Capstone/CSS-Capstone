const multer = require('multer');

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '');
    }
});

// single image is a key
const upload = multer({ storage }).single('imageFile');
// mulitple
const upload_multiple = multer({storage:storage}).array('hotelImages');

module.exports = {upload, upload_multiple};
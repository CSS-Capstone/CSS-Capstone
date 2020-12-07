const express = require('express');
const router = express.Router();
const authMW = require('../../modules/auth');
const dotenv = require('dotenv');
const multer = require('../../utilities/multer');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');
const uuid = require('uuid');

router.get('/developer', authMW.isLoggedIn, async (req, res) => {
    console.log('Fetch request: /developer/' + req.session.user.user_id);

    res.render('pages/developer/developer', {user: req.session.user});
});

module.exports = router;
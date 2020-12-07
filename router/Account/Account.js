const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const db = require('../../utilities/db');
const s3 = require('../../utilities/s3');

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
    console.log('Fetch request: DELETE /accout/' + userId);
    
    const queryHelper = require('../../modules/accountHelper');
    await queryHelper.deleteAccout(userId).then((val) => {
        if (val) {
            console.log(val);
        }
    });
    return res.redirect('/logout');
});


module.exports = router;
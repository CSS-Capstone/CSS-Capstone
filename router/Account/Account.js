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

// put method after edit the hotel
router.put('/account/:id', (req, res) => {
    res.send('hello: I am the put page of after edit (save edited data happends here');
});

// redner delete hotel page
router.get('/account/:id/delete', (req, res) => {
    res.send('hello: I am deleting page for hotel');
})

// delete action method
router.delete('/account/', (req, res) => {
    res.send('hello: I am the action method after user clicked delete');
});

module.exports = router;
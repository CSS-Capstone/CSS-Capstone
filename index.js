const express = require('express');
const path = require('path');
const app = express();
const mysql = require("mysql");
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const passport = require('passport');
const facebookStrategy = require('passport-facebook').Strategy;
// const cookieSession = require('cookie-session');
// const expressSession = require('express-session'); 
const cookieParser = require('cookie-parser');
const trim = require('./modules/trim-city');
const stripe = require('stripe')(`sk_test_51HeDoXDKUeOleiaZmD7Cs7od48G3QKEFJULAQh4Iz6bDh5UNREhDafamLTfqfxfVH2ajagBLpbVZpet2GYIXzcmM00YWS0Bvi4`);
const url = require('url');
require('./passport-google-setup');
require('./passport-facebook-setup');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("stylesheets"));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// app.use(session({secret:"this is your secret key"}));
app.use(cookieParser());
// app.use(cookieSession({
//     name: 'tuto-session',
//     keys: ['key1', 'key2']
// }));
// ===============================================
// ============ Database connection ==============
// ===============================================

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// const isLoggedIn = (req, res, next) => {
//     if (req.user) {
//         next();
//     }
//     else {
//         res.sendStatus(401);
//     }
// }

// db.connect((err) => {
//     if (err) {
//         console.error('Database connection failed!! ' + err.stack);
//         return;
//     }

//     console.log('Connected to database!!');
// });

// db.end();

// mySQLConnection.connect(async function(err) {
//     if (err) {
//         console.log(err);
//         throw err;
//     }
//     console.log("connected to db");
//     console.log()
    
//     // sample insert
//     // mySQLConnection.query('INSERT INTO people (name, age, address) VALUES (?, ?, ?)', ['Larry', '41', 'California, USA'], async function(error, result) {
//     //     if (error) {
//     //         console.log(error);
//     //         throw error;
//     //     }
//     //     console.log("1 record inserted");
//     // });
//     mySQLConnection.end();
// });
// end of database

app.get('/', (req, res) => {
    res.render('pages/index');
});

// index user input to test page

app.post('/', (req, res) => {
    var searchedData = req.body;
    searchedData.location = trim.trimCity(JSON.stringify(searchedData.location));
    var locationStr = searchedData.location;
    res.redirect(`/hotel/searched/${locationStr}`);
});

// ===============================================
// start of facebook
// ===============================================

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook/failed' }),
    function(req, res) {
        // console.log(req.user);

        // =============
        // first way to do it
        // =============

        // res.redirect(url.format({
        //     pathname: "/good",
        //     query: req.user
        // }));

        // =============
        // second way to do it
        // =============
        
        res.cookie("profile", req.user);
        //this will be different in locale in the JSON data
        res.redirect('/facebook/good');
    });

app.get('/facebook/good', (req, res) => {
    // console.log(req.user);
    let data = req.cookies.profile;
    console.log(data);
    res.send("Hello, facebook auth works");
});

app.get('/facebook/failed', (req, res) => {
    res.send("Hello, facebook auth fails");
});

app.get('/facebook/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
});

// ===============================================
// end of facebook
// ===============================================

// ======================================================

// ===============================================
// start of google
// ===============================================
app.get('/google/failed', (req, res) => {
    res.send('You Failed to log in!');
});

//need to figure out how to get req.user JSON data
//from /google/callback get request
app.get('/google/good', (req, res) => {
    // =============
    // first way to do it
    // =============

    // console.log(req.query);

    // =============
    // second way to do it
    // =============

    // console.log(req.cookies);
    var data = req.cookies.profile;
    // res.send(`Hello!! Google OAuth is a success!!`);
    // res.send(`Hello, ${req.cookies.profile.displayName}!!!`);
    res.render('pages/tryGoogle', {
        username: req.cookies.profile.displayName,
        picture: req.cookies.profile.photos[0].value,
        email: req.cookies.profile.emails[0].value
    })
});

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/google/failed' }),
    function(req, res) {
        // console.log(req.user);

        // =============
        // first way to do it
        // =============

        // res.redirect(url.format({
        //     pathname: "/good",
        //     query: req.user
        // }));

        // =============
        // second way to do it
        // =============

        res.cookie("profile", req.user);
        //this will be different in locale in the JSON data
        res.redirect('/good');
    });

app.get('/google/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

// ===============================================
// end of google
// ===============================================

app.get('/about', (req, res) => {
    res.render('pages/about');
})

app.get('/faq', (req, res) => {
    res.render('pages/FAQ')
});

// =============================
// Things may change============
// =============================

// =============================
// Basic Hotel Finder===========
// =============================

app.get('/hotel/search', (req, res) => {
    res.send('hello: main Search');
});


// ====================================
// Park ===============================
// ====================================
app.get('/hotel/searched/:cityname', async (req, res) => {
    // API KEY will be hide to env
    const HOTEL_API_KEY = `297461`;
    const theKey = `AIzaSyDiccr3QeWOHWRfSzLrNyUzrRX_I1bcZa4`;
    // Currently limited to 3
    const HOTEL_API_URL = `http://engine.hotellook.com/api/v2/lookup.json?query=${req.params.cityname}&lang=en&lookFor=both&limit=5&token=${HOTEL_API_KEY}`
    try {
        const response = await fetch(HOTEL_API_URL);
        const hoteldata = await response.json();
        if (hoteldata.status !== 'ok') {
            throw 'API Satus is bad';
        }
        // ========== Filter Data ==================
        // 1. get country name of the location
        const fullCountryName = hoteldata.results.locations[0].countryName;
        //console.log(`From Express server: ${fullCountryName}`);
        // 2. filter hotel data based on the country name 
        // so all hotel are in united states
        const filterHotelData = hoteldata.results.hotels.filter(s => s.locationName.indexOf(fullCountryName) >= 0);
        const mapHotelData = filterHotelData.map(filteredHotel => {
            const filterObj = {
                id: filteredHotel.id
            ,   name: filteredHotel.label
            ,   location: {
                    lat: filteredHotel.location.lat
                ,   lon: filteredHotel.location.lon
                }
            };
            return filterObj;
        });
        // console.log(mapHotelData);
        //console.log(mapHotelData);
        const theHotelData = {
            hoteldata: hoteldata
        ,   filterHotelData: filterHotelData
        ,   mapHotelData: mapHotelData
        }
        
        res.render('pages/hotel/hotelSearched', {theHotelData: theHotelData, theKey: theKey});
    } catch(err) {
        console.log(err);
        res.send(err);
    }
    
})

app.get('/hotel/searched/detail/:id', async (req, res) => {
    const StripePublicKey = process.env.STRIPE_PUBLIC_KEY;
    const AirQualityKey = process.env.AIR_QUALITY_KEY;
    const hotelId = req.params.id;
    const hotelLabel = req.query.label;
    const hotelFullName = req.query.fullname;
    const hotelScore = req.query.score;
    const hotelCoordLat = req.query.lat;
    const hotelCoordLon = req.query.lon;
    const hotelLocationName = req.query.locationName;
    const weatherAPIURL = `http://api.openweathermap.org/data/2.5/weather?lat=${hotelCoordLat}&lon=${hotelCoordLon}&appid=${process.env.WEATHER_API_KEY}`;
    const weatherDataResponse = await fetch(weatherAPIURL);
    const weatherData = await weatherDataResponse.json();
    const airqualityAPIURL = `https://api.weatherbit.io/v2.0/current/airquality?lat=${hotelCoordLat}&lon=${hotelCoordLon}&key=${process.env.AIR_QUALITY_KEY}`;
    const air_qualityDataReponse = await fetch(airqualityAPIURL);
    const airQualityData = await air_qualityDataReponse.json();
    // console.log(weatherData);
    console.log(airQualityData);
    const hotelObj = {
        hotelId
    ,   hotelLabel
    ,   hotelFullName
    ,   hotelScore
    ,   hotelCoordLat
    ,   hotelCoordLon
    ,   hotelLocationName
    };
    res.render('pages/hotel/hotelSearchedDetail', {
        hotelObj: hotelObj, 
        StripePublicKey:StripePublicKey, 
        weatherData:weatherData,
        airQualityData: airQualityData
    });
});

app.get('/hotel/searched/detail/:id/payment', (req, res) => {
    res.render('pages/booking/bookConfirm');
});

app.post('/hotel/searched/detail/:id/payment', (req, res) => {
    // console.log(res.status());
    const paymentData = req.body;
    const passingData = req.body.body;
    const hotelPrice = Number(paymentData.body.totalPrice * 100);
    console.log(hotelPrice);
    console.log(paymentData);
    // charge on stripe
    stripe.customers.create({
        email: paymentData.email
    ,   source: paymentData.token
    }).then(customer => stripe.charges.create({
        customer: customer.id
    ,   currency: 'usd'
    ,   amount: hotelPrice
    })).then(function() {
        res.render('pages/booking/bookConfirm', {paymentData:paymentData});
    });
});
// ====================================
// End of Park ========================
// ====================================


app.get('/hotel/search/:id/book', (req, res) => {
    res.send('hello: Searched Hotel Booking');
});

app.get('/hotel/search/:id/book', (req, res) => {
    res.send('hello: Searched Hotel Booking Confirmation');
});

// =============================
// Register && Login============
// =============================
app.get('/login', (req, res) => {
    res.render('pages/sign_in');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.get('/reset_password', (req, res) => {
    res.render('pages/')
})


// =============================
// Basic Hotel CRUD=============
// =============================
app.get('/users', (req, res) => {
    res.render('pages/users');
});

app.get('/account', (req, res) => {
    res.send('hello: user account page where user sees there posts and make actions post, edit, and delete');
});

app.get('/account/new', (req, res) => {
    res.send('hello: Posting new Hotel');
});

app.get('/account/:id', (req, res) => {
    res.send('hello: detail of the user posted hotel');
});

app.get('/account/:id/edit', (req, res) => {
    res.send('hello: render edit page of posted hotel');
});

// put method after edit the hotel
app.put('/account/:id', (req, res) => {
    res.send('hello: I am the put page of after edit (save edited data happends here');
});

// redner delete hotel page
app.get('/account/:id/delete', (req, res) => {
    res.send('hello: I am deleting page for hotel');
})

// delete action method
app.delete('/account/', (req, res) => {
    res.send('hello: I am the action method after user clicked delete');
});

app.get("*", (req, res) => {
    res.send("hello: make-up link not in our domain");
});

const port = 8080;
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    // console.log(process.title);
});

// for testing
module.exports = server;

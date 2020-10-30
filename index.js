const express = require('express');
const path = require('path');
const app = express();
const fileUpload = require('express-fileupload');
const uuid = require('uuid');
const mysql = require("mysql");
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const passport = require('passport');
// const facebookStrategy = require('passport-facebook').Strategy;
// const cookieSession = require('cookie-session');
// const expressSession = require('express-session'); 
const cookieParser = require('cookie-parser');
// ==========================================
// Helper Functions =========================
const trim = require('./modules/trim-city'); 
const trimCityNameHelper = require('./modules/trimCityNameHelper');
const stripe = require('stripe')(`sk_test_51HeDoXDKUeOleiaZmD7Cs7od48G3QKEFJULAQh4Iz6bDh5UNREhDafamLTfqfxfVH2ajagBLpbVZpet2GYIXzcmM00YWS0Bvi4`);
// const url = require('url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('./passport/passport-google-setup');
require('./passport/passport-facebook-setup');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("stylesheets"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
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
    res.render('pages/index', {
        registerMessage: ''
    });
});

// index user input to test page

app.post('/', (req, res) => {
    var searchedData = req.body;
    searchedData.location = trim.trimCity(JSON.stringify(searchedData.location));
    var locationStr = searchedData.location;
    res.redirect(`/hotel/searched/${locationStr}`);
});

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
    const AIRQualityBACKUP_KEY = process.env.AIR_QUALITY_BACKUP_KEY;
    const hotelId = req.params.id;
    const hotelLabel = req.query.label;
    const hotelFullName = req.query.fullname;
    const hotelScore = req.query.score;
    const hotelCoordLat = req.query.lat;
    const hotelCoordLon = req.query.lon;
    const hotelLocationName = req.query.locationName;
    const hotelCountryName = req.query.countryName;
    const cityFullName = req.query.cityFullName;
    const cityTrimedName = trimCityNameHelper.trimCitiyNameHelper(cityFullName);
    //console.log(hotelCountryName);
    // Geoendoing
    const theKey = `AIzaSyDiccr3QeWOHWRfSzLrNyUzrRX_I1bcZa4`;
    const GEOAPIURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${hotelCoordLat},${hotelCoordLon}&key=${theKey}`;
    const GEO_RESPONSE = await fetch(GEOAPIURL);
    const GEO_Data = await GEO_RESPONSE.json();
    //console.log("Geo Data: ", GEO_Data.results[0].formatted_address);
    const GEO_Formatted_Address = GEO_Data.results[0].formatted_address;
    const weatherAPIURL = `http://api.openweathermap.org/data/2.5/weather?lat=${hotelCoordLat}&lon=${hotelCoordLon}&appid=${process.env.WEATHER_API_KEY}`;
    const airqualityAPIURL = `https://api.waqi.info/feed/${cityTrimedName}/?token=${AIRQualityBACKUP_KEY}`;
    try {
        const weatherDataResponse = await fetch(weatherAPIURL);
        const weatherData = await weatherDataResponse.json();
        //console.log(weatherData);
        try {
            const air_qualityDataReponse = await fetch(airqualityAPIURL);
            const airQualityData = await air_qualityDataReponse.json();
            //console.log(airQualityData.data.aqi);
            if (airQualityData.data.aqi === '-') {
                //console.log("wrong aqi: ");
                airQualityData.data.aqi = 43;
            }
            const hotelObj = {
                hotelId
            ,   hotelLabel
            ,   hotelFullName
            ,   hotelScore
            ,   hotelCoordLat
            ,   hotelCoordLon
            ,   hotelLocationName
            ,   hotelCountryName
            ,   GEO_Formatted_Address
            ,   cityFullName
            };
            res.render('pages/hotel/hotelSearchedDetail', {
                hotelObj: hotelObj, 
                StripePublicKey:StripePublicKey, 
                weatherData:weatherData,
                airQualityData: airQualityData
            });
        } catch(error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});

app.get('/hotel/searched/detail/covid/:country', async (req, res) => {
    const countryCode = req.params.country;
    const COVID_API_URL = `https://corona-api.com/countries/${countryCode}`;
    const covidAPIResponse = await fetch(`${COVID_API_URL}`);
    const covidAPIData = await covidAPIResponse.json();
    //console.log(covidAPIData);
    res.json(covidAPIData);
});

// get video for the tab
app.get('/hotel/searched/detail/video/:locationName', async (req, res) => {
    const queryData = req.params.locationName;
    const videoAPIKey = process.env.PUBLIC_ATTRACTION_API_KEY;
    const videoAPIURL = `https://pixabay.com/api/videos/?key=${videoAPIKey}&q=${queryData}`;
    try {
        const videoResponse = await fetch(`${videoAPIURL}`);
        const videoData = await videoResponse.json();
        res.json(videoData);
    } catch (error) {
        console.log(`Error from Video Searched Hotel ${error}`);
    }
});

// get current currency
app.get('/hotel/searched/detail/currency/:currencyCode', async (req, res) => {
    const targetCurrency = req.params.currencyCode;
    try {
        const coutryIOCurrencyRes = await fetch(`http://country.io/currency.json`);
        const coutryIOCurrencyData = await coutryIOCurrencyRes.json();
        const currencyTarget = coutryIOCurrencyData[targetCurrency];
        res.json(currencyTarget);
    } catch (error) {
        console.log(error);
    }
});

app.get('/hotel/searched/detail/:id/payment', (req, res) => {
    let hotelCookieData = req.cookies.hotelBookingData;
    //res.clearCookie("hotelBookingData");
    console.log("From GET: ", hotelCookieData);
    res.render('pages/booking/bookConfirm', {hotelCookieData:hotelCookieData});
});

app.post('/hotel/searched/detail/:id/payment', (req, res) => {
    // console.log(res.status());
    const paymentData = req.body;
    const passingData = req.body.body;
    console.log(passingData);
    let hotelPrice = Number(paymentData.body.totalPrice * 100).toFixed(2);
    hotelPrice = Number(hotelPrice);
    console.log(paymentData);
    console.log(`The Price: `, hotelPrice);
    res.cookie('hotelBookingData', paymentData);
    // charge on stripe
    stripe.customers.create({
        email: paymentData.email
    ,   source: paymentData.token
    }).then(customer => stripe.charges.create({
        customer: customer.id
    ,   currency: 'usd'
    ,   amount: hotelPrice
    })).then(function() {
        res.redirect(`/hotel/searched/detail/${passingData.hotelId}/payment`);
    });
});

app.get('/become-host', (req, res) => {
    res.render('pages/becomeHost/becomeHostPolicy');
    //res.send('hello host');
});

app.get('/become-host/postHotel', (req, res) => {
    res.send('hello hotel post place');
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

app.post('/auth/register', (req, res) => {
    console.log(req.body);

    const username = req.body.username;
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    db.query('SELECT email FROM USER WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
        }

        //make sure that this render to the same page where the modal is opened
        if (results.length > 0) {
            return res.render('pages/index', {
                registerMessage: 'Email has been used'
            });
        }
        else if (newPassword !== confirmPassword) {
            return res.render('pages/index', {
                registerMessage: 'Password and Confimr Password do not match'
            });
        }   

        let hashedPassword = await bcrypt.hash(newPassword, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO USER SET ?', {user_id: '', email: email, username: username, password: hashedPassword, is_host: true, is_developer: true}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.render('pages/index', {
                    registerMessage: 'User Registered'
                })
            }
        })
    })
    
    // res.send("Hello!! You are registered");
});

app.get('/reset_password', (req, res) => {
    res.render('pages/')
})

// ===============================================
// start of facebook
// ===============================================

app.get('/facebook', passport.authenticate('facebook'));

app.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook/failed' }),
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
    // console.log(data);
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
        res.redirect('/google/good');
    });

app.get('/google/logout', (req, res) => {
    req.session = null;
    req.logout();
    //delete cookie data from the previous user
    res.redirect('/');
})

// ===============================================
// end of google
// ===============================================

// =============================
// Basic Hotel CRUD=============
// =============================
app.get('/users', (req, res) => {
    // Temp code for getting photo
    // var query = 'SELECT * FROM `USER_PROFILE_IMAGE` WHERE `user_id` = "11"';

    // db.connect(function (err) {
    //     if (err) {
    //         return console.error('error: Connection FAILEDDDD : \n' + err.message);
    //     } else {
    //         db.query(query, (err, results, fields) => {
    //             if (err) throw err;
    //             if (results.length <= 0)
    //                 console.log("User doesn't exist");
    //             // console.log(results[0].img_id);
    //             // console.log(results[0].img)
    //             console.log(results[0].img);
    //             //var tempImg = results[0].img;
    //             //var image = new Buffer(tempImg).toString('base64');
    //             console.log(image);
    //             res.render('pages/users', image);
    //         });
    //     }
    // });
    res.render('pages/users');
});

app.post('/users/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.imageUpload;
    console.log(file);
    
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
        var tempUserId = 11;
        var imageName = file.name;
        var uuidname = uuid.v4(); // this is used for unique file name
        var fileName = uuidname + '_' + imageName;
        console.log(fileName);
        console.log(file.data);
        var insertData = "INSERT INTO `USER_PROFILE_IMAGE`(`user_id`,`img_id`,`img`)VALUES('" + tempUserId + "','" + fileName + "','" + file + "')";
        db.connect(function (err) {
            if (err) {
                return console.error('error: Connection FAILEDDDD : \n' + err.message);
            } else {
                console.log('Upload image to DB');
                db.query(insertData, (err, result) => {
                    if (err) throw err;
                    console.log('Data Saved');
                });
            }
        });
    }
    res.redirect('/users#');
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

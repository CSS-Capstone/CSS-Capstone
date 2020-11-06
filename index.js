const express = require('express');
const session = require('express-session');
// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
// const client  = redis.createClient();
const path = require('path');
const app = express();
const AWS = require('aws-sdk');
const multer = require('multer');
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
const authMW = require('./modules/auth');
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// app.use(session({secret:"this is your secret key"}));
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(session({
    secret: process.env.SESSION_SECRET,
    // store: new redisStore({ host: 'localhost', port: 8080, client: client,ttl : 260}),
    saveUninitialized: true,
    resave: true
}));

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

///////////////////////////////////
// multer to AWS S3 upload logics
///////////////////////////////////
const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '');
    }
});

// single image is a key
const upload = multer({ storage }).single('imageFile');
// mulitple
const upload_multiple = multer({storage:storage}).array('hotelImages');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});

app.get('/', (req, res) => {
    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    res.render('pages/index', {
        registerMessage: '',
        loginMessage: '',
        resetPasswordMessage: '',
        modalStyle: '',
        stayInWhere: '',
        formDataLogin: userDetailLogin,
        formDataRegister: userDetailRegister
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

app.get('/become-host', authMW.isLoggedIn, (req, res) => {
    res.render('pages/becomeHost/becomeHostPolicy');
    //res.send('hello host');
});

app.get('/become-host/postHotel/new', authMW.isLoggedIn, (req, res) => {
    let loggedInUserData = req.session.user;
    res.render('pages/hostHotel/hotelPost', {loggedInUserData:loggedInUserData});
});

app.post('/become-host/postHotel', authMW.isLoggedIn, (req, res) => {
    let postedUserID = req.session.user.user_id;
    let hotelPostData = req.body;
    // ==============================
    // HOTEL BASIC DATA =============
    let hotelLabel = hotelPostData.hotelLabel;
    let hotelPrice = hotelPostData.hotelPrice;
    let hotelLocation = hotelPostData.hotelLocation;
    let hotelLocationStreetAddress = hotelPostData.hotel_location_street;
    let hotelLocationTrimmedForDB = trimCityNameHelper.trimCityNameAndCountryName(hotelLocation);
    // Datas to insert DB after trim by using trim helper functions
    // ASSUME USER ID is has a USER ID 14
    let hotelCity = hotelLocationTrimmedForDB[0];
    let hotelCountry = hotelLocationTrimmedForDB[1];
    // CONNECTION WILL BE SEPERATE OUT SOON
    // BASIC DATABASE CONNECTION
    db.connect((error) => {
        if (!error) {
            console.log("Database is Successfully Connected");
        } else {
            console.log("DB connection Failed");
        }
    });
    let insertQuery = "INSERT INTO `css-capstone`.HOTEL SET ?";
    db.query(insertQuery, 
        {hotel_name: hotelLabel, 
        hotel_price: hotelPrice, 
        country: hotelCountry,
        city: hotelCity,
        address: hotelLocationStreetAddress,
        isAPI: false,
        isDeveloper: true,
        user_id: postedUserID}, (err, result) => {
            // callback function
            if (err) {
                console.log(err);
                throw err;
            }
            console.log("Hotel Insert Added Successfully into Database");
            console.log(result);
        });
    req.session.hotelPostData = hotelPostData;
    res.redirect('/become/postHotelImage');
});

app.get('/become/postHotelImage', authMW.isLoggedIn, (req, res) => {
    // CHANGE RETRIEVE DATA FROM DB LATER
    let hotelPostData = req.session.hotelPostData;
    req.session.hotelPostData = null;
    console.log(hotelPostData);
    console.log(`HotelData in Hotel Image: ${hotelPostData}`);
    console.log(hotelPostData);
    res.render('pages/hostHotel/hotelPostImage', {hotelPostData:hotelPostData});
});

app.post('/become-host/postHotelImage', upload_multiple, (req, res) => {
    // console.log(req.files);
    let currentPostingUser = req.session.user;
    let currentPostingUserID = currentPostingUser.user_id;
    console.log(currentPostingUser);
    let hotelImageData = req.files;
    console.log(hotelImageData);
    // DB CONNECT
    db.connect((error) => {
        if (!error) {
            console.log("Database Connected Successfully");
        } else {
            console.log("DB Connection Failed");
        }
    });
    for (let i = 0; i < hotelImageData.length; i++) {
        let eachImageData = hotelImageData[i];
        // console.log(eachImageData.mimetype);
        if (eachImageData.mimetype == 'image/jpg' || eachImageData.mimetype == 'image/jpeg' || eachImageData.mimetype == 'image/png') {
            console.log("is it here?");
            // console.log(eachImageData.originalname.split("."));
            let splitByDataType = eachImageData.originalname.split(".");
            console.log(splitByDataType[0]);
            console.log(splitByDataType[1]);
            let fileName = uuid.v5(splitByDataType[0], process.env.SEED_KEY);
            console.log(fileName);
            let fullHotelImageName = currentPostingUserID + '_'  + fileName + '.' + splitByDataType[1];
            console.log(fullHotelImageName);

            // PARAMETER FOR UPLOAD IN S3 BUCKET
            let params = {
                Bucket: process.env.AWS_HOTEL_BUCKET_NAME
            ,   Key: `${fullHotelImageName}`
            ,   Body: eachImageData.buffer
            };

            s3.upload(params, (error, data) => {
                if (error) {
                    res.status(500).send(error);
                }
                
                console.log("============== AWS S3 ACCESS ==========");
                const tempUserId = currentPostingUser.user_id;
                let hotelImageID = data.key;
                let fileLocation = data.Location;
                console.log(hotelImageID);
                console.log(fileLocation);
                const insertHotelImageQuery = "INSERT INTO `css-capstone`.USER_HOTEL_IMAGE SET ?";
                db.query(insertHotelImageQuery, 
                    {
                        // this will be change into req.session.user later
                        user_id: tempUserId
                    ,   hotel_img_id: fullHotelImageName
                    ,   hotel_img: fileLocation
                    }, (err, result) => {
                        // callback function
                        if (err) {
                            console.log(err);
                            console.log("Error on Hotel Image Database");
                            throw err;
                        }
                        console.log("Successfully added in the Hotel Image Database");
                    }
                )
            });
            //res.render('pages/hostHotel/hotelPostImage');
        } else {
            console.log("It should be here....");
            
        }
        
    }
    res.send("hello world");
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
app.post('/auth/login', async (req, res) => {
    try{
        // console.log(req.body);
        let email = req.body.email;
        let password = req.body.password;
        let userDetailLogin = {
            email: ''
        }
        let userDetailRegister = {
            email: '',
            username: ''
        }

        db.query('SELECT * FROM USER WHERE email = ?', [email], async (error, results) => {
            // console.log(results);
            
            // if email or password is incorrect
            if(results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('pages/index', {
                    registerMessage: '',
                    loginMessage: "Email or password is incorrect",
                    resetPasswordMessage: '',
                    modalStyle: "block",
                    stayInWhere: 'login',
                    formDataLogin: userDetailLogin,
                    formDataRegister: userDetailRegister
                })
            } 
            else {
                const userId = results[0].user_id;
                const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWB_EXPIRES_IN
                })
                // console.log("Token: " + token);
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPRESS * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                var userPhotos = [];
                db.query('SELECT * FROM USER_PROFILE_IMAGE WHERE user_id = ?', [userId], async (error, photos) => {
                    userPhotos = photos;
                });
                res.cookie('jwt', token, cookieOptions);
                // console.log(req.cookies);
                //make the data fo the user
                // let sess = req.session;
                req.user = results[0];
                req.user.userPhotos = userPhotos;
                
                //make the data for the user's session
                req.session.user = req.user;
                req.session.isLoggedIn = true;
                // req.session.cookie.user = {
                //     isLoggedIn: false,
                //     userDetail: {}
                // };
                // req.session.cookie.user.isLoggedIn = true;
                // req.session.cookie.user.userDetail = req.user;
                // req.session.userPhotos = userPhotos;
                console.log(req.user);
                console.log(req.session);
                // console.log(req.session.cookie.user.userDetail);
                // res.status(200).render('pages/index', {
                //     loginMessage: '',
                //     registerMessage: '',
                //     resetPasswordMessage: '',
                //     modalStyle: '',
                //     stayInWhere: ''
                // });
                res.status(200).redirect('/');
            }
        });
    } catch (error) {
        console.log(error)
    }
})

app.get('/login', (req, res) => {
    res.render('pages/sign_in');
});

app.get('/register', (req, res) => {
    res.render('pages/,register');
});

app.post('/auth/register', (req, res) => {
    // console.log(req.body);
    let username = req.body.username;
    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;
    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    db.query('SELECT email FROM USER WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
        }
        //make sure that this render to the same page where the modal is opened
        // this checks if there is an email already registered in the DB or not
        if (results.length > 0) {
            return res.render('pages/index', {
                registerMessage: 'Email has been used',
                loginMessage: '',
                resetPasswordMessage: '',
                modalStyle: 'block',
                stayInWhere: 'register',
                formDataLogin: userDetail,
                formDataRegister: userDetailRegister
            });
        }
         
        let hashedPassword = await bcrypt.hash(newPassword, 8);
        // console.log(hashedPassword);
        db.query('INSERT INTO USER SET ?', {user_id: '', email: email, username: username, password: hashedPassword, is_host: true, is_developer: true}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.redirect('/');
            }
        })
    })
    
    // res.send("Hello!! You are registered");
});

app.get('/reset_password', (req, res) => {
    res.render('pages/set_up_new_password');
})

app.post('/auth/reset_password', (req, res) => {
    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;
    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    
    db.query('SELECT email, user_id FROM USER WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if (results.length === 0) {
            return res.render('pages/index', {
                registerMessage: '',
                loginMessage: '',
                resetPasswordMessage: 'This email is not registered',
                modalStyle: 'block',
                stayInWhere: 'reset password',
                formDataLogin: userDetailLogin,
                formDataRegister: userDetailRegister
            });
        }

        let userId = results[0].user_id;
        let hashedPassword = await bcrypt.hash(newPassword, 8);

        db.query('UPDATE USER SET password = ? WHERE user_id = ?', [hashedPassword, userId], async (error, result) => {
            if (error) {
                console.log(error);
            }
            else {
                // console.log('Rows affected: ' + result.affectedRows);
                return res.redirect('/');
            }
        })
    })
    // res.send("Reset password successful");
})

app.get('/logout', (req, res) => {
    // req.session = undefined;
    // req.user = undefined;
    // req.cookies = undefined;
    req.session.destroy(function (err) {
        res.clearCookie('profile');
        res.clearCookie('jwt');
        req.logout();
        res.redirect('/');
    })
    // req.logout();
    // res.clearCookie('profile');
    // res.clearCookie('jwt');
    // console.log(req.user);
    // console.log(req.session);
    // console.log(req.cookies);
    // res.redirect('/');
})
// ===============================================
// start of facebook
// ===============================================
app.get('/facebook/login', (req, res) => {
    res.cookie("accountAction", 'login');
    // console.log(req.cookies.accountAction);
    res.redirect('/facebook');
})

app.get('/facebook/register', (req, res) => {
    res.cookie("accountAction", 'register');
    // console.log(req.cookies.accountAction);
    res.redirect('/facebook');
})

app.get('/facebook', passport.authenticate('facebook'));

app.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook/failed' }),
    function(req, res) {
        console.log(req.user);

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
    // console.log(req.cookies);
    var data = req.cookies.profile;
    // console.log(data.emails[0]);
    // console.log(data.displayName);
    var currAction = req.cookies.accountAction;
    
    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }

    if (currAction === 'register') {
        userDetailRegister = {
            email: data.emails[0].value,
            username: data.displayName
        }
    }
    else if (currAction === 'login') {
        userDetailLogin = {
            email: data.emails[0].value
        }
    }
    
    // console.log(data);
    return res.render('pages/index', {
        registerMessage: '',
        loginMessage: '',
        resetPasswordMessage: '',
        modalStyle: 'block',
        stayInWhere: currAction,
        formDataLogin: userDetailLogin,
        formDataRegister: userDetailRegister
    });
});

app.get('/facebook/failed', (req, res) => {
    res.send("Hello, facebook auth fails");
});

// app.get('/facebook/logout', (req, res) => {
//     req.session = null;
//     req.logout();
//     res.redirect('/');
// });

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

    console.log(req.cookies);
    var data = req.cookies.profile;
    var currAction = req.cookies.accountAction;
    
    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }

    if (currAction === 'register') {
        userDetailRegister = {
            email: data.email,
            username: data.displayName
        }
    }
    else if (currAction === 'login') {
        userDetailLogin = {
            email: data.email
        }
    }
    
    // console.log(data);
    return res.render('pages/index', {
        registerMessage: '',
        loginMessage: '',
        resetPasswordMessage: '',
        modalStyle: 'block',
        stayInWhere: currAction,
        formDataLogin: userDetailLogin,
        formDataRegister: userDetailRegister
    });
    // res.send(`Hello!! Google OAuth is a success!!`);
    // res.send(`Hello, ${req.cookies.profile.displayName}!!!`);
    // res.render('pages/tryGoogle', {
    //     username: req.cookies.profile.displayName,
    //     picture: req.cookies.profile.photos[0].value,
    //     email: req.cookies.profile.emails[0].value
    // });
});

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/login', (req, res) => {
    res.cookie("accountAction", 'login');
    // console.log(req.cookies.accountAction);
    res.redirect('/google');
});

app.get('/google/register', (req, res) => {
    res.cookie("accountAction", 'register');
    res.redirect('/google');
});

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

// app.get('/google/logout', (req, res) => {
//     req.session = null;
//     req.logout();
//     //delete cookie data from the previous user
//     res.redirect('/');
// })

// ===============================================
// end of google
// ===============================================

// =============================
// Basic Hotel CRUD=============
// =============================
app.get('/users', authMW.isLoggedIn, (req, res) => {
    // testing purpose
    // Key is the image_id in MySQL image db
    // Which should be in user.session
    console.log("req.user");
    console.log(req.user);

    console.log("req.session.user");
    console.log(req.session.user);

    // var params = { 
    //     Bucket: process.env.AWS_BUCKET_NAME, 
    //     Key: '4319367f-5484-5303-8915-712d014451ff.png'
    // };

    // async function getImage() {
    //     const data = s3.getObject(params).promise();
    //     return data;
    // };

    // function encode(data) {
    //     let buf = Buffer.from(data);
    //     let base64 = buf.toString('base64');
    //     return base64;
    // }

    // getImage().then((img) => {
    //     let image = "<img class='profile__image' src='data:image/jpeg;base64," + encode(img.Body) + "'" + "/>";
    //     res.render('pages/users', { image });
    // }).catch((e)=> {
    //     console.log(e);
    // });
    //res.render('pages/users', {image: fileLocation});
});

app.post('/users/upload', upload, (req, res) => {

    // var tempUserId = 11;
    // var queryForPhotoCnt = "SELECT COUNT(*) FROM `USER_PROFILE_IMAGE` WHERE `user_id` = '" + tempUserId + "'";

    const file = req.file;
    console.log("======= File info from client side =======");
    console.log(file);

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" 
        || file.mimetype == "image/gif") {

        // From session check
        // Check the counts of photo is less than 3? and if there is any matching file ID
        // if (req.session.user.photos.length? >= 3)
        // res.redirect('/users#', {message: "Unsupported Image Type Error"});
        // foreach photos
        // if (photos.img_id == uuid.v5 of newly uploaded photo)
        // res.redirect('/users#', {message: "Image already exist"});
        // else

        let image = file.originalname.split(".");
        const fileType = image[image.length - 1];

        const fileName = uuid.v5(image[0], process.env.SEED_KEY);
        console.log(uuid.v5(image[0], process.env.SEED_KEY));
        console.log(fileName);
        const fullFileName = fileName + "." + fileType;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${fullFileName}`,
            Body: file.buffer
        };
        
        s3.upload(params, (error, data) => {
            if (error) {
                res.status(500).send(error); 
            }
    
            if (res.statusCode == 200) {
                console.log("======= AWS S3 Upload Success =======");

                // Will be replaced with req.session.user_id ?
                const tempUserId = 11;
                const imgID = data.key;
                const fileLocation = data.Location;
                // user.session.photo.isMain? should be used
                const isMain = false;

                console.log(data);
                console.log(imgID);
                console.log(fileLocation);

                // var insertData = "INSERT INTO `USER_PROFILE_IMAGE`(`user_id`,`img_id`,`img_url`,`is_main`)VALUES('" 
                //                 + tempUserId + "','" + fullFileName + "','" + fileLocation + "','" + isMain + "')";
                // db.connect(function (err) {
                //     if (err) {
                //         return console.log('error: Connection FAILEDDDD : \n' + err.message);
                //     } else {
                //         console.log("======= Upload image info to MySQL =======");
                        
                //         db.query(insertData, (err, result) => {
                //             if (err) throw err;
                //             console.log('Data Saved');
                //             console.log(result);
                //         });
                //     }
                // });
                res.redirect('/users#');
            }
        });

        // db.connect(function (err) {
        //     if (err) {
        //         return console.error('error: Connection FAILEDDDD : \n' + err.message);
        //     } else {
        //         db.query(queryForPhotoCnt, (err, results) => {
        //             if (err) throw err;
        //             if (results[0]['COUNT(*)'] <= 0) 
        //                 console.log("User doesn't exist");
    
        //             if (results[0]['COUNT(*)'] == 3) {
        //                 console.log("Can't post more photos");
        //                 res.redirect('/users#', {message: "Unsupported Image Type Error"});   
        //             }

        //             console.log("======= Photo count less than 3 =======");
        //             console.log(results[0]['COUNT(*)']);

                    
        //         });
        //     }
        // });
    } else {
        res.redirect('/users#', {message: "Unsupported Image Type Error"})
    }
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

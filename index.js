const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
// const client  = redis.createClient();
const nodemailer = require('nodemailer');
// const request = require('request');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
// const facebookStrategy = require('passport-facebook').Strategy;
// const cookieSession = require('cookie-session');
// const expressSession = require('express-session'); 
const cookieParser = require('cookie-parser');
// ==========================================
// Helper Functions =========================
const authMW = require('./modules/auth');
const trim = require('./modules/trim-city');
const trimCityNameHelper = require('./modules/trimCityNameHelper');
// const url = require('url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('./modules/logger');
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_HOTELFINDER_ADDRESS,
//         pass: process.env.EMAIL_HOTELFINDER_PASSWORD 
//     }
// });
const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "hotelfinder114@outlook.com",
      pass: "Hotel0505114"
    }
});
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100
});

require('./passport/passport-google-setup');
require('./passport/passport-facebook-setup');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("stylesheets"));
app.use(logger.logger);
app.use(limiter);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
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
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge: 6000000 }
}));

// FLASH ================================
app.use(flash());
// ======================================

// ===============================================
// ============ Database connection ==============
// ===============================================
const db = require('./utilities/db.js');

app.use( (req, res, next) => {
    res.locals.error_message = req.flash("error");
    res.locals.success_message = req.flash("success");
    next();
});
// ===============================================
// =============== ROUTER ========================
// ===============================================
const LOGIN_REG_ROUTE = require('./router/LoginRegister/LoginRegister.js')
const HOTEL_ROUTE = require('./router/Hotel/Hotel.js');
const BECOMEHOST_ROUTE = require('./router/BecomeHost/BecomeHost.js');
const USER_ROUTE = require('./router/User/User.js');
const DEVELOPER_ROUTE = require('./router/Developer/Developer.js');
const ACCOUNT_ROUTE = require('./router/Account/Account.js');
const USER_REVIEW_ROUTE = require('./router/UserReview/UserReview.js');
const ADMIN_ROUTE = require('./router/Admin/Admin.js');
app.use(LOGIN_REG_ROUTE);
app.use(HOTEL_ROUTE);
app.use(BECOMEHOST_ROUTE);
app.use(USER_ROUTE);
app.use(DEVELOPER_ROUTE);
app.use(ACCOUNT_ROUTE);
app.use(USER_REVIEW_ROUTE);
app.use(ADMIN_ROUTE);

app.get('/', (req, res) => {
    // var currDomain = req.get('host');
    // console.log(req.get('host'));
    let isLoggedIn = req.session.user == null ? false : true;

    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    res.render('pages/index', {
        isLoggedIn: isLoggedIn,
        registerMessage: '',
        loginMessage: '',
        resetPasswordMessage: '',
        modalStyle: '',
        stayInWhere: '',
        formDataLogin: userDetailLogin,
        formDataRegister: userDetailRegister,
        // currDomain: currDomain
    });
});

// index user input to test page

app.post('/', async (req, res) => {
    var searchedData = req.body;
    var location = req.body.location;
    var checkInDate = req.body.checkin__date;
    var checkOutDate = req.body.checkout__date;
    searchedData.location = trim.trimCity(JSON.stringify(searchedData.location));
    // ============================================
    // DO NOT JUST REMOVE THE THING
    // IF DATE IS UNDEFINE
    let myCheckInDate = req.body.checkin__date;
    let myCheckOutDate = req.body.checkout__date;
    let trimHelperDateObj = trimCityNameHelper.validateCheckInAndOutDate(myCheckInDate, myCheckOutDate);
    
    let dateObj = {
        checkin__date: trimHelperDateObj[0]
    ,   checkout__date: trimHelperDateObj[1]
    };
    res.cookie('hotelBookingDateData', dateObj);
    // =============================================
    var locationStr = searchedData.location;
    // console.log(locationStr);
    res.clearCookie('searchKeyword');
    let searchKeyword = {
        location: location,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate
    }
    console.log("=========FROM INDEX POST =============");
    console.log(dateObj);
    res.cookie('searchKeyword', searchKeyword);
    res.redirect(`/hotel/searched/${locationStr}`);
});

app.get('/about', (req, res) => {
    let isLoggedIn = req.session.user == null ? false : true;

    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    res.render('pages/about', {
        isLoggedIn: isLoggedIn,
        registerMessage: '',
        loginMessage: '',
        resetPasswordMessage: '',
        modalStyle: '',
        stayInWhere: '',
        formDataLogin: userDetailLogin,
        formDataRegister: userDetailRegister,
        // currDomain: currDomain
    });
})

app.get('/faq', (req, res) => {
    let isLoggedIn = req.session.user == null ? false : true;

    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    res.render('pages/FAQ', {
        isLoggedIn: isLoggedIn,
        registerMessage: '',
        loginMessage: '',
        resetPasswordMessage: '',
        modalStyle: '',
        stayInWhere: '',
        formDataLogin: userDetailLogin,
        formDataRegister: userDetailRegister,
        // currDomain: currDomain
    });
});

app.get("*", (req, res) => {
    res.status('404').render('pages/invalidURL');
});

const port = 8080;
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    // console.log(process.title);
});

// for testing
module.exports = server;

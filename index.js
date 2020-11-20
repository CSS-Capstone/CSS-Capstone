const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
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
    windowMs: 15 * 60 * 1000,
    max: 100
});

require('./passport/passport-google-setup');
require('./passport/passport-facebook-setup');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("stylesheets"));
app.use(logger.logger);
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

// ===============================================
// ============ Database connection ==============
// ===============================================
const db = require('./utilities/db.js');


// ===============================================
// =============== ROUTER ========================
// ===============================================
const HOTEL_ROUTE = require('./router/Hotel/Hotel.js');
const BECOMEHOST_ROUTE = require('./router/BecomeHost/BecomeHost.js');
const USER_ROUTE = require('./router/User/User.js');
const ACCOUNT_ROUTE = require('./router/Account/Account.js');
app.use(HOTEL_ROUTE);
app.use(BECOMEHOST_ROUTE);
app.use(USER_ROUTE);
app.use(ACCOUNT_ROUTE);

app.get('/', (req, res) => {
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
    res.render('pages/FAQ');
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
        let isLoggedIn = req.session.user == null ? false : true;

        db.query('SELECT * FROM USER WHERE email = ?', [email], async (error, results) => {
            // console.log(results);
            
            // if email or password is incorrect
            if(results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('pages/index', {
                    isLoggedIn: isLoggedIn,
                    registerMessage: '',
                    loginMessage: "Email or password is incorrect",
                    resetPasswordMessage: '',
                    modalStyle: "block",
                    stayInWhere: 'login',
                    formDataLogin: userDetailLogin,
                    formDataRegister: userDetailRegister
                })
            } 

            if(!results[0].isConfirmed) {
                return res.status(401).render('pages/index', {
                    isLoggedIn: isLoggedIn,
                    registerMessage: '',
                    loginMessage: "Account is not confirmed yet. Check your email",
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
                
                db.query(`SELECT img_id FROM USER_PROFILE_IMAGE WHERE user_id = ? AND is_main = ?`, [userId, true], async (error, photo) => {
                    let profile_img = (Object.keys(photo).length === 0) ? null : photo[0].img_id;
                    res.cookie('jwt', token, cookieOptions);
                    req.user = results[0];
                    req.user.profile_img = profile_img;
                    req.session.user = req.user;
                    req.session.isLoggedIn = true;
                    // console.log(req.session.user);
                    res.status(200).redirect('/');
                });
                
                // console.log(req.user);
                console.log(req.session);
                //res.status(200).redirect('/');
            }
        });
    } catch (error) {
        console.log(error);
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
    let isLoggedIn = req.session.user == null ? false : true;

    //make sure that it checks the validity of the username
    //make sure that it checks the validity of the email
    db.query('SELECT email FROM USER WHERE email = ? OR username = ?', [email, username], async (error, results) => {
        if(error) {
            console.log(error);
        }
        // make sure that this render to the same page where the modal is opened
        // this checks if there is an email already registered in the DB or not
        if (results.length > 0) {
            return res.render('pages/index', {
                isLoggedIn: isLoggedIn,
                registerMessage: 'Email or username has been used',
                loginMessage: '',
                resetPasswordMessage: '',
                modalStyle: 'block',
                stayInWhere: 'register',
                formDataLogin: userDetailLogin,
                formDataRegister: userDetailRegister
            });
        }
         
        let hashedPassword = await bcrypt.hash(newPassword, 8);
        // console.log(hashedPassword);
        db.query('INSERT INTO USER SET ?', {user_id: '', email: email, username: username, password: hashedPassword, is_host: true, is_developer: true, isConfirmed: false}, async (error, result) => {
            if (error) {
                console.log(error);
            } else {
                db.query('SELECT * FROM USER WHERE email = ?', [email], (error, answer) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        var userId = answer[0].user_id;
                        var userPassword = answer[0].password;
                        // make a loop
                        // go thru userPassword
                        // use charAt to detect "/"
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.EMAIL_HOTELFINDER_ADDRESS,
                                pass: process.env.EMAIL_HOTELFINDER_PASSWORD 
                            }
                        });
                        var userPasswordEncoded = encodeURIComponent(userPassword);
                        console.log(userPassword);
                        console.log(userPasswordEncoded);
                        var mailOptions = {
                            from: process.env.EMAIL_HOTELFINDER_ADDRESS,
                            to: email,
                            subject: 'Test sending email',
                            text: 'That was easy!',
                            html: `<div><p>Please click the link below to confirm your new account.</p><br><a href="https://testssl.css-hotelfinder.net/confirm_account/${userId}/${userPasswordEncoded}">https://testssl.css-hotelfinder.net/confirm_account/${userId}/${userPasswordEncoded}</a></div>`
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error){
                                console.log(error);
                            }
                            else {
                                console.log('Email sent: ' + info.response)
                            }
                        })
                    }
                })
                
                return res.redirect('/');
            }
        })
    })
    
    // res.send("Hello!! You are registered");
});

// confirm account
app.get('/confirm_account/:user_id/:password', (req, res) => {
    let userId = req.params.user_id;
    let password = req.params.password;
    let passwordDecoded = decodeURI(password);
    let isConfirmed = true;
    // console.log(passwordDecoded);
    db.query('UPDATE USER SET isConfirmed = ? WHERE user_id = ? AND password = ?', [isConfirmed, userId, passwordDecoded], (error, results) => {
        if (error) {
            console.log(error);
        }
        else {
            // console.log(results[0]);
            return res.redirect('/');
        }
    });
});

app.get('/reset_password', (req, res) => {
    res.render('pages/set_up_new_password');
});

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
    let isLoggedIn = req.session.user == null ? false : true;
    db.query('SELECT email, user_id FROM USER WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if (results.length === 0) {
            return res.render('pages/index', {
                isLoggedIn: isLoggedIn,
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
    // console.log(req.cookies);
    // console.log(req.cookies.profile.emails);
    var data = req.cookies.profile;
    // console.log(data.emails[0]);
    // console.log(data.displayName);
    var currAction = req.cookies.accountAction;
    var facebookEmail = data.emails[0].value;

    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    let isLoggedIn = req.session.user == null ? false : true;
    if (currAction === 'register') {
        userDetailRegister = {
            email: facebookEmail,
            username: data.displayName
        }
        return res.render('pages/index', {
            isLoggedIn: isLoggedIn,
            registerMessage: '',
            loginMessage: '',
            resetPasswordMessage: '',
            modalStyle: 'block',
            stayInWhere: currAction,
            formDataLogin: userDetailLogin,
            formDataRegister: userDetailRegister
        });
    }
    else if (currAction === 'login') {
        // userDetailLogin = {
        //     email: facebookEmail
        // }
        db.query('SELECT * FROM USER WHERE email = ?', [facebookEmail], (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                // if user is not registered yet
                if (results.length < 1) {
                    currAction = 'register';
                    userDetailRegister = {
                        email: facebookEmail,
                        username: data.displayName
                    }
                    return res.render('pages/index', {
                        isLoggedIn: isLoggedIn,
                        registerMessage: '',
                        loginMessage: '',
                        resetPasswordMessage: '',
                        modalStyle: 'block',
                        stayInWhere: currAction,
                        formDataLogin: userDetailLogin,
                        formDataRegister: userDetailRegister
                    });
                }
                // if user is already registered
                if (results.length > 0) {
                    //check if the account is registered or not yet
                    userDetailLogin = {
                        email: facebookEmail
                    }
                    if(!results[0].isConfirmed) {
                        return res.status(401).render('pages/index', {
                            isLoggedIn: isLoggedIn,
                            registerMessage: '',
                            loginMessage: "Account is not confirmed yet. Check your email",
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
                        db.query(`SELECT img_id FROM USER_PROFILE_IMAGE WHERE user_id = ? AND is_main = ?`, [userId, true], async (error, photo) => {
                            let profile_img = (Object.keys(photo).length === 0) ? null : photo[0].img_id;
                            res.cookie('jwt', token, cookieOptions);
                            req.user = results[0];
                            req.user.profile_img = profile_img;
                            req.session.user = req.user;
                            req.session.isLoggedIn = true;
                            // console.log(req.session);
                            // console.log(req.session.user);
                            res.status(200).redirect('/');
                        });
                    }
                }
            }
        })
    }
    
    
    // console.log(data);
    // return res.render('pages/index', {
    //     isLoggedIn: isLoggedIn,
    //     registerMessage: '',
    //     loginMessage: '',
    //     resetPasswordMessage: '',
    //     modalStyle: 'block',
    //     stayInWhere: currAction,
    //     formDataLogin: userDetailLogin,
    //     formDataRegister: userDetailRegister
    // });
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

    // console.log(req.cookies);
    var data = req.cookies.profile;
    var currAction = req.cookies.accountAction;
    var googleEmail = data.email;

    let userDetailLogin = {
        email: ''
    }
    let userDetailRegister = {
        email: '',
        username: ''
    }
    let isLoggedIn = req.session.user == null ? false : true;
    //this action is taken if using google to register
    if (currAction === 'register') {
        userDetailRegister = {
            email: googleEmail,
            username: data.displayName
        }
        return res.render('pages/index', {
            isLoggedIn: isLoggedIn,
            registerMessage: '',
            loginMessage: '',
            resetPasswordMessage: '',
            modalStyle: 'block',
            stayInWhere: currAction,
            formDataLogin: userDetailLogin,
            formDataRegister: userDetailRegister
        });
    }
    //this action is taken if using google to login
    else if (currAction === 'login') {
        db.query('SELECT * FROM USER WHERE email = ?', [googleEmail], (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                // if user is not registered yet
                if (results.length < 1) {
                    currAction = 'register';
                    userDetailRegister = {
                        email: googleEmail,
                        username: data.displayName
                    }
                    return res.render('pages/index', {
                        isLoggedIn: isLoggedIn,
                        registerMessage: '',
                        loginMessage: '',
                        resetPasswordMessage: '',
                        modalStyle: 'block',
                        stayInWhere: currAction,
                        formDataLogin: userDetailLogin,
                        formDataRegister: userDetailRegister
                    });
                }
                // if user is already registered
                if (results.length > 0) {
                    //check if the account is registered or not yet
                    userDetailLogin = {
                        email: googleEmail
                    }
                    if(!results[0].isConfirmed) {
                        return res.status(401).render('pages/index', {
                            isLoggedIn: isLoggedIn,
                            registerMessage: '',
                            loginMessage: "Account is not confirmed yet. Check your email",
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
                        db.query(`SELECT img_id FROM USER_PROFILE_IMAGE WHERE user_id = ? AND is_main = ?`, [userId, true], async (error, photo) => {
                            let profile_img = (Object.keys(photo).length === 0) ? null : photo[0].img_id;
                            res.cookie('jwt', token, cookieOptions);
                            req.user = results[0];
                            req.user.profile_img = profile_img;
                            req.session.user = req.user;
                            req.session.isLoggedIn = true;
                            // console.log(req.session);
                            // console.log(req.session.user);
                            res.status(200).redirect('/');
                        });
                    }
                }
            }
        })
    }
    // return res.render('pages/index', {
    //     isLoggedIn: isLoggedIn,
    //     registerMessage: '',
    //     loginMessage: '',
    //     resetPasswordMessage: '',
    //     modalStyle: 'block',
    //     stayInWhere: currAction,
    //     formDataLogin: userDetailLogin,
    //     formDataRegister: userDetailRegister
    // });
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

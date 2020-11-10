const express = require('express');
const session = require('express-session');
// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
// const client  = redis.createClient();
const nodemailer = require('nodemailer');
const trim = require('./modules/trim-city');
// const request = require('request');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
// const facebookStrategy = require('passport-facebook').Strategy;
// const cookieSession = require('cookie-session');
// const expressSession = require('express-session'); 
const cookieParser = require('cookie-parser');
const trim = require('./modules/trim-city');
// ==========================================
// Helper Functions =========================
// const url = require('url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_HOTELFINDER_ADDRESS,
        pass: process.env.EMAIL_HOTELFINDER_PASSWORD
    }
});
// const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: testAccount.user, // generated ethereal user
//         pass: testAccount.pass, // generated ethereal password
//     },
// });

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
//const ACCOUNT_ROUTE = require('./router/Account/Account.js');
const USER_ROUTE = require('./router/User/User.js');
app.use(HOTEL_ROUTE);
app.use(BECOMEHOST_ROUTE);
app.use(USER_ROUTE);

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
    res.render('pages/FAQ')
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
            
            //if account is not confirmed yet
            if(results[0].isConfirmed === false) {
                return res.status(406).render('pages/index', {
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
                var mailOptions = {
                    from: process.env.EMAIL_HOTELFINDER_ADDRESS,
                    to: results[0].email,
                    subject: 'Test sending email',
                    text: 'That was easy!'
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error){
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                //make the data for the user's session
                req.session.user = req.user;
                req.session.isLoggedIn = true;
                // console.log(req.user);
                // console.log(req.session);
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
        db.query('INSERT INTO USER SET ?', {user_id: '', email: email, username: username, password: hashedPassword, is_host: true, is_developer: true, isConfirmed: false}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                // send to user the confirmation account ema
                
                var mailOptions = {
                    from: process.env.EMAIL_HOTELFINDER_ADDRESS,
                    to: email,
                    subject: 'Test sending email',
                    text: 'That was easy!'
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error){
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response)
                    }
                })
                return res.redirect('/');
            }
        })
    })
    
    // res.send("Hello!! You are registered");
});

app.get('/register/:user_id/:password', (req, res) => {
    db.query('UPDATE USER SET isConfirmed = ? WHERE user_id = ?', [])
    res.redirect('/');
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
                formDataRegister: userDetailRegister,
                isLoggedIn
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
        //isLoggedIn: '',
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

const express = require('express');
const router = express.Router();
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../utilities/db');

require('../../passport/passport-google-setup');
require('../../passport/passport-facebook-setup');

router.post('/auth/login', async (req, res) => {
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
                
                const userResult = results[0];

                req.session.user = {
                    user_id: userId,
                    email: userResult.email,
                    username: userResult.username,
                    password: userResult.password,
                    is_host: userResult.is_host,
                    is_developer: userResult.is_developer,
                    isAdmin: userResult.isAdmin,
                    profile: {
                        img: userResult.profile_img,
                        imgDom: null,
                        about: userResult.profile_about,
                        location: userResult.profile_location,
                        languages: userResult.profile_languages
                    }, 
                    developer: {
                        is_active: null,
                        api_key: null
                    }
                };

                const userImgQuery = `SELECT * FROM USER_PROFILE_IMAGE WHERE user_id = ?;`;
                const userDevQuery = `SELECT * FROM DEVELOPER WHERE user_id = ?;`

                db.query(userImgQuery, [userId], async (error, photo) => {
                    if (error) { console.log('Failed to retrieve the photo of user'); }
                    else {
                        db.query(userDevQuery, [userId], async (err, dev) => {
                            if (err) { console.log('Failed to retrieve the dev of user'); }
                            else {
                                let profile_img = (Object.keys(photo).length === 0) ? 'default_profile_img' : photo[0].img_id;
                                res.cookie('jwt', token, cookieOptions);
                                req.session.user.profile.img = profile_img;
                                if (Object.keys(dev).length !== 0) {
                                    var booleanVal = dev[0].is_active === 1 ? "true" : "false";
                                    let devTemp = {
                                        is_active: booleanVal,
                                        api_key: dev[0].api_key
                                    };
                                    req.session.user.developer = devTemp;
                                } 
                                req.session.isLoggedIn = true;
                                console.log(req.session.user);
                                res.status(200).redirect('/');
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
})

router.post('/auth/register', (req, res) => {
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

    db.query('SELECT email FROM USER WHERE email = ? OR username = ?', [email, username], async (error, results) => {
        if(error) {
            console.log(error);
        }
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
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.EMAIL_HOTELFINDER_ADDRESS,
                                pass: process.env.EMAIL_HOTELFINDER_PASSWORD 
                            }
                        });
                        var userPasswordEncoded = encodeURIComponent(userPassword);
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
});

// confirm account
router.get('/confirm_account/:user_id/:password', (req, res) => {
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

router.get('/reset_password', (req, res) => {
    res.render('pages/set_up_new_password');
});

router.post('/auth/reset_password', (req, res) => {
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
                return res.redirect('/');
            }
        })
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.clearCookie('profile');
        res.clearCookie('jwt');
        req.logout();
        res.redirect('/');
    })
})
// ===============================================
// start of facebook
// ===============================================
router.get('/facebook/login', (req, res) => {
    res.cookie("accountAction", 'login');
    // console.log(req.cookies.accountAction);
    res.redirect('/facebook');
})

router.get('/facebook/register', (req, res) => {
    res.cookie("accountAction", 'register');
    // console.log(req.cookies.accountAction);
    res.redirect('/facebook');
})

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook/failed' }),
    function(req, res) {
        res.cookie("profile", req.user);
        //this will be different in locale in the JSON data
        res.redirect('/facebook/good');
    });

router.get('/facebook/good', (req, res) => {
    var data = req.cookies.profile;
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
                        const userResult = results[0];

                        req.session.user = {
                            user_id: userId,
                            email: userResult.email,
                            username: userResult.username,
                            password: userResult.password,
                            is_host: userResult.is_host,
                            is_developer: userResult.is_developer,
                            isAdmin: userResult.isAdmin,
                            profile: {
                                img: userResult.profile_img,
                                imgDom: null,
                                about: userResult.profile_about,
                                location: userResult.profile_location,
                                languages: userResult.profile_languages
                            }, 
                            developer: {
                                is_active: null,
                                api_key: null
                            }
                        };

                        const userImgQuery = `SELECT * FROM USER_PROFILE_IMAGE WHERE user_id = ?;`;
                        const userDevQuery = `SELECT * FROM DEVELOPER WHERE user_id = ?;`

                        db.query(userImgQuery, [userId], async (error, photo) => {
                            if (error) { console.log('Failed to retrieve the photo of user'); }
                            else {
                                db.query(userDevQuery, [userId], async (err, dev) => {
                                    if (err) { console.log('Failed to retrieve the dev of user'); }
                                    else {
                                        let profile_img = (Object.keys(photo).length === 0) ? 'default_profile_img' : photo[0].img_id;
                                        res.cookie('jwt', token, cookieOptions);
                                        req.session.user.profile.img = profile_img;
                                        if (Object.keys(dev).length !== 0) {
                                            var booleanVal = dev[0].is_active === 1 ? "true" : "false";
                                            let devTemp = {
                                                is_active: booleanVal,
                                                api_key: dev[0].api_key
                                            };
                                            req.session.user.developer = devTemp;
                                        } 
                                        req.session.isLoggedIn = true;
                                        console.log(req.session.user);
                                        res.status(200).redirect('/');
                                    }
                                });
                            }
                        });
                    }
                }
            }
        })
    }
});

router.get('/facebook/failed', (req, res) => {
    res.send("Hello, facebook auth fails");
});

// ===============================================
// end of facebook
// ===============================================

// ======================================================

// ===============================================
// start of google
// ===============================================
router.get('/google/failed', (req, res) => {
    res.send('You Failed to log in!');
});

router.get('/google/good', (req, res) => {
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
                        const userResult = results[0];

                        req.session.user = {
                            user_id: userId,
                            email: userResult.email,
                            username: userResult.username,
                            password: userResult.password,
                            is_host: userResult.is_host,
                            is_developer: userResult.is_developer,
                            isAdmin: userResult.isAdmin,
                            profile: {
                                img: userResult.profile_img,
                                imgDom: null,
                                about: userResult.profile_about,
                                location: userResult.profile_location,
                                languages: userResult.profile_languages
                            }, 
                            developer: {
                                is_active: null,
                                api_key: null
                            }
                        };

                        const userImgQuery = `SELECT * FROM USER_PROFILE_IMAGE WHERE user_id = ?;`;
                        const userDevQuery = `SELECT * FROM DEVELOPER WHERE user_id = ?;`

                        db.query(userImgQuery, [userId], async (error, photo) => {
                            if (error) { console.log('Failed to retrieve the photo of user'); }
                            else {
                                db.query(userDevQuery, [userId], async (err, dev) => {
                                    if (err) { console.log('Failed to retrieve the dev of user'); }
                                    else {
                                        let profile_img = (Object.keys(photo).length === 0) ? 'default_profile_img' : photo[0].img_id;
                                        res.cookie('jwt', token, cookieOptions);
                                        req.session.user.profile.img = profile_img;
                                        if (Object.keys(dev).length !== 0) {
                                            var booleanVal = dev[0].is_active === 1 ? "true" : "false";
                                            let devTemp = {
                                                is_active: booleanVal,
                                                api_key: dev[0].api_key
                                            };
                                            req.session.user.developer = devTemp;
                                        } 
                                        req.session.isLoggedIn = true;
                                        console.log(req.session.user);
                                        res.status(200).redirect('/');
                                    }
                                });
                            }
                        });
                    }
                }
            }
        })
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/login', (req, res) => {
    res.cookie("accountAction", 'login');
    // console.log(req.cookies.accountAction);
    res.redirect('/google');
});

router.get('/google/register', (req, res) => {
    res.cookie("accountAction", 'register');
    res.redirect('/google');
});

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/google/failed' }),
    function(req, res) {
        res.cookie("profile", req.user);
        //this will be different in locale in the JSON data
        res.redirect('/google/good');
    });

// ===============================================
// end of google
// ===============================================

// ===============================================
// ===============================================
// ===============================================
module.exports = router;
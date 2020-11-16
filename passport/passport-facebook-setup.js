const passport = require('passport');
const dotenv = require('dotenv');

const facebookStrategy = require('passport-facebook').Strategy;
dotenv.config({ path: './.env' });

passport.serializeUser(function(user, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    return done(null, id);
});

passport.use(new facebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'name', 'email', 'gender', 'picture.type(large)']
}, function(token, refreshToken, profile, done){
    // console.log(profile);
    return done(null, profile);  
}));
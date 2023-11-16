const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const dotenv = require('dotenv');
const User = require('../models/UserModels');
const generateJWT = require('../utils/generateJWT');


dotenv.config();


//google oauth
const pport = passport;
pport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.SECRET_ID,
    callbackURL: process.env.REDIRECT_URL,
    scope: ['email', 'profile'],
    }, async (accessToken, refreshToken, profile, done) => {
        const userData = {
            username: profile.displayName,
            email: profile.emails[0].value,
            accessToken,
            refreshToken
        };
        // console.log(userData);
        // console.log(profile);
        try {
            const user = await User.findOne({ "google.email": profile.emails[0].value });
            if (user){
                accessToken = generateJWT({ email: user.google.email, id: user.google.id, duration: "5m"});
                refreshToken = generateJWT({ email: user.google.email, id: user.google.id, duration: "1d" });
                user.google.lastLogin = new Date();
                user.google.refreshToken = refreshToken;
                await user.save();
                // res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 3600 * 1000 , sameSite: 'None', secured: true });
                const data = {...user, refreshToken, accessToken};
                return done(null, data);
            }
            const newUser = new User({
                method: 'google',
                google: {
                    username: profile.displayName,
                    email: profile.emails[0].value,
                }
            });
            await newUser.save();
            accessToken = generateJWT({ email: user.google.email, id: user.google.id, duration: "5m"});
            refreshToken = generateJWT({ email: user.google.email, id: user.google.id, duration: "1d" });
            user.google.lastLogin = new Date();
            user.google.refreshToken = refreshToken;
            await user.save();
            // res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 3600 * 1000 , sameSite: 'None', secured: true });
            const data = { ...newUser, refreshToken, accessToken};
            return done(null, data);
        } catch (error) {
            console.log(error);
            return done(error, userData);
        }
}));

// passport.use(new JwtStrategy({
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.ACCESS_TOKEN},
//     async (payload, done) => {
//     try {
//         const user = await User.findOne({ "google.email": payload.email });    
//         if (!user) {
//           return done(null, false);
//         }
//         console.log('passport -- ', user);
//         return done(null, user);
//     } catch (error) {
//         return done(error, false);
//     }
// }));

pport.serializeUser(function (user, cb) {
    cb(null, user);
});
pport.deserializeUser(function (user, cb){
    cb(null, user);
});

module.exports = pport;

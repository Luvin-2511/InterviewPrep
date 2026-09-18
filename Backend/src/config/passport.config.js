const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user.model');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.BACKEND_URL
                ? `${process.env.BACKEND_URL}/api/auth/google/callback`
                : '/api/auth/google/callback',
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await userModel.findOne({
                    $or: [
                        { googleId: profile.id },
                        { email: profile.emails[0].value },
                    ],
                });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.avatar = profile.photos?.[0]?.value || user.avatar;
                        await user.save();
                    }
                } else {
                    const base = profile.displayName.toLowerCase().replace(/\s+/g, '');
                    const rand = Math.floor(Math.random() * 9999);
                    const username = base + rand;
                    user = await userModel.create({
                        googleId: profile.id,
                        username,
                        email: profile.emails[0].value,
                        avatar: profile.photos?.[0]?.value || '',
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;

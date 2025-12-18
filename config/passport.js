import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userService from '../services/users/userService.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/users/google/callback"
},
    async (profile, done) => {
        try {
            // Find or create user in database
            let user = await userService.findByGoogleId(profile.id);

            if (!user) {
                // Check if user already exists with this email
                user = await userService.findByLogin(profile.emails[0].value);

                if (user) {
                    return new Error('User already exists');
                } else {
                    // Create new user
                    // Use profile data
                    const username = profile.displayName.split(' ')[0] + Math.floor(Math.random() * 1000);
                    const email = profile.emails[0].value;
                    const photo = profile.photos[0].value;

                    const userId = await userService.createUser(username, email, null, 0, profile.id);
                    await userService.updatePhoto(userId, photo);
                    user = await userService.findById(userId);
                }
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userService from '../services/users/userService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google OAuth Strategy configuration for Passport.js.
 * 
 * This strategy handles:
 * 1. Authenticating with Google.
 * 2. Finding an existing user by their Google ID.
 * 3. Fallback: Checking if a user already exists with the same email.
 * 4. Creating a new user if no match is found.
 */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/users/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user in database
            let user = await userService.findByGoogleId(profile.id);

            if (!user) {
                // Check if user already exists with this email
                user = await userService.findByLogin(profile.emails[0].value);

                if (user) {
                    // LINK: If user exists with email but no googleId, link them
                    return done(new Error('A user with this email already exists but is not linked to Google. Please log in with your password.'), null);
                } else {
                    // Create new user
                    const username = profile.displayName.split(' ')[0] + Math.floor(Math.random() * 1000);
                    const email = profile.emails[0].value;
                    const photo = profile.photos[0].value || '/uploads/users/cat_default.webp';

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

/**
 * Serializes the user ID into the session.
 * 
 * @param {Object} user - The user object to serialize.
 * @param {Function} done - The callback function.
 */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/**
 * Deserializes the user from the ID stored in the session.
 * 
 * @param {number|string} id - The user ID from the session.
 * @param {Function} done - The callback function.
 */
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
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
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/users/google/callback",
    passReqToCallback: false
},
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
            let user = await userService.findByGoogleId(profile.id);

            if (!user) {

                const email = profile.emails?.[0]?.value;
                if (!email) return done(new Error('No email found'), undefined);

                const existingUser = await userService.findByLogin({ login: email, password: '' });

                if (existingUser) {
                    return done(null, false, { message: 'Email already exists' });
                } else {
                    const username = profile.displayName.split(' ')[0] + Math.floor(Math.random() * 1000);

                    const photo = (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : '/uploads/users/cat_default.webp';

                    const userId = await userService.createUser(username, email, "", 0, profile.id);
                    await userService.updatePhoto(userId, photo);
                    user = await userService.findById(userId);
                }
            }
            return done(null, user || undefined);
        } catch (err) {
            return done(err as Error, undefined);
        }
    }
));

/**
 * Serializes the user ID into the session.
 * 
 * @param {Object} user - The user object to serialize.
 * @param {Function} done - The callback function.
 */
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

/**
 * Deserializes the user from the ID stored in the session.
 * 
 * @param {number|string} id - The user ID from the session.
 * @param {Function} done - The callback function.
 */
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await userService.findById(id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        done(err as Error, null);
    }
});

export default passport;

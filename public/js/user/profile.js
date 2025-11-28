/**
 * User profile page functionality.
 * Displays and manages user account information.
 */

import { checkSession } from '../tools/session.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the profile page.
 * Loads and displays user information.
 */
export async function init() {
    // Prevent duplicate initialization
    if (isInitialized) {
        logger.debug('Profile module already initialized, skipping');
        return;
    }

    logger.user('Profile script initialized');
    isInitialized = true;

    const session = await checkSession();

    if (!session.loggedIn) {
        logger.warn('User not logged in, redirecting to login page');
        window.location.href = '/logIn';
        return;
    }

    logger.info(`Profile loaded for user: ${session.username}`);

    // TODO: Add profile display and editing functionality

    console.log(session);

    // Use the /users/me endpoint which returns current user's data without requiring admin
    const data = await fetch(API.USERS.ME, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const response = await data.json();

    const username = document.getElementById('profile-username');
    const email = document.getElementById('profile-email');
    const role = document.getElementById('profile-role');
    const img = document.getElementById('profile-img');

    username.textContent = response.username;
    email.textContent = response.email;

    // Set profile image with correct fallback path
    if (!response.photo || response.photo === '/uploads/users/cat_default.webp') {
        img.src = '/uploads/users/cat_default.webp';
    } else {
        img.src = response.photo;
    }

    role.textContent = response.admin ? 'Admin' : 'User';
}

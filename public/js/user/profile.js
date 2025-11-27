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

    const data = await fetch(API.USERS.BY_ID(session.id), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const user = await data.json();

    const username = document.getElementById('profile-username');
    const email = document.getElementById('profile-email');
    const role = document.getElementById('profile-role');

    username.textContent = user.username;
    email.textContent = user.email;
    role.textContent = user.admin ? 'Admin' : 'User';
}

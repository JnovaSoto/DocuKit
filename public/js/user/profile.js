/**
 * User profile page functionality.
 * Displays and manages user account information.
 */

import { checkSession } from '../tools/session.js';
import logger from '../tools/logger.js';
import { API, ROUTES } from '../config/constants.js';
import { changePage } from '../navigation.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the profile page.
 * Loads and displays user information.
 */
export async function init() {
    // Always reset initialization to allow fresh data load
    isInitialized = false;

    logger.user('Profile script initialized');
    isInitialized = true;

    const session = await checkSession();

    if (!session.loggedIn) {
        logger.warn('User not logged in, redirecting to login page');
        changePage(ROUTES.LOGIN);
        return;
    }

    logger.info(`Profile loaded for user: ${session.username}`);

    try {
        // Use the /users/me endpoint which returns current user's data without requiring admin
        const response = await fetch(API.USERS.ME, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        const username = document.getElementById('profile-username');
        const email = document.getElementById('profile-email');
        const role = document.getElementById('profile-role');
        const img = document.getElementById('profile-img');

        if (username) username.textContent = userData.username || 'N/A';
        if (email) email.textContent = userData.email || 'N/A';
        if (role) role.textContent = userData.admin ? 'Admin' : 'User';

        // Set profile image with correct fallback path
        if (img) {
            if (!userData.photo || userData.photo === '/uploads/users/cat_default.webp') {
                img.src = '/uploads/users/cat_default.webp';
            } else {
                img.src = userData.photo;
            }
            img.alt = `${userData.username}'s profile picture`;
        }

        logger.success('Profile data loaded successfully');

    } catch (error) {
        logger.error('Error loading profile data:', error);
        // Display error message to user
        const username = document.getElementById('profile-username');
        if (username) username.textContent = 'Error loading profile';
    }
}

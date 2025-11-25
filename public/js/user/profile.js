/**
 * User profile page functionality.
 * Displays and manages user account information.
 */

import { checkSession } from '../tools/session.js';
import logger from '../tools/logger.js';

/**
 * Initializes the profile page.
 * Loads and displays user information.
 */
export async function init() {
    logger.user('Profile script initialized');

    const session = await checkSession();

    if (!session.loggedIn) {
        logger.warn('User not logged in, redirecting to login page');
        window.location.href = '/logIn';
        return;
    }

    logger.info(`Profile loaded for user: ${session.username}`);

    // TODO: Add profile display and editing functionality
}

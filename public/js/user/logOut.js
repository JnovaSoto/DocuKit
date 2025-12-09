/**
 * Logout functionality.
 * Handles user session termination.
 */

import { API, SUCCESS_MESSAGES } from '../config/constants.js';
import { showTemporaryAlert } from '../tools/alerts.js';
import logger from '../tools/logger.js';

/**
 * Initializes the logout functionality.
 * 
 * @param {HTMLElement} logOutButton - The logout button element
 */
export function init(logOutButton) {
    logger.auth('Logout script initialized');

    if (!logOutButton) {
        logger.warn('Logout button not found');
        return;
    }

    logOutButton.addEventListener('click', async (event) => {
        event.preventDefault();

        try {
            logger.network('Sending logout request');

            const response = await fetch(API.USERS.LOGOUT, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                logger.success('User logged out successfully');
                showTemporaryAlert('success', SUCCESS_MESSAGES.LOGOUT);
            }

            // Stay on current page after logout
            window.location.reload();

        } catch (error) {
            logger.error('Logout failed:', error);
            // Still reload page even if logout request fails
            window.location.reload();
        }
    });
}
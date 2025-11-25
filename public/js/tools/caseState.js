/**
 * Response error handling utilities.
 * Centralizes HTTP error handling and user feedback.
 */

import { showTemporaryAlert } from './alerts.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import logger from './logger.js';

/**
 * Handles HTTP response errors and displays appropriate alerts to the user.
 * 
 * @param {Response} response - The fetch Response object to check
 * @param {boolean} [suppressAlert=false] - If true, don't show alert to user
 * @returns {boolean} True if there was an error, false if response is OK
 * 
 * @example
 * const response = await fetch('/api/endpoint');
 * if (handleResponseError(response)) {
 *   return; // Error occurred, alert shown to user
 * }
 * // Continue with successful response
 */
export function handleResponseError(response, suppressAlert = false) {
    if (!response.ok) {
        logger.error(`HTTP Error ${response.status}: ${response.statusText}`);

        if (!suppressAlert) {
            switch (response.status) {
                case HTTP_STATUS.FORBIDDEN:
                    showTemporaryAlert('alert', ERROR_MESSAGES.FORBIDDEN);
                    break;
                case HTTP_STATUS.NOT_FOUND:
                    showTemporaryAlert('alert', ERROR_MESSAGES.NOT_FOUND);
                    break;
                case HTTP_STATUS.UNAUTHORIZED:
                    showTemporaryAlert('alert', ERROR_MESSAGES.UNAUTHORIZED);
                    break;
                case HTTP_STATUS.BAD_REQUEST:
                    showTemporaryAlert('alert', ERROR_MESSAGES.VALIDATION_ERROR);
                    break;
                default:
                    showTemporaryAlert('alert', ERROR_MESSAGES.SERVER_ERROR);
                    break;
            }
        }

        return true; // Error occurred
    }

    return false; // No error
}

// Keep old name for backward compatibility during transition
export const cases = handleResponseError;

export default handleResponseError;
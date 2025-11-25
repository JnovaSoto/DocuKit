/**
 * Login page functionality.
 * Handles user authentication via username or email.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { API, SUCCESS_MESSAGES } from '../config/constants.js';
import logger from '../tools/logger.js';

/**
 * Initializes the login page functionality.
 * Sets up form submission handler for user authentication.
 */
export async function init() {
  logger.form('Login script initialized');

  const form = document.getElementById('login-form');
  if (!form) {
    logger.warn('Login form not found');
    return;
  }

  form.addEventListener('submit', async (event) => {
    // Prevent page reload
    event.preventDefault();

    // Get user login input
    const login = document.getElementById('login-input').value;
    const password = document.getElementById('password-input').value;

    const requestBody = { login, password };

    try {
      logger.network('Sending login request');

      // Send login request to server
      const response = await fetch(API.USERS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      // Show alert if login fails
      if (handleResponseError(response)) {
        return;
      }

      // Login successful, clear input fields
      const data = await response.json();
      logger.success(`User logged in: ${data.username}`);
      showTemporaryAlert('success', SUCCESS_MESSAGES.LOGIN);

      document.getElementById('login-input').value = '';
      document.getElementById('password-input').value = '';

      // Redirect to home page
      window.location.href = '/home';

    } catch (error) {
      // Handle fetch/network errors
      logger.error('Login fetch failed:', error);
      showTemporaryAlert('alert', 'Something went wrong');
    }
  });
}

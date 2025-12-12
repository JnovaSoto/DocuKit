/**
 * Login page functionality.
 * Handles user authentication via username or email.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { API, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants.js';
import logger from '../tools/logger.js';
import { pass } from '../tools/passwordHide.js';
import { VALIDATION } from '../config/constants.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the login page functionality.
 * Sets up form submission handler for user authentication.
 */
export async function init() {
  // Prevent duplicate initialization
  if (isInitialized) {
    logger.debug('Login module already initialized, skipping');
    return;
  }

  logger.form('Login script initialized');
  isInitialized = true;

  const form = document.getElementById('login-form');
  if (!form) {
    logger.warn('Login form not found');
    isInitialized = false; // Reset flag if form not found
    return;
  }

  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const togglePasswordButton = document.getElementById('toggle-password');
  const togglePasswordIcon = document.getElementById('toggle-password-icon');

  pass(togglePasswordButton, passwordInput, togglePasswordIcon)

  form.addEventListener('submit', async (event) => {
    // Prevent page reload
    event.preventDefault();

    // Get user login input
    const login = loginInput.value;
    const password = passwordInput.value;

    if (loginInput.value.length < VALIDATION.LOGIN.MAX_LENGTH) {
      loginInput.setCustomValidity(`Username must be ${VALIDATION.LOGIN.MAX_LENGTH} characters or less`);
    } else {
      loginInput.setCustomValidity('');
    }

    if (passwordInput.value.length < VALIDATION.PASSWORD.MAX_LENGTH) {
      passwordInput.setCustomValidity(`Password must be ${VALIDATION.PASSWORD.MAX_LENGTH} characters or less`);
    } else {
      passwordInput.setCustomValidity('');
    }

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
      if (await handleResponseError(response)) {
        return;
      }

      // Login successful, clear input fields
      const data = await response.json();
      logger.success(`User logged in: ${data.username}`);
      showTemporaryAlert('success', SUCCESS_MESSAGES.LOGIN);

      document.getElementById('login-input').value = '';
      document.getElementById('password-input').value = '';

      // Redirect to the page user was on before login, or home if none saved
      const returnPath = sessionStorage.getItem('returnPath');
      // Determine the destination URL
      const targetUrl = (returnPath === '/signUp') ? '/home' : (returnPath || '/home');
      // Perform the redirection
      sessionStorage.removeItem('returnPath');// Clear after use
      window.location.href = targetUrl;

      if (window.location.href === '/logIn') {
        showTemporaryAlert('alert', ERROR_MESSAGES.LOGIN_ERROR);
      }

    } catch (error) {
      // Handle fetch/network errors
      logger.error('Login fetch failed:', error);
      showTemporaryAlert('alert', ERROR_MESSAGES.NETWORK_ERROR);
    }
  });
}

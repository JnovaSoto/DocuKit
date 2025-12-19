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
import { changePage } from '../navigation.js';

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
  const submitButton = form.querySelector('button[type="submit"]');

  pass(togglePasswordButton, passwordInput, togglePasswordIcon)

  let isSubmitting = false;

  form.addEventListener('submit', async (event) => {
    // Prevent page reload
    event.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      logger.warn('Login already in progress');
      return;
    }

    // Get user login input
    const login = loginInput.value;
    const password = passwordInput.value;

    // Validate max length
    if (loginInput.value.length > VALIDATION.LOGIN.MAX_LENGTH) {
      loginInput.setCustomValidity(`Username must be ${VALIDATION.LOGIN.MAX_LENGTH} characters or less`);
    } else {
      loginInput.setCustomValidity('');
    }

    if (passwordInput.value.length > VALIDATION.PASSWORD.MAX_LENGTH) {
      passwordInput.setCustomValidity(`Password must be ${VALIDATION.PASSWORD.MAX_LENGTH} characters or less`);
    } else {
      passwordInput.setCustomValidity('');
    }

    const requestBody = { login, password };

    try {
      isSubmitting = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
      }

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

      // Reload header to update user info
      await reloadHeader();

      // Redirect to the page user was on before login, or home if none saved
      const returnPath = sessionStorage.getItem('returnPath');
      // Determine the destination URL
      const targetUrl = (returnPath === '/signUp') ? '/home' : (returnPath || '/home');
      // Perform the redirection
      sessionStorage.removeItem('returnPath');// Clear after use

      await changePage(targetUrl);

    } catch (error) {
      // Handle fetch/network errors
      logger.error('Login fetch failed:', error);
      showTemporaryAlert('alert', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Log in';
      }
    }
  });
}

/**
 * Reloads the header to update user session info
 */
async function reloadHeader() {
  try {
    const header = document.querySelector('#header');
    if (!header) return;

    const response = await fetch('/partials/header');
    const html = await response.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const metaTags = tempDiv.querySelectorAll('meta');
    metaTags.forEach(meta => meta.remove());

    header.innerHTML = tempDiv.innerHTML;

    // Re-initialize header scripts
    const headerModule = await import('/js/main/header.js');
    // Reset the initialization flag
    if (headerModule.resetInit) headerModule.resetInit();
    if (headerModule.init) await headerModule.init();

    const getTagModule = await import('/js/tags/getTag.js');
    if (getTagModule.init) await getTagModule.init();

    const getPropertyModule = await import('/js/properties/getProperty.js');
    if (getPropertyModule.init) await getPropertyModule.init();

    // Re-initialize translation
    const translationModule = await import('/js/tools/translation.js');
    if (translationModule.init) await translationModule.init();

  } catch (err) {
    logger.error('Error reloading header:', err);
  }
}

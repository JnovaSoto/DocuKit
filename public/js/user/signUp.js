/**
 * Sign up page functionality.
 * Handles new user registration with validation.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { API, SUCCESS_MESSAGES, VALIDATION } from '../config/constants.js';
import logger from '../tools/logger.js';
import { pass } from '../tools/passwordHide.js';
import { changePage } from '../navigation.js';
import { ROUTES } from '../config/constants.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the sign up page functionality.
 * Sets up form validation and submission handler.
 */
export async function init() {
  // Prevent duplicate initialization
  if (isInitialized) {
    logger.debug('SignUp module already initialized, skipping');
    return;
  }

  logger.form('SignUp script initialized');
  isInitialized = true;

  const form = document.getElementById('signUp-form');
  if (!form) {
    logger.warn('SignUp form not found');
    isInitialized = false; // Reset flag if form not found
    return;
  }

  // Get input elements
  const usernameInput = document.getElementById('user-input');
  const emailInput = document.getElementById('email-input');
  const photoInput = document.getElementById('img-input');
  const passwordInput = document.getElementById('password-input');
  const passwordRepeatInput = document.getElementById('repeat-password-input');
  const togglePasswordButton = document.getElementById('toggle-password');
  const toggleRepeatPasswordButton = document.getElementById('toggle-repeat-password');
  const togglePasswordIcon = document.getElementById('toggle-password-icon');
  const toggleRepeatPasswordIcon = document.getElementById('toggle-repeat-password-icon');


  // Real-time validation for username (alphanumeric and underscore only)
  usernameInput.addEventListener('input', () => {
    usernameInput.value = usernameInput.value.replace(/[^a-zA-Z0-9_]/g, '');

    if (usernameInput.value.length > VALIDATION.USERNAME.MAX_LENGTH) {
      usernameInput.setCustomValidity(`Username must be ${VALIDATION.USERNAME.MAX_LENGTH} characters or less`);
    } else {
      usernameInput.setCustomValidity('');
    }
  });

  pass(togglePasswordButton, passwordInput, togglePasswordIcon)
  pass(toggleRepeatPasswordButton, passwordRepeatInput, toggleRepeatPasswordIcon)

  // Real-time email validation
  emailInput.addEventListener('input', () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailInput.value)) {
      emailInput.setCustomValidity('Invalid email format');
    } else {
      emailInput.setCustomValidity('');
    }
  });

  // Form submission handler
  form.addEventListener('submit', async (event) => {
    // Prevent page reload
    event.preventDefault();

    // Get user input values
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const passwordRepeat = passwordRepeatInput.value;
    const photo = photoInput.files[0];

    // Check if passwords match
    if (password !== passwordRepeat) {
      showTemporaryAlert('alert', "The passwords don't match");
      return;
    }

    // Validate password length
    if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
      showTemporaryAlert('alert', `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`);
      return;
    }

    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('admin', 0);

    // Add photo file if selected
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      logger.network('Sending user registration request');

      // Send request to create user with FormData
      const response = await fetch(API.USERS.SIGNUP, {
        method: 'POST',
        body: formData
      });

      // Show alert if creation fails
      if (await handleResponseError(response)) {
        return;
      }

      // User created successfully, clear inputs
      logger.success('User created successfully');
      showTemporaryAlert('success', SUCCESS_MESSAGES.SIGNUP);

      usernameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';
      passwordRepeatInput.value = '';
      photoInput.value = '';

      changePage(ROUTES.LOGIN);

    } catch (error) {
      // Handle fetch/network errors
      logger.error('SignUp fetch failed:', error);
      showTemporaryAlert('alert', 'Something went wrong');
    }
  });
}

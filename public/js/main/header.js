/**
 * Header functionality.
 * Manages user session display, dropdown menu, and permission-based button states.
 */

import { checkSession } from '../tools/session.js';
import logger from '../tools/logger.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the header functionality.
 * Updates UI based on user session and permissions.
 */
export async function init() {
  // Prevent duplicate initialization
  if (isInitialized) {
    logger.debug('Header module already initialized, skipping');
    return;
  }

  logger.info('Header script initialized');
  isInitialized = true;

  try {
    const sessionData = await checkSession();

    const btnCreate = document.getElementById('btn-create-tags');
    const btnFavorites = document.getElementById('btn-favorites-tags');
    const btnEdit = document.getElementById('btn-edit-tags');
    const btnDelete = document.getElementById('btn-delete-tags');
    const headerDropdown = document.getElementById('headerDropdown');
    const dropdownMenu = headerDropdown.nextElementSibling;

    /**
     * Helper to enable/disable buttons based on permissions.
     * @param {HTMLElement} btn - The button element
     * @param {boolean} enabled - Whether to enable the button
     */
    const setButtonState = (btn, enabled) => {
      if (!btn) return;
      if (enabled) {
        btn.classList.remove('disabled');
        btn.removeAttribute('tabindex');
        btn.removeAttribute('aria-disabled');
      } else {
        btn.classList.add('disabled');
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-disabled', 'true');
      }
    };

    // Default: disable all buttons
    setButtonState(btnCreate, false);
    setButtonState(btnEdit, false);
    setButtonState(btnDelete, false);
    setButtonState(btnFavorites, false);

    // Clear dropdown items
    dropdownMenu.innerHTML = '';

    if (sessionData.loggedIn) {
      // Update dropdown text
      headerDropdown.textContent = sessionData.username;

      // Profile link
      const profileLink = document.createElement('a');
      profileLink.className = 'dropdown-item';
      profileLink.href = '/profile';
      profileLink.id = 'btn-go-profile';
      profileLink.textContent = 'Profile';

      // Divider
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';

      // Logout link
      const logoutLink = document.createElement('a');
      logoutLink.className = 'dropdown-item';
      logoutLink.id = 'btn-log-out';
      logoutLink.textContent = 'Log out';

      import('../user/logOut.js').then(mod => {
        if (mod.init) mod.init(logoutLink);
      });

      // Append dropdown items
      dropdownMenu.append(profileLink, divider, logoutLink);

      // Admin-level logic
      switch (sessionData.admin) {
        case 0:
          // Regular user: can only use favorites
          setButtonState(btnFavorites, true);
          break;
        case 1:
          // Admin: can create, edit and delete tags
          setButtonState(btnCreate, true);
          setButtonState(btnFavorites, true);
          setButtonState(btnEdit, true);
          setButtonState(btnDelete, true);
          break;
        default:
          logger.warn('Unknown admin level:', sessionData.admin);
      }
    } else {
      // User not logged in: show Sign up
      const signUpLink = document.createElement('a');
      signUpLink.className = 'dropdown-item';
      signUpLink.href = '/signUp';
      signUpLink.id = 'btn-sign-up';
      signUpLink.textContent = 'Sign up';

      // Divider
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';

      // Log in link
      const logInLink = document.createElement('a');
      logInLink.className = 'dropdown-item';
      logInLink.href = '/logIn';
      logInLink.id = 'btn-log-in';
      logInLink.textContent = 'Log in';

      dropdownMenu.append(signUpLink, divider, logInLink);

      // Update dropdown text
      headerDropdown.textContent = 'User';
    }

  } catch (err) {
    logger.error('Error initializing header:', err);
  }
}
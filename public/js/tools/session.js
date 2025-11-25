/**
 * Session management utilities.
 * Handles user authentication state checking and session validation.
 */

import logger from './logger.js';
import { API } from '../config/constants.js';

/**
 * Checks if the user is currently logged in by querying the session endpoint.
 * 
 * @returns {Promise<Object>} Session data object containing:
 *   - loggedIn {boolean} - Whether user is authenticated
 *   - username {string} - Username if logged in
 *   - admin {boolean} - Whether user has admin privileges
 * 
 * @example
 * const session = await checkSession();
 * if (session.loggedIn) {
 *   console.log(`Welcome ${session.username}`);
 * }
 */
export async function checkSession() {
  try {
    const response = await fetch(API.USERS.ME, {
      credentials: 'include'
    });

    const data = await response.json();

    if (data.loggedIn) {
      logger.auth(`Session active for user: ${data.username}`);
    } else {
      logger.auth('No active session');
    }

    return data;
  } catch (err) {
    logger.error('Error checking session:', err);
    return { loggedIn: false };
  }
}

/**
 * Validates that a user is logged in. Useful for protecting actions.
 * 
 * @returns {Promise<boolean>} True if user is logged in, false otherwise
 * 
 * @example
 * if (!await requireLogin()) {
 *   showTemporaryAlert('alert', 'You must be logged in');
 *   return;
 * }
 */
export async function requireLogin() {
  const session = await checkSession();
  return session.loggedIn;
}

/**
 * Validates that a user is logged in and has admin privileges.
 * 
 * @returns {Promise<boolean>} True if user is admin, false otherwise
 * 
 * @example
 * if (!await requireAdmin()) {
 *   showTemporaryAlert('alert', 'Admin access required');
 *   return;
 * }
 */
export async function requireAdmin() {
  const session = await checkSession();
  return session.loggedIn && session.admin;
}

/**
 * Gets the current user's information if logged in.
 * 
 * @returns {Promise<Object|null>} User object or null if not logged in
 * 
 * @example
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log(`Logged in as ${user.username}`);
 * }
 */
export async function getCurrentUser() {
  const session = await checkSession();
  if (!session.loggedIn) return null;

  return {
    username: session.username,
    admin: session.admin
  };
}


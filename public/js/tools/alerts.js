/**
 * Alert notification system.
 * Displays temporary slide-in alerts to provide user feedback.
 */

import logger from './logger.js';
import { ALERT_TIMING } from '../config/constants.js';

/**
 * Shows a temporary alert that slides in from the right and auto-dismisses.
 * 
 * @param {string} id - The ID of the alert element to show (e.g., 'success', 'alert')
 * @param {string} [text] - Optional custom text to display in the alert
 * 
 * @example
 * showTemporaryAlert('success', 'Tag created successfully!');
 * showTemporaryAlert('alert', 'An error occurred');
 */
export function showTemporaryAlert(id, text) {
  logger.alert('Showing alert', { id, text });

  const alert = document.getElementById(id);
  if (!alert) {
    logger.warn(`Alert element with id "${id}" not found`);
    return;
  }

  // Make the alert visible
  alert.style.display = 'block';

  // Set custom text if provided
  if (text) {
    alert.textContent = text;
  }

  // Allow browser to register the initial position before animating
  setTimeout(() => {
    alert.classList.add('show');
  }, ALERT_TIMING.SHOW_DELAY);

  // Slide out and hide after display duration
  setTimeout(() => {
    alert.classList.remove('show');

    // Hide completely after transition completes
    setTimeout(() => {
      alert.style.display = 'none';
    }, ALERT_TIMING.HIDE_TRANSITION);

  }, ALERT_TIMING.DISPLAY_DURATION);
}

export default showTemporaryAlert;


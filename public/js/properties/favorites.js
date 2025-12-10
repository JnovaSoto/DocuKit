/**
 * Favorites functionality for CSS properties.
 * Handles adding/removing CSS properties from user favorites.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API } from '../config/constants.js';
import logger from '../tools/logger.js';

logger.info('CSS Property Favorites module loaded');

// Flag to prevent duplicate initialization
let isFavoriteListenerAttached = false;

/**
 * Initializes the CSS property favorites functionality.
 * Called by navigation.js on page load/navigation.
 */
export async function init() {
    logger.info('CSS Property Favorites init() called');

    // Attach the global "Favorite" button listener ONCE
    if (!isFavoriteListenerAttached) {
        logger.info('Attaching CSS property favorite button listener');
        isFavoriteListenerAttached = true;

        document.body.addEventListener('click', async (event) => {

            logger.info('CSS Property Favorite button clicked');

            const favoriteBtn = event.target.closest('.favorite-btn');
            if (!favoriteBtn) return;

            // Only handle property favorites (not tag favorites)
            // Check if we're on the CSS properties page
            const isPropertyPage = window.location.pathname === '/css-properties' ||
                document.querySelector('.propertyTable') !== null;

            if (!isPropertyPage) return;

            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();

            const propertyId = favoriteBtn.dataset.id;
            const isFavorited = favoriteBtn.dataset.favorited === 'true';

            if (!propertyId) {
                logger.warn('Favorite button missing data-id attribute');
                return;
            }

            // Check login first
            if (!await requireLogin()) {
                showTemporaryAlert('alert', 'You must log in to add favorites');
                return;
            }

            // Toggle favorite status
            if (isFavorited) {
                await removeFavorite(propertyId, favoriteBtn);
            } else {
                await addFavorite(propertyId, favoriteBtn);
            }
        });
    }
}

/**
 * Adds a CSS property to user's favorites.
 * @param {string} propertyId - Property ID to add
 * @param {HTMLElement} button - The favorite button element
 */
async function addFavorite(propertyId, button) {
    try {
        const response = await fetch(API.USERS.FAVORITES_CSS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ propertyId })
        });

        if (await handleResponseError(response)) return;

        // Update button UI
        const icon = button.querySelector('.icon_favorite');
        icon.textContent = 'favorite';
        button.classList.add('favorited');
        button.dataset.favorited = 'true';

        showTemporaryAlert('success', 'Added to favorites');
        logger.success('CSS Property added to favorites:', propertyId);

    } catch (error) {
        logger.error('Error adding CSS property favorite:', error);
        showTemporaryAlert('alert', 'Failed to add favorite');
    }
}

/**
 * Removes a CSS property from user's favorites.
 * @param {string} propertyId - Property ID to remove
 * @param {HTMLElement} button - The favorite button element
 */
async function removeFavorite(propertyId, button) {
    try {
        const response = await fetch(API.USERS.DELETE_FAVORITE_CSS(propertyId), {
            method: 'DELETE',
            credentials: 'include'
        });

        if (await handleResponseError(response)) return;

        // Update button UI
        const icon = button.querySelector('.icon_favorite');
        icon.textContent = 'favorite_border';
        button.classList.remove('favorited');
        button.dataset.favorited = 'false';

        showTemporaryAlert('success', 'Removed from favorites');
        logger.success('CSS Property removed from favorites:', propertyId);

    } catch (error) {
        logger.error('Error removing CSS property favorite:', error);
        showTemporaryAlert('alert', 'Failed to remove favorite');
    }
}

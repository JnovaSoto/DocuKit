/**
 * Favorites functionality.
 * Handles adding/removing tags from user favorites.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API } from '../config/constants.js';
import logger from '../tools/logger.js';

logger.info('Favorites module loaded');

// Flag to prevent duplicate initialization
let isFavoriteListenerAttached = false;

/**
 * Initializes the favorites functionality.
 * Called by navigation.js on page load/navigation.
 */
export async function init() {
    logger.info('Favorites init() called');

    // Attach the global "Favorite" button listener ONCE
    if (!isFavoriteListenerAttached) {
        logger.info('Attaching favorite button listener');
        isFavoriteListenerAttached = true;

        document.body.addEventListener('click', async (event) => {

            logger.info('Favorite button clicked');

            const favoriteBtn = event.target.closest('.favorite-btn');
            if (!favoriteBtn) return;

            // Only handle tag favorites (not property favorites)
            const type = favoriteBtn.dataset.type;
            if (type && type !== 'tag') return;

            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();

            const tagId = favoriteBtn.dataset.id;
            const isFavorited = favoriteBtn.dataset.favorited === 'true';

            if (!tagId) {
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
                await removeFavorite(tagId, favoriteBtn);
            } else {
                await addFavorite(tagId, favoriteBtn);
            }
        });
    }
}

/**
 * Adds a tag to user's favorites.
 * @param {string} tagId - Tag ID to add
 * @param {HTMLElement} button - The favorite button element
 */
async function addFavorite(tagId, button) {
    try {
        const response = await fetch(API.USERS.FAVORITES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tagId })
        });

        if (await handleResponseError(response)) return;

        // Update button UI
        const icon = button.querySelector('.icon_favorite');
        icon.textContent = 'favorite';
        button.classList.add('favorited');
        button.dataset.favorited = 'true';

        showTemporaryAlert('success', 'Added to favorites');
        logger.success('Tag added to favorites:', tagId);

    } catch (error) {
        logger.error('Error adding favorite:', error);
        showTemporaryAlert('alert', 'Failed to add favorite');
    }
}

/**
 * Removes a tag from user's favorites.
 * @param {string} tagId - Tag ID to remove
 * @param {HTMLElement} button - The favorite button element
 */
async function removeFavorite(tagId, button) {
    try {
        const response = await fetch(API.USERS.DELETE_FAVORITE(tagId), {
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
        logger.success('Tag removed from favorites:', tagId);

    } catch (error) {
        logger.error('Error removing favorite:', error);
        showTemporaryAlert('alert', 'Failed to remove favorite');
    }
}

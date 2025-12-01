/**
 * Favorites page functionality.
 * Displays user's favorite tags.
 */

import { renderTable } from '../auto/renderTable.js';
import { requireLogin } from '../tools/session.js';
import { showTemporaryAlert } from '../tools/alerts.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

/**
 * Initializes the favorites page.
 * Fetches and displays user's favorite tags.
 */
export async function init() {
    logger.info('Favorites page initialized');

    // Require login to view favorites
    if (!await requireLogin()) {
        showTemporaryAlert('alert', 'You must log in to view favorites');
        return;
    }

    const container = document.getElementById('favorites-container');
    if (!container) {
        logger.error('Favorites container not found');
        return;
    }

    try {
        // Fetch user's favorites
        const favResponse = await fetch(API.USERS.FAVORITES, {
            credentials: 'include'
        });

        if (!favResponse.ok) {
            throw new Error('Failed to fetch favorites');
        }

        const { favorites } = await favResponse.json();

        if (!favorites || favorites.length === 0) {
            container.innerHTML = '<p>You have no favorite tags yet. Add some from the home page!</p>';
            return;
        }

        logger.info('User favorites:', favorites);

        // Fetch tag data for favorites
        const tagsResponse = await fetch(API.TAGS.BY_IDS(favorites.join(',')), {
            credentials: 'include'
        });

        if (!tagsResponse.ok) {
            throw new Error('Failed to fetch favorite tags');
        }

        const tags = await tagsResponse.json();

        // Fetch all attributes for these tags
        const attributesPromises = tags.map(tag =>
            fetch(API.ATTRIBUTES.BY_TAG_ID(tag.id), {
                credentials: 'include'
            }).then(res => res.ok ? res.json() : [])
        );

        const attributesArrays = await Promise.all(attributesPromises);
        const attributes = attributesArrays.flat();

        logger.success(`Loaded ${tags.length} favorite tags`);

        // Create table and render
        container.innerHTML = `
            <table class="tagTable">
                <thead>
                    <tr>
                        <th><h3>Tags</h3></th>
                        <th><h3>Usability</h3></th>
                        <th><h3>Attributes</h3></th>
                        <th><h3>Favorite</h3></th>
                        <th><h3>Edit</h3></th>
                        <th><h3>Delete</h3></th>
                    </tr>
                </thead>
            </table>
        `;

        const table = container.querySelector('.tagTable');
        renderTable(table, tags, attributes, favorites);

    } catch (error) {
        logger.error('Error loading favorites:', error);
        container.innerHTML = '<p>Error loading favorites. Please try again later.</p>';
    }
}

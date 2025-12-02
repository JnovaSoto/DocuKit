import logger from '../tools/logger.js';
import { API } from '../config/constants.js';
import { renderTable } from '../auto/renderTable.js';

export async function init() {

    logger.debug('Favorites page initialized');

    const favoritesContainer = document.getElementById('favorites-container');
    const table = favoritesContainer.querySelector('.tagTable');

    try {
        // 1. Fetch user's favorite tag IDs
        const favoritesResponse = await fetch(API.USERS.FAVORITES);
        if (!favoritesResponse.ok) {
            throw new Error('Failed to fetch favorites');
        }
        const favoritesData = await favoritesResponse.json();
        const favoriteIds = favoritesData.favorites || [];

        if (favoriteIds.length === 0) {
            favoritesContainer.innerHTML = '<p>You have no favorite tags yet.</p>';
            return;
        }

        // 2. Fetch tag details for these IDs
        const tagsResponse = await fetch(API.TAGS.BY_IDS(favoriteIds.join(',')));
        if (!tagsResponse.ok) {
            if (tagsResponse.status === 404) {
                favoritesContainer.innerHTML = '<p>You have no favorite tags yet.</p>';
                return;
            }
            throw new Error('Failed to fetch tag details');
        }
        const tags = await tagsResponse.json();

        const attributesResponse = await fetch(API.ATTRIBUTES.BASE);
        if (!attributesResponse.ok) {
            throw new Error('Failed to fetch attributes');
        }
        const attributes = await attributesResponse.json();

        // 4. Render the table
        console.log('Rendering favorites table:', {
            tableFound: !!table,
            tagsCount: tags.length,
            attributesCount: attributes.length,
            favoriteIds: favoriteIds
        });

        if (!table) {
            console.error('Table element not found in favorites container');
            return;
        }

        renderTable(table, tags, attributes, favoriteIds);

    } catch (error) {
        logger.error('Error loading favorites:', error);
        favoritesContainer.innerHTML = '<div class="alert alert-danger">Error loading favorites. Please try again later.</div>';
    }
}

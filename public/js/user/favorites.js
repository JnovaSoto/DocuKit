import logger from '../tools/logger.js';
import { API } from '../config/constants.js';
import { renderTable } from '../auto/renderTable.js';
import { getCurrentTheme } from '../tools/themeSwitch.js';

export async function init() {

    logger.debug('Favorites page initialized');

    const favoritesContainer = document.getElementById('favorites-container');
    const currentTheme = getCurrentTheme();

    // Determine if we're showing CSS properties or HTML tags based on theme
    const isCssMode = currentTheme === 'css';

    logger.info(`Favorites page mode: ${isCssMode ? 'CSS Properties' : 'HTML Tags'}`);

    try {
        if (isCssMode) {
            await loadCssFavorites(favoritesContainer);
        } else {
            await loadTagFavorites(favoritesContainer);
        }
    } catch (error) {
        logger.error('Error loading favorites:', error);
        favoritesContainer.innerHTML = '<div class="alert alert-danger">Error loading favorites. Please try again later.</div>';
    }
}

/**
 * Loads and displays HTML tag favorites
 */
async function loadTagFavorites(container) {
    const table = container.querySelector('.tagTable');

    // 1. Fetch user's favorite tag IDs
    const favoritesResponse = await fetch(API.USERS.FAVORITES);
    if (!favoritesResponse.ok) {
        throw new Error('Failed to fetch favorites');
    }
    const favoritesData = await favoritesResponse.json();
    const favoriteIds = favoritesData.favorites || [];

    if (favoriteIds.length === 0) {
        container.innerHTML = '<p>You have no favorite tags yet.</p>';
        return;
    }

    // 2. Fetch tag details for these IDs
    const tagsResponse = await fetch(API.TAGS.BY_IDS(favoriteIds.join(',')));
    if (!tagsResponse.ok) {
        if (tagsResponse.status === 404) {
            container.innerHTML = '<p>You have no favorite tags yet.</p>';
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
    logger.info('Rendering tag favorites table:', {
        tableFound: !!table,
        tagsCount: tags.length,
        attributesCount: attributes.length,
        favoriteIds: favoriteIds
    });

    if (!table) {
        logger.error('Table element not found in favorites container');
        return;
    }

    renderTable(table, tags, attributes, favoriteIds);
}

/**
 * Loads and displays CSS property favorites
 */
async function loadCssFavorites(container) {
    // Change table class to propertyTable for CSS properties
    let table = container.querySelector('.tagTable');
    if (table) {
        table.className = 'propertyTable';
    }

    // 1. Fetch user's favorite CSS property IDs
    const favoritesResponse = await fetch(API.USERS.FAVORITES_CSS);
    if (!favoritesResponse.ok) {
        throw new Error('Failed to fetch CSS favorites');
    }
    const favoritesData = await favoritesResponse.json();
    const favoriteIds = favoritesData.favorites || [];

    if (favoriteIds.length === 0) {
        container.innerHTML = '<p>You have no favorite CSS properties yet.</p>';
        return;
    }

    // 2. Fetch property details for these IDs
    const propertiesResponse = await fetch(API.PROPERTIES.BY_IDS(favoriteIds.join(',')));
    if (!propertiesResponse.ok) {
        if (propertiesResponse.status === 404) {
            container.innerHTML = '<p>You have no favorite CSS properties yet.</p>';
            return;
        }
        throw new Error('Failed to fetch property details');
    }
    const properties = await propertiesResponse.json();

    const attributesResponse = await fetch(API.PROPERTY_ATTRIBUTES.BASE);
    if (!attributesResponse.ok) {
        throw new Error('Failed to fetch property attributes');
    }
    const propertyAttributes = await attributesResponse.json();

    // 4. Render the table
    logger.info('Rendering CSS property favorites table:', {
        tableFound: !!table,
        propertiesCount: properties.length,
        attributesCount: propertyAttributes.length,
        favoriteIds: favoriteIds
    });

    if (!table) {
        logger.error('Table element not found in favorites container');
        return;
    }

    renderTable(table, properties, propertyAttributes, favoriteIds);
}

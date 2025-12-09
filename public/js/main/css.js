/**
 * CSS properties page functionality.
 * Loads and displays all CSS properties with their attributes in a table.
 */

import { renderTable } from '../auto/renderTable.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

/**
 * Initializes the CSS properties page.
 * Fetches properties and attributes, then populates the table.
 */
export async function init() {
    logger.info('CSS properties script initialized');

    /**
     * Fetches all properties from the server.
     * @returns {Promise<Array>} Array of property objects
     */
    async function getProperties() {
        const response = await fetch(API.PROPERTIES.BASE);
        if (!response.ok) {
            throw new Error('Error fetching properties');
        }
        return await response.json();
    }

    /**
     * Fetches all property attributes from the server.
     * @returns {Promise<Array>} Array of property attribute objects
     */
    async function getPropertyAttributes() {
        const response = await fetch(API.PROPERTY_ATTRIBUTES.BASE);
        if (!response.ok) {
            throw new Error('Error fetching property attributes');
        }
        return await response.json();
    }

    /**
     * Fetches user's favorite properties.
     * @returns {Promise<Array>} Array of favorite property IDs
     */
    async function getUserFavorites() {
        try {
            const response = await fetch(API.USERS.FAVORITES, {
                credentials: 'include'
            });
            if (!response.ok) {
                // User not logged in or error - return empty array
                return [];
            }
            const data = await response.json();
            return data.favorites || [];
        } catch (error) {
            logger.warn('Could not fetch favorites:', error);
            return [];
        }
    }

    try {
        // Fetch data
        const properties = await getProperties();
        const propertyAttributes = await getPropertyAttributes();
        const userFavorites = await getUserFavorites();

        logger.success(`Loaded ${properties.length} properties and ${propertyAttributes.length} property attributes`);
        logger.info(`User favorites: ${userFavorites}`);

        const table = document.querySelector('.propertyTable');
        renderTable(table, properties, propertyAttributes, userFavorites);

    } catch (error) {
        logger.error('Error loading properties:', error);
    }
}
